// Builds the xTradeFi logo from one source: the mark geometry below + the wordmark outlined from
// Space Grotesk 500 (opentype.js). Writes public/brand/*, public/favicon.svg and src/components/brand/logoPaths.ts,
// then renders the 500x500 PNG exports with resvg.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'
import { Resvg } from '@resvg/resvg-js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = (p) => path.join(root, p)

// Tokens (keep in sync with src/styles/tokens.css)
const INK = '#eef0e6'
const BG = '#0a0b0d'
const CALL_A = '#19e3a0'
const CALL_B = '#b7f23a'
const PUT_A = '#ffb627'
const PUT_B = '#ff5b4a'

// Mark on a 48x48 grid: chamfered tile (cut top-left and bottom-right, like the UI frames) holding an "x" made of a
// rising call line and a falling put line that cross at the strike dot.
const MARK_TILE = 'M13 3H43a2 2 0 0 1 2 2V35L35 45H5a2 2 0 0 1-2-2V13Z'
const MARK_CALL = 'M13 35 35 13'
const MARK_PUT = 'M13 13 35 35'
const markDefs = (id) => `<linearGradient id="${id}-t" x1="3" y1="45" x2="45" y2="3" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}"/><stop offset=".55" stop-color="${CALL_B}"/><stop offset="1" stop-color="${PUT_A}"/></linearGradient><linearGradient id="${id}-c" x1="13" y1="35" x2="35" y2="13" gradientUnits="userSpaceOnUse"><stop stop-color="${CALL_A}"/><stop offset="1" stop-color="${CALL_B}"/></linearGradient><linearGradient id="${id}-p" x1="13" y1="13" x2="35" y2="35" gradientUnits="userSpaceOnUse"><stop stop-color="${PUT_A}"/><stop offset="1" stop-color="${PUT_B}"/></linearGradient>`
const markBody = (id, ink) =>
  `<path d="${MARK_TILE}" stroke="url(#${id}-t)" stroke-width="3" stroke-linejoin="round" fill="none"/>` +
  `<path d="${MARK_PUT}" stroke="url(#${id}-p)" stroke-width="4.2" stroke-linecap="round"/>` +
  `<path d="${MARK_CALL}" stroke="url(#${id}-c)" stroke-width="4.2" stroke-linecap="round"/>` +
  `<circle cx="24" cy="24" r="4.4" fill="${ink}" stroke="${BG}" stroke-width="2"/>`

// Wordmark
const fontFile = out('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff')
const buf = fs.readFileSync(fontFile)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
const SIZE = 40
const TRACK = -0.4 // px at SIZE, slight tightening
const word = 'xTradeFi'
// Outline each glyph once at the origin, then offset copies of its commands. Calling getPath repeatedly on the
// same glyph with an x offset produced NaN coordinates in opentype.js 2.0.
const glyphs = font.stringToGlyphs(word)
const shapes = glyphs.map((g) => g.getPath(0, 0, SIZE).commands.map((c) => ({ ...c })))
const commands = []
let x = 0
glyphs.forEach((g, i) => {
  for (const c of shapes[i]) {
    const o = { ...c }
    for (const k of ['x', 'x1', 'x2']) if (k in o) o[k] += x
    commands.push(o)
  }
  let adv = (g.advanceWidth / font.unitsPerEm) * SIZE
  if (i < glyphs.length - 1) adv += ((font.getKerningValue(g, glyphs[i + 1]) || 0) / font.unitsPerEm) * SIZE
  x += adv + TRACK
})
// Own serialiser: opentype.js 2.0 toPathData drops some L commands and can emit NaN.
const n = (v) => +v.toFixed(2)
const wordD = commands
  .map((c) => {
    if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`
    if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`
    if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`
    return 'Z'
  })
  .join('')
const wordPath = new opentype.Path()
wordPath.commands = commands
if (wordD.includes('NaN')) throw new Error('wordmark path contains NaN')
const bb = wordPath.getBoundingBox()
const wordW = Math.ceil(bb.x2 - bb.x1)
const wordTop = bb.y1
const wordH = Math.ceil(bb.y2 - bb.y1)

// Lockup: mark 48 + gap 12 + wordmark, wordmark vertically centred on the mark
const GAP = 12
const lockW = 48 + GAP + wordW
const wordY = 24 - (wordTop + wordH / 2)
const lockup = (id, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lockW} 48" width="${lockW}" height="48" fill="none" role="img" aria-label="xTradeFi"><defs>${markDefs(id)}</defs>${markBody(id, ink)}<g transform="translate(${48 + GAP - bb.x1} ${wordY.toFixed(2)})"><path d="${wordD}" fill="${ink}"/></g></svg>`
const markSvg = (id, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none" role="img" aria-label="xTradeFi"><defs>${markDefs(id)}</defs>${markBody(id, ink)}</svg>`

fs.mkdirSync(out('public/brand'), { recursive: true })
fs.writeFileSync(out('public/brand/logo.svg'), lockup('xs', INK))
fs.writeFileSync(out('public/brand/logo-inverted.svg'), lockup('xs', BG))
fs.writeFileSync(out('public/brand/mark.svg'), markSvg('xs', INK))
// Favicon: mark on its own dark tile so it reads on light browser chrome too
fs.writeFileSync(
  out('public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><defs>${markDefs('f')}</defs><rect width="48" height="48" rx="10" fill="${BG}"/><g transform="translate(4 4) scale(.8333)">${markBody('f', INK)}</g></svg>`,
)

// 500x500 exports: stacked lockup (mark above wordmark), centred with ~12% padding
const stacked = (bg) => {
  const inner = 500 * 0.76
  const markS = 190
  const wordScale = inner / wordW
  const wH = wordH * wordScale
  const total = markS + 34 + wH
  const top = (500 - total) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" fill="none">${bg ? `<rect width="500" height="500" fill="${bg}"/>` : ''}<defs>${markDefs('e')}</defs><g transform="translate(${(500 - markS) / 2} ${top}) scale(${markS / 48})">${markBody('e', INK)}</g><g transform="translate(${(500 - inner) / 2 - bb.x1 * wordScale} ${top + markS + 34 - wordTop * wordScale}) scale(${wordScale})"><path d="${wordD}" fill="${INK}"/></g></svg>`
}
const src = stacked(BG)
fs.writeFileSync(out('public/brand/logo-500.svg'), src)
const render = (svg, file) => {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 500 }, background: 'rgba(0,0,0,0)' }).render().asPng()
  fs.writeFileSync(out(file), png)
}
render(src, 'public/brand/logo-500.png')
render(stacked(null), 'public/brand/logo-500-transparent.png')
fs.unlinkSync(out('public/brand/logo-500.svg'))

// Paths for the inline React logo
fs.writeFileSync(
  out('src/components/brand/logoPaths.ts'),
  `// Generated by scripts/build-logo.mjs. Do not edit by hand.\nexport const MARK_TILE = '${MARK_TILE}'\nexport const MARK_CALL = '${MARK_CALL}'\nexport const MARK_PUT = '${MARK_PUT}'\nexport const WORD_D = '${wordD}'\nexport const WORD_BOX = { x: ${(48 + GAP - bb.x1).toFixed(2)}, y: ${wordY.toFixed(2)}, w: ${lockW} }\n`,
)
console.log('logo built', { lockW, wordW, wordH })
