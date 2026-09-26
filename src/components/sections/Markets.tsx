import { useId, useMemo, useState } from 'react'
import { LINKS, MARKETS } from '@/data/site'
import { Boxed } from '@/components/ui/Boxed'
import { Corners } from '@/components/ui/Corners'
import { ArrowUR, PlayTri } from '@/components/ui/ArrowUR'
import { TickerArt } from '@/components/ui/Art'
import { CardTrack, SliderArrows } from '@/components/ui/CardSlider'
import { useSlider } from '@/hooks/useSlider'
import { ScrambleLink } from '@/components/ui/Scramble'
import { Reveal } from '@/components/ui/Reveal'
import { BrandLogo, type BrandKey } from '@/components/brand/BrandLogo'

const STACK: { cat: string; logo: BrandKey; label: string }[] = [
  { cat: 'Oracle', logo: 'chainlink', label: 'Chainlink' },
  { cat: 'Network', logo: 'robinhood', label: 'Robinhood Chain' },
  { cat: 'Collateral', logo: 'usdg', label: 'USDG' },
]

/** Closed gradient outline around the ticker tile, cut at top-left and bottom-right like the xTradeFi mark. */
function TickerFrame() {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="market-card__frame" viewBox="0 0 250 250" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="250" x2="250" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--call-a)" />
          <stop offset="0.5" stopColor="var(--call-b)" />
          <stop offset="1" stopColor="var(--put-b)" />
        </linearGradient>
      </defs>
      <path d="M40 1H241Q249 1 249 9V210L210 249H9Q1 249 1 241V40Z" stroke={`url(#${id})`} strokeWidth="1.5" />
    </svg>
  )
}

// Only markets with options (a Chainlink feed on Robinhood Chain) are offered on the landing page. Static data,
// so it lives at module level.
const offered = MARKETS.list.filter((m) => m.o)
const stocks = offered.filter((m) => m.s !== 'ETF')
const etfs = offered.filter((m) => m.s === 'ETF')

export function Markets() {
  const [group, setGroup] = useState<0 | 1>(0)
  const [filter, setFilter] = useState<(typeof MARKETS.filters)[number]>('All')
  const list = useMemo(() => {
    const base = group === 0 ? stocks : etfs
    return filter === 'All' || group === 1 ? base : base.filter((m) => m.s === filter)
  }, [group, filter])
  const s = useSlider(list.length, `${group}-${filter}`)

  return (
    <section className="team-section" id="markets" data-section="markets">
      <div className="container">
        <div className="section-head-cols">
          <div className="section-heading">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="section-title section-title--xl">
              <Boxed>
                <Reveal>{MARKETS.headBoxed}</Reveal>
              </Boxed>{' '}
              <Reveal delay={0.1}>{MARKETS.headTop}</Reveal>
              <br />
              <Reveal delay={0.2}>{MARKETS.headBottom}</Reveal>
            </h2>
          </div>
          <p className="section-descr">{MARKETS.side}</p>
        </div>
      </div>

      <div className="team-filters">
        <div className="team-filters__label">Categories</div>
        <div className="team-filters__chips" role="tablist" aria-label="Filter markets by sector">
          {MARKETS.filters
            .filter((f) => f !== 'ETF')
            .map((f) => (
              <button key={f} type="button" role="tab" aria-selected={filter === f} disabled={group === 1 && f !== 'All'} className={`chip ${filter === f ? 'is-current' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
        </div>
      </div>

      <div className="slider-row slider-row--team">
        <SliderArrows onPrev={s.prev} onNext={s.next} canPrev={s.canPrev} canNext={s.canNext} className="slider-row__arrows" />
        <CardTrack index={s.index}>
          {list.map((m) => (
            <article key={m.t} className="market-card">
              <div className="market-card__top">
                <span className="market-card__name">
                  <PlayTri /> {m.t}
                </span>
                <span className="market-card__badge">
                  {m.s}
                  <i className="market-card__b1" />
                  <i className="market-card__b2" />
                </span>
              </div>
              <div className="market-card__media">
                <TickerFrame />
                <div className="market-card__img">
                  <TickerArt ticker={m.t} tone={offered.indexOf(m)} />
                </div>
              </div>
              <div className="market-card__bottom">
                <span>{m.n}</span>
                <a className="market-card__more" href={LINKS.app} aria-label={`Trade options on ${m.t}`}>
                  <span>Trade</span>
                  <svg width="28" height="28" viewBox="0 0 28 28" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M14 1v26M1 14h26" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </CardTrack>
      </div>

      <div className="team-group-tabs" role="tablist" aria-label="Market type">
        {[`Stocks`, `Index ETFs`].map((label, i) => (
          <button key={label} type="button" role="tab" aria-selected={group === i} className={`team-group-tab ${group === i ? 'is-current' : ''}`} onClick={() => setGroup(i as 0 | 1)}>
            <span className="team-group-tab__inner">
              {label} <span className="team-group-tab__count">[{i === 0 ? stocks.length : etfs.length}]</span>
              {group === i && <Corners size={14} inset={-18} />}
            </span>
          </button>
        ))}
      </div>

      <div className="team-rows-list">
        <div className="team-row-heading">
          <span className="team-row-heading__title">
            <PlayTri /> {MARKETS.stackTitle} {MARKETS.stackCount}
          </span>
          <ScrambleLink className="tabs-all" href="#fees" text={MARKETS.stackCta}>
            <span className="tabs-all__box">
              <ArrowUR size={22} />
            </span>
          </ScrambleLink>
        </div>
        <div className="partner-row">
          {STACK.map((p) => (
            <div key={p.cat} className="partner-cell">
              <span className="partner-cell__cat">{p.cat}</span>
              <span className="partner-cell__logo">
                <BrandLogo name={p.logo} label={p.label} className={`partner-logo partner-logo--${p.logo}`} />
                <i className="partner-cell__c1" />
                <i className="partner-cell__c2" />
              </span>
              <span className="partner-cell__name">{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
