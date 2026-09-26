import { useId, type ReactNode } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import { useInView } from '@/hooks/useInView'

type Props = {
  children: ReactNode
  /** grad: two gradient strokes (top-left chamfer + bottom-right chamfer). line: one thin outline, bottom-right chamfer. */
  variant?: 'grad' | 'line'
  className?: string
}

const C = 14 // chamfer size, px

/** A word or phrase wrapped in the page's chamfered outline. Paths are computed from the measured box and draw on
 *  when the element scrolls into view. */
export function Boxed({ children, variant = 'line', className = '' }: Props) {
  const id = useId().replace(/:/g, '')
  const [sizeRef, { w, h }] = useElementSize<HTMLSpanElement>()
  const [viewRef, inView] = useInView<HTMLSpanElement>()
  const set = (el: HTMLSpanElement | null) => {
    sizeRef.current = el
    viewRef.current = el
  }
  const s = variant === 'grad' ? 1.25 : 0.75
  let paths: { d: string; stroke: string; len: number }[] = []
  if (w > 0 && h > 0) {
    if (variant === 'grad') {
      const bx = w * 0.37
      paths = [
        { d: `M${s} ${h * 0.8}V${C}L${C} ${s}H${w - s}`, stroke: `url(#${id}a)`, len: h * 0.8 + w + C },
        { d: `M${bx} ${h - s}H${w - C}L${w - s} ${h - C}`, stroke: `url(#${id}b)`, len: w - bx + C },
      ]
    } else {
      paths = [{ d: `M${s} ${s}H${w - s}V${h - C}L${w - C} ${h - s}H${s}Z`, stroke: 'var(--text-60)', len: 2 * (w + h) }]
    }
  }
  return (
    <span ref={set} className={`boxed boxed--${variant} ${inView ? 'is-in' : ''} ${className}`}>
      {children}
      {w > 0 && (
        <svg className="boxed__svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
          {variant === 'grad' && (
            <defs>
              <linearGradient id={`${id}a`} x1="0" y1={h} x2={w} y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--call-a)" />
                <stop offset="0.7" stopColor="var(--call-b)" />
              </linearGradient>
              <linearGradient id={`${id}b`} x1={w * 0.37} y1={h} x2={w} y2={h - C} gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--put-a)" />
                <stop offset="1" stopColor="var(--put-b)" />
              </linearGradient>
            </defs>
          )}
          {paths.map((p, i) => (
            <path
              key={i}
              d={p.d}
              stroke={p.stroke}
              strokeWidth={s * 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: p.len, strokeDashoffset: inView ? 0 : p.len, transitionDelay: `${0.15 + i * 0.35}s` }}
            />
          ))}
        </svg>
      )}
    </span>
  )
}
