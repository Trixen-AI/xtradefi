import type { ReactNode } from 'react'

/** Endless horizontal loop. Content renders twice; the track moves by exactly one copy. */
export function Marquee({ children, seconds = 40, className = '' }: { children: ReactNode; seconds?: number; className?: string }) {
  return (
    <div className={`marquee ${className}`}>
      <div className="marquee__track" style={{ animationDuration: `${seconds}s` }}>
        <div className="marquee__set">{children}</div>
        <div className="marquee__set" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
