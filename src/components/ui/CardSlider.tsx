import type { ReactNode } from 'react'

type ArrowsProps = { onPrev: () => void; onNext: () => void; canPrev: boolean; canNext: boolean; className?: string }

/** Long thin arrows used by every card slider. */
export function SliderArrows({ onPrev, onNext, canPrev, canNext, className = '' }: ArrowsProps) {
  return (
    <div className={`slider-arrows ${className}`}>
      <button type="button" aria-label="Previous" onClick={onPrev} disabled={!canPrev}>
        <svg width="54" height="46" viewBox="0 0 54 46" fill="none" aria-hidden="true">
          <path d="M53 23H2M23 1 1.5 23 23 45" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      <button type="button" aria-label="Next" onClick={onNext} disabled={!canNext}>
        <svg width="54" height="46" viewBox="0 0 54 46" fill="none" aria-hidden="true">
          <path d="M1 23h51M31 1l21.5 22L31 45" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </div>
  )
}

export function CardTrack({ index, children, className = '' }: { index: number; children: ReactNode; className?: string }) {
  return (
    <div className={`card-track ${className}`}>
      <div className="card-track__inner" style={{ transform: `translate3d(calc(${index} * -1 * var(--card-w)), 0, 0)` }}>
        {children}
      </div>
    </div>
  )
}
