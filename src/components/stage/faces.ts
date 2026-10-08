import type { Face } from '@/lib/stageStore'

// Face artwork for the 3D emblem, drawn once per face into a 1024px canvas. Each face is a payoff sketch of the
// product it stands for, in QuiverFi's call→put palette.
const CALL_A = '#19e3a0'
const CALL_B = '#b7f23a'
const PUT_A = '#ffb627'
const PUT_B = '#ff5b4a'
const INK = '#eef0e6'
const S = 1024

function grad(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, a: string, b: string) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, a)
  g.addColorStop(1, b)
  return g
}

function base(ctx: CanvasRenderingContext2D, round: boolean) {
  ctx.fillStyle = '#0b0c0e'
  ctx.fillRect(0, 0, S, S)
  ctx.save()
  if (round) {
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, S / 2 - 8, 0, Math.PI * 2)
    ctx.clip()
  }
  ctx.strokeStyle = 'rgba(238,240,230,0.055)'
  ctx.lineWidth = 2
  for (let i = 64; i < S; i += 64) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, S)
    ctx.moveTo(0, i)
    ctx.lineTo(S, i)
    ctx.stroke()
  }
  ctx.restore()
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align: CanvasTextAlign = 'left') {
  ctx.font = '500 34px "Roboto Mono", monospace'
  ctx.fillStyle = 'rgba(238,240,230,0.7)'
  ctx.textAlign = align
  ctx.fillText(text, x, y)
}

function stroke(ctx: CanvasRenderingContext2D, pts: [number, number][], style: CanvasGradient | string, w: number) {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = w
  ctx.strokeStyle = style
  ctx.shadowColor = typeof style === 'string' ? style : 'rgba(25,227,160,0.55)'
  ctx.shadowBlur = 28
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
  ctx.restore()
}

function axes(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = 'rgba(238,240,230,0.28)'
  ctx.lineWidth = 3
  ctx.setLineDash([14, 14])
  ctx.beginPath()
  ctx.moveTo(150, y)
  ctx.lineTo(874, y)
  ctx.stroke()
  ctx.setLineDash([])
}

function strike(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  ctx.strokeStyle = 'rgba(238,240,230,0.45)'
  ctx.lineWidth = 3
  ctx.setLineDash([10, 12])
  ctx.beginPath()
  ctx.moveTo(x, top)
  ctx.lineTo(x, bottom)
  ctx.stroke()
  ctx.setLineDash([])
  label(ctx, 'K', x, bottom + 50, 'center')
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.fillStyle = INK
  ctx.shadowColor = INK
  ctx.shadowBlur = 24
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
  ctx.strokeStyle = '#0b0c0e'
  ctx.lineWidth = 10
  ctx.stroke()
}

const DRAW: Record<Face, (ctx: CanvasRenderingContext2D) => void> = {
  x(ctx) {
    base(ctx, false)
    stroke(ctx, [[310, 310], [714, 714]], grad(ctx, 310, 310, 714, 714, PUT_A, PUT_B), 62)
    stroke(ctx, [[310, 714], [714, 310]], grad(ctx, 310, 714, 714, 310, CALL_A, CALL_B), 62)
    dot(ctx, 512, 512, 58)
  },
  call(ctx) {
    base(ctx, false)
    label(ctx, 'COVERED CALL', 150, 190)
    axes(ctx, 620)
    strike(ctx, 590, 300, 760)
    stroke(ctx, [[160, 800], [590, 390], [870, 390]], grad(ctx, 160, 800, 870, 390, CALL_A, CALL_B), 44)
    dot(ctx, 590, 390, 26)
  },
  put(ctx) {
    base(ctx, false)
    label(ctx, 'CASH-SECURED PUT', 150, 190)
    axes(ctx, 560)
    strike(ctx, 470, 300, 760)
    stroke(ctx, [[160, 820], [470, 420], [870, 420]], grad(ctx, 160, 820, 870, 420, PUT_B, PUT_A), 44)
    dot(ctx, 470, 420, 26)
  },
  binary(ctx) {
    base(ctx, false)
    label(ctx, 'UP / DOWN', 150, 190)
    axes(ctx, 560)
    stroke(ctx, [[160, 740], [512, 740], [512, 360], [864, 360]], grad(ctx, 160, 740, 864, 360, PUT_B, CALL_A), 40)
    stroke(ctx, [[780, 300], [820, 250], [860, 300]], CALL_A, 18)
    stroke(ctx, [[160, 800], [200, 850], [240, 800]], PUT_B, 18)
    dot(ctx, 512, 560, 26)
  },
  vault(ctx) {
    base(ctx, false)
    label(ctx, 'YIELD VAULT', 150, 190)
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineWidth = 40
    ctx.strokeStyle = grad(ctx, 250, 800, 800, 250, CALL_A, CALL_B)
    ctx.shadowColor = CALL_A
    ctx.shadowBlur = 28
    ctx.beginPath()
    ctx.arc(512, 560, 250, Math.PI * 0.85, Math.PI * 2.55)
    ctx.stroke()
    ctx.restore()
    const ax = 512 + 250 * Math.cos(Math.PI * 2.55)
    const ay = 560 + 250 * Math.sin(Math.PI * 2.55)
    stroke(ctx, [[ax - 70, ay - 10], [ax + 4, ay + 8], [ax + 10, ay - 66]], CALL_B, 22)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 0 ? PUT_A : 'rgba(238,240,230,0.85)'
      ctx.beginPath()
      ctx.ellipse(512, 640 - i * 62, 110, 34, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#0b0c0e'
      ctx.lineWidth = 8
      ctx.stroke()
    }
  },
  oracle(ctx) {
    base(ctx, true)
    ctx.save()
    ctx.translate(512, 512)
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2
      const long = i % 6 === 0
      ctx.strokeStyle = long ? 'rgba(238,240,230,0.7)' : 'rgba(238,240,230,0.25)'
      ctx.lineWidth = long ? 6 : 3
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * 440, Math.sin(a) * 440)
      ctx.lineTo(Math.cos(a) * (long ? 395 : 415), Math.sin(a) * (long ? 395 : 415))
      ctx.stroke()
    }
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(238,240,230,0.2)'
    ctx.beginPath()
    ctx.arc(0, 0, 330, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
    stroke(ctx, [[230, 610], [330, 560], [400, 600], [470, 470], [512, 512], [600, 420], [680, 460], [794, 380]], grad(ctx, 230, 610, 794, 380, CALL_A, PUT_A), 30)
    dot(ctx, 512, 512, 34)
    label(ctx, 'SETTLED AT EXPIRY', 512, 760, 'center')
  },
}

const cache = new Map<Face, HTMLCanvasElement>()

export function faceCanvas(face: Face) {
  const hit = cache.get(face)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')
  if (ctx) DRAW[face](ctx)
  cache.set(face, c)
  return c
}
