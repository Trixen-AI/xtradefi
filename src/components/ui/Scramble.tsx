import { useRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { gsap, SCRAMBLE_CHARS, prefersReducedMotion } from '@/lib/gsap'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { text: string; children?: ReactNode }

/** Mono link whose label re-scrambles into itself on hover. */
export function ScrambleLink({ text, children, className = '', ...rest }: Props) {
  const label = useRef<HTMLSpanElement>(null)
  const run = () => {
    if (!label.current || prefersReducedMotion()) return
    gsap.to(label.current, { duration: 0.6, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.6 }, overwrite: true })
  }
  const external = rest.href?.startsWith('http')
  return (
    <a className={`link-more ${className}`} onMouseEnter={run} onFocus={run} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      <span ref={label}>{text}</span>
      {children}
    </a>
  )
}
