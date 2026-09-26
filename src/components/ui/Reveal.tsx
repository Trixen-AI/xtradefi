import type { ElementType, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

/** Masked line reveal: the text rises from below its line box when it enters the viewport. */
export function Reveal({ children, as: Tag = 'span', delay = 0, className = '' }: { children: ReactNode; as?: ElementType; delay?: number; className?: string }) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag ref={ref} className={`rv ${inView ? 'is-in' : ''} ${className}`}>
      <span className="rv__i" style={{ transitionDelay: `${delay}s` }}>
        {children}
      </span>
    </Tag>
  )
}
