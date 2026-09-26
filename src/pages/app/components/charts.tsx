import { useMemo, useState, type PointerEvent } from 'react'
import { useElementSize } from '@/hooks/useElementSize'
import type { Round } from '../lib/options'
import { fmtUsd } from '../lib/format'
import { fmtNyTime } from '../lib/time'

// Chart colours validated with the dataviz validator against the dark surface #0a0b0d (OKLCH L band 0.48-0.67,
// CVD separation 7.2 which is in the floor band, so profit/loss also differ by dash pattern and text labels).
const UP = '#00a96e'
const DOWN = '#ee4a3b'
const GRID = '#1c1e21'

/** Clean tick values across [min, max]. */
function ticks(min: number, max: number, count = 4) {
  const span = max - min || Math.abs(max) || 1
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(10)))
  return out
}

const PAD = { l: 64, r: 16, t: 16, b: 28 }

// ---------------------------------------------------------------- price history

/** Oracle price history as a single 2px line with a 10% wash; crosshair snaps to the nearest round. */
export function PriceChart({ rounds, height = 240 }: { rounds: Round[]; height?: number }) {
  const [ref, { w }] = useElementSize<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const geo = useMemo(() => {
    if (rounds.length < 2 || w < 100) return null
    const xs = rounds.map((r) => r.updatedAt)
    const ys = rounds.map((r) => r.answer)
    const x0 = xs[0]
    const x1 = xs[xs.length - 1]
    let y0 = Math.min(...ys)
    let y1 = Math.max(...ys)
    const padY = (y1 - y0) * 0.12 || y1 * 0.01
    y0 -= padY
    y1 += padY
    const iw = w - PAD.l - PAD.r
    const ih = height - PAD.t - PAD.b
    const sx = (x: number) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * iw
    const sy = (y: number) => PAD.t + (1 - (y - y0) / (y1 - y0 || 1)) * ih
    const pts = rounds.map((r) => [sx(r.updatedAt), sy(r.answer)] as const)
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    const area = `${line}L${pts[pts.length - 1][0].toFixed(1)} ${PAD.t + ih}L${pts[0][0].toFixed(1)} ${PAD.t + ih}Z`
    return { pts, line, area, yTicks: ticks(y0, y1).map((v) => ({ v, y: sy(v) })), ih, iw }
  }, [rounds, w, height])

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!geo) return
    const x = e.clientX - e.currentTarget.getBoundingClientRect().left
    let best = 0
    geo.pts.forEach(([px], i) => {
      if (Math.abs(px - x) < Math.abs(geo.pts[best][0] - x)) best = i
    })
    setHover(best)
  }

  const last = rounds[rounds.length - 1]
  const h = hover !== null ? rounds[hover] : null

  return (
    <div ref={ref} className="dchart">
      {geo ? (
        <svg width={w} height={height} role="img" aria-label={`Oracle price history, ${rounds.length} rounds`} onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          {geo.yTicks.map((t) => (
            <g key={t.v}>
              <line x1={PAD.l} x2={w - PAD.r} y1={t.y} y2={t.y} stroke={GRID} />
              <text x={PAD.l - 10} y={t.y + 4} textAnchor="end" className="dchart__tick">
                {fmtUsd(t.v)}
              </text>
            </g>
          ))}
          <text x={PAD.l} y={height - 8} className="dchart__tick">
            {fmtNyTime(new Date(rounds[0].updatedAt * 1000))}
          </text>
          <text x={w - PAD.r} y={height - 8} textAnchor="end" className="dchart__tick">
            {fmtNyTime(new Date(last.updatedAt * 1000))}
          </text>
          <path d={geo.area} fill={UP} opacity={0.1} />
          <path d={geo.line} fill="none" stroke={UP} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={geo.pts[geo.pts.length - 1][0]} cy={geo.pts[geo.pts.length - 1][1]} r={4} fill={UP} stroke="var(--bg)" strokeWidth={2} />
          {hover !== null ? (
            <g pointerEvents="none">
              <line x1={geo.pts[hover][0]} x2={geo.pts[hover][0]} y1={PAD.t} y2={PAD.t + geo.ih} stroke="var(--muted)" />
              <circle cx={geo.pts[hover][0]} cy={geo.pts[hover][1]} r={5} fill={UP} stroke="var(--bg)" strokeWidth={2} />
            </g>
          ) : null}
          <rect x={PAD.l} y={PAD.t} width={geo.iw} height={geo.ih} fill="transparent" />
        </svg>
      ) : (
        <div className="dchart__empty" style={{ height }}>
          {rounds.length < 2 ? 'Waiting for oracle history…' : null}
        </div>
      )}
      {h && geo ? (
        <div className="dchart__tip" style={{ left: Math.min(Math.max(geo.pts[hover!][0], 90), w - 90), top: 8 }}>
          <strong>{fmtUsd(h.answer)}</strong>
          <span>{fmtNyTime(new Date(h.updatedAt * 1000))}</span>
        </div>
      ) : null}
    </div>
  )
}

// ---------------------------------------------------------------- payoff at expiry

type PayoffProps = {
  f: (x: number) => number
  spot: number
  strike: number
  height?: number
  unitLabel?: string
}

/** Profit / loss at expiry across ±30% of spot. Profit segments solid green, loss segments dashed coral,
 *  zero baseline neutral; strike and spot marked; crosshair reads out P/L at any expiry price. */
export function PayoffChart({ f, spot, strike, height = 220 }: PayoffProps) {
  const [ref, { w }] = useElementSize<HTMLDivElement>()
  const [hx, setHx] = useState<number | null>(null)
  const geo = useMemo(() => {
    if (!(spot > 0) || w < 120) return null
    const x0 = Math.min(spot, strike) * 0.7
    const x1 = Math.max(spot, strike) * 1.3
    const N = 160
    const samples = Array.from({ length: N + 1 }, (_, i) => {
      const x = x0 + ((x1 - x0) * i) / N
      return [x, f(x)] as const
    })
    let y0 = Math.min(0, ...samples.map((s) => s[1]))
    let y1 = Math.max(0, ...samples.map((s) => s[1]))
    const pad = (y1 - y0) * 0.12 || 1
    y0 -= pad
    y1 += pad
    const l = 72
    const iw = w - l - PAD.r
    const ih = height - PAD.t - PAD.b
    const sx = (x: number) => l + ((x - x0) / (x1 - x0)) * iw
    const sy = (y: number) => PAD.t + (1 - (y - y0) / (y1 - y0)) * ih
    // split into profit / loss runs, inserting the exact zero crossing between samples
    const runs: { up: boolean; pts: [number, number][] }[] = []
    samples.forEach(([x, y], i) => {
      const up = y >= 0
      const p: [number, number] = [sx(x), sy(y)]
      const cur = runs[runs.length - 1]
      if (!cur) return void runs.push({ up, pts: [p] })
      if (cur.up === up) return void cur.pts.push(p)
      const [px, py] = samples[i - 1]
      const t = py / (py - y)
      const cross: [number, number] = [sx(px + (x - px) * t), sy(0)]
      if (Number.isFinite(t) && t >= 0 && t <= 1) cur.pts.push(cross)
      runs.push({ up, pts: Number.isFinite(t) && t >= 0 && t <= 1 ? [cross, p] : [p] })
    })
    const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
    return { l, iw, ih, sx, sy, x0, x1, runs: runs.map((r) => ({ up: r.up, d: path(r.pts) })), yTicks: ticks(y0, y1).map((v) => ({ v, y: sy(v) })), zeroY: sy(0) }
  }, [f, spot, strike, w, height])

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!geo) return
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left
    const x = geo.x0 + ((px - geo.l) / geo.iw) * (geo.x1 - geo.x0)
    setHx(Math.min(geo.x1, Math.max(geo.x0, x)))
  }
  const hy = hx !== null ? f(hx) : null

  return (
    <div ref={ref} className="dchart">
      {geo ? (
        <svg width={w} height={height} role="img" aria-label="Profit and loss at expiry" onPointerMove={onMove} onPointerLeave={() => setHx(null)}>
          {geo.yTicks.map((t) => (
            <g key={t.v}>
              <line x1={geo.l} x2={w - PAD.r} y1={t.y} y2={t.y} stroke={GRID} />
              <text x={geo.l - 10} y={t.y + 4} textAnchor="end" className="dchart__tick">
                {fmtUsd(t.v, true)}
              </text>
            </g>
          ))}
          <line x1={geo.l} x2={w - PAD.r} y1={geo.zeroY} y2={geo.zeroY} stroke="var(--muted)" />
          <text x={w - PAD.r - 4} y={geo.zeroY - 8} textAnchor="end" className="dchart__label">
            Profit
          </text>
          <text x={w - PAD.r - 4} y={geo.zeroY + 16} textAnchor="end" className="dchart__label">
            Loss
          </text>
          {[
            { x: strike, label: 'Strike' },
            { x: spot, label: 'Now' },
          ].map((m) => (
            <g key={m.label}>
              <line x1={geo.sx(m.x)} x2={geo.sx(m.x)} y1={PAD.t} y2={PAD.t + geo.ih} stroke="var(--divider)" />
              <text x={geo.sx(m.x) + 6} y={PAD.t + 12} className="dchart__label">
                {m.label}
              </text>
            </g>
          ))}
          {geo.runs.map((r, i) => (
            <path key={i} d={r.d} fill="none" stroke={r.up ? UP : DOWN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={r.up ? undefined : '6 5'} />
          ))}
          <text x={geo.l} y={height - 8} className="dchart__tick">
            {fmtUsd(geo.x0)}
          </text>
          <text x={w - PAD.r} y={height - 8} textAnchor="end" className="dchart__tick">
            {fmtUsd(geo.x1)}
          </text>
          {hx !== null && hy !== null ? (
            <g pointerEvents="none">
              <line x1={geo.sx(hx)} x2={geo.sx(hx)} y1={PAD.t} y2={PAD.t + geo.ih} stroke="var(--muted)" />
              <circle cx={geo.sx(hx)} cy={geo.sy(hy)} r={5} fill={hy >= 0 ? UP : DOWN} stroke="var(--bg)" strokeWidth={2} />
            </g>
          ) : null}
        </svg>
      ) : (
        <div className="dchart__empty" style={{ height }} />
      )}
      {hx !== null && hy !== null && geo ? (
        <div className="dchart__tip" style={{ left: Math.min(Math.max(geo.sx(hx), 100), w - 100), top: 8 }}>
          <strong>{`${hy >= 0 ? '+' : ''}${fmtUsd(hy)}`}</strong>
          <span>if expiry price is {fmtUsd(hx)}</span>
        </div>
      ) : null}
    </div>
  )
}
