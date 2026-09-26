import { useEffect, useRef, useState } from 'react'

export function useElementSize<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const r = entry.target.getBoundingClientRect()
      setSize((s) => (Math.round(r.width) === s.w && Math.round(r.height) === s.h ? s : { w: Math.round(r.width), h: Math.round(r.height) }))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size] as const
}
