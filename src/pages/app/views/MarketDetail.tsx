import { Navigate, useParams } from 'react-router'
import { FEED_DEVIATION, FEED_HEARTBEAT_S, MARKET_BY_TICKER } from '../data/tokens'
import { feedState, useNow, useOracles, useRounds, useUiMultiplier, useWalletBalances } from '../hooks/chainData'
import { realisedVol } from '../lib/options'
import { ago, fmtNum, fmtPct, fmtUsd, shortAddr } from '../lib/format'
import { explorer } from '../wallet/chain'
import { useWallet } from '../hooks/useWallet'
import { CopyButton, ExtLink, Panel, Skel, Stat, StateTag, TickerBadge } from '../components/ui'
import { PriceChart } from '../components/charts'
import { AddTokenButton } from '../components/AddToken'

export default function MarketDetail() {
  const { ticker = '' } = useParams()
  const market = MARKET_BY_TICKER.get(ticker.toUpperCase())
  const now = useNow()
  const { address, isConnected } = useWallet()
  const { quotes } = useOracles()
  const { balances } = useWalletBalances(address)
  const { rounds, isLoading: histLoading } = useRounds(market?.feed, 40)
  const multiplier = useUiMultiplier(market?.token)

  if (!market) return <Navigate to="/app/markets" replace />
  const quote = quotes.get(market.ticker)
  const vol = realisedVol(rounds)
  const bal = balances.get(market.ticker)?.amount ?? 0
  const first = rounds[0]
  const change = first && quote ? quote.price / first.answer - 1 : undefined

  return (
    <div className="dview">
      <a className="dback" href="/app/markets">
        ← All markets
      </a>
      <header className="dview__head dview__head--market">
        <div className="dmarket-id">
          <TickerBadge ticker={market.ticker} size={52} />
          <div>
            <p className="dview__pre">
              {market.sector} · {market.name}
            </p>
            <h1 className="dview__title">{market.ticker}</h1>
          </div>
        </div>
        <div className="dmarket-price">
          <span className="dhero-num">{quote ? fmtUsd(quote.price) : market.tradable ? <Skel w={140} /> : 'No feed'}</span>
          <span className="dmarket-price__meta">
            <StateTag state={market.tradable ? feedState(quote, now) : 'none'} />
            {quote ? <span>Updated {ago(now - quote.updatedAt)}</span> : null}
          </span>
        </div>
      </header>

      {market.tradable ? (
        <div className="dtrade-cta">
          <a className="dbtn dbtn--primary" href={`/app/trade?product=call&market=${market.ticker}`}>
            Write a covered call
          </a>
          <a className="dbtn" href={`/app/trade?product=put&market=${market.ticker}`}>
            Sell a put
          </a>
          <a className="dbtn" href={`/app/trade?product=binary&market=${market.ticker}`}>
            Up or down
          </a>
        </div>
      ) : (
        <p className="dnote">{market.ticker} has a stock token on Robinhood Chain but no Chainlink price feed yet, so options on it are not available.</p>
      )}

      {market.tradable ? (
        <Panel title={`Oracle price · last ${rounds.length} rounds`} action={change !== undefined ? <span className={change >= 0 ? 'is-up' : 'is-down'}>{`${change >= 0 ? '+' : ''}${fmtPct(change, 2)} over this window`}</span> : null}>
          {histLoading && !rounds.length ? <div className="dchart__empty" style={{ height: 240 }} /> : <PriceChart rounds={rounds} />}
          <p className="dchart__note">Each point is a Chainlink round: a new answer is written on a 0.5% move or every 24h. Long straight segments are quiet stretches between rounds, including nights and weekends when the US market is closed.</p>
        </Panel>
      ) : null}

      <div className="dgrid dgrid--3">
        <Stat label="Realised volatility" value={vol !== undefined ? fmtPct(vol) : '–'} sub={vol !== undefined ? `Annualised, from ${rounds.length} oracle rounds` : 'Needs at least 9 oracle rounds'} />
        <Stat label="Your balance" value={isConnected ? fmtNum(bal) : '–'} sub={isConnected ? (quote ? fmtUsd(bal * quote.price) : 'Not priced') : 'Connect a wallet'} />
        <Stat label="Display multiplier" value={multiplier !== undefined ? `${fmtNum(multiplier, 6)}x` : '–'} sub="ERC-8056 uiMultiplier; the feed price already includes it" />
      </div>

      <Panel title="Contracts">
        <dl className="dkv">
          <div>
            <dt>Stock token</dt>
            <dd>
              <span className="mono">{shortAddr(market.token)}</span>
              <CopyButton text={market.token} label="Copy token address" />
              <ExtLink href={explorer.token(market.token)}>Explorer</ExtLink>
              <AddTokenButton address={market.token} symbol={market.ticker} decimals={18} />
            </dd>
          </div>
          <div>
            <dt>Chainlink feed</dt>
            <dd>
              {market.feed ? (
                <>
                  <span className="mono">{shortAddr(market.feed)}</span>
                  <CopyButton text={market.feed} label="Copy feed address" />
                  <ExtLink href={explorer.address(market.feed)}>Explorer</ExtLink>
                </>
              ) : (
                'Not available yet'
              )}
            </dd>
          </div>
          {market.feed ? (
            <div>
              <dt>Feed parameters</dt>
              <dd>
                8 decimals · heartbeat {FEED_HEARTBEAT_S / 3600}h · deviation {fmtPct(FEED_DEVIATION, 1)} · US equities 24/5
              </dd>
            </div>
          ) : null}
          {quote ? (
            <div>
              <dt>Latest round</dt>
              <dd className="mono">{quote.roundId.toString()}</dd>
            </div>
          ) : null}
        </dl>
      </Panel>
    </div>
  )
}
