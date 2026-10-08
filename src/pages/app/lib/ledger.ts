import { useSyncExternalStore } from 'react'
import type { Address, Hex } from 'viem'
import type { Product } from './options'

// Per-wallet record of signed approvals, orders and vault actions, kept in this browser's localStorage under a
// versioned key. It is the dashboard's source of truth while actions are signatures (see data/protocol.ts).
// Every read is wrapped: private windows or blocked storage fall back to an empty ledger in memory.

export type Position = {
  id: string
  product: Product
  ticker: string
  up: boolean
  strike: number
  expiry: number // unix seconds
  size: number // tokens (call), units (put) or USDC stake (binary)
  premium: number // USD per unit at open (model), 0 for binary
  spotAtOpen: number
  collateral: { symbol: string; amount: number }
  openedAt: number
  signature: Hex
  status: 'open' | 'closed' | 'settled'
  closedAt?: number
  closePnl?: number
  settlePrice?: number
  settlePnl?: number
}

export type VaultEntry = { id: string; action: 'deposit' | 'withdraw'; amount: number; at: number; signature: Hex }

export type Ledger = {
  approvals: Record<string, { amount: number; signature: Hex; at: number }>
  positions: Position[]
  vault: VaultEntry[]
  nonce: number
}

const VERSION = 1
const EMPTY: Ledger = { approvals: {}, positions: [], vault: [], nonce: 0 }
const keyFor = (owner: Address) => `quiverfi:v${VERSION}:ledger:${owner.toLowerCase()}`

const cache = new Map<string, Ledger>()
const listeners = new Set<() => void>()

function read(owner: Address): Ledger {
  const key = keyFor(owner)
  const hit = cache.get(key)
  if (hit) return hit
  let value = EMPTY
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) value = { ...EMPTY, ...(JSON.parse(raw) as Ledger) }
  } catch {
    value = EMPTY
  }
  cache.set(key, value)
  return value
}

function write(owner: Address, next: Ledger) {
  const key = keyFor(owner)
  cache.set(key, next)
  try {
    window.localStorage.setItem(key, JSON.stringify(next))
  } catch {
    /* storage unavailable: keep the in-memory copy for this session */
  }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(`quiverfi:v${VERSION}:ledger:`)) {
      cache.delete(e.key)
      l()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(l)
    window.removeEventListener('storage', onStorage)
  }
}

export const ledger = {
  get: (owner: Address) => read(owner),
  update(owner: Address, fn: (l: Ledger) => Ledger) {
    write(owner, fn(read(owner)))
  },
  nextNonce(owner: Address) {
    const n = read(owner).nonce + 1
    write(owner, { ...read(owner), nonce: n })
    return n
  },
}

/** The ledger for the connected wallet (empty when disconnected). */
export function useLedger(owner?: Address): Ledger {
  return useSyncExternalStore(
    subscribe,
    () => (owner ? read(owner) : EMPTY),
    () => EMPTY,
  )
}

/** Collateral committed by open positions, per symbol. */
export function lockedBySymbol(l: Ledger) {
  const out = new Map<string, number>()
  for (const p of l.positions) if (p.status === 'open') out.set(p.collateral.symbol, (out.get(p.collateral.symbol) ?? 0) + p.collateral.amount)
  const vault = l.vault.reduce((s, v) => s + (v.action === 'deposit' ? v.amount : -v.amount), 0)
  if (vault > 0) out.set('USDC', (out.get('USDC') ?? 0) + vault)
  return out
}

export const vaultBalance = (l: Ledger) => Math.max(0, l.vault.reduce((s, v) => s + (v.action === 'deposit' ? v.amount : -v.amount), 0))
