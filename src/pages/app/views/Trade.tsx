import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { MARKET_BY_TICKER, MARKET_LIST, USDG } from '../data/tokens'
import { PROTOCOL } from '../data/protocol'
import { feedState, useNow, useOracles, useRounds, useWalletBalances } from '../hooks/chainData'
import { bsPremium, payoffAt, probAbove, realisedVol, yearsUntil, type Product } from '../lib/options'
import { fmtExpiry, upcomingExpiries } from '../lib/time'
import { fmtNum, fmtPct, fmtUsd } from '../lib/format'
import { hasProjectId } from '../wallet/appkit'
import { ConnectCta, SwitchChainButton } from '../components/wallet'
import { useWallet } from '../hooks/useWallet'
import { Notice, Panel, Skel, StateTag, TickerBadge } from '../components/ui'
import { lockedBySymbol, useLedger } from '../lib/ledger'
import { actionError, useProtocol } from '../hooks/useProtocol'
import { PayoffChart } from '../components/charts'

const PRODUCTS: { id: Product; label: string; hint: string }[] = [
  { id: 'call', label: 'Covered call', hint: 'Lock stock tokens, sell a call, earn USDG premium upfront.' },
  { id: 'put', label: 'Cash-secured put', hint: 'Lock USDG, sell a put, earn premium; buy at your strike if it falls there.' },
  { id: 'binary', label: 'Binary', hint: 'Pick up or down. Right at expiry: collect close to 2x your stake.' },
]

const TRADABLE = MARKET_LIST.filter((m) => m.tradable)

/** Strike increments that read like a real option chain. */
function strikeStep(S: number) {
  return S >= 500 ? 5 : S >= 100 ? 1 : S >= 20 ? 0.5 : 0.1
}
const roundTo = (x: number, step: number) => Math.round(x / step) * step
const parseNum = (s: string) => {
  const n = Number(s.replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}

export default function Trade() {
  const [params, setParams] = useSearchParams()
  const productParam = params.get('product') as Product | null
  const product: Product = productParam === 'put' || productParam === 'binary' ? productParam : 'call'
  const marketParam = (params.get('market') ?? 'NVDA').toUpperCase()
  const market = MARKET_BY_TICKER.get(marketParam)?.tradable ? MARKET_BY_TICKER.get(marketParam)! : TRADABLE[0]

  const now = useNow()
  const { address, isConnected, wrongChain } = useWallet()
  const { quotes } = useOracles()
  const { balances } = useWalletBalances(address)
  const { rounds } = useRounds(market.feed, 40)

  const [expiryIdx, setExpiryIdx] = useState(0)
  const [strikeInput, setStrikeInput] = useState('')
  const [sizeInput, setSizeInput] = useState('')
  const [up, setUp] = useState(true)
  const [busy, setBusy] = useState<'approve' | 'open' | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string; link?: boolean } | null>(null)
  const book = useLedger(address)
  const protocol = useProtocol()

  // Expiries depend only on the calendar day, so recompute per day rather than per tick.
  const day = Math.floor(now / 86_400)
  const expiries = useMemo(() => upcomingExpiries(4, new Date(day * 86_400_000 + 12 * 3600_000)), [day])
  const expiry = expiries[Math.min(expiryIdx, expiries.length - 1)]

  const quote = quotes.get(market.ticker)
  const S = quote?.price ?? 0
  const step = strikeStep(S || 100)
  const defaultStrike = S ? roundTo(product === 'call' ? S * 1.05 : product === 'put' ? S * 0.95 : S, step) : 0
  const K = strikeInput ? parseNum(strikeInput) : defaultStrike
  const size = sizeInput ? parseNum(sizeInput) : 0
  const T = expiry ? yearsUntil(expiry, now * 1000) : 0
  const vol = realisedVol(rounds)

  const premium = product === 'binary' || vol === undefined ? undefined : bsPremium(product, S, K, T, vol)
  const pAbove = vol !== undefined ? probAbove(S, K, T, vol) : undefined
  const pWin = pAbove === undefined ? undefined : up ? pAbove : 1 - pAbove

  const locked = lockedBySymbol(book)
  const usdg = Math.max(0, (balances.get('USDG')?.amount ?? 0) - (locked.get('USDG') ?? 0))
  const tokenBal = Math.max(0, (balances.get(market.ticker)?.amount ?? 0) - (locked.get(market.ticker) ?? 0))
  const collateral = product === 'call' ? { amount: size, symbol: market.ticker, have: tokenBal } : product === 'put' ? { amount: size * K, symbol: USDG.symbol, have: usdg } : { amount: size, symbol: USDG.symbol, have: usdg }
  const enough = collateral.amount <= collateral.have + 1e-9
  const validInputs = S > 0 && K > 0 && size > 0 && !!expiry
  const allowance = book.approvals[collateral.symbol]?.amount ?? 0
  const needsApproval = allowance + 1e-9 < collateral.amount
  const collateralAsset = collateral.symbol === USDG.symbol ? { symbol: USDG.symbol, address: USDG.address, decimals: USDG.decimals } : { symbol: market.ticker, address: market.token, decimals: market.decimals }

  const setProduct = (p: Product) => {
    setStrikeInput('')
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('product', p)
      return next
    }, { replace: true })
  }
  const setMarket = (t: string) => {
    setStrikeInput('')
    setSizeInput('')
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('market', t)
      return next
    }, { replace: true })
  }

  const maxSize = product === 'call' ? tokenBal : product === 'put' ? (K > 0 ? usdg / K : 0) : usdg

  // Recomputed per render on purpose: 160 samples is cheap and keeps the chart in step with every input.
  const f = (x: number) => payoffAt({ product, S, K, size: size > 0 ? size : 1, premium: premium ?? 0, up, winMultiple: PROTOCOL.binaryMaxMultiple }, x)

  const summary = (() => {
    const n = size > 0 ? size : 0
    if (product === 'call') {
      const p = premium ?? 0
      return [
        ['Premium (model)', premium !== undefined ? `${fmtUsd(p)} / unit · ${fmtUsd(p * n)} total` : 'Needs oracle history'],
        ['Max profit', premium !== undefined ? fmtUsd(n * (Math.max(K - S, 0) + p)) : '–'],
        ['Breakeven', premium !== undefined ? fmtUsd(S - p) : '–'],
        ['Chance it expires unexercised', pAbove !== undefined ? fmtPct(1 - pAbove) : '–'],
      ]
    }
    if (product === 'put') {
      const p = premium ?? 0
      return [
        ['Premium (model)', premium !== undefined ? `${fmtUsd(p)} / unit · ${fmtUsd(p * n)} total` : 'Needs oracle history'],
        ['Max profit', premium !== undefined ? fmtUsd(n * p) : '–'],
        ['Breakeven', premium !== undefined ? fmtUsd(K - p) : '–'],
        ['Chance it expires unexercised', pAbove !== undefined ? fmtPct(pAbove) : '–'],
      ]
    }
    return [
      ['Direction', up ? `Up: above ${fmtUsd(K)}` : `Down: below ${fmtUsd(K)}`],
      ['Payout if right', `up to ${fmtUsd(n * PROTOCOL.binaryMaxMultiple)} (close to 2x, set at open)`],
      ['Max loss', fmtUsd(n)],
      ['Chance of being right (model)', pWin !== undefined ? fmtPct(pWin) : '–'],
    ]
  })()

  const doApprove = async () => {
    setMsg(null)
    setBusy('approve')
    try {
      await protocol.approve(collateralAsset, collateral.amount)
      setMsg({ tone: 'ok', text: `${collateral.symbol} approved. Now open the position.` })
    } catch (e) {
      setMsg({ tone: 'err', text: actionError(e) })
    } finally {
      setBusy(null)
    }
  }
  const doOpen = async () => {
    if (!expiry) return
    setMsg(null)
    setBusy('open')
    try {
      await protocol.openPosition({
        product,
        market: { ticker: market.ticker, symbol: market.ticker, address: market.token, decimals: market.decimals },
        up,
        strike: K,
        expiry: Math.floor(expiry.getTime() / 1000),
        size,
        premium: premium ?? 0,
        spot: S,
        collateral: { ...collateralAsset, amount: collateral.amount },
      })
      setSizeInput('')
      setMsg({ tone: 'ok', text: 'Position opened.', link: true })
    } catch (e) {
      setMsg({ tone: 'err', text: actionError(e) })
    } finally {
      setBusy(null)
    }
  }

  const needsQuote = product !== 'binary' && premium === undefined
  const action = (() => {
    if (!hasProjectId) return <button className="dbtn dbtn--block" disabled type="button">Wallet setup needed</button>
    if (!isConnected) return <ConnectCta className="dbtn--block" label="Connect wallet to continue" />
    if (wrongChain) return <SwitchChainButton className="dbtn--block" />
    if (!validInputs) return <button className="dbtn dbtn--block" disabled type="button">{size > 0 ? 'Enter a strike' : product === 'binary' ? 'Enter a stake' : 'Enter a size'}</button>
    if (!enough) return <button className="dbtn dbtn--block" disabled type="button">{`Not enough ${collateral.symbol}`}</button>
    if (needsQuote) return <button className="dbtn dbtn--block" disabled type="button">Loading quote…</button>
    return (
      <div className="dflow">
        <ol className="dflow__steps" aria-label="Steps">
          <li className={needsApproval ? 'is-current' : 'is-done'}>
            <span>{needsApproval ? '1' : '✓'}</span> Approve {collateral.symbol}
          </li>
          <li className={needsApproval ? '' : 'is-current'}>
            <span>2</span> Open position
          </li>
        </ol>
        {needsApproval ? (
          <button type="button" className="dbtn dbtn--primary dbtn--block" disabled={busy !== null} onClick={doApprove}>
            {busy === 'approve' ? 'Confirm in your wallet…' : `Approve ${fmtNum(collateral.amount, 4)} ${collateral.symbol}`}
          </button>
        ) : (
          <button type="button" className="dbtn dbtn--primary dbtn--block" disabled={busy !== null} onClick={doOpen}>
            {busy === 'open' ? 'Confirm in your wallet…' : product === 'binary' ? `Open ${up ? 'up' : 'down'} position` : product === 'call' ? 'Write covered call' : 'Sell put'}
          </button>
        )}
      </div>
    )
  })()

  const state = feedState(quote, now)

  return (
    <div className="dview">
      <header className="dview__head">
        <div>
          <p className="dview__pre">Trade</p>
          <h1 className="dview__title">Build a position</h1>
          <p className="dview__sub">{PRODUCTS.find((p) => p.id === product)!.hint}</p>
        </div>
      </header>

      <div className="dtabs" role="tablist" aria-label="Product">
        {PRODUCTS.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={product === p.id} className={`dtab ${product === p.id ? 'is-on' : ''}`} onClick={() => setProduct(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="dtrade">
        <Panel title="Order" className="dtrade__form">
          <div className="dfield">
            <label htmlFor="t-market">Market</label>
            <div className="dfield__row">
              <TickerBadge ticker={market.ticker} size={36} />
              <select id="t-market" value={market.ticker} onChange={(e) => setMarket(e.target.value)}>
                {TRADABLE.map((m) => (
                  <option key={m.ticker} value={m.ticker}>
                    {m.ticker} · {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="dfield__meta">
              <span>Oracle {quote ? fmtUsd(S) : <Skel w={60} />}</span>
              <StateTag state={state} />
            </div>
          </div>

          {product === 'binary' ? (
            <div className="dfield">
              <span className="dfield__label">Direction</span>
              <div className="dseg" role="group" aria-label="Direction">
                <button type="button" className={up ? 'is-on is-up' : ''} aria-pressed={up} onClick={() => setUp(true)}>
                  ▲ Up
                </button>
                <button type="button" className={!up ? 'is-on is-down' : ''} aria-pressed={!up} onClick={() => setUp(false)}>
                  ▼ Down
                </button>
              </div>
            </div>
          ) : null}

          <div className="dfield">
            <span className="dfield__label">Expiry</span>
            <div className="dchips">
              {expiries.map((d, i) => (
                <button key={d.toISOString()} type="button" className={`dchip ${i === expiryIdx ? 'is-on' : ''}`} aria-pressed={i === expiryIdx} onClick={() => setExpiryIdx(i)}>
                  {fmtExpiry(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="dfield">
            <label htmlFor="t-strike">{product === 'binary' ? 'Level' : 'Strike'} (USD)</label>
            <input id="t-strike" className="dinput" inputMode="decimal" value={strikeInput || (defaultStrike ? String(defaultStrike) : '')} onChange={(e) => setStrikeInput(e.target.value)} />
            <div className="dchips dchips--sm">
              {[-0.1, -0.05, 0, 0.05, 0.1].map((d) => (
                <button key={d} type="button" className="dchip" disabled={!S} onClick={() => setStrikeInput(String(roundTo(S * (1 + d), step)))}>
                  {d === 0 ? 'At spot' : `${d > 0 ? '+' : ''}${d * 100}%`}
                </button>
              ))}
            </div>
            {S > 0 && K > 0 ? <div className="dfield__meta">{`${K >= S ? '+' : ''}${fmtPct(K / S - 1)} from the oracle price`}</div> : null}
          </div>

          <div className="dfield">
            <label htmlFor="t-size">{product === 'binary' ? 'Stake (USDG)' : product === 'call' ? `Size (${market.ticker} tokens)` : `Size (${market.ticker} units)`}</label>
            <div className="dinput-wrap">
              <input id="t-size" className="dinput" inputMode="decimal" placeholder="0.0" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} />
              <button type="button" className="dinput-max" disabled={!isConnected || maxSize <= 0} onClick={() => setSizeInput(String(Math.floor(maxSize * 10_000) / 10_000))}>
                Max
              </button>
            </div>
            <div className="dfield__meta">
              {isConnected ? `Available: ${fmtNum(collateral.have)} ${collateral.symbol}${locked.get(collateral.symbol) ? ` (${fmtNum(locked.get(collateral.symbol))} in open positions)` : ''}` : 'Connect a wallet to see your balance'}
            </div>
          </div>

          <div className="dcollateral">
            <div>
              <span>Collateral locked</span>
              <b>
                {fmtNum(collateral.amount, 4)} {collateral.symbol}
              </b>
            </div>
            <span className={`dcollateral__state ${!isConnected || !size ? '' : enough ? 'is-ok' : 'is-short'}`}>{!isConnected || !size ? '–' : enough ? '✓ Covered by your balance' : '✕ More than your balance'}</span>
          </div>

          {action}
          {msg ? (
            <p className={`dmsg is-${msg.tone}`} role={msg.tone === 'err' ? 'alert' : 'status'}>
              {msg.text}
              {msg.link ? (
                <>
                  {' '}
                  <a href="/app/positions">View in Positions →</a>
                </>
              ) : null}
            </p>
          ) : null}
        </Panel>

        <div className="dtrade__side">
          {state === 'closed' ? <Notice title="US market closed">The oracle price is the last answer of the previous session. Feeds resume with the 24/5 session.</Notice> : null}
          <Panel title="Quote">
            <dl className="dkv dkv--quote">
              <div>
                <dt>Expiry</dt>
                <dd>{expiry ? `${fmtExpiry(expiry)} · ${fmtNum(T * 365, 1)} days` : '–'}</dd>
              </div>
              <div>
                <dt>Realised volatility</dt>
                <dd>{vol !== undefined ? `${fmtPct(vol)} (${rounds.length} rounds)` : 'Loading oracle history…'}</dd>
              </div>
              {summary.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <div>
                <dt>Protocol fee</dt>
                <dd>{fmtPct(PROTOCOL.feeRate, 1)} per trade</dd>
              </div>
            </dl>
            <p className="dfine">Model estimate: Black-Scholes with volatility from this market’s Chainlink rounds. The protocol sets the final premium or payout when the position opens.</p>
          </Panel>
          <Panel title={`Profit / loss at expiry${size > 0 ? '' : ' (per 1 unit)'}`}>
            {S > 0 && K > 0 ? <PayoffChart f={f} spot={S} strike={K} /> : <div className="dchart__empty" style={{ height: 220 }} />}
          </Panel>
        </div>
      </div>
    </div>
  )
}
