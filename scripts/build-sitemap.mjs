// Writes public/sitemap.xml from the site's routes: the landing page plus every docs page slug found in
// src/pages/docs/content.tsx. Runs automatically before `npm run build` (prebuild), so it never drifts.
// The dashboard (/app) is left out on purpose: it is disallowed in robots.txt and marked noindex.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://quiverfi.org'

const docs = fs.readFileSync(path.join(root, 'src/pages/docs/content.tsx'), 'utf8')
const slugs = [...docs.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1])
if (!slugs.length) throw new Error('no docs slugs found')

const today = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: `${ORIGIN}/`, priority: '1.0', changefreq: 'weekly' },
  ...slugs.map((s) => ({ loc: `${ORIGIN}/docs/${s}`, priority: '0.7', changefreq: 'monthly' })),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap: ${urls.length} urls`)
