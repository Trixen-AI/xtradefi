import { useDeferredValue, useMemo, useState } from 'react'
import { MARKET_LIST } from '../data/tokens'
import { feedState, useNow, useOracles, useWalletBalances } from '../hooks/chainData'
import { ago, fmtNum, fmtUsd } from '../lib/format'
import { useWallet } from '../hooks/useWallet'
import { Panel, Skel, StateTag, TickerBadge } from '../components/ui'

const SECTORS = ['All', 'Tech', 'Fintech', 'Consumer', 'ETF'] as const
type SortKey = 'ticker' | 'price' | 'value'

export default function Markets() {
  const { address, isConnected } = useWallet()
  const now = useNow()
  const { quotes, isLoading, isError } = useOracles()
  const { balances } = useWalletBalances(address)
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState<(typeof SECTORS)[number]>('All')
  const [tradableOnly, setTradableOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('ticker')
  const q = useDeferredValue(query.trim().toLowerCase())

  const rows = useMemo(() => {
    const list = MARKET_LIST.map((m) => {
      const quote = quotes.get(m.ticker)
      const bal = balances.get(m.ticker)?.amount ?? 0
      return { m, quote, bal, value: quote ? bal * quote.price : undefined }
    }).filter(({ m }) => (sector === 'All' || m.sector === sector) && (!tradableOnly || m.tradable) && (!q || `${m.ticker} ${m.name}`.toLowerCase().includes(q)))
    return list.toSorted((a, b) => {
      if (sort === 'price') return (b.quote?.price ?? -1) - (a.quote?.price ?? -1)
      if (sort === 'value') return (b.value ?? -1) - (a.value ?? -1)
      return a.m.ticker.localeCompare(b.m.ticker)
    })
  }, [quotes, balances, sector, tradableOnly, q, sort])

  const tradable = MARKET_LIST.filter((m) => m.tradable).length

  return (
    <div className="dview">
      <header className="dview__head">
        <div>
          <p className="dview__pre">Markets</p>
          <h1 className="dview__title">Tokenized stocks on Robinhood Chain</h1>
          <p className="dview__sub">
            {MARKET_LIST.length} stock tokens · {tradable} with a Chainlink feed and open for options · prices refresh every 30s
          </p>
        </div>
      </header>

      <div className="dfilters">
        <label className="dsearch">
          <span className="sr-only">Search markets</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5 13 13" />
          </svg>
          <input type="search" placeholder="Search ticker or name" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="dchips" role="group" aria-label="Sector">
          {SECTORS.map((s) => (
            <button key={s} type="button" className={`dchip ${sector === s ? 'is-on' : ''}`} aria-pressed={sector === s} onClick={() => setSector(s)}>
              {s}
            </button>
          ))}
        </div>
        <label className="dcheck">
          <input type="checkbox" checked={tradableOnly} onChange={(e) => setTradableOnly(e.target.checked)} />
          <span>Tradable only</span>
        </label>
        <label className="dselect">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="ticker">Ticker</option>
            <option value="price">Price</option>
            <option value="value" disabled={!isConnected}>
              Your value
            </option>
          </select>
        </label>
      </div>

      <Panel pad={false}>
        {isError ? <p className="dtable-error">Could not reach Robinhood Chain. Retrying automatically.</p> : null}
        <div className="dtable-wrap">
          <table className="dtable dtable--markets">
            <thead>
              <tr>
                <th>Market</th>
                <th className="num">Oracle price</th>
                <th className="num hide-sm">Updated</th>
                <th>State</th>
                {isConnected ? <th className="num hide-sm">Your balance</th> : null}
                {isConnected ? <th className="num">Value</th> : null}
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ m, quote, bal, value }) => (
                <tr key={m.ticker}>
                  <td>
                    <a className="dasset" href={`/app/markets/${m.ticker}`}>
                      <TickerBadge ticker={m.ticker} />
                      <span>
                        <b>{m.ticker}</b>
                        <small>{m.name}</small>
                      </span>
                    </a>
                  </td>
                  <td className="num">{quote ? fmtUsd(quote.price) : m.tradable && isLoading ? <Skel w={64} /> : '–'}</td>
                  <td className="num hide-sm muted">{quote ? ago(now - quote.updatedAt) : '–'}</td>
                  <td>
                    <StateTag state={m.tradable ? feedState(quote, now) : 'none'} />
                  </td>
                  {isConnected ? <td className="num hide-sm">{bal > 0 ? fmtNum(bal) : '–'}</td> : null}
                  {isConnected ? <td className="num">{value ? fmtUsd(value) : '–'}</td> : null}
                  <td className="act">
                    {m.tradable ? (
                      <a className="dbtn dbtn--sm" href={`/app/trade?market=${m.ticker}`}>
                        Trade
                      </a>
                    ) : (
                      <a className="dbtn dbtn--ghost dbtn--sm" href={`/app/markets/${m.ticker}`}>
                        Details
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length ? <p className="dtable-error">No market matches these filters.</p> : null}
        </div>
      </Panel>
      <p className="dfoot">Prices are Chainlink answers read directly from Robinhood Chain. Markets marked “No feed” have a stock token but no Chainlink feed yet, so options on them are not available.</p>
    </div>
  )
}
