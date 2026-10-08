// Official third-party logos, stored byte-for-byte in src/assets/logos and inlined unmodified (resize only).
// Sources:
//   chainlink-logo-white.svg     https://cdn.prod.website-files.com/5f6b7190899f41fb70882d08/6aa7fef7d50e112425683256_Chainlink-Logo-White.svg  (chain.link/brand-assets)
//   chainlink-symbol-white.svg   https://cdn.prod.website-files.com/5f6b7190899f41fb70882d08/6aa7fef7a31aed5b1bf78dd7_Chainlink-Symbol-White.svg (chain.link/brand-assets)
//   eth-diamond-purple.svg       https://ethereum.org/images/assets/svgs/eth-diamond-purple.svg (ethereum.org/assets; the dark-mode mark ethereum.org itself uses)
//   usdc-logo-ondark.svg         https://cdn.prod.website-files.com/66327d2c71b7019a2a9a1b62/67c8850799c5bdc15291c334_usdc-logo_ondark.svg (usdc.com, Circle's official USDC site; the on-dark variant)
import chainlinkLogo from '@/assets/logos/chainlink-logo-white.svg?raw'
import chainlinkSymbol from '@/assets/logos/chainlink-symbol-white.svg?raw'
import ethDiamond from '@/assets/logos/eth-diamond-purple.svg?raw'
import usdcLogo from '@/assets/logos/usdc-logo-ondark.svg?raw'

const LOGOS = {
  chainlink: chainlinkLogo,
  'chainlink-symbol': chainlinkSymbol,
  ethereum: ethDiamond,
  usdc: usdcLogo,
} as const

export type BrandKey = keyof typeof LOGOS

export function BrandLogo({ name, label, className = '' }: { name: BrandKey; label: string; className?: string }) {
  return <span className={`brand-logo brand-logo--${name} ${className}`} role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: LOGOS[name] }} />
}
