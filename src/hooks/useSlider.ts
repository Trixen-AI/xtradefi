import { useState } from 'react'

/** Index state for a card track. The index resets to 0 whenever resetKey changes (derived, no effect). */
export function useSlider(count: number, resetKey: unknown = null) {
  const [state, setState] = useState({ key: resetKey, index: 0 })
  const index = Object.is(state.key, resetKey) ? state.index : 0
  const max = Math.max(0, count - 1)
  const go = (i: number) => setState({ key: resetKey, index: Math.min(max, Math.max(0, i)) })
  return {
    index,
    prev: () => go(index - 1),
    next: () => go(index + 1),
    canPrev: index > 0,
    canNext: index < max,
  }
}
