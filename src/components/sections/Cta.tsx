import { CTA, LINKS, SOCIALS } from '@/data/site'
import { Boxed } from '@/components/ui/Boxed'
import { ArrowPlain } from '@/components/ui/ArrowUR'
import { Marquee } from '@/components/ui/Marquee'
import { Reveal } from '@/components/ui/Reveal'
import { BrandLogo, type BrandKey } from '@/components/brand/BrandLogo'

const AVATAR: Record<string, BrandKey> = { chainlink: 'chainlink-symbol', robinhood: 'robinhood', usdg: 'usdg-token' }
const FACTS = ['No KYC', '0.5% protocol fee', '24/5 markets', '30s price updates', 'Chainlink settled', 'Robinhood Chain', 'One USDG balance', 'Custom strikes']

/** Generic wallet glyph for the "any EVM wallet" card (no brand implied). */
function WalletIcon() {
  return (
    <svg className="stack-card__logo" viewBox="0 0 30 30" fill="none" stroke="var(--text)" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="24" height="18" rx="3" />
      <path d="M3 12h24" />
      <rect x="18" y="15" width="10" height="6" rx="2" stroke="var(--call-a)" />
    </svg>
  )
}

export function Cta() {
  const x = SOCIALS[0]
  const cells = [
    { pre: x.pre, title: x.label, href: x.href, pill: x.handle, right: false, handle: true },
    { pre: 'Read the', title: 'Docs', href: LINKS.docs, pill: 'Protocol docs', right: true },
    { pre: 'Browse the', title: 'Markets', href: '#markets', pill: '16 stocks', right: false },
    { pre: 'Ready to trade?', title: 'Launch App', href: LINKS.app, pill: 'Open app', right: true },
  ]
  return (
    <section className="revolution" id="start" data-section="start">
      <div className="container-middle revolution__head">
        <div className="revolution__pre">
          <span className="section-heading-dots section-heading-dots--inline" aria-hidden="true">
            <i />
            <i />
          </span>
          {CTA.pre}
        </div>
        <h2 className="revolution__title">
          <Boxed variant="grad" className="revolution__a">
            <Reveal>{CTA.wordA}</Reveal>
          </Boxed>
          <Boxed variant="grad" className="revolution__b">
            <Reveal delay={0.1}>{CTA.wordB}</Reveal>
          </Boxed>
        </h2>
      </div>

      <div className="container">
        <div className="marquee-block marquee-block--stack">
          <div className="marquee-label">{CTA.stackLabel}</div>
          <Marquee seconds={48} className="stack-marquee">
            {CTA.stack.map((s) => (
              <article key={s.key} className="stack-card">
                <div className="stack-card__head">
                  <span className="stack-card__avatar">
                    {AVATAR[s.key] ? <BrandLogo name={AVATAR[s.key]} label={s.name} className={`stack-card__logo stack-card__logo--${s.key}`} /> : <WalletIcon />}
                  </span>
                  <span className="stack-card__who">
                    <span className="stack-card__name">{s.name}</span>
                    <span className="stack-card__handle">{s.handle}</span>
                  </span>
                </div>
                <p className="stack-card__body">{s.body}</p>
              </article>
            ))}
          </Marquee>
        </div>
        <Marquee seconds={30} className="facts-marquee">
          {FACTS.map((f) => (
            <span key={f} className="facts-marquee__item">
              {f}
              <ArrowPlain size={10} />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="container-middle revolution__items" data-section="start-grid">
        {cells.map((c, i) => (
          <a key={c.title} className={`revolution__item ${c.right ? 'align-right' : ''} ${i > 1 ? 'border-top' : ''}`} href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            <span className="revolution__item-pre">{c.pre}</span>
            <span className="revolution__item-title">
              {c.title}
              <ArrowPlain size={20} className="revolution__item-arrow" />
            </span>
            <span className={`revolution__pill ${'handle' in c ? 'revolution__pill--handle' : ''}`}>{c.pill}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
