import { formatUnits } from 'viem'

const usd2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const usdCompact = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 })

export function fmtUsd(n: number | undefined, compact = false) {
  if (n === undefined || !Number.isFinite(n)) return '–'
  if (n !== 0 && Math.abs(n) < 0.01) return n > 0 ? '<$0.01' : '>-$0.01'
  if (compact && Math.abs(n) >= 100_000) return usdCompact.format(n)
  return usd2.format(n)
}

export function fmtNum(n: number | undefined, maxDp = 4) {
  if (n === undefined || !Number.isFinite(n)) return '–'
  const dp = Math.abs(n) >= 1000 ? 2 : maxDp
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: dp }).format(n)
}

export function fmtPct(n: number | undefined, dp = 1) {
  if (n === undefined || !Number.isFinite(n)) return '–'
  return `${(n * 100).toFixed(dp)}%`
}

/** bigint amount → number for display maths (display only; never feed this back into a transaction). */
export function toNum(v: bigint | undefined, decimals: number) {
  return v === undefined ? undefined : Number(formatUnits(v, decimals))
}

export function shortAddr(a?: string) {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ''
}

export function ago(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '–'
  if (seconds < 60) return `${Math.round(seconds)}s ago`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`
  if (seconds < 86_400) return `${(seconds / 3600).toFixed(1)}h ago`
  return `${(seconds / 86_400).toFixed(1)}d ago`
}
