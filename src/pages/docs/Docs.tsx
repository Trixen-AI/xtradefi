import { useEffect, useMemo, useState } from 'react'
import Lenis from 'lenis'
import { Navigate, useParams } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { LaunchButton } from '@/components/layout/LaunchButton'
import { ArrowPlain, PlayTri } from '@/components/ui/ArrowUR'
import { Boxed } from '@/components/ui/Boxed'
import { prefersReducedMotion } from '@/lib/gsap'
import { setPageMeta } from '@/lib/seo'
import { LINKS } from '@/data/site'
import { DOC_GROUPS, DOC_PAGES } from './content'
import './docs.css'

const SITE_LINKS = [
  { label: 'Products', href: '/#products' },
  { label: 'Markets', href: '/#markets' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'FAQ', href: '/#faq' },
]

/** Tracks which section heading is currently at the top of the reading area. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? '')
  const key = ids.join('|')
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -65% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
    // ids is rebuilt every render; the joined key is the real dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

/** Smooth page scrolling like the website, with in-page anchors offset below the sticky header.
 *  Inner scroll areas opt out with data-lenis-prevent. */
function useDocsSmoothScroll() {
  useEffect(() => {
    const reduced = prefersReducedMotion()
    const lenis = reduced ? null : new Lenis({ duration: 1.05, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => {
      lenis?.raf(t)
      raf = requestAnimationFrame(loop)
    }
    if (lenis) raf = requestAnimationFrame(loop)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      const el = a ? document.getElementById(a.getAttribute('href')!.slice(1)) : null
      if (!el) return
      e.preventDefault()
      const offset = -(document.querySelector('.docs-header')?.getBoundingClientRect().height ?? 66) - 20
      if (lenis) lenis.scrollTo(el, { offset })
      else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset })
      history.replaceState(null, '', a!.getAttribute('href'))
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(raf)
      lenis?.destroy()
    }
  }, [])
}

export default function Docs() {
  useDocsSmoothScroll()
  const { slug } = useParams()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuFor, setMenuFor] = useState(slug)
  // Close the mobile page menu whenever the page changes (derived during render, no effect).
  if (menuFor !== slug) {
    setMenuFor(slug)
    setMenuOpen(false)
  }
  const index = DOC_PAGES.findIndex((p) => p.slug === slug)
  const page = index >= 0 ? DOC_PAGES[index] : undefined
  const ids = useMemo(() => page?.sections.map((s) => s.id) ?? [], [page])
  const active = useActiveHeading(ids)

  useEffect(() => {
    if (page) setPageMeta({ title: `${page.title} · xTradeFi Docs`, description: page.lead, path: `/docs/${page.slug}` })
    return () => setPageMeta({})
  }, [page])

  if (!slug) return <Navigate to="/docs/introduction" replace />
  if (!page) return <Navigate to="/docs/introduction" replace />

  const q = query.trim().toLowerCase()
  const groups = q ? DOC_GROUPS.map((g) => ({ ...g, pages: g.pages.filter((p) => `${p.title} ${p.lead}`.toLowerCase().includes(q)) })).filter((g) => g.pages.length) : DOC_GROUPS
  const prev = DOC_PAGES[index - 1]
  const next = DOC_PAGES[index + 1]

  return (
    <div className="docs">
      <header className="docs-header">
        <a className="docs-header__logo" href="/" aria-label="xTradeFi home">
          <Logo className="docs-header__logo-svg" />
        </a>
        <div className="docs-header__mid">
          <span className="docs-header__tag">Docs</span>
          <nav className="docs-header__nav" aria-label="Website">
            {SITE_LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="docs-header__right">
          <LaunchButton />
        </div>
      </header>

      <div className="docs-body">
        <aside className="docs-side" aria-label="Documentation" data-lenis-prevent>
          <label className="docs-search">
            <span className="sr-only">Search the docs</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <circle cx="6" cy="6" r="4.5" />
              <path d="M9.5 9.5 13 13" />
            </svg>
            <input type="search" placeholder="Search docs" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button type="button" className="docs-side__toggle" aria-expanded={menuOpen} aria-controls="docs-pages" onClick={() => setMenuOpen((v) => !v)}>
            <span>{page.title}</span>
            <span className="docs-side__toggle-hint">
              {menuOpen ? 'Close' : 'All pages'}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </span>
          </button>
          <div id="docs-pages" className={`docs-side__pages ${menuOpen ? 'is-open' : ''}`} data-lenis-prevent>
            <div className="docs-side__pages-inner">
            {groups.length ? (
              groups.map((g) => (
                <div key={g.title} className="docs-side__group">
                  <div className="docs-side__title">{g.title}</div>
                  <ul>
                    {g.pages.map((p) => (
                      <li key={p.slug}>
                        <a href={`/docs/${p.slug}`} className={p.slug === page.slug ? 'is-current' : ''} aria-current={p.slug === page.slug ? 'page' : undefined}>
                          {p.slug === page.slug ? <PlayTri /> : null}
                          {p.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="docs-side__empty">No page matches “{query}”.</p>
            )}
            </div>
          </div>
        </aside>

        <article className="docs-article">
          <div className="docs-article__pre">
            <span className="section-heading-dots section-heading-dots--inline" aria-hidden="true">
              <i />
              <i />
            </span>
            {page.group}
          </div>
          <h1 className="docs-article__title">
            <Boxed>{page.title}</Boxed>
          </h1>
          <p className="docs-article__lead">{page.lead}</p>

          {page.sections.map((s) => (
            <section key={s.id} id={s.id} className="docs-section">
              <h2>
                <a href={`#${s.id}`} className="docs-anchor" aria-label={`Link to ${s.title}`}>
                  #
                </a>
                {s.title}
              </h2>
              <div className="docs-prose">{s.body}</div>
            </section>
          ))}

          <nav className="docs-pager" aria-label="Previous and next page">
            {prev ? (
              <a href={`/docs/${prev.slug}`} className="docs-pager__link">
                <span className="docs-pager__dir">Previous</span>
                <span className="docs-pager__title">{prev.title}</span>
              </a>
            ) : (
              <span />
            )}
            {next ? (
              <a href={`/docs/${next.slug}`} className="docs-pager__link docs-pager__link--next">
                <span className="docs-pager__dir">Next</span>
                <span className="docs-pager__title">{next.title}</span>
              </a>
            ) : (
              <a href={LINKS.app} className="docs-pager__link docs-pager__link--next">
                <span className="docs-pager__dir">Ready?</span>
                <span className="docs-pager__title">Launch the app</span>
              </a>
            )}
          </nav>
        </article>

        <nav className="docs-toc" aria-label="On this page">
          <div className="docs-toc__title">On this page</div>
          <ul>
            {page.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className={active === s.id ? 'is-active' : ''}>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <a className="docs-toc__x" href={LINKS.x} target="_blank" rel="noopener noreferrer">
            Updates on X <ArrowPlain size={9} />
          </a>
        </nav>
      </div>

      <footer className="docs-footer">
        <span>© 2026 xTradeFi · On-chain options on tokenized stocks</span>
        <a href="/">Back to the website</a>
      </footer>
    </div>
  )
}
