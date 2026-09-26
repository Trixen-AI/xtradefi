import { useState } from 'react'
import { GUIDES, LINKS } from '@/data/site'
import { Corners } from '@/components/ui/Corners'
import { ArrowUR, PlayTri } from '@/components/ui/ArrowUR'
import { Art } from '@/components/ui/Art'
import { CardTrack, SliderArrows } from '@/components/ui/CardSlider'
import { useSlider } from '@/hooks/useSlider'
import { ScrambleLink } from '@/components/ui/Scramble'
import { Reveal } from '@/components/ui/Reveal'

type Tab = (typeof GUIDES.tabs)[number]

export function Guides() {
  const [tab, setTab] = useState<Tab>(GUIDES.tabs[0])
  const items = GUIDES.items[tab]
  const s = useSlider(items.length, tab)
  return (
    <section className="latest-items latest-items--guides" id="guides" data-section="guides">
      <div className="container">
        <div className="section-head-cols">
          <span className="section-heading-dots" aria-hidden="true">
            <i />
            <i />
          </span>
          <h2 className="section-title">
            <Reveal>{GUIDES.headTop}</Reveal>
          </h2>
        </div>
      </div>
      <div className="tabs-head">
        <div className="tabs-head__left" role="tablist" aria-label="Guide topics">
          {GUIDES.tabs.map((t) => (
            <button key={t} type="button" role="tab" aria-selected={t === tab} className={`tab-big ${t === tab ? 'is-current' : ''}`} onClick={() => setTab(t)}>
              {t}
              {t === tab && <Corners size={12} inset={-2} />}
            </button>
          ))}
        </div>
        <div className="tabs-head__right">
          <span className="tabs-more">
            <PlayTri /> {GUIDES.more}
          </span>
          <ScrambleLink className="tabs-all" href={LINKS.docs} text={GUIDES.cta}>
            <span className="tabs-all__box">
              <ArrowUR size={22} />
            </span>
          </ScrambleLink>
        </div>
      </div>
      <div className="slider-row">
        <SliderArrows onPrev={s.prev} onNext={s.next} canPrev={s.canPrev} canNext={s.canNext} className="slider-row__arrows" />
        <CardTrack index={s.index}>
          {items.map((it) => (
            <a key={it.title} className="blog-card" href={LINKS.docs}>
              <div className="blog-card__meta">
                {it.tag} <i className="blog-card__sq" /> {it.time}
              </div>
              <div className="blog-card__media">
                <Corners size={10} inset={-16} tone="dim" />
                <Art kind={it.art} />
              </div>
              <h3 className="blog-card__title">{it.title}</h3>
              <div className="blog-card__by">
                By <span>{GUIDES.by}</span>
              </div>
            </a>
          ))}
        </CardTrack>
      </div>
    </section>
  )
}
