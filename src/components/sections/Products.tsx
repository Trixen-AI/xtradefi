import { useEffect, useRef, useState } from 'react'
import { PRODUCTS } from '@/data/site'
import { stageStore } from '@/lib/stageStore'
import { Boxed } from '@/components/ui/Boxed'
import { NbChip } from '@/components/ui/NbChip'
import { ArrowUR } from '@/components/ui/ArrowUR'
import { ScrambleLink } from '@/components/ui/Scramble'
import { Reveal } from '@/components/ui/Reveal'

/** Product rows: the row crossing the middle of the viewport is fully lit (others sit at 0.35) and drives the
 *  payoff shown on the 3D tile. */
export function Products() {
  const rows = useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = useState(-1)

  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const mid = window.innerHeight * 0.55
      let found = -1
      rows.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.top < mid && r.bottom > mid) found = i
      })
      setActive(found)
      if (found >= 0) stageStore.set({ productIndex: found })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section className="solutions-section" id="products" data-section="products">
      <div className="container">
        <div className="section-heading section-heading--lg">
          <span className="section-heading-dots" aria-hidden="true">
            <i />
            <i />
          </span>
          <h2 className="section-title section-title--lg">
            <Boxed>
              <Reveal>{PRODUCTS.title}</Reveal>
            </Boxed>
          </h2>
        </div>
        <div className="solutions-list">
          {PRODUCTS.items.map((p, i) => (
            <div key={p.kind} ref={(el) => void (rows.current[i] = el)} className={`solutions-row ${active === i ? 'is-active' : ''}`}>
              <NbChip n={String(i + 1).padStart(2, '0')} />
              <div className="solutions-cols">
                <div className="solutions-col solutions-col--left">
                  <h3 className="solutions-row-title">
                    {p.title[0]}
                    <br />
                    {p.title[1]}
                  </h3>
                  <p className="solutions-row-descr">{p.body}</p>
                </div>
                <div className="solutions-col solutions-col--right">
                  <ul className="solutions-feat-list">
                    {p.feats.map((f) => (
                      <li key={f} className="solutions-feat-item">
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="solutions-actions">
                    {p.ctas.map((c) => (
                      <ScrambleLink key={c.label} href={c.href} text={c.label} className="link-more--sm">
                        <ArrowUR className="link-more-icon" size={20} />
                      </ScrambleLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
