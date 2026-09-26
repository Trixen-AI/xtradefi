import { useEffect, useRef, useState } from 'react'
import { NAV, PRODUCT_TILES } from '@/data/site'
import { Logo } from '@/components/brand/Logo'
import { LaunchButton } from './LaunchButton'
import { ArrowPlain, Caret } from '@/components/ui/ArrowUR'

function DotsIcon({ open }: { open: boolean }) {
  return (
    <svg className={`dots-ico ${open ? 'is-open' : ''}`} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect className="d1" x="1" y="1" width="3.5" height="3.5" />
      <rect className="d2" x="9.5" y="1" width="3.5" height="3.5" />
      <rect className="d3" x="1" y="9.5" width="3.5" height="3.5" />
      <rect className="d4" x="9.5" y="9.5" width="3.5" height="3.5" />
    </svg>
  )
}

export function Header() {
  const [menu, setMenu] = useState<number | null>(null)
  const [tiles, setTiles] = useState(false)
  const [mobile, setMobile] = useState(false)
  const closeTimer = useRef<number>(0)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(null)
        setTiles(false)
        setMobile(false)
      }
    }
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setTiles(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDoc)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDoc)
    }
  }, [])

  const openMenu = (i: number) => {
    window.clearTimeout(closeTimer.current)
    setTiles(false)
    setMenu(i)
  }
  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setMenu(null), 160)
  }
  const active = menu !== null ? NAV[menu] : null

  return (
    <header ref={root} className={`site-header ${mobile ? 'is-mobile-open' : ''}`}>
      <div className="header-container">
        <a className="header-logo" href="#intro" aria-label="xTradeFi home">
          <Logo className="header-logo__svg" />
        </a>
        <div className="header-mdl-part">
          <button type="button" className={`header-eco ${tiles ? 'is-open' : ''}`} aria-expanded={tiles} onClick={() => setTiles((v) => !v)}>
            <DotsIcon open={tiles} />
            Our Products
          </button>
          <nav className="header-nav" aria-label="Main">
            {NAV.map((item, i) =>
              item.menu ? (
                <div key={item.label} className="header-nav__dd" onMouseEnter={() => openMenu(i)} onMouseLeave={scheduleClose}>
                  <button type="button" className={`header-nav__link ${menu === i ? 'is-open' : ''}`} aria-expanded={menu === i} onClick={() => (menu === i ? setMenu(null) : openMenu(i))}>
                    {item.label}
                    <Caret className="header-nav__caret" />
                  </button>
                </div>
              ) : (
                <a key={item.label} className="header-nav__link" href={item.href}>
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <i className="vertical-line vertical-line--left vertical-line-header" />
          <i className="vertical-line vertical-line--right vertical-line-header" />
        </div>
        <div className="header-right">
          <LaunchButton />
          <button type="button" className="header-burger" aria-label="Open menu" aria-expanded={mobile} onClick={() => setMobile((v) => !v)}>
            <i />
            <i />
          </button>
        </div>
      </div>

      {tiles && (
        <div className="eco-menu" role="menu">
          {PRODUCT_TILES.map((t, i) => (
            <a key={t.name} href={t.href} className={`eco-tile eco-tile--${t.tone} ${i === 0 ? 'is-current' : ''}`} onClick={() => setTiles(false)}>
              <span className="eco-tile__top">
                <Logo mark className="eco-tile__mark" />
                <span className="eco-tile__name">{t.name}</span>
                <ArrowPlain className="eco-tile__arrow" size={10} />
              </span>
              <span className="eco-tile__sub">{t.sub}</span>
            </a>
          ))}
        </div>
      )}

      <div className={`mega ${active?.menu ? 'is-open' : ''}`} onMouseEnter={() => menu !== null && openMenu(menu)} onMouseLeave={scheduleClose}>
        {active?.menu && (
          <div className="mega__grid">
            {active.menu.map((col) => (
              <div key={col.title} className="mega__col">
                <div className="mega__title">{col.title}</div>
                <ul className="mega__list">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className={l.muted ? 'is-muted' : ''} onClick={() => setMenu(null)}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <a className="mega__cta" href={active.href} onClick={() => setMenu(null)}>
                  {col.cta}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mobile-menu" hidden={!mobile}>
        {NAV.map((item) => (
          <a key={item.label} href={item.href} onClick={() => setMobile(false)}>
            {item.label}
          </a>
        ))}
        <LaunchButton className="btn-launch--block" />
      </div>
    </header>
  )
}
