import { Suspense, lazy, useEffect } from 'react'
import { useLocation } from 'react-router'
import { setPageMeta } from '@/lib/seo'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'
import { stageStore } from '@/lib/stageStore'
import { Loader } from '@/components/layout/Loader'
import { Header } from '@/components/layout/Header'
import { AsideNav } from '@/components/layout/AsideNav'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/sections/Hero'
import { Overview } from '@/components/sections/Overview'
import { Highlights } from '@/components/sections/Highlights'
import { Products } from '@/components/sections/Products'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Architecture } from '@/components/sections/Architecture'
import { Fees } from '@/components/sections/Fees'
import { Settlement } from '@/components/sections/Settlement'
import { Guides } from '@/components/sections/Guides'
import { Markets } from '@/components/sections/Markets'
import { Faq } from '@/components/sections/Faq'
import { Cta } from '@/components/sections/Cta'

// Three.js is the heaviest dependency; load the stage after first paint.
const Stage3D = lazy(() => import('@/components/stage/Stage3D').then((m) => ({ default: m.Stage3D })))

/** Smooth scrolling (Lenis driven by GSAP's ticker) and in-page anchor handling. */
function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      const el = id ? document.getElementById(id) : null
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -66 })
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}

/** The section under the middle of the viewport drives the aside nav and the 3D stage. */
function useActiveSection() {
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      // Innermost match wins, so a block inside a section (the CTA grid) can override its section.
      let hit = ''
      document.querySelectorAll<HTMLElement>('[data-section]').forEach((s) => {
        const r = s.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) hit = s.dataset.section!
      })
      if (hit) stageStore.set({ section: hit })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
}

/** Arriving from another route with a hash (e.g. /#faq from the docs): jump to that section once it exists. */
function useHashOnArrival() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = window.setTimeout(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 66 })
    }, 60)
    return () => window.clearTimeout(id)
  }, [hash])
}

export default function Home() {
  useEffect(() => setPageMeta({}), [])
  useSmoothScroll()
  useActiveSection()
  useHashOnArrival()
  return (
    <>
      <Loader />
      <i className="vertical-line vertical-line--left" aria-hidden="true" />
      <i className="vertical-line vertical-line--center" aria-hidden="true" />
      <i className="vertical-line vertical-line--right" aria-hidden="true" />
      <Header />
      <AsideNav />
      <Suspense fallback={null}>
        <Stage3D />
      </Suspense>
      <main>
        <Hero />
        <Overview />
        <Highlights />
        <Products />
        <HowItWorks />
        <Architecture />
        <Fees />
        <Settlement />
        <Guides />
        <Markets />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
