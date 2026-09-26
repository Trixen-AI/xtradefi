/** Numbered chip: 40x40, call-coloured bracket top-left and put-coloured bracket bottom-right. */
export function NbChip({ n, className = '' }: { n: string; className?: string }) {
  return (
    <span className={`nb ${className}`}>
      <span>{n}</span>
      <svg className="nb__tl" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <path d="M1 13V5a4 4 0 0 1 4-4h12" stroke="var(--call-a)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <svg className="nb__br" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
        <path d="M17 1v8a4 4 0 0 1-4 4H1" stroke="var(--put-b)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}
