import { useState, type ReactNode } from 'react'
import { PlayTri } from '@/components/ui/ArrowUR'
import type { FeedState } from '../hooks/chainData'

/** Bordered block with a mono title bar, the dashboard's basic container. */
export function Panel({ title, action, children, className = '', pad = true }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={`dp ${className}`}>
      {title ? (
        <header className="dp__head">
          <h2 className="dp__title">
            <PlayTri /> {title}
          </h2>
          {action ? <div className="dp__action">{action}</div> : null}
        </header>
      ) : null}
      <div className={pad ? 'dp__body' : ''}>{children}</div>
    </section>
  )
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: 'up' | 'down' }) {
  return (
    <div className="dstat">
      <div className="dstat__label">{label}</div>
      <div className={`dstat__value ${tone ? `is-${tone}` : ''}`}>{value}</div>
      {sub ? <div className="dstat__sub">{sub}</div> : null}
    </div>
  )
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="dempty">
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M13 3H43a2 2 0 0 1 2 2V35L35 45H5a2 2 0 0 1-2-2V13Z" stroke="var(--divider)" strokeWidth="2" />
        <path d="M16 24h16" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="dempty__title">{title}</div>
      {children ? <p className="dempty__text">{children}</p> : null}
      {action}
    </div>
  )
}

const STATE_LABEL: Record<FeedState, string> = { open: 'Open', closed: 'Closed', stale: 'Stale', none: 'No feed' }

/** Market state: icon + label, never colour alone. */
export function StateTag({ state }: { state: FeedState }) {
  return (
    <span className={`dstate is-${state}`}>
      <i aria-hidden="true" />
      {STATE_LABEL[state]}
    </span>
  )
}

/** Ticker monogram (no third-party logos). */
export function TickerBadge({ ticker, size = 32 }: { ticker: string; size?: number }) {
  return (
    <span className="dtick" style={{ width: size, height: size, fontSize: Math.max(9, size * 0.3) }} aria-hidden="true">
      {ticker.slice(0, 4)}
    </span>
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      className="dbtn-icon"
      aria-label={done ? 'Copied' : label}
      title={done ? 'Copied' : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          window.setTimeout(() => setDone(false), 1400)
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--call-a)" strokeWidth="1.8" aria-hidden="true">
          <path d="M2 8.5 6 12l8-8" />
        </svg>
      ) : (
        <svg width="14" height="16" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="1" y="4" width="10" height="13" />
          <path d="M5 1h10v13" />
        </svg>
      )}
    </button>
  )
}

export function ExtLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={`dlink ${className}`} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M1 13 13 1M4.5 1H13v8.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </a>
  )
}

/** Skeleton bar for values that are loading. */
export function Skel({ w = 80 }: { w?: number }) {
  return <span className="dskel" style={{ width: w }} aria-hidden="true" />
}

export function Notice({ tone = 'info', title, children, action }: { tone?: 'info' | 'warn'; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className={`dnotice is-${tone}`} role={tone === 'warn' ? 'alert' : 'status'}>
      <span className="dnotice__icon" aria-hidden="true">
        {tone === 'warn' ? '!' : 'i'}
      </span>
      <div className="dnotice__body">
        <strong>{title}</strong>
        {children ? <span>{children}</span> : null}
      </div>
      {action ? <div className="dnotice__action">{action}</div> : null}
    </div>
  )
}
