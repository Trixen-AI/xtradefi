import { useEffect, useState } from 'react'
import { TRACK } from '@/data/site'
import { prefersReducedMotion } from '@/lib/gsap'
import { Boxed } from '@/components/ui/Boxed'
import { Corners } from '@/components/ui/Corners'
import { Reveal } from '@/components/ui/Reveal'

const DELAY = 3000
const DURATION = 500

/** Numbered feature strip that auto-advances one slide every 3s (0.5s ease), looping forever. */
export function Overview() {
  const items = TRACK.items
  const [index, setIndex] = useState(0)
  const [animate, setAnimate] = useState(true)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = window.setInterval(() => {
      setAnimate(true)
      setIndex((i) => i + 1)
    }, DELAY)
    return () => window.clearInterval(id)
  }, [])

  // After sliding onto the cloned first slide, jump back to the real one without a transition.
  useEffect(() => {
    if (index < items.length) return
    const id = window.setTimeout(() => {
      setAnimate(false)
      setIndex(0)
    }, DURATION + 20)
    return () => window.clearTimeout(id)
  }, [index, items.length])

  const slides = [...items, ...items.slice(0, 2)]
  const active = index % items.length

  return (
    <section className="overview" id="overview" data-section="overview">
      <div className="overview-slider-wrap">
        <div className="overview-slider" role="region" aria-label="What xTradeFi offers" aria-roledescription="carousel">
          <div className="overview-slider__track" style={{ transform: `translateX(calc(${index} * -1 * var(--slide-w)))`, transition: animate ? `transform ${DURATION}ms ease` : 'none' }}>
            {slides.map((label, i) => (
              <div key={i} className={`overview-slide ${i % items.length === active && i >= index ? 'is-active' : ''}`} aria-hidden={i % items.length !== active}>
                <span className="overview-slide__n">{String((i % items.length) + 1).padStart(2, '0')}</span>
                <span className="overview-slide__label">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <i className="overview-fade overview-fade--left" aria-hidden="true" />
        <i className="overview-fade overview-fade--right" aria-hidden="true" />
        <span className="overview-corners">
          <Corners size={14} inset={-22} />
        </span>
      </div>

      <div className="overview-descr">
        <div className="container overview-descr__inner">
          <div className="section-heading">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="section-title">
              <Boxed>
                <Reveal>{TRACK.headTop}</Reveal>
              </Boxed>
              <br />
              <Reveal delay={0.1}>{TRACK.headBottom}</Reveal>
            </h2>
          </div>
          <p className="overview-side">{TRACK.side}</p>
        </div>
      </div>
    </section>
  )
}
