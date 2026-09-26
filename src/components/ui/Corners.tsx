import type { CSSProperties } from 'react'

type Props = { size?: number; inset?: number; className?: string; tone?: 'text' | 'dim' }

/** Four L-shaped brackets around the parent (parent must be position: relative). */
export function Corners({ size = 12, inset = -1, className = '', tone = 'text' }: Props) {
  const style = { '--c-size': `${size}px`, '--c-inset': `${inset}px` } as CSSProperties
  return (
    <span className={`corners corners--${tone} ${className}`} style={style} aria-hidden="true">
      <i className="corners__tl" />
      <i className="corners__tr" />
      <i className="corners__bl" />
      <i className="corners__br" />
    </span>
  )
}
