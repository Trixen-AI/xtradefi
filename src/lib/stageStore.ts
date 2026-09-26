import { useSyncExternalStore } from 'react'

/** What the fixed 3D stage shows. Sections write to it; the stage and the aside nav read it. */
export type Face = 'x' | 'call' | 'put' | 'binary' | 'vault' | 'oracle'
export type StageState = {
  section: string
  productIndex: number
}

let state: StageState = { section: 'intro', productIndex: 0 }
const listeners = new Set<() => void>()

export const stageStore = {
  get: () => state,
  set(patch: Partial<StageState>) {
    const next = { ...state, ...patch }
    if (next.section === state.section && next.productIndex === state.productIndex) return
    state = next
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export function useStage() {
  return useSyncExternalStore(stageStore.subscribe, stageStore.get, stageStore.get)
}

const PRODUCT_FACES: Face[] = ['call', 'put', 'binary', 'vault']

/** Where the object sits and what it shows, per section. Hidden sections fade it out and drop it 450px. */
export function stageFor(s: StageState): { visible: boolean; shape: 'tile' | 'coin'; face: Face; spot: 'center' | 'high' } {
  switch (s.section) {
    case 'intro':
    case 'overview':
      return { visible: true, shape: 'tile', face: 'x', spot: 'center' }
    case 'products':
      return { visible: true, shape: 'tile', face: PRODUCT_FACES[s.productIndex] ?? 'call', spot: 'center' }
    case 'settlement':
      return { visible: true, shape: 'coin', face: 'oracle', spot: 'high' }
    case 'start-grid':
      return { visible: true, shape: 'tile', face: 'x', spot: 'center' }
    default:
      return { visible: false, shape: 'tile', face: 'x', spot: 'center' }
  }
}
