import { useEffect, useState } from 'react'
import { MARKET_BY_TICKER } from '../data/tokens'
import { useNow, useOracles, useRounds } from '../hooks/chainData'
import { useWallet } from '../hooks/useWallet'
import { actionError, useProtocol } from '../hooks/useProtocol'
import { useLedger, type Position } from '../lib/ledger'
import { markToModel, priceAtExpiry, PRODUCT_LABEL, settlementPnl } from '../lib/positions'
import { realisedVol } from '../lib/options'
import { fmtExpiry } from '../lib/time'
import { fmtNum, fmtUsd, shortAddr } from '../lib/format'
import { ConnectCta } from '../components/wallet'
import { CopyButton, Empty, Panel, Stat, TickerBadge } from '../components/ui'

function timeLeft(s: number) {
  if (s <= 0) return 'Expired'
  const d = Math.floor(s / 86_400)
  const h = Math.floor((s % 86_400) / 3600)
  return d > 0 ? `${d}d ${h}h left` : `${h}h ${Math.floor((s % 3600) / 60)}m left`
}

function Pnl({ v }: { v: number | undefined }) {
  if (v === undefined) return <span className="muted">–</span>
  return <span className={v >= 0 ? 'is-up' : 'is-down'}>{`${v >= 0 ? '+' : ''}${fmtUsd(v)}`}</span>
}

/** One position: live model value while open, automatic settlement at the oracle price once expired. */
function PositionRow({ p, now }: { p: Position; now: number }) {
  const market = MARKET_BY_TICKER.get(p.ticker)
  const { quotes } = useOracles()
  const { rounds } = useRounds(market?.feed, 60)
  const protocol = useProtocol()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const spot = quotes.get(p.ticker)?.price
  const vol = realisedVol(rounds)
  const expired = now >= p.expiry
  const settlePrice = expired ? priceAtExpiry(rounds, p.expiry) : undefined
  const live = p.status === 'open' && !expired ? markToModel(p, spot, vol, now) : undefined

  // Settle once the oracle price at expiry is known (writes the result to the wallet's ledger).
  useEffect(() => {
    if (p.status === 'open' && expired && settlePrice !== undefined) protocol.settle(p.id, settlePrice, settlementPnl(p, settlePrice))
  }, [p, expired, settlePrice, protocol])

  const close = async () => {
    if (live === undefined) return
    setBusy(true)
    setErr('')
    try {
      await protocol.closePosition(p, live)
    } catch (e) {
      setErr(actionError(e))
    } finally {
      setBusy(false)
    }
  }

  const result = p.status === 'closed' ? p.closePnl : p.status === 'settled' ? p.settlePnl : live
  const what = p.product === 'binary' ? `${p.up ? 'Up' : 'Down'} · level ${fmtUsd(p.strike)}` : `Strike ${fmtUsd(p.strike)}`
  const sizeLabel = p.product === 'binary' ? `${fmtNum(p.size, 2)} USDC stake` : `${fmtNum(p.size)} ${p.product === 'call' ? p.ticker : 'units'}`

  return (
    <article className={`dpos is-${p.status}`}>
      <div className="dpos__id">
        <TickerBadge ticker={p.ticker} size={40} />
        <div>
          <b>
            {p.ticker} · {PRODUCT_LABEL[p.product]}
          </b>
          <span>
            {what} · {sizeLabel}
          </span>
        </div>
      </div>
      <dl className="dpos__grid">
        <div>
          <dt>Expiry</dt>
          <dd>
            {fmtExpiry(new Date(p.expiry * 1000))}
            <small>{p.status === 'open' ? timeLeft(p.expiry - now) : p.status === 'settled' ? 'Settled' : 'Closed'}</small>
          </dd>
        </div>
        <div>
          <dt>{p.product === 'binary' ? 'Stake' : 'Premium'}</dt>
          <dd>{p.product === 'binary' ? fmtUsd(p.size) : fmtUsd(p.premium * p.size)}</dd>
        </div>
        <div>
          <dt>Collateral</dt>
          <dd>
            {fmtNum(p.collateral.amount, 4)} {p.collateral.symbol}
          </dd>
        </div>
        <div>
          <dt>{p.status === 'open' ? (expired ? 'Settling' : 'P/L now (model)') : p.status === 'settled' ? `Settled at ${fmtUsd(p.settlePrice)}` : 'P/L at close'}</dt>
          <dd>{p.status === 'open' && expired ? <span className="muted">Waiting for oracle</span> : <Pnl v={result} />}</dd>
        </div>
      </dl>
      <div className="dpos__act">
        <span className="dpos__sig" title="EIP-712 order signature">
          Signed order {shortAddr(p.signature)}
          <CopyButton text={p.signature} label="Copy signature" />
        </span>
        {p.status === 'open' && !expired ? (
          <button type="button" className="dbtn dbtn--sm" disabled={busy || live === undefined} onClick={close}>
            {busy ? 'Confirm in wallet…' : 'Close'}
          </button>
        ) : null}
      </div>
      {err ? <p className="dmsg is-err">{err}</p> : null}
    </article>
  )
}

export default function Positions() {
  const { address, isConnected } = useWallet()
  const now = useNow(10_000)
  const book = useLedger(address)
  const { quotes } = useOracles()
  const [tab, setTab] = useState<'open' | 'history'>('open')

  const open = book.positions.filter((p) => p.status === 'open')
  const history = book.positions.filter((p) => p.status !== 'open')
  const list = tab === 'open' ? open : history
  const committed = open.reduce((s, p) => s + (p.collateral.symbol === 'USDC' ? p.collateral.amount : p.collateral.amount * (quotes.get(p.collateral.symbol)?.price ?? 0)), 0)
  const realised = history.reduce((s, p) => s + (p.status === 'closed' ? (p.closePnl ?? 0) : (p.settlePnl ?? 0)), 0)
  const premium = book.positions.reduce((s, p) => s + (p.product === 'binary' ? 0 : p.premium * p.size), 0)

  return (
    <div className="dview">
      <header className="dview__head">
        <div>
          <p className="dview__pre">Positions</p>
          <h1 className="dview__title">Your positions</h1>
          <p className="dview__sub">Every order signed from this wallet: valued live on Chainlink prices, settled at the oracle price at expiry.</p>
        </div>
        {isConnected ? (
          <a className="dbtn dbtn--primary" href="/app/trade">
            New position
          </a>
        ) : null}
      </header>

      {isConnected ? (
        <div className="dstats">
          <Stat label="Open positions" value={String(open.length)} sub={`${history.length} in history`} />
          <Stat label="Collateral committed" value={fmtUsd(committed)} sub="At oracle prices" />
          <Stat label="Premium collected" value={fmtUsd(premium)} sub="Calls and puts, at open" />
          <Stat label="Realised P/L" value={<Pnl v={history.length ? realised : undefined} />} sub="Closed and settled, before fees" />
        </div>
      ) : null}

      <div className="dtabs" role="tablist" aria-label="Position status">
        {(['open', 'history'] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`dtab ${tab === t ? 'is-on' : ''}`} onClick={() => setTab(t)}>
            {t === 'open' ? `Open (${open.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>

      {!isConnected ? (
        <Panel pad={false}>
          <Empty title="Connect a wallet to see your positions" action={<ConnectCta />}>
            Positions are kept per wallet address.
          </Empty>
        </Panel>
      ) : list.length ? (
        <div className="dpos-list">
          {list.map((p) => (
            <PositionRow key={p.id} p={p} now={now} />
          ))}
        </div>
      ) : (
        <Panel pad={false}>
          <Empty title={tab === 'open' ? 'No open positions' : 'Nothing settled yet'} action={<a className="dbtn dbtn--sm" href="/app/trade">Build a position</a>}>
            {tab === 'open' ? 'Write a covered call, sell a put or take an up/down position to see it here.' : 'Closed and settled positions show up here with their final P/L.'}
          </Empty>
        </Panel>
      )}

    </div>
  )
}
