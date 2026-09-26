import { useEffect, useRef } from 'react'
import { LAYERS } from '@/data/site'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { Boxed } from '@/components/ui/Boxed'
import { NbChip } from '@/components/ui/NbChip'
import { Reveal } from '@/components/ui/Reveal'
import { Logo } from '@/components/brand/Logo'

// Each layer is an original node diagram (replacing the reference's Rive scenes): a centre tile, four satellite
// tiles with labels and "+" buttons, orthogonal connectors, and chips. Connectors draw on and a pulse travels
// them while the layer is in view. Coordinates live in a 948 x 568 box.
const W = 948
const H = 568
const CENTER = { x: 474, y: 250 }
const SAT = [
  { x: 190, y: 120 },
  { x: 760, y: 120 },
  { x: 190, y: 400 },
  { x: 760, y: 400 },
]

function wire(a: { x: number; y: number }, b: { x: number; y: number }) {
  const midX = (a.x + b.x) / 2
  return `M${a.x} ${a.y}H${midX - 10}Q${midX} ${a.y} ${midX} ${a.y + (b.y > a.y ? 10 : -10)}V${b.y + (b.y > a.y ? -10 : 10)}Q${midX} ${b.y} ${midX + (b.x > a.x ? 10 : -10)} ${b.y}H${b.x}`
}

function CenterIcon({ kind }: { kind: string }) {
  const s = { fill: 'none', stroke: 'var(--text)', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (kind === 'x') return <Logo mark className="arch-center__logo" />
  return (
    <svg className="arch-center__ico" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'wallet' && (
        <g {...s}>
          <rect x="8" y="16" width="44" height="34" rx="4" />
          <path d="M8 26h44" />
          <rect x="38" y="30" width="18" height="12" rx="3" stroke="var(--call-a)" />
        </g>
      )}
      {kind === 'coin' && (
        <g {...s}>
          <ellipse cx="32" cy="20" rx="20" ry="8" stroke="var(--call-a)" />
          <path d="M12 20v12c0 4.4 9 8 20 8s20-3.6 20-8V20M12 32v12c0 4.4 9 8 20 8s20-3.6 20-8V32" />
        </g>
      )}
      {kind === 'oracle' && (
        <g {...s}>
          <circle cx="32" cy="32" r="22" />
          <path d="M14 38l10-8 8 6 8-12 10 6" stroke="var(--call-b)" />
          <circle cx="32" cy="32" r="3" fill="var(--text)" />
        </g>
      )}
    </svg>
  )
}

function Diagram({ layer }: { layer: (typeof LAYERS.items)[number] }) {
  const root = useRef<SVGSVGElement>(null)
  useEffect(() => {
    const svg = root.current
    if (!svg || prefersReducedMotion()) return
    const lines = svg.querySelectorAll<SVGPathElement>('.arch-wire__glow')
    const pulses = svg.querySelectorAll<SVGCircleElement>('.arch-pulse')
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.6 })
    lines.forEach((l, i) => {
      const len = l.getTotalLength()
      gsap.set(l, { strokeDasharray: `${len * 0.18} ${len}`, strokeDashoffset: len * 0.18 })
      tl.to(l, { strokeDashoffset: -len, duration: 1.6, ease: 'power1.inOut' }, i * 0.35)
    })
    pulses.forEach((p, i) => tl.fromTo(p, { opacity: 0.2 }, { opacity: 1, duration: 0.4, yoyo: true, repeat: 1 }, 1.2 + i * 0.35))
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tl.play() : tl.pause()), { threshold: 0.15 })
    io.observe(svg)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [])

  return (
    <div className="arch-diagram">
      <svg ref={root} className="arch-svg" viewBox={`0 0 ${W} ${H}`} fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`archGlow${layer.n}`} x1="0" y1="0" x2={W} y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--call-a)" />
            <stop offset="0.5" stopColor="var(--call-b)" />
            <stop offset="1" stopColor="var(--put-a)" />
          </linearGradient>
        </defs>
        {SAT.map((sat, i) => (
          <g key={i}>
            <path d={wire(sat, CENTER)} stroke="var(--divider)" strokeWidth="1.2" />
            <path className="arch-wire__glow" d={wire(sat, CENTER)} stroke={`url(#archGlow${layer.n})`} strokeWidth="1.8" strokeLinecap="round" />
            <circle className="arch-pulse" cx={sat.x} cy={sat.y} r="4" fill="var(--call-a)" />
          </g>
        ))}
        <path d={`M${CENTER.x} ${CENTER.y + 70}V${H - 60}`} stroke="var(--divider)" strokeWidth="1.2" strokeDasharray="4 5" />
      </svg>
      <div className="arch-center" style={{ left: `${(CENTER.x / W) * 100}%`, top: `${(CENTER.y / H) * 100}%` }}>
        <CenterIcon kind={layer.center} />
      </div>
      {layer.nodes.map((n, i) => (
        <div key={n} className={`arch-node arch-node--${i}`} style={{ left: `${(SAT[i].x / W) * 100}%`, top: `${(SAT[i].y / H) * 100}%` }}>
          <span className="arch-node__tile">
            <i />
          </span>
          <span className="arch-node__label">{n}</span>
          <span className="arch-node__plus" aria-hidden="true">
            +
          </span>
        </div>
      ))}
      <ul className="arch-chips" style={{ left: `${(CENTER.x / W) * 100}%` }}>
        {layer.chips.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  )
}

export function Architecture() {
  return (
    <section className="ecosystem-section" id="architecture" data-section="architecture">
      <div className="container">
        <div className="section-head-cols">
          <div className="section-heading">
            <span className="section-heading-dots" aria-hidden="true">
              <i />
              <i />
            </span>
            <h2 className="section-title">
              <Reveal>{LAYERS.headTop}</Reveal>{' '}
              <Boxed>
                <Reveal delay={0.1}>{LAYERS.headBoxed}</Reveal>
              </Boxed>
            </h2>
          </div>
          <p className="section-descr">{LAYERS.side}</p>
        </div>
        <div className="arch-layers">
          {LAYERS.items.map((layer) => (
            <div key={layer.n} className="arch-layer">
              <div className="arch-layer__label">
                <span>Layer</span>
                <NbChip n={layer.n} />
              </div>
              <div className="arch-layer__body">
                <h3 className="arch-layer__title">{layer.title}</h3>
                <Diagram layer={layer} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
