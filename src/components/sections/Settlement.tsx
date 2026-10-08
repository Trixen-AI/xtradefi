import { SETTLE } from '@/data/site'
import { Boxed } from '@/components/ui/Boxed'
import { ArrowUR } from '@/components/ui/ArrowUR'
import { Marquee } from '@/components/ui/Marquee'
import { Reveal } from '@/components/ui/Reveal'
import { BrandLogo } from '@/components/brand/BrandLogo'

export function Settlement() {
  return (
    <section className="token-section" id="settlement" data-section="settlement">
      <div className="container">
        <div className="token-intro">
          <div className="token-intro__left">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="token-title">
              <Boxed variant="grad">
                <Reveal>{SETTLE.head}</Reveal>
              </Boxed>
            </h2>
            <p className="token-body">{SETTLE.body}</p>
          </div>
          <div className="token-intro__right">
            <div className="token-feats-title">{SETTLE.featsTitle}</div>
            <ul className="token-feats">
              {SETTLE.feats.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid-columns grid-columns-popular">
          <div className="grid-columns__label">{SETTLE.pricedBy}</div>
          <a className="buy-cell" href="https://data.chain.link" target="_blank" rel="noopener noreferrer">
            <BrandLogo name="chainlink" label="Chainlink" className="buy-cell__logo buy-cell__logo--chainlink" />
            <span className="buy-cell__tag">Oracle</span>
            <ArrowUR size={20} className="buy-cell__arrow" />
          </a>
          <a className="buy-cell" href="https://ethereum.org" target="_blank" rel="noopener noreferrer">
            <BrandLogo name="ethereum" label="Ethereum" className="buy-cell__logo buy-cell__logo--ethereum" />
            <span className="buy-cell__tag">Network · Mainnet</span>
            <ArrowUR size={20} className="buy-cell__arrow" />
          </a>
        </div>

        <div className="marquee-block marquee-block--tickers">
          <div className="marquee-label">{SETTLE.runsOn}</div>
          <Marquee seconds={50} className="ticker-marquee">
            {SETTLE.marquee.map((t) => (
              <span key={t} className="ticker-marquee__item">
                {t}
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
