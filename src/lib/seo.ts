// Per-route head tags for the single-page app. index.html carries the defaults for "/"; routes that differ
// (docs pages, the dashboard) update title, description, canonical, Open Graph and robots on mount.

export const SITE_ORIGIN = 'https://xtradefi.org'
export const DEFAULT_TITLE = 'xTradeFi · On-chain options on tokenized stocks'
export const DEFAULT_DESCRIPTION = 'Trade covered calls, cash-secured puts and binary options on 16 tokenized stocks. Settled on-chain by Chainlink oracles on Robinhood Chain. No KYC.'

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

const meta = (key: 'name' | 'property', id: string) => () => {
  const m = document.createElement('meta')
  m.setAttribute(key, id)
  return m
}

export type PageMeta = { title?: string; description?: string; path?: string; noindex?: boolean }

export function setPageMeta({ title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, path = '/', noindex = false }: PageMeta) {
  const url = `${SITE_ORIGIN}${path}`
  document.title = title
  setTag('meta[name="description"]', meta('name', 'description'), 'content', description)
  setTag('meta[name="robots"]', meta('name', 'robots'), 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
  setTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', url)
  setTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', title)
  setTag('meta[property="og:description"]', meta('property', 'og:description'), 'content', description)
  setTag('meta[name="twitter:title"]', meta('name', 'twitter:title'), 'content', title)
  setTag('meta[name="twitter:description"]', meta('name', 'twitter:description'), 'content', description)
}
