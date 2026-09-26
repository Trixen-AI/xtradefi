import { useEffect, useState } from 'react'
import { SECTIONS } from '@/data/site'
import { useStage } from '@/lib/stageStore'

/** Fixed right rail: one dot per section, the active one labelled; MENU opens a panel listing every section. */
export function AsideNav() {
  const { section } = useStage()
  const [open, setOpen] = useState(false)
  const activeIndex = Math.max(0, SECTIONS.findIndex((s) => section === s.id || section.startsWith(`${s.id}-`)))

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <aside className="aside-nav" aria-label="Sections">
        <ol className="aside-nav__dots">
          {SECTIONS.map((s, i) => (
            <li key={s.id} className={i === activeIndex ? 'is-active' : ''}>
              <a href={`#${s.id}`} aria-label={s.label} aria-current={i === activeIndex ? 'true' : undefined}>
                <i />
                {i === activeIndex && <span className="aside-nav__label">{s.label}</span>}
              </a>
            </li>
          ))}
        </ol>
        <button type="button" className="aside-nav__menu" onClick={() => setOpen(true)} aria-expanded={open}>
          <svg width="24" height="10" viewBox="0 0 24 10" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M10 1h14M4 5h20M0 9h24" />
          </svg>
          <span>Menu</span>
        </button>
      </aside>

      <div className={`aside-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <button type="button" className="aside-panel__scrim" aria-label="Close sections" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
        <div className="aside-panel__box">
          <div className="aside-panel__head">
            <span>All sections</span>
            <button type="button" aria-label="Close" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M1 1l14 14M15 1 1 15" />
              </svg>
            </button>
          </div>
          <ol className="aside-panel__list">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className={i === activeIndex ? 'is-active' : ''}>
                <a href={`#${s.id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}
