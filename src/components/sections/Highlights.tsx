import { HIGHLIGHTS } from '@/data/site'
import { Marquee } from '@/components/ui/Marquee'

// Small original line icons for the highlight cells (the reference used award logos in this slot).
function Icon({ name }: { name: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg className="hl-icon" width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      {name === 'grid' && (
        <g {...p}>
          <rect x="3" y="3" width="11" height="11" />
          <rect x="20" y="3" width="11" height="11" />
          <rect x="3" y="20" width="11" height="11" />
          <path d="M20 26h11M25.5 20.5v11" stroke="var(--call-a)" />
        </g>
      )}
      {name === 'stack' && (
        <g {...p}>
          <path d="M17 3 31 10 17 17 3 10Z" stroke="var(--call-a)" />
          <path d="M3 17l14 7 14-7M3 24l14 7 14-7" />
        </g>
      )}
      {name === 'fee' && (
        <g {...p}>
          <circle cx="10" cy="10" r="5" />
          <circle cx="24" cy="24" r="5" stroke="var(--put-b)" />
          <path d="M28 4 6 30" />
        </g>
      )}
      {name === 'pulse' && (
        <g {...p}>
          <path d="M2 18h7l3-9 5 17 4-12 3 4h8" stroke="var(--call-b)" />
        </g>
      )}
      {name === 'key' && (
        <g {...p}>
          <circle cx="11" cy="17" r="7" />
          <path d="M18 17h14M27 17v6M31 17v4" stroke="var(--put-a)" />
        </g>
      )}
      {name === 'coin' && (
        <g {...p}>
          <ellipse cx="17" cy="9" rx="12" ry="5" stroke="var(--call-a)" />
          <path d="M5 9v8c0 2.8 5.4 5 12 5s12-2.2 12-5V9M5 17v8c0 2.8 5.4 5 12 5s12-2.2 12-5v-8" />
        </g>
      )}
    </svg>
  )
}

export function Highlights() {
  return (
    <section className="highlights" id="highlights" data-section="highlights">
      <div className="container">
        <div className="marquee-block">
          <div className="marquee-label">{HIGHLIGHTS.label}</div>
          <Marquee seconds={36} className="hl-marquee">
            {HIGHLIGHTS.items.map((it) => (
              <div key={it.title} className="hl-item">
                <div className="hl-item__logo">
                  <Icon name={it.icon} />
                  <span className="hl-item__big">{it.big}</span>
                  <i className="hl-item__c1" />
                  <i className="hl-item__c2" />
                </div>
                <div className="hl-item__text">
                  <span>{it.title}</span>
                  <span className="hl-item__sub">{it.sub}</span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
