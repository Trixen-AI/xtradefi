import { LINKS, STEPS } from '@/data/site'
import { Corners } from '@/components/ui/Corners'
import { ArrowUR, PlayTri } from '@/components/ui/ArrowUR'
import { Art } from '@/components/ui/Art'
import { CardTrack, SliderArrows } from '@/components/ui/CardSlider'
import { useSlider } from '@/hooks/useSlider'
import { ScrambleLink } from '@/components/ui/Scramble'
import { Reveal } from '@/components/ui/Reveal'

export function HowItWorks() {
  const s = useSlider(STEPS.items.length)
  return (
    <section className="latest-items" id="how-it-works" data-section="how-it-works">
      <div className="container">
        <div className="section-head-cols">
          <h2 className="section-title">
            <Reveal>{STEPS.headTop}</Reveal>
          </h2>
        </div>
      </div>
      <div className="tabs-head">
        <div className="tabs-head__left">
          <span className="tab-big is-current">
            {STEPS.headBoxed}
            <Corners size={12} inset={-2} />
          </span>
        </div>
        <div className="tabs-head__right">
          <span className="tabs-more">
            <PlayTri /> {STEPS.more}
          </span>
          <ScrambleLink className="tabs-all" href={LINKS.docs} text={STEPS.tabs[1]}>
            <span className="tabs-all__box">
              <ArrowUR size={22} />
            </span>
          </ScrambleLink>
        </div>
      </div>
      <div className="slider-row">
        <SliderArrows onPrev={s.prev} onNext={s.next} canPrev={s.canPrev} canNext={s.canNext} className="slider-row__arrows" />
        <CardTrack index={s.index}>
          {STEPS.items.map((it) => (
            <article key={it.n} className="case-card">
              <div className="case-card__top">
                <PlayTri />
                <span>Step {it.n}</span>
                <i className="case-card__notch" aria-hidden="true" />
              </div>
              <div className="case-card__media">
                <Corners size={10} inset={-16} tone="dim" />
                <Art kind={it.art} />
              </div>
              <h3 className="case-card__title">{it.title}</h3>
              <p className="case-card__body">{it.body}</p>
              <ul className="case-card__chips">
                {it.chips.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </article>
          ))}
        </CardTrack>
      </div>
    </section>
  )
}
