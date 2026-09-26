// Option maths used for estimates only. The protocol sets real premiums and payouts at execution; the UI labels
// everything computed here as a model estimate.

const YEAR_S = 365 * 86_400

/** Standard normal CDF (Abramowitz & Stegun 7.1.26, |error| < 7.5e-8). */
export function normCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return x >= 0 ? 1 - p : p
}

function d1d2(S: number, K: number, T: number, sigma: number) {
  const v = sigma * Math.sqrt(T)
  const d1 = (Math.log(S / K) + 0.5 * sigma * sigma * T) / v
  return [d1, d1 - v] as const
}

/** Black-Scholes premium per unit with zero rates. T in years. */
export function bsPremium(type: 'call' | 'put', S: number, K: number, T: number, sigma: number) {
  if (!(S > 0 && K > 0 && T > 0 && sigma > 0)) return undefined
  const [d1, d2] = d1d2(S, K, T, sigma)
  return type === 'call' ? S * normCdf(d1) - K * normCdf(d2) : K * normCdf(-d2) - S * normCdf(-d1)
}

/** Model probability that the price finishes above K at expiry. */
export function probAbove(S: number, K: number, T: number, sigma: number) {
  if (!(S > 0 && K > 0 && T > 0 && sigma > 0)) return undefined
  return normCdf(d1d2(S, K, T, sigma)[1])
}

export const yearsUntil = (expiry: Date, now = Date.now()) => Math.max(0, (expiry.getTime() - now) / 1000 / YEAR_S)

export type Round = { answer: number; updatedAt: number }

/** Annualised realised volatility from oracle rounds: sum of squared log returns over elapsed calendar time.
 *  Needs at least 8 returns, otherwise undefined (the UI then shows no estimate instead of a guess). */
export function realisedVol(rounds: Round[]) {
  const r = rounds.filter((x) => x.answer > 0 && x.updatedAt > 0).sort((a, b) => a.updatedAt - b.updatedAt)
  let sumSq = 0
  let n = 0
  for (let i = 1; i < r.length; i++) {
    if (r[i].updatedAt <= r[i - 1].updatedAt) continue
    const lr = Math.log(r[i].answer / r[i - 1].answer)
    sumSq += lr * lr
    n++
  }
  if (n < 8) return undefined
  const span = (r[r.length - 1].updatedAt - r[0].updatedAt) / YEAR_S
  return span > 0 ? Math.sqrt(sumSq / span) : undefined
}

export type Product = 'call' | 'put' | 'binary'

/** Profit or loss at expiry for one position, as a function of the expiry price X.
 *  call: covered call incl. the stock leg, measured against the spot at open.
 *  put: cash-secured put. binary: stake-based up/down position (winMultiple = total payout / stake). */
export function payoffAt(p: { product: Product; S: number; K: number; size: number; premium: number; up: boolean; winMultiple: number }, X: number) {
  if (p.product === 'call') return p.size * (Math.min(X, p.K) - p.S + p.premium)
  if (p.product === 'put') return p.size * (p.premium - Math.max(p.K - X, 0))
  const win = p.up ? X > p.K : X < p.K
  return win ? p.size * (p.winMultiple - 1) : -p.size
}
