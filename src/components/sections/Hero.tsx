import { useEffect, useRef, useState } from 'react'
import { HERO, HERO_ORDERS } from '@/data/site'
import { gsap, SCRAMBLE_CHARS, prefersReducedMotion } from '@/lib/gsap'
import { Boxed } from '@/components/ui/Boxed'
import { Logo } from '@/components/brand/Logo'
import { PlayTri } from '@/components/ui/ArrowUR'
import { Reveal } from '@/components/ui/Reveal'

const CYCLE_MS = 4500
// Connector from the prompt box to the status box, in the 950 x 365 coordinate space of the hero's middle column.
const CONNECTOR = 'M92 146H228L258 116H676Q686 116 686 126V210Q686 220 696 220H774'

export function Hero() {
  const [index, setIndex] = useState(0)
  const status = useRef<HTMLSpanElement>(null)
  const tool = useRef<HTMLSpanElement>(null)
  const rows = useRef<(HTMLSpanElement | null)[]>([])
  const path = useRef<SVGPathElement>(null)
  const order = HERO_ORDERS[index]

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HERO_ORDERS.length), CYCLE_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const reduced = prefersReducedMotion()
    const targets: [HTMLElement | null, string][] = [
      [status.current, order.status],
      [tool.current, order.tool],
      ...order.rows.map((r, i) => [rows.current[i], r] as [HTMLElement | null, string]),
    ]
    if (reduced) {
      targets.forEach(([el, t]) => el && (el.textContent = t))
      return
    }
    const tl = gsap.timeline()
    targets.forEach(([el, t], i) => {
      if (el) tl.to(el, { duration: 0.7, scrambleText: { text: t, chars: SCRAMBLE_CHARS, speed: 0.7 } }, 0.35 + i * 0.08)
    })
    const p = path.current
    if (p) {
      const len = p.getTotalLength()
      tl.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 0)
    }
    return () => void tl.kill()
  }, [order])

  return (
    <section className="hero" id="intro" data-section="intro">
      <div className="container hero-flex-container">
        <div className="container-middle hero-top">
          <svg className="hero-connector" viewBox="0 0 950 365" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="heroConn" x1="92" y1="146" x2="774" y2="220" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--call-a)" />
                <stop offset="0.5" stopColor="var(--call-b)" />
                <stop offset="1" stopColor="var(--put-a)" />
              </linearGradient>
            </defs>
            <path d={CONNECTOR} stroke="var(--divider)" strokeWidth="1.2" />
            <path ref={path} d={CONNECTOR} stroke="url(#heroConn)" strokeWidth="1.4" />
          </svg>

          <div className="hero-quote" aria-hidden="true">
            <svg width="22" height="16" viewBox="0 0 22 16" fill="currentColor">
              <path d="M0 16V9.6C0 4.2 2.6 1.1 7.7 0l.9 2.4C6 3.3 4.7 5 4.5 7.4H8.8V16H0zm12.7 0V9.6c0-5.4 2.6-8.5 7.7-9.6l.9 2.4c-2.6.9-3.9 2.6-4.1 5H22V16h-9.3z" />
            </svg>
          </div>
          <PlayTri className="hero-quote-tri" />
          <span className="hero-bracket hero-bracket--top" aria-hidden="true" />
          <span className="hero-bracket hero-bracket--bottom" aria-hidden="true" />

          <div className="hero-prompts" aria-live="polite">
            <div className="hero-prompts__track" style={{ transform: `translateY(${-index * 104}px)` }}>
              {HERO_ORDERS.map((o, i) => (
                <p key={o.prompt} className={`hero-prompt ${i === index ? 'is-active' : ''} ${i === index + 1 ? 'is-next' : ''}`}>
                  {o.prompt}
                </p>
              ))}
            </div>
          </div>

          <div className="hero-status">
            <span className="hero-status__dot" aria-hidden="true" />
            <span ref={status} className="hero-status__text">
              {HERO_ORDERS[0].status}
            </span>
            <span className="hero-status__icon" aria-hidden="true">
              <Logo mark className="hero-status__mark" />
            </span>
          </div>
          <div className="hero-tool">
            <PlayTri className="hero-tool__tri" />
            <span ref={tool}>{HERO_ORDERS[0].tool}</span>
          </div>
          <ul className="hero-rows">
            {HERO_ORDERS[0].rows.map((r, i) => (
              <li key={i}>
                <PlayTri className="hero-rows__tri" />
                <span ref={(el) => void (rows.current[i] = el)}>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-bottom">
          <div className="hero-bottom-left">
            <Reveal as="div" className="hero-pre-title">
              {HERO.pre}
            </Reveal>
            <h1 className="hero-heading">
              <Boxed variant="grad" className="hero-heading-top">
                <Reveal delay={0.1}>{HERO.top}</Reveal>
              </Boxed>
              <Boxed variant="grad" className="hero-heading-bottom">
                <Reveal delay={0.2}>{HERO.bottom}</Reveal>
              </Boxed>
            </h1>
          </div>
          <i className="hero-bottom-line" aria-hidden="true" />
          <p className="hero-side">{HERO.side}</p>
          <a className="hero-scroll" href="#overview">
            <span>{HERO.scroll}</span>
            <span className="hero-scroll__box">
              <svg width="46" height="58" viewBox="0 0 46 58" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M23 0v56M1 34l22 22 22-22" />
              </svg>
              <i className="hero-scroll__c1" />
              <i className="hero-scroll__c2" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
