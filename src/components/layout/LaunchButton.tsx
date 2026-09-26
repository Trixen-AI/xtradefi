import { LINKS } from '@/data/site'

/** Cut-corner Launch App button (header, docs, mobile menu). */
export function LaunchButton({ className = '' }: { className?: string }) {
  return (
    <a className={`btn-launch ${className}`} href={LINKS.app}>
      <svg className="btn-launch__frame" viewBox="0 0 136 40" preserveAspectRatio="none" fill="none" aria-hidden="true">
        <path d="M1 39V9l8-8h126" stroke="url(#launchA)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <path d="M135 1v30l-8 8H1" stroke="url(#launchB)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <defs>
          <linearGradient id="launchA" x1="0" y1="40" x2="136" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--call-a)" />
            <stop offset="1" stopColor="var(--divider)" />
          </linearGradient>
          <linearGradient id="launchB" x1="136" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--put-b)" />
            <stop offset="1" stopColor="var(--divider)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="btn-launch__dots" aria-hidden="true">
        <i />
        <i />
      </span>
      Launch App
    </a>
  )
}
