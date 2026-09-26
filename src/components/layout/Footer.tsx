import { useState, type FormEvent } from 'react'
import { FOOTER, SOCIALS } from '@/data/site'
import { Logo } from '@/components/brand/Logo'
import { ArrowPlain } from '@/components/ui/ArrowUR'

export function Footer() {
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <footer className="footer-2">
      <div className="site-footer">
        <svg className="site-footer__frame" viewBox="0 0 1377 882" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0.5 882V20L20 0.5H1357L1376.5 20V882" fill="none" stroke="var(--divider)" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="footer__top">
          <Logo mark className="footer__mark" />
          <div className="footer__main">
            <form className="footer__sub" onSubmit={submit}>
              <div className="footer__sub-head">
                <span className="footer__sub-title">{FOOTER.subscribe}</span>
                <span className="footer__sub-note">{FOOTER.subNote}</span>
              </div>
              <div className="footer__sub-row">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input id="footer-email" type="email" required placeholder={FOOTER.placeholder} autoComplete="email" />
                <button type="submit" className="btn-cut">
                  {sent ? 'Noted' : FOOTER.button}
                </button>
              </div>
            </form>
            <div className="footer__cols">
              {FOOTER.cols.map((col) => (
                <div key={col.title} className="footer__col">
                  <div className="footer__col-title">{col.title}</div>
                  <ul>
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        <a href={href}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <ul className="footer__socials">
                {SOCIALS.map((s) => (
                  <li key={s.key}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer">
                      {s.label}
                      <ArrowPlain size={9} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer__badge-row">
              <p className="footer__risk">{FOOTER.risk}</p>
              <span className="footer__badge">
                <Logo mark className="footer__badge-mark" />
                <span>
                  <small>{FOOTER.badge[0]}</small>
                  {FOOTER.badge[1]}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <span className="footer__year">© 2026</span>
          <span className="footer__copy">{FOOTER.copy}</span>
          <span className="footer__dots" aria-hidden="true">
            <i />
            <i />
          </span>
        </div>
      </div>
    </footer>
  )
}
