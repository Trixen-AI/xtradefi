import { useEffect, useMemo, useState } from 'react'
import { formatUnits, type Address } from 'viem'
import { useBalance, useReadContract, useReadContracts } from 'wagmi'
import { ethereumChain } from '../wallet/chain'
import { aggregatorAbi, erc20Abi, ETH_FEED, FEED_DECIMALS, FEED_HEARTBEAT_S, MARKET_LIST, ONDO_SVALUE_ORACLE, sValueAbi, USDG, USDG_FEED } from '../data/tokens'
import { isMarketSession } from '../lib/time'
import type { Round } from '../lib/options'

const chainId = ethereumChain.id

// ---------- clock ----------

/** Current unix time in seconds, re-rendering every `everyMs`. */
export function useNow(everyMs = 15_000) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    const id = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), everyMs)
    return () => window.clearInterval(id)
  }, [everyMs])
  return now
}

// ---------- oracle prices ----------

export type Quote = { price: number; updatedAt: number; roundId: bigint }

const FEEDS: { key: string; address: Address }[] = [
  ...MARKET_LIST.filter((m) => m.feed).map((m) => ({ key: m.ticker, address: m.feed! })),
  { key: 'USDG', address: USDG_FEED },
  { key: 'ETH', address: ETH_FEED },
]

/** Latest Chainlink answer for every listed feed, one multicall, refreshed every 30s (the feeds' own cadence). */
export function useOracles() {
  const q = useReadContracts({
    contracts: FEEDS.map((f) => ({ address: f.address, abi: aggregatorAbi, functionName: 'latestRoundData' as const, chainId })),
    query: { refetchInterval: 30_000, staleTime: 15_000 },
  })
  const quotes = useMemo(() => {
    const map = new Map<string, Quote>()
    q.data?.forEach((r, i) => {
      if (r.status !== 'success') return
      const [roundId, answer, , updatedAt] = r.result
      map.set(FEEDS[i].key, { price: Number(formatUnits(answer, FEED_DECIMALS)), updatedAt: Number(updatedAt), roundId })
    })
    return map
  }, [q.data])
  return { quotes, isLoading: q.isLoading, isError: q.isError && !q.data, refetch: q.refetch, fetchedAt: q.dataUpdatedAt }
}

export type FeedState = 'open' | 'closed' | 'stale' | 'none'

/** Market state for a quote: the US 24/5 session decides open/closed; an open session with an answer older than
 *  the 24h heartbeat (plus an hour of grace) is flagged stale. */
export function feedState(q: Quote | undefined, now: number): FeedState {
  if (!q) return 'none'
  const open = isMarketSession(new Date(now * 1000))
  if (!open) return 'closed'
  return now - q.updatedAt > FEED_HEARTBEAT_S + 3600 ? 'stale' : 'open'
}

// ---------- wallet balances ----------

const BALANCE_TOKENS: { key: string; address: Address; decimals: number }[] = [
  { key: 'USDG', address: USDG.address, decimals: USDG.decimals },
  ...MARKET_LIST.map((m) => ({ key: m.ticker, address: m.token, decimals: m.decimals })),
]

/** ETH, USDG and every stock-token balance of an address on Ethereum. */
export function useWalletBalances(address?: Address) {
  const enabled = !!address
  const eth = useBalance({ address, chainId, query: { enabled, refetchInterval: 15_000 } })
  const q = useReadContracts({
    contracts: BALANCE_TOKENS.map((t) => ({ address: t.address, abi: erc20Abi, functionName: 'balanceOf' as const, args: [address ?? '0x0000000000000000000000000000000000000000'] as const, chainId })),
    query: { enabled, refetchInterval: 15_000 },
  })
  const balances = useMemo(() => {
    const map = new Map<string, { raw: bigint; amount: number }>()
    q.data?.forEach((r, i) => {
      if (r.status !== 'success') return
      const t = BALANCE_TOKENS[i]
      map.set(t.key, { raw: r.result, amount: Number(formatUnits(r.result, t.decimals)) })
    })
    return map
  }, [q.data])
  return {
    eth: eth.data ? { raw: eth.data.value, amount: Number(formatUnits(eth.data.value, 18)) } : undefined,
    balances,
    isLoading: enabled && (q.isLoading || eth.isLoading),
    isError: q.isError && !q.data,
    refetch: () => {
      void q.refetch()
      void eth.refetch()
    },
  }
}

// ---------- oracle history ----------

/** The last `count` rounds of a feed (newest first), read with getRoundData. Round IDs step down within the
 *  current aggregator phase; rounds that do not exist are skipped. */
export function useRounds(feed: Address | undefined, count = 40) {
  const latest = useReadContract({ address: feed, abi: aggregatorAbi, functionName: 'latestRoundData', chainId, query: { enabled: !!feed, refetchInterval: 60_000 } })
  const latestId = latest.data?.[0]
  const ids = useMemo(() => {
    if (latestId === undefined) return []
    const out: bigint[] = []
    const phaseMask = (1n << 64n) - 1n
    for (let i = 1; i <= count; i++) {
      const id = latestId - BigInt(i)
      if ((id & phaseMask) === 0n) break
      out.push(id)
    }
    return out
  }, [latestId, count])
  const hist = useReadContracts({
    contracts: ids.map((id) => ({ address: feed, abi: aggregatorAbi, functionName: 'getRoundData' as const, args: [id] as const, chainId })),
    query: { enabled: ids.length > 0, staleTime: 5 * 60_000 },
  })
  const rounds = useMemo(() => {
    const out: Round[] = []
    if (latest.data) out.push({ answer: Number(formatUnits(latest.data[1], FEED_DECIMALS)), updatedAt: Number(latest.data[3]) })
    hist.data?.forEach((r) => {
      if (r.status !== 'success') return
      const [, answer, , updatedAt] = r.result as readonly [bigint, bigint, bigint, bigint, bigint]
      if (updatedAt > 0n) out.push({ answer: Number(formatUnits(answer, FEED_DECIMALS)), updatedAt: Number(updatedAt) })
    })
    return out.sort((a, b) => a.updatedAt - b.updatedAt)
  }, [latest.data, hist.data])
  return { rounds, isLoading: latest.isLoading || hist.isLoading, isError: latest.isError }
}

/** Ondo shares-per-token (sValue, 1e18 = 1.0) from the SyntheticSharesOracle. The oracle reverts for tokens with no
 *  corporate action recorded; that means 1 token = 1 share, so the hook returns 1. */
export function useSValue(token?: Address) {
  const q = useReadContract({ address: ONDO_SVALUE_ORACLE, abi: sValueAbi, functionName: 'getSValue', args: token ? [token] : undefined, chainId, query: { enabled: !!token, staleTime: 10 * 60_000, retry: false } })
  if (!token) return undefined
  if (q.data) return Number(formatUnits(q.data[0], 18))
  return q.isError ? 1 : undefined
}

/** sValue for every tradable token in one multicall (a reverted call means 1 token = 1 share). Token value =
 *  balance × share price × sValue. */
export function useSValues() {
  const tokens = MARKET_LIST.filter((m) => m.tradable)
  const q = useReadContracts({
    contracts: tokens.map((m) => ({ address: ONDO_SVALUE_ORACLE, abi: sValueAbi, functionName: 'getSValue' as const, args: [m.token] as const, chainId })),
    query: { staleTime: 10 * 60_000 },
  })
  return useMemo(() => {
    const map = new Map<string, number>()
    tokens.forEach((m, i) => {
      const r = q.data?.[i]
      map.set(m.ticker, r && r.status === 'success' ? Number(formatUnits((r.result as readonly [bigint, boolean])[0], 18)) : 1)
    })
    return map
    // tokens is derived from a static list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.data])
}
