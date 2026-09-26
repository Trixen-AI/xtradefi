import { PROTOCOL } from '../data/protocol'
import type { Position } from './ledger'
import { bsPremium, probAbove, type Round } from './options'

const YEAR_S = 365 * 86_400

/** Model value of a position now (writer's P/L before fees). Call/put: premium kept minus the option's current
 *  value. Binary: expected payout minus stake. Undefined when there is no price or volatility yet. */
export function markToModel(p: Position, spot: number | undefined, vol: number | undefined, now: number) {
  if (!spot || !vol) return undefined
  const T = Math.max(0, p.expiry - now) / YEAR_S
  if (p.product === 'binary') {
    const pUp = T > 0 ? probAbove(spot, p.strike, T, vol) : spot > p.strike ? 1 : 0
    if (pUp === undefined) return undefined
    const pWin = p.up ? pUp : 1 - pUp
    return p.size * PROTOCOL.binaryMaxMultiple * pWin - p.size
  }
  const value = T > 0 ? bsPremium(p.product, spot, p.strike, T, vol) : p.product === 'call' ? Math.max(spot - p.strike, 0) : Math.max(p.strike - spot, 0)
  return value === undefined ? undefined : p.size * (p.premium - value)
}

/** P/L at expiry for an oracle settlement price X. */
export function settlementPnl(p: Position, X: number) {
  if (p.product === 'call') return p.size * (p.premium - Math.max(X - p.strike, 0))
  if (p.product === 'put') return p.size * (p.premium - Math.max(p.strike - X, 0))
  const win = p.up ? X > p.strike : X < p.strike
  return win ? p.size * (PROTOCOL.binaryMaxMultiple - 1) : -p.size
}

/** Settlement price: the last oracle answer published at or before expiry. */
export function priceAtExpiry(rounds: Round[], expiry: number) {
  let best: Round | undefined
  for (const r of rounds) if (r.updatedAt <= expiry && (!best || r.updatedAt > best.updatedAt)) best = r
  return best?.answer
}

export const PRODUCT_LABEL = { call: 'Covered call', put: 'Cash-secured put', binary: 'Binary' } as const
