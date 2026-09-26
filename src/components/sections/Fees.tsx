import { useState } from 'react'
import { FEES, LINKS } from '@/data/site'
import { Boxed } from '@/components/ui/Boxed'
import { ArrowUR, PlayTri } from '@/components/ui/ArrowUR'
import { ScrambleLink } from '@/components/ui/Scramble'
import { Reveal } from '@/components/ui/Reveal'

function FeeIcon({ name }: { name: string }) {
  const s = { fill: 'none', strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const tile = (
    <>
      <rect x="4" y="4" width="62" height="62" rx="12" fill="#15171a" stroke="rgba(238,240,230,0.14)" />
      <rect x="10" y="10" width="50" height="50" rx="8" stroke="rgba(238,240,230,0.08)" fill="none" />
    </>
  )
  return (
    <svg className="fee-icon" width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
      {tile}
      {name === 'call' && <path {...s} stroke="var(--call-a)" d="M18 48 36 28h16" />}
      {name === 'put' && <path {...s} stroke="var(--put-b)" d="M18 50 32 30h20" />}
      {name === 'binary' && <path {...s} stroke="var(--call-b)" d="M18 46h17V24h17" />}
      {name === 'vault' && (
        <g {...s} stroke="var(--call-a)">
          <path d="M35 20a15 15 0 1 1-14 10" />
          <path d="M16 26l5 4 4-5" />
        </g>
      )}
      {name === 'network' && (
        <g {...s} stroke="var(--text)">
          <circle cx="24" cy="24" r="5" />
          <circle cx="46" cy="24" r="5" />
          <circle cx="35" cy="46" r="5" stroke="var(--call-a)" />
          <path d="M29 24h12M27 28l5 13M43 28l-5 13" strokeWidth="1.6" />
        </g>
      )}
      {name === 'oracle' && (
        <g {...s} stroke="var(--text)">
          <circle cx="35" cy="35" r="16" />
          <path d="M22 40l8-6 5 4 6-9 7 4" stroke="var(--call-b)" />
        </g>
      )}
      {name === 'settle' && (
        <g {...s} stroke="var(--text)">
          <circle cx="35" cy="35" r="16" />
          <path d="M35 24v11l7 5" stroke="var(--put-a)" />
        </g>
      )}
      {name === 'contract' && (
        <g {...s} stroke="var(--text)">
          <rect x="22" y="18" width="26" height="34" rx="2" />
          <path d="M28 28h14M28 35h14M28 42h8" stroke="var(--call-a)" strokeWidth="1.8" />
        </g>
      )}
    </svg>
  )
}

export function Fees() {
  const [info, setInfo] = useState(false)
  // Two rows of cards; the toggle swaps which row comes first. Rows can hold 3 or 4 cards, so each card spans
  // 12 / rowLength columns and the chamfered corners are set per position instead of by nth-child.
  const rows = info ? [FEES.info, FEES.products] : [FEES.products, FEES.info]
  const cards = rows.flatMap((row, r) =>
    row.map((c, i) => {
      const corner = r === 0 ? (i === 0 ? 'tl' : i === row.length - 1 ? 'tr' : '') : i === 0 ? 'bl' : i === row.length - 1 ? 'br' : ''
      return { ...c, span: 12 / row.length, cls: `${i === 0 ? 'is-first' : ''} ${corner ? `is-${corner}` : ''}` }
    }),
  )
  return (
    <section className="pricing-section" id="fees" data-section="fees">
      <div className="container">
        <div className="section-head-cols price-section">
          <div className="section-heading">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="section-title section-title--xl">
              <Reveal>{FEES.headTop}</Reveal>{' '}
              <Boxed>
                <Reveal delay={0.1}>{FEES.headBoxed}</Reveal>
              </Boxed>
            </h2>
          </div>
          <div className="price-descr">
            <p>{FEES.side}</p>
            <p className="price-note">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="8.5" stroke="var(--call-a)" />
                <path d="M6 10h8M10 6v8" stroke="var(--put-a)" />
              </svg>
              {FEES.note}
            </p>
            <label className="price-toggle">
              <span className="price-toggle__switch">
                <input type="checkbox" checked={info} onChange={(e) => setInfo(e.target.checked)} />
                <i />
              </span>
              <span className="price-toggle__label">{info ? FEES.toggle[1] : FEES.toggle[0]}</span>
            </label>
          </div>
        </div>

        <div className="pricing-clip-box">
          <svg className="pricing-clip-box__frame" viewBox="0 0 1377 564" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0.5 563.5V20L20 0.5H1357L1376.5 20V563.5" fill="none" stroke="var(--divider)" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="pricing-grid">
            {cards.map((c) => (
              <div key={c.name} className={`pricing-card ${c.cls}`} style={{ gridColumn: `span ${c.span}` }}>
                <div className="pricing-card__head">
                  <FeeIcon name={c.icon} />
                  <h3>{c.name}</h3>
                </div>
                <dl className="pricing-card__rows">
                  {c.rows.map(([k, v]) => (
                    <div key={k} className="pricing-card__row">
                      <dt>
                        <PlayTri /> {k}
                      </dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>

        <div className="pricing-action-wrapper">
          <ScrambleLink className="pricing-action" href={LINKS.docs} text={FEES.cta}>
            <ArrowUR size={24} />
          </ScrambleLink>
        </div>
      </div>
    </section>
  )
}
