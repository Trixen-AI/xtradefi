import { useState } from 'react'
import { FAQ, LINKS } from '@/data/site'
import { Boxed } from '@/components/ui/Boxed'
import { Corners } from '@/components/ui/Corners'
import { Reveal } from '@/components/ui/Reveal'

export function Faq() {
  const [tab, setTab] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq-2" id="faq" data-section="faq">
      <div className="container">
        <div className="section-head-cols">
          <div className="section-heading">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="section-title section-title--xl">
              <Reveal>{FAQ.headTop}</Reveal>
              <br />
              <Boxed>
                <Reveal delay={0.1}>{FAQ.headBoxed}</Reveal>
              </Boxed>
            </h2>
          </div>
          <p className="section-descr section-descr--faq">
            {FAQ.side[0]}
            <br />
            {FAQ.side[1]}
            <a href={LINKS.x} target="_blank" rel="noopener noreferrer">
              @QuiverFi_
            </a>
            .
          </p>
        </div>
      </div>
      <div className="faq-container">
        <div className="faq-content">
          <div className="faq-tabs" role="tablist" aria-label="FAQ topics">
            {FAQ.tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={`faq-tab ${tab === i ? 'is-current' : ''}`}
                onClick={() => {
                  setTab(i)
                  setOpen(null)
                }}
              >
                <span className="faq-tab__inner">
                  {t}
                  {tab === i && <Corners size={14} inset={-12} />}
                </span>
              </button>
            ))}
          </div>
          <div className="faq-list">
            {FAQ.items[tab].map((item, i) => {
              const isOpen = open === i
              return (
                <div key={item.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button type="button" className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{item.q}</span>
                    <svg className="faq-plus" width="28" height="28" viewBox="0 0 28 28" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M1 14h26" />
                      <path className="faq-plus__v" d="M14 1v26" />
                    </svg>
                  </button>
                  <div className="faq-a">
                    <div className="faq-a__inner">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
