import type { ReactNode } from 'react'
import { NETWORK } from '@/config/network'
import { MARKETS } from '@/data/site'
import { Callout, KeyValues, Steps } from './parts'

// xTradeFi documentation. One source for the sidebar, the page body, the on-page contents and prev/next links.
// Copy rules: facts come from the product concept; nothing here states protocol parameters that are not decided.
// No em dashes.

export type DocSection = { id: string; title: string; body: ReactNode }
export type DocPage = { slug: string; title: string; lead: string; sections: DocSection[] }
export type DocGroup = { title: string; pages: DocPage[] }

const offered = MARKETS.list.filter((m) => m.o)
const waiting = MARKETS.list.filter((m) => !m.o)
const stocks = offered.filter((m) => m.s !== 'ETF')
const etfs = offered.filter((m) => m.s === 'ETF')

export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'Get started',
    pages: [
      {
        slug: 'introduction',
        title: 'Introduction',
        lead: 'xTradeFi is an on-chain options protocol for tokenized stocks. Write or buy options on NVDA, AAPL, TSLA and 20+ more without a brokerage account, a margin account or KYC.',
        sections: [
          {
            id: 'what-it-does',
            title: 'What xTradeFi does',
            body: (
              <>
                <p>
                  Tokenized stocks are tokens that track the price of a listed share. xTradeFi lets you put an option on top of them: sell a call against stock tokens you hold, sell a put backed by stablecoins, take a simple up-or-down position, or let a vault write calls for you.
                </p>
                <p>Every position lives in a smart contract from the moment it opens until it settles. At expiry the contract reads the Chainlink oracle price and pays out in the same transaction.</p>
              </>
            ),
          },
          {
            id: 'four-products',
            title: 'Four products',
            body: (
              <KeyValues
                rows={[
                  ['Covered calls', 'Lock stock tokens, sell calls, earn USDG premium upfront.'],
                  ['Cash-secured puts', 'Lock USDG, sell puts, earn premium and agree to buy at your strike.'],
                  ['Binary options', 'Pick up or down. Right at expiry: collect close to 2x your stake.'],
                  ['Yield vault', 'Deposit USDG; the vault writes covered calls for you and compounds.'],
                ]}
              />
            ),
          },
          {
            id: 'principles',
            title: 'Design principles',
            body: (
              <ul className="docs-list">
                <li>Your wallet is the account. No sign-up, no email, no KYC.</li>
                <li>Fully collateralized positions. You can never owe more than you locked.</li>
                <li>Oracle settlement. Nobody chooses the expiry price; Chainlink delivers it on-chain.</li>
                <li>One balance. A single USDG balance covers margin across every market.</li>
              </ul>
            ),
          },
        ],
      },
      {
        slug: 'getting-started',
        title: 'Getting started',
        lead: 'Everything you need before your first position: an EVM wallet, the Robinhood Chain network and some USDG.',
        sections: [
          {
            id: 'connect',
            title: 'Connect a wallet',
            body: (
              <>
                <p>xTradeFi works with any EVM wallet. Open the app, choose Connect wallet and approve the connection in your wallet. There is no account to create.</p>
                <Callout>The app only asks your wallet to connect and, when you trade, to sign transactions you review first. It never asks for your recovery phrase.</Callout>
              </>
            ),
          },
          {
            id: 'network',
            title: 'Switch to Robinhood Chain',
            body: (
              <p>
                xTradeFi runs on {NETWORK.name} (chain ID {NETWORK.chainId}). If your wallet is on another network, the app shows a Switch network button that asks your wallet to change or add the network. See <a href="/docs/network">Network</a> for the full parameters.
              </p>
            ),
          },
          {
            id: 'first-position',
            title: 'Open your first position',
            body: (
              <Steps
                items={[
                  ['Fund your wallet', 'Hold USDG for puts, binaries and the vault, or stock tokens for covered calls.'],
                  ['Pick a product and market', 'Covered call, put, binary or vault; then a stock, a strike and an expiry.'],
                  ['Review and sign', 'The app shows collateral, premium and the 0.5% protocol fee before you sign.'],
                  ['Wait for expiry', 'The position settles automatically at the Chainlink price. Nothing to claim by hand.'],
                ]}
              />
            ),
          },
        ],
      },
    ],
  },
  {
    title: 'Products',
    pages: [
      {
        slug: 'covered-calls',
        title: 'Covered calls',
        lead: 'Earn premium on stock tokens you already hold by selling call options against them.',
        sections: [
          {
            id: 'how',
            title: 'How it works',
            body: (
              <>
                <p>You lock stock tokens as collateral and sell a call at a strike and expiry you choose. The buyer pays you a premium in USDG straight away.</p>
                <p>At expiry the contract reads the oracle price:</p>
                <ul className="docs-list">
                  <li>At or below the strike: the call expires worthless. Your stock tokens unlock and the premium is yours.</li>
                  <li>Above the strike: the call is exercised. Your locked tokens go to the buyer at the strike price and you keep the premium.</li>
                </ul>
              </>
            ),
          },
          {
            id: 'when',
            title: 'When it fits',
            body: <p>Covered calls suit holders who are happy to sell at the strike and want income while they wait. The trade-off: you give up any upside above the strike until expiry.</p>,
          },
          {
            id: 'summary',
            title: 'At a glance',
            body: (
              <KeyValues
                rows={[
                  ['Collateral', 'Stock tokens of the same market'],
                  ['You receive', 'Premium in USDG, upfront'],
                  ['Max gain', 'Premium plus any rise up to the strike'],
                  ['Protocol fee', '0.5% per trade'],
                ]}
              />
            ),
          },
        ],
      },
      {
        slug: 'cash-secured-puts',
        title: 'Cash-secured puts',
        lead: 'Get paid now for agreeing to buy a stock at a price you pick.',
        sections: [
          {
            id: 'how',
            title: 'How it works',
            body: (
              <>
                <p>You lock enough USDG to buy the stock at your strike and sell a put. The premium is paid to you upfront.</p>
                <ul className="docs-list">
                  <li>At or above the strike at expiry: the put expires worthless. Your USDG unlocks and you keep the premium.</li>
                  <li>Below the strike: the put is exercised. Your locked USDG buys the stock tokens at the strike, and you keep the premium.</li>
                </ul>
              </>
            ),
          },
          {
            id: 'when',
            title: 'When it fits',
            body: <p>Puts suit traders who would like to buy on a dip anyway. If the stock never falls to your strike, the premium is your return.</p>,
          },
          {
            id: 'summary',
            title: 'At a glance',
            body: (
              <KeyValues
                rows={[
                  ['Collateral', 'USDG: strike multiplied by size'],
                  ['You receive', 'Premium in USDG, upfront'],
                  ['If exercised', 'You receive stock tokens at the strike'],
                  ['Protocol fee', '0.5% per trade'],
                ]}
              />
            ),
          },
        ],
      },
      {
        slug: 'binary-options',
        title: 'Binary options',
        lead: 'A plain directional call: will the stock close above or below a level at expiry?',
        sections: [
          {
            id: 'how',
            title: 'How it works',
            body: (
              <>
                <p>You pick a market, a direction (up or down) and a stake in USDG. At expiry the oracle price decides the outcome.</p>
                <ul className="docs-list">
                  <li>Right: you collect close to 2x your stake.</li>
                  <li>Wrong: you lose the stake. Nothing more.</li>
                </ul>
                <Callout>The exact payout multiple for a position is shown in the app before you sign. It sits close to, and below, 2x.</Callout>
              </>
            ),
          },
          {
            id: 'summary',
            title: 'At a glance',
            body: (
              <KeyValues
                rows={[
                  ['Stake', 'USDG'],
                  ['Max loss', 'Your stake'],
                  ['Payout if right', 'Close to 2x the stake'],
                  ['Protocol fee', '0.5% per trade'],
                ]}
              />
            ),
          },
        ],
      },
      {
        slug: 'yield-vault',
        title: 'Yield vault',
        lead: 'Deposit USDG and let the vault write covered calls on your behalf.',
        sections: [
          {
            id: 'how',
            title: 'How it works',
            body: (
              <>
                <p>The vault pools deposits and runs a covered-call strategy each cycle. Premium earned is added back to the pool, so your share compounds without you managing positions.</p>
                <p>Your deposit is represented by a vault share. When you withdraw, you receive your share of the pool at that time.</p>
              </>
            ),
          },
          {
            id: 'risk',
            title: 'What to keep in mind',
            body: <p>Vault yield is not guaranteed. When stocks rise sharply past the strikes the vault sold, upside is capped for that cycle, and the pool can be worth less than you deposited if the underlying falls.</p>,
          },
        ],
      },
    ],
  },
  {
    title: 'Protocol',
    pages: [
      {
        slug: 'markets',
        title: 'Markets',
        lead: `Options on ${offered.length} tokenized stocks and ETFs, all priced by Chainlink.`,
        sections: [
          {
            id: 'hours',
            title: 'Trading hours and prices',
            body: (
              <KeyValues
                rows={[
                  ['Trading', '24/5'],
                  ['Price updates', 'Every 30 seconds, plus deviation triggers'],
                  ['Price source', 'Chainlink price feeds'],
                  ['New markets', 'Added regularly'],
                ]}
              />
            ),
          },
          {
            id: 'stocks',
            title: `Stocks (${stocks.length})`,
            body: (
              <div className="docs-tickers">
                {stocks.map((m) => (
                  <span key={m.t}>
                    <b>{m.t}</b> {m.n}
                  </span>
                ))}
              </div>
            ),
          },
          {
            id: 'etfs',
            title: `Index ETFs (${etfs.length})`,
            body: (
              <div className="docs-tickers">
                {etfs.map((m) => (
                  <span key={m.t}>
                    <b>{m.t}</b> {m.n}
                  </span>
                ))}
              </div>
            ),
          },
          {
            id: 'next',
            title: `Listed, options coming (${waiting.length})`,
            body: (
              <>
                <p>These stock tokens exist on {NETWORK.name} but have no Chainlink price feed there yet. Options on them open once a feed is live.</p>
                <div className="docs-tickers">
                  {waiting.map((m) => (
                    <span key={m.t}>
                      <b>{m.t}</b> {m.n}
                    </span>
                  ))}
                </div>
              </>
            ),
          },
        ],
      },
      {
        slug: 'settlement',
        title: 'Settlement',
        lead: 'Every position expires to the oracle price. Settlement is automatic and nobody can interfere with it.',
        sections: [
          {
            id: 'flow',
            title: 'What happens at expiry',
            body: (
              <Steps
                items={[
                  ['Feeds stay current', 'Chainlink price feeds update every 30 seconds, with deviation triggers in between.'],
                  ['Price is pulled on-chain', 'At expiry the contract reads the oracle price for the market.'],
                  ['Positions settle in the same call', 'Every position in that expiry is resolved against that single price.'],
                  ['Payouts go out', 'Payouts are calculated and sent immediately. There is no manual step.'],
                ]}
              />
            ),
          },
          {
            id: 'why',
            title: 'Why an oracle',
            body: <p>A single, public price source means no counterparty can pick a better number for themselves, and no operator can pause or rewrite an expiry.</p>,
          },
        ],
      },
      {
        slug: 'fees',
        title: 'Fees',
        lead: 'One flat protocol fee per trade. Nothing else is charged by the protocol.',
        sections: [
          {
            id: 'protocol-fee',
            title: 'Protocol fee',
            body: (
              <KeyValues
                rows={[
                  ['Protocol fee', '0.5% per trade'],
                  ['Subscription', 'None'],
                  ['Withdrawal fee', 'None'],
                ]}
              />
            ),
          },
          {
            id: 'gas',
            title: 'Network fees',
            body: <p>Transactions on {NETWORK.name} also cost network gas, paid by your wallet to the network, not to xTradeFi.</p>,
          },
        ],
      },
      {
        slug: 'network',
        title: 'Network',
        lead: `xTradeFi runs on ${NETWORK.name}.`,
        sections: [
          {
            id: 'parameters',
            title: 'Network parameters',
            body: (
              <KeyValues
                rows={
                  [
                    ['Network', NETWORK.name],
                    ['Chain ID', String(NETWORK.chainId)],
                    NETWORK.nativeSymbol ? ['Gas token', NETWORK.nativeSymbol] : null,
                    NETWORK.rpcUrl ? ['RPC URL', NETWORK.rpcUrl] : null,
                    NETWORK.explorerUrl ? ['Explorer', NETWORK.explorerUrl] : null,
                    ['Oracle', 'Chainlink'],
                  ].filter(Boolean) as [string, string][]
                }
              />
            ),
          },
          {
            id: 'contracts',
            title: 'Contracts',
            body: <p>The xTradeFi contract addresses will be listed on this page at launch. Only trust addresses published here and on the official X account.</p>,
          },
        ],
      },
    ],
  },
  {
    title: 'Safety',
    pages: [
      {
        slug: 'risks',
        title: 'Risks',
        lead: 'Options are risky. Read this before you trade.',
        sections: [
          {
            id: 'market',
            title: 'Market risk',
            body: (
              <ul className="docs-list">
                <li>Covered calls cap your upside at the strike until expiry.</li>
                <li>Cash-secured puts can leave you holding stock tokens bought above the current price.</li>
                <li>Binary options lose the full stake when the call is wrong.</li>
                <li>The yield vault can be worth less than your deposit.</li>
              </ul>
            ),
          },
          {
            id: 'limits',
            title: 'What you cannot lose',
            body: <p>Positions are fully collateralized when they open. You cannot lose more than the collateral or stake you locked.</p>,
          },
          {
            id: 'tech',
            title: 'Technical risk',
            body: <p>Smart contracts, oracles and the network itself can fail or behave unexpectedly. Only use funds you can afford to lose and check contract addresses before signing.</p>,
          },
          {
            id: 'assets',
            title: 'About tokenized stocks',
            body: <p>Tokenized stocks track share prices. Holding them does not make you a shareholder of the company, and xTradeFi is not affiliated with the companies whose shares are tracked.</p>,
          },
        ],
      },
    ],
  },
]

export const DOC_PAGES = DOC_GROUPS.flatMap((g) => g.pages.map((p) => ({ ...p, group: g.title })))
