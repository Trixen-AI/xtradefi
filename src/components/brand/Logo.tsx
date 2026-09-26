import { useId } from 'react'
import { MARK_CALL, MARK_PUT, MARK_TILE, WORD_BOX, WORD_D } from './logoPaths'

type Props = { className?: string; mark?: boolean; ink?: string; title?: string }

/** xTradeFi logo, inline SVG. Mark + outlined wordmark (Space Grotesk 500), built by scripts/build-logo.mjs. */
export function Logo({ className = '', mark = false, ink = 'var(--text)', title = 'xTradeFi' }: Props) {
  const id = useId().replace(/:/g, '')
  const w = mark ? 48 : WORD_BOX.w
  return (
    <svg className={className} viewBox={`0 0 ${w} 48`} fill="none" role="img" aria-label={title}>
      <defs>
        <linearGradient id={`${id}t`} x1="3" y1="45" x2="45" y2="3" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--call-a)" />
          <stop offset=".55" stopColor="var(--call-b)" />
          <stop offset="1" stopColor="var(--put-a)" />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="13" y1="35" x2="35" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--call-a)" />
          <stop offset="1" stopColor="var(--call-b)" />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="13" y1="13" x2="35" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--put-a)" />
          <stop offset="1" stopColor="var(--put-b)" />
        </linearGradient>
      </defs>
      <path d={MARK_TILE} stroke={`url(#${id}t)`} strokeWidth="3" strokeLinejoin="round" />
      <path d={MARK_PUT} stroke={`url(#${id}p)`} strokeWidth="4.2" strokeLinecap="round" />
      <path d={MARK_CALL} stroke={`url(#${id}c)`} strokeWidth="4.2" strokeLinecap="round" />
      <circle cx="24" cy="24" r="4.4" fill={ink} stroke="var(--bg)" strokeWidth="2" />
      {!mark && <path transform={`translate(${WORD_BOX.x} ${WORD_BOX.y})`} d={WORD_D} fill={ink} />}
    </svg>
  )
}
