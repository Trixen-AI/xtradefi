import { useEffect, useState } from 'react'

/** Intro: crosshair guide lines with LOADING labels over a dimmed page, gone once the page has painted. */
export function Loader() {
  const [state, setState] = useState<'on' | 'out' | 'gone'>('on')
  useEffect(() => {
    const out = window.setTimeout(() => setState('out'), 900)
    const gone = window.setTimeout(() => setState('gone'), 1700)
    return () => {
      window.clearTimeout(out)
      window.clearTimeout(gone)
    }
  }, [])
  if (state === 'gone') return null
  return (
    <div className={`page-loader ${state === 'out' ? 'is-out' : ''}`} aria-hidden="true">
      <i className="page-loader__h page-loader__h--1" />
      <i className="page-loader__h page-loader__h--2" />
      <i className="page-loader__v page-loader__v--1" />
      <i className="page-loader__v page-loader__v--2" />
      <span className="page-loader__label page-loader__label--l">
        <svg width="5" height="8" viewBox="0 0 5 8" fill="currentColor">
          <path d="M0 0v8l5-4z" />
        </svg>
        Loading
      </span>
      <span className="page-loader__label page-loader__label--r">Loading</span>
    </div>
  )
}
