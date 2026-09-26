import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin)

export const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger }
