import { NavLink, Outlet } from 'react-router'
import { useBlockNumber } from 'wagmi'
import { Logo } from '@/components/brand/Logo'
import { LINKS } from '@/data/site'
import { robinhoodChain } from '../wallet/chain'
import { hasProjectId } from '../wallet/appkit'
import { AccountButton, SwitchChainButton } from './wallet'
import { useWallet } from '../hooks/useWallet'
import { Notice } from './ui'

const NAV = [
  { to: '/app', label: 'Overview', end: true, icon: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z' },
  { to: '/app/markets', label: 'Markets', icon: 'M3 20h18M6 16V9M11 16V5M16 16v-5M21 16V7' },
  { to: '/app/trade', label: 'Trade', icon: 'M4 17 10 11l4 4 7-8M15 7h6v6' },
  { to: '/app/vault', label: 'Vault', icon: 'M4 5h16v14H4zM4 9h16M12 13v3M9 5V3M15 5V3' },
  { to: '/app/positions', label: 'Positions', icon: 'M4 6h16M4 12h16M4 18h10' },
]

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

function NetworkChip() {
  const block = useBlockNumber({ chainId: robinhoodChain.id, query: { refetchInterval: 12_000 } })
  return (
    <span className="dnet" title="Latest Robinhood Chain block, read from the network RPC">
      <i className={block.data ? 'is-live' : ''} aria-hidden="true" />
      <span className="dnet__name">{robinhoodChain.name}</span>
      <span className="dnet__block">{block.data ? `#${block.data.toLocaleString('en-US')}` : 'connecting…'}</span>
    </span>
  )
}

export function DashLayout() {
  const { wrongChain } = useWallet()
  return (
    <div className="dash">
      <header className="dash-top">
        <a className="dash-top__logo" href="/" aria-label="xTradeFi website">
          <Logo className="dash-top__logo-svg" />
        </a>
        <div className="dash-top__mid">
          <span className="dash-top__tag">App</span>
          <NetworkChip />
        </div>
        <div className="dash-top__right">
          <AccountButton />
        </div>
      </header>

      <nav className="dash-rail" aria-label="Dashboard">
        <ul>
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} end={n.end} className={({ isActive }) => `dash-rail__link ${isActive ? 'is-active' : ''}`}>
                <NavIcon d={n.icon} />
                <span>{n.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="dash-rail__foot">
          <a href="/docs">Docs</a>
          <a href="/">Website</a>
          <a href={LINKS.x} target="_blank" rel="noopener noreferrer">
            X
          </a>
        </div>
      </nav>

      <main className="dash-main">
        {!hasProjectId ? (
          <Notice tone="warn" title="Wallet connection is not configured.">
            Add your Reown project ID as VITE_REOWN_PROJECT_ID in a .env file (see .env.example) and restart the app. Market data below is live either way.
          </Notice>
        ) : null}
        {wrongChain ? (
          <Notice tone="warn" title={`Your wallet is on another network.`} action={<SwitchChainButton />}>
            xTradeFi runs on {robinhoodChain.name} (chain ID {robinhoodChain.id}).
          </Notice>
        ) : null}
        <Outlet />
      </main>
    </div>
  )
}
