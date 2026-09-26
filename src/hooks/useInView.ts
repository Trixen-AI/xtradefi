import { useEffect, useRef, useState } from 'react'

/** True once the element has entered the viewport (never flips back). */
export function useInView<T extends Element>(options: IntersectionObserverInit = { rootMargin: '0px 0px -12% 0px' }) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        io.disconnect()
      }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // options is a literal per call site; observing once is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])
  return [ref, inView] as const
}
