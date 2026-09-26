import { useId } from 'react'

// Original line artwork for card image slots (395 x 222 box). One drawing grammar: hairline grid, 1.5px ink
// strokes, one call-green and one put-coral accent, a single ink "strike" dot.

function Frame({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <svg className="art" viewBox="0 0 395 222" fill="none" aria-hidden="true">
      <defs>
        <pattern id={`${id}g`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0v24" stroke="rgba(238,240,230,0.06)" />
        </pattern>
        <linearGradient id={`${id}c`} x1="0" y1="222" x2="395" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--call-a)" />
          <stop offset="1" stopColor="var(--call-b)" />
        </linearGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="395" y2="222" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--put-a)" />
          <stop offset="1" stopColor="var(--put-b)" />
        </linearGradient>
      </defs>
      <rect width="395" height="222" fill="#0d0e10" />
      <rect width="395" height="222" fill={`url(#${id}g)`} />
      {children}
    </svg>
  )
}

const ink = 'var(--text)'
const dim = 'rgba(238,240,230,0.35)'

export function Art({ kind }: { kind: string }) {
  const id = useId().replace(/:/g, '')
  const c = `url(#${id}c)`
  const p = `url(#${id}p)`
  switch (kind) {
    case 'wallet':
      return (
        <Frame id={id}>
          <rect x="120" y="58" width="130" height="96" rx="6" stroke={ink} strokeWidth="1.5" />
          <path d="M120 84h130" stroke={dim} />
          <rect x="206" y="98" width="58" height="34" rx="4" stroke={c} strokeWidth="2" fill="#0d0e10" />
          <circle cx="222" cy="115" r="5" fill={ink} />
          <path d="M264 115h44" stroke={dim} strokeDasharray="4 5" />
          <path d="M308 96l20 19-20 19" stroke={c} strokeWidth="2" />
          <path d="M60 170h60M60 180h36" stroke={dim} />
          <text x="60" y="52" fill={dim} fontFamily="Roboto Mono" fontSize="11">EVM WALLET</text>
        </Frame>
      )
    case 'pick':
      return (
        <Frame id={id}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={70} y={40 + i * 30} width={255} height={22} stroke={i === 2 ? c : dim} strokeWidth={i === 2 ? 2 : 1} />
              <text x={82} y={55 + i * 30} fill={i === 2 ? ink : dim} fontFamily="Roboto Mono" fontSize="11">
                {`STRIKE ${['-10%', '-5%', 'ATM', '+5%', '+10%'][i]}`}
              </text>
            </g>
          ))}
          <circle cx="300" cy="111" r="6" fill={ink} />
          <path d="M340 60v100" stroke={p} strokeWidth="2" />
          <path d="M334 66l6-6 6 6M334 154l6 6 6-6" stroke={p} strokeWidth="2" />
        </Frame>
      )
    case 'settle':
      return (
        <Frame id={id}>
          <circle cx="198" cy="111" r="66" stroke={dim} />
          <circle cx="198" cy="111" r="48" stroke={c} strokeWidth="2" strokeDasharray="220 80" />
          <path d="M198 111V78M198 111l22 14" stroke={ink} strokeWidth="1.5" />
          <circle cx="198" cy="111" r="5" fill={ink} />
          <path d="M40 150l40-20 30 12 26-30" stroke={c} strokeWidth="2" />
          <path d="M270 90l26 16 26-22 34 8" stroke={p} strokeWidth="2" />
          <text x="164" y="200" fill={dim} fontFamily="Roboto Mono" fontSize="11">EXPIRY</text>
        </Frame>
      )
    case 'a':
      return (
        <Frame id={id}>
          <path d="M40 170 170 70h180" stroke={c} strokeWidth="2.5" />
          <path d="M40 60 170 150h180" stroke={p} strokeWidth="2.5" />
          <circle cx="170" cy="110" r="7" fill={ink} />
          <path d="M170 30v160" stroke={dim} strokeDasharray="4 6" />
        </Frame>
      )
    case 'b':
      return (
        <Frame id={id}>
          {[60, 100, 140, 180, 220, 260, 300, 340].map((x, i) => {
            const up = [1, 0, 1, 1, 0, 1, 0, 1][i]
            const top = 60 + ((i * 37) % 70)
            return <rect key={x} x={x - 8} y={top} width="16" height={50 + ((i * 23) % 40)} stroke={up ? c : p} strokeWidth="1.8" />
          })}
          <path d="M30 150h340" stroke={dim} strokeDasharray="4 6" />
          <circle cx="220" cy="150" r="6" fill={ink} />
        </Frame>
      )
    case 'c':
      return (
        <Frame id={id}>
          <rect x="140" y="50" width="115" height="130" stroke={ink} strokeWidth="1.5" />
          <path d="M140 80h115M158 100h60M158 116h78M158 132h44" stroke={dim} />
          <path d="M110 70l-30 30 30 30" stroke={c} strokeWidth="2" />
          <path d="M285 90l30 30-30 30" stroke={p} strokeWidth="2" />
          <circle cx="236" cy="160" r="6" fill={ink} />
        </Frame>
      )
    default:
      return (
        <Frame id={id}>
          <circle cx="198" cy="111" r="70" stroke={dim} />
          <path d="M128 111a70 70 0 0 1 140 0" stroke={c} strokeWidth="2.5" />
          <path d="M268 111a70 70 0 0 1-140 0" stroke={p} strokeWidth="2.5" strokeDasharray="6 6" />
          <circle cx="268" cy="111" r="6" fill={ink} />
          <path d="M40 111h60M296 111h60" stroke={dim} />
        </Frame>
      )
  }
}

/** Ticker monogram used in market cards: big mono ticker on a gridded tile. */
export function TickerArt({ ticker, tone }: { ticker: string; tone: number }) {
  const id = useId().replace(/:/g, '')
  const len = ticker.length
  const size = len >= 5 ? 44 : len === 4 ? 52 : 62
  return (
    <svg className="ticker-art" viewBox="0 0 250 250" aria-hidden="true">
      <defs>
        <pattern id={`${id}g`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0v25" stroke="rgba(238,240,230,0.07)" fill="none" />
        </pattern>
        <linearGradient id={`${id}l`} x1="0" y1="250" x2="250" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor={tone % 2 ? 'var(--put-a)' : 'var(--call-a)'} />
          <stop offset="1" stopColor={tone % 2 ? 'var(--put-b)' : 'var(--call-b)'} />
        </linearGradient>
      </defs>
      <rect width="250" height="250" fill="#101113" />
      <rect width="250" height="250" fill={`url(#${id}g)`} />
      {/* strike line motif, decorative only: no price data */}
      <path d="M24 176H226" stroke="rgba(238,240,230,0.25)" strokeDasharray="6 7" />
      <path d="M24 176H125" stroke={`url(#${id}l)`} strokeWidth="3" strokeLinecap="round" />
      <circle cx={60 + (tone % 5) * 32} cy="176" r="6" fill="var(--text)" />
      <text x="125" y="118" textAnchor="middle" fill="var(--text)" fontFamily="Roboto Mono" fontWeight="500" fontSize={size} letterSpacing="2">
        {ticker}
      </text>
    </svg>
  )
}
