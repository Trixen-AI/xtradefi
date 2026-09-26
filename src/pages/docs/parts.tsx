import type { ReactNode } from 'react'
import { PlayTri } from '@/components/ui/ArrowUR'
import { NbChip } from '@/components/ui/NbChip'

/** Note block framed with the site's corner brackets. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-callout">
      <span className="docs-callout__label">Note</span>
      <p>{children}</p>
      <i className="docs-callout__c1" aria-hidden="true" />
      <i className="docs-callout__c2" aria-hidden="true" />
    </div>
  )
}

/** Mono label on the left, value on the right; same row device as the fee cards. */
export function KeyValues({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="docs-kv">
      {rows.map(([k, v]) => (
        <div key={k} className="docs-kv__row">
          <dt>
            <PlayTri /> {k}
          </dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Numbered steps using the numbered chip. */
export function Steps({ items }: { items: [string, string][] }) {
  return (
    <ol className="docs-steps">
      {items.map(([title, body], i) => (
        <li key={title}>
          <NbChip n={String(i + 1).padStart(2, '0')} />
          <div>
            <h4>{title}</h4>
            <p>{body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
