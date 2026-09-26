import { parseUnits, type Hex } from 'viem'
import { useSignTypedData } from 'wagmi'
import { EIP712_DOMAIN, EIP712_TYPES, type AssetRef } from '../data/protocol'
import { ledger, type Position } from '../lib/ledger'
import type { Product } from '../lib/options'
import { useWallet } from './useWallet'

const toUnits = (n: number, decimals: number) => parseUnits(Math.max(0, n).toFixed(Math.min(decimals, 8)), decimals)
const toPrice = (n: number) => parseUnits(Math.max(0, n).toFixed(8), 8)

export type OpenArgs = {
  product: Product
  market: AssetRef & { ticker: string }
  up: boolean
  strike: number
  expiry: number
  size: number
  premium: number
  spot: number
  collateral: AssetRef & { amount: number }
}

/** Every user action goes through here. Today each one is an EIP-712 signature (no gas, no funds moved); at
 *  contract launch the bodies switch to ERC-20 approve and contract writes, the views stay the same. */
export function useProtocol() {
  const { address } = useWallet()
  const { signTypedDataAsync } = useSignTypedData()

  const owner = () => {
    if (!address) throw new Error('Connect a wallet first')
    return address
  }

  async function approve(asset: AssetRef, amount: number) {
    const who = owner()
    const nonce = BigInt(ledger.nextNonce(who))
    const signature = await signTypedDataAsync({
      domain: EIP712_DOMAIN,
      types: EIP712_TYPES,
      primaryType: 'Approval',
      message: { owner: who, asset: asset.address, amount: toUnits(amount, asset.decimals), nonce, deadline: BigInt(Math.floor(Date.now() / 1000) + 7 * 86_400) },
    })
    ledger.update(who, (l) => ({ ...l, approvals: { ...l.approvals, [asset.symbol]: { amount, signature, at: Date.now() } } }))
  }

  /** Spends allowance like ERC-20 transferFrom would. */
  function spend(symbol: string, amount: number) {
    const who = owner()
    ledger.update(who, (l) => {
      const cur = l.approvals[symbol]
      if (!cur) return l
      return { ...l, approvals: { ...l.approvals, [symbol]: { ...cur, amount: Math.max(0, cur.amount - amount) } } }
    })
  }

  async function openPosition(a: OpenArgs) {
    const who = owner()
    const nonce = ledger.nextNonce(who)
    const signature: Hex = await signTypedDataAsync({
      domain: EIP712_DOMAIN,
      types: EIP712_TYPES,
      primaryType: 'Order',
      message: {
        owner: who,
        product: a.product,
        market: a.market.address,
        direction: a.product === 'binary' ? (a.up ? 'up' : 'down') : a.product === 'call' ? 'sell-call' : 'sell-put',
        strike: toPrice(a.strike),
        expiry: BigInt(a.expiry),
        size: toUnits(a.size, a.product === 'call' ? a.market.decimals : 6),
        premium: toPrice(a.premium),
        nonce: BigInt(nonce),
      },
    })
    spend(a.collateral.symbol, a.collateral.amount)
    const position: Position = {
      id: `${nonce}-${signature.slice(2, 10)}`,
      product: a.product,
      ticker: a.market.ticker,
      up: a.up,
      strike: a.strike,
      expiry: a.expiry,
      size: a.size,
      premium: a.premium,
      spotAtOpen: a.spot,
      collateral: { symbol: a.collateral.symbol, amount: a.collateral.amount },
      openedAt: Math.floor(Date.now() / 1000),
      signature,
      status: 'open',
    }
    ledger.update(who, (l) => ({ ...l, positions: [position, ...l.positions] }))
    return position
  }

  async function closePosition(p: Position, pnl: number) {
    const who = owner()
    const nonce = BigInt(ledger.nextNonce(who))
    await signTypedDataAsync({ domain: EIP712_DOMAIN, types: EIP712_TYPES, primaryType: 'Close', message: { owner: who, order: p.id, nonce } })
    ledger.update(who, (l) => ({ ...l, positions: l.positions.map((x) => (x.id === p.id ? { ...x, status: 'closed', closedAt: Math.floor(Date.now() / 1000), closePnl: pnl } : x)) }))
  }

  /** Settlement needs no signature: the oracle price at expiry decides it. */
  function settle(id: string, price: number, pnl: number) {
    const who = owner()
    ledger.update(who, (l) => ({ ...l, positions: l.positions.map((x) => (x.id === id && x.status === 'open' ? { ...x, status: 'settled', settlePrice: price, settlePnl: pnl } : x)) }))
  }

  async function vault(action: 'deposit' | 'withdraw', amount: number, usdg: AssetRef) {
    const who = owner()
    const nonce = ledger.nextNonce(who)
    const signature = await signTypedDataAsync({ domain: EIP712_DOMAIN, types: EIP712_TYPES, primaryType: 'Vault', message: { owner: who, action, amount: toUnits(amount, usdg.decimals), nonce: BigInt(nonce) } })
    if (action === 'deposit') spend(usdg.symbol, amount)
    ledger.update(who, (l) => ({ ...l, vault: [{ id: `${nonce}-${signature.slice(2, 10)}`, action, amount, at: Math.floor(Date.now() / 1000), signature }, ...l.vault] }))
  }

  return { approve, openPosition, closePosition, settle, vault }
}

/** Readable message for a failed signature request. */
export function actionError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e)
  if (/reject|denied|cancel/i.test(msg)) return 'Signature rejected in your wallet.'
  if (/chain|network/i.test(msg)) return 'Switch your wallet to Robinhood Chain and try again.'
  return 'The wallet could not sign this request. Try again.'
}
