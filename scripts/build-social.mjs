// Social and app icons from the same logo source as scripts/build-logo.mjs (run that first).
// Writes public/og-image.png (1200x630), public/apple-touch-icon.png (180), public/icon-192.png, public/icon-512.png.
// All text is outlined from the brand fonts so rendering never depends on installed fonts.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = (p) => path.join(root, p)

const INK = '#eef0e6'
const BG = '#0a0b0d'
const DIVIDER = '#34363a'
const MUTED = '#86887f'
const CALL_A = '#19e3a0'
const CALL_B = '#b7f23a'
const PUT_A = '#ffb627'
const PUT_B = '#ff5b4a'

// Mark + wordmark geometry, read from the generated logo module
const src = fs.readFileSync(out('src/components/brand/logoPaths.ts'), 'utf8')
const pick = (name) => src.match(new RegExp(`export const ${name} = '([^']+)'`))[1]
const MARK_TILE = pick('MARK_TILE')
const MARK_CALL = pick('MARK_CALL')
const MARK_PUT = pick('MARK_PUT')
const WORD_D = pick('WORD_D')
const box = src.match(/WORD_BOX = \{ x: ([\d.-]+), y: ([\d.-]+), w: (\d+) \}/)
const WORD_X = Number(box[1])
const WORD_Y = Number(box[2])
const LOCK_W = Number(box[3])

const markDefs = (id) =>
  `<linearGradient id="${id}t" x1="3" y1="45" x2="45" y2="3" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}"/><stop offset=".55" stop-color="${CALL_B}"/><stop offset="1" stop-color="${PUT_A}"/></linearGradient>` +
  `<linearGradient id="${id}c" x1="13" y1="35" x2="35" y2="13" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}"/><stop offset="1" stop-color="${CALL_B}"/></linearGradient>` +
  `<linearGradient id="${id}p" x1="13" y1="13" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stop-color="${PUT_A}"/><stop offset="1" stop-color="${PUT_B}"/></linearGradient>`
const markBody = (id) =>
  `<path d="${MARK_TILE}" stroke="url(#${id}t)" stroke-width="3" stroke-linejoin="round" fill="none"/>` +
  `<path d="${MARK_PUT}" stroke="url(#${id}p)" stroke-width="4.2" stroke-linecap="round"/>` +
  `<path d="${MARK_CALL}" stroke="url(#${id}c)" stroke-width="4.2" stroke-linecap="round"/>` +
  `<circle cx="24" cy="24" r="4.4" fill="${INK}" stroke="${BG}" stroke-width="2"/>`

// Text outliner (same approach as build-logo.mjs: glyphs outlined once at the origin, own serialiser)
function loadFont(file) {
  const buf = fs.readFileSync(out(file))
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
}
function outline(font, text, size, track = 0) {
  const glyphs = font.stringToGlyphs(text)
  const commands = []
  let x = 0
  glyphs.forEach((g, i) => {
    for (const c of g.getPath(0, 0, size).commands) {
      const o = { ...c }
      for (const k of ['x', 'x1', 'x2']) if (k in o) o[k] += x
      commands.push(o)
    }
    let adv = (g.advanceWidth / font.unitsPerEm) * size
    if (i < glyphs.length - 1) adv += ((font.getKerningValue(g, glyphs[i + 1]) || 0) / font.unitsPerEm) * size
    x += adv + track
  })
  const n = (v) => +v.toFixed(2)
  const d = commands
    .map((c) => {
      if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
      if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
      return 'Z'
    })
    .join('')
  if (d.includes('NaN')) throw new Error(`outline NaN: ${text}`)
  return { d, width: x - track }
}

const sans = loadFont('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-400-normal.woff')
const mono = loadFont('node_modules/@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff')

// ---------- Open Graph image, 1200 x 630 ----------
const W = 1200
const H = 630
const headline = outline(sans, 'On-chain options on tokenized stocks.', 50, -0.4)
const products = outline(mono, 'COVERED CALLS  ·  PUTS  ·  BINARIES  ·  YIELD VAULT', 19, 1.2)
const domain = outline(mono, 'quiverfi.org', 24, 0.5)
const chain = outline(mono, 'ETHEREUM  ·  CHAINLINK SETTLED', 17, 1)

const lockScale = 2.2 // lockup is 48 high → 105.6 px
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none">
<defs>${markDefs('o')}
<linearGradient id="bar" x1="0" y1="0" x2="${W}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}"/><stop offset=".4" stop-color="${CALL_B}"/><stop offset=".7" stop-color="${PUT_A}"/><stop offset="1" stop-color="${PUT_B}"/></linearGradient>
<radialGradient id="glow" cx="935" cy="175" r="380" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}" stop-opacity=".16"/><stop offset=".6" stop-color="${PUT_A}" stop-opacity=".04"/><stop offset="1" stop-color="${BG}" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="${BG}"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<path d="M170 0V${H}M${W - 170} 0V${H}M0 470H${W}" stroke="${DIVIDER}"/>
<rect width="${W}" height="5" fill="url(#bar)"/>
<g transform="translate(${W - 170 - 190 + 20} 78) scale(${190 / 48})" opacity=".95">${markBody('o')}</g>
<g transform="translate(76 120) scale(${lockScale})">${markBody('o')}<path transform="translate(${WORD_X} ${WORD_Y})" d="${WORD_D}" fill="${INK}"/></g>
<path transform="translate(80 350)" d="${headline.d}" fill="${INK}"/>
<path transform="translate(82 418)" d="${products.d}" fill="${MUTED}"/>
<path transform="translate(80 560)" d="${domain.d}" fill="${INK}"/>
<path transform="translate(${W - 80 - chain.width} 557)" d="${chain.d}" fill="${MUTED}"/>
</svg>`

const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: BG }).render().asPng()
fs.writeFileSync(out('public/og-image.png'), png(og, W))

// ---------- app icons: mark on the brand background, ~14% padding ----------
const icon = (size) => {
  const pad = size * 0.14
  const s = (size - pad * 2) / 48
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none"><defs>${markDefs('i')}</defs><rect width="${size}" height="${size}" fill="${BG}"/><g transform="translate(${pad} ${pad}) scale(${s})">${markBody('i')}</g></svg>`
}
for (const [file, size] of [
  ['public/apple-touch-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
]) fs.writeFileSync(out(file), png(icon(size), size))

console.log('social assets built', { ogHeadlineWidth: Math.round(headline.width), lockup: LOCK_W * lockScale })
