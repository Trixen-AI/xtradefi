import { useId } from 'react'

/** Up-right arrow: one hairline with an open head, stroked with the call→put gradient. */
export function ArrowUR({ size = 22, className = '' }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={`arrow-ur ${className}`} width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="1" y1="21" x2="21" y2="1" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--call-a)" />
          <stop offset="0.5" stopColor="var(--call-b)" />
          <stop offset="1" stopColor="var(--put-b)" />
        </linearGradient>
      </defs>
      <path d="M1.5 20.5 20.5 1.5M8 1.5h12.5V14" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  )
}

export function ArrowPlain({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 13 13 1M4.5 1H13v8.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function Caret({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="7" height="5" viewBox="0 0 7 5" fill="currentColor" aria-hidden="true">
      <path d="M0 0h7L3.5 5z" />
    </svg>
  )
}

export function PlayTri({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="5" height="7" viewBox="0 0 5 7" fill="currentColor" aria-hidden="true">
      <path d="M0 0v7l5-3.5z" />
    </svg>
  )
}
