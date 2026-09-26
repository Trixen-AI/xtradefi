import { useMemo } from 'react'
import { MARKET_LIST, USDG } from '../data/tokens'
import { lockedBySymbol, useLedger, vaultBalance } from '../lib/ledger'
import { PRODUCT_LABEL } from '../lib/positions'
import { fmtExpiry } from '../lib/time'
import { feedState, useNow, useOracles, useWalletBalances } from '../hooks/chainData'
import { ago, fmtNum, fmtUsd, shortAddr } from '../lib/format'
import { explorer } from '../wallet/chain'
import { ConnectCta } from '../components/wallet'
import { useWallet } from '../hooks/useWallet'
import { CopyButton, Empty, ExtLink, Panel, Skel, Stat, StateTag, TickerBadge } from '../components/ui'
import { AddTokenButton } from '../components/AddToken'

export default function Overview() {
  const { address, isConnected } = useWallet()
  const now = useNow()
  const { quotes, isLoading: pricesLoading } = useOracles()
  const { eth, balances, isLoading } = useWalletBalances(address)
  const book = useLedger(address)
  const locked = lockedBySymbol(book)
  const openPositions = book.positions.filter((p) => p.status === 'open')

  const usdgPrice = quotes.get('USDG')?.price ?? 1
  const ethPrice = quotes.get('ETH')?.price

  // Holdings valued at the oracle price; tokens without a feed are listed but not valued.
  const holdings = useMemo(
    () =>
      MARKET_LIST.map((m) => {
        const bal = balances.get(m.ticker)?.amount ?? 0
        const price = quotes.get(m.ticker)?.price
        return { m, bal, price, value: price !== undefined ? bal * price : undefined }
      }).filter((h) => h.bal > 0),
    [balances, quotes],
  )
  const usdg = balances.get('USDG')?.amount ?? 0
  const freeUsdg = Math.max(0, usdg - (locked.get('USDG') ?? 0))
  const inVault = vaultBalance(book)
  const stockValue = holdings.reduce((s, h) => s + (h.value ?? 0), 0)
  const unpriced = holdings.filter((h) => h.value === undefined).length
  const portfolio = usdg * usdgPrice + stockValue + (eth && ethPrice ? eth.amount * ethPrice : 0)
  const snapshot = MARKET_LIST.filter((m) => m.tradable).slice(0, 8)

  return (
    <div className="dview">
      <header className="dview__head">
        <div>
          <p className="dview__pre">Overview</p>
          <h1 className="dview__title">{isConnected ? 'Your account' : 'Welcome to xTradeFi'}</h1>
        </div>
        {isConnected && address ? (
          <div className="dview__addr">
            <span>{shortAddr(address)}</span>
            <CopyButton text={address} label="Copy address" />
            <ExtLink href={explorer.address(address)}>Explorer</ExtLink>
          </div>
        ) : null}
      </header>

      {!isConnected ? (
        <Panel className="dhero">
          <div className="dhero__inner">
            <div>
              <h2 className="dhero__title">Connect an EVM wallet</h2>
              <p className="dhero__text">See your USDG and stock-token balances on Robinhood Chain, what you can use as collateral, and build option positions on live Chainlink prices. No sign-up, no email, no KYC.</p>
            </div>
            <ConnectCta />
          </div>
        </Panel>
      ) : (
        <div className="dstats">
          <Stat label="Portfolio value" value={isLoading ? <Skel w={120} /> : fmtUsd(portfolio)} sub={unpriced ? `${unpriced} holding${unpriced > 1 ? 's' : ''} without an oracle price not included` : 'USDG, stock tokens and ETH at oracle prices'} />
          <Stat label="USDG" value={isLoading ? <Skel /> : fmtNum(usdg, 2)} sub={locked.get('USDG') ? `${fmtNum(freeUsdg, 2)} free · ${fmtNum(locked.get('USDG'), 2)} in positions and the vault` : 'Collateral for puts, binaries and the vault'} />
          <Stat label="Stock tokens" value={isLoading ? <Skel /> : fmtUsd(stockValue)} sub={`${holdings.length} market${holdings.length === 1 ? '' : 's'} held`} />
          <Stat label="ETH (gas)" value={isLoading || !eth ? <Skel /> : fmtNum(eth.amount, 5)} sub={eth && ethPrice ? fmtUsd(eth.amount * ethPrice) : 'Network fees on Robinhood Chain'} />
        </div>
      )}

      {isConnected ? (
        <div className="dgrid dgrid--2">
          <Panel title="What you can open now">
            <ul className="dcap">
              <li>
                <span className="dcap__name">Cash-secured puts · binaries · vault</span>
                <span className="dcap__val">{fmtNum(freeUsdg, 2)} USDG free</span>
                <a className="dbtn dbtn--sm" href="/app/trade?product=put">
                  Sell a put
                </a>
              </li>
              {holdings.filter((h) => h.m.tradable).length ? (
                holdings
                  .filter((h) => h.m.tradable)
                  .map((h) => (
                    <li key={h.m.ticker}>
                      <span className="dcap__name">Covered calls on {h.m.ticker}</span>
                      <span className="dcap__val">up to {fmtNum(Math.max(0, h.bal - (locked.get(h.m.ticker) ?? 0)))} units</span>
                      <a className="dbtn dbtn--sm" href={`/app/trade?product=call&market=${h.m.ticker}`}>
                        Write a call
                      </a>
                    </li>
                  ))
              ) : (
                <li>
                  <span className="dcap__name">Covered calls</span>
                  <span className="dcap__val">Hold a stock token to write calls against it</span>
                  <a className="dbtn dbtn--sm" href="/app/markets">
                    Markets
                  </a>
                </li>
              )}
            </ul>
          </Panel>

          <Panel title={`Open positions (${openPositions.length})`} action={<a href="/app/positions">View all</a>}>
            {openPositions.length || inVault > 0 ? (
              <ul className="dopen">
                {openPositions.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <a href="/app/positions">
                      <b>{p.ticker}</b>
                      <span>{PRODUCT_LABEL[p.product]}{p.product === 'binary' ? ` · ${p.up ? 'Up' : 'Down'}` : ` · ${fmtUsd(p.strike)}`}</span>
                      <small>{fmtExpiry(new Date(p.expiry * 1000))}</small>
                    </a>
                  </li>
                ))}
                {inVault > 0 ? (
                  <li>
                    <a href="/app/vault">
                      <b>Vault</b>
                      <span>{fmtNum(inVault, 2)} USDG deposited</span>
                      <small>Covered-call strategy</small>
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <Empty title="No positions yet" action={<a className="dbtn dbtn--sm" href="/app/trade">Build a position</a>}>
                Write a covered call, sell a put, take an up/down position or deposit into the vault.
              </Empty>
            )}
          </Panel>
        </div>
      ) : null}

      {isConnected ? (
        <Panel title="Holdings" pad={false}>
          {isLoading ? (
            <div className="dtable-loading">
              <Skel w={240} />
            </div>
          ) : holdings.length || usdg > 0 ? (
            <div className="dtable-wrap">
              <table className="dtable">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th className="num">Balance</th>
                    <th className="num">Oracle price</th>
                    <th className="num">Value</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {usdg > 0 ? (
                    <tr>
                      <td>
                        <span className="dasset">
                          <TickerBadge ticker="USDG" />
                          <span>
                            <b>USDG</b>
                            <small>{USDG.name}</small>
                          </span>
                        </span>
                      </td>
                      <td className="num">{fmtNum(usdg, 2)}</td>
                      <td className="num">{fmtUsd(usdgPrice)}</td>
                      <td className="num">{fmtUsd(usdg * usdgPrice)}</td>
                      <td className="act">
                        <AddTokenButton address={USDG.address} symbol="USDG" decimals={USDG.decimals} />
                      </td>
                    </tr>
                  ) : null}
                  {holdings.map((h) => (
                    <tr key={h.m.ticker}>
                      <td>
                        <a className="dasset" href={`/app/markets/${h.m.ticker}`}>
                          <TickerBadge ticker={h.m.ticker} />
                          <span>
                            <b>{h.m.ticker}</b>
                            <small>{h.m.name}</small>
                          </span>
                        </a>
                      </td>
                      <td className="num">{fmtNum(h.bal)}</td>
                      <td className="num">{h.price !== undefined ? fmtUsd(h.price) : 'No feed'}</td>
                      <td className="num">{h.value !== undefined ? fmtUsd(h.value) : '–'}</td>
                      <td className="act">
                        <AddTokenButton address={h.m.token} symbol={h.m.ticker} decimals={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No USDG or stock tokens in this wallet" action={<a className="dbtn dbtn--sm" href="/docs/getting-started">How to get started</a>}>
              Fund this address on Robinhood Chain with USDG for puts, binaries and the vault, or with stock tokens for covered calls.
            </Empty>
          )}
        </Panel>
      ) : null}

      <Panel title="Markets now" action={<a href="/app/markets">All markets</a>} pad={false}>
        <div className="dsnap">
          {snapshot.map((m) => {
            const q = quotes.get(m.ticker)
            return (
              <a key={m.ticker} className="dsnap__cell" href={`/app/markets/${m.ticker}`}>
                <span className="dsnap__top">
                  <b>{m.ticker}</b>
                  <StateTag state={feedState(q, now)} />
                </span>
                <span className="dsnap__price">{q ? fmtUsd(q.price) : pricesLoading ? <Skel w={70} /> : '–'}</span>
                <span className="dsnap__sub">{q ? `Updated ${ago(now - q.updatedAt)}` : m.name}</span>
              </a>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
