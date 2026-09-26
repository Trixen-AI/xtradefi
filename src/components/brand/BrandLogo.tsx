// Official third-party logos, stored byte-for-byte in src/assets/logos and inlined unmodified (resize only).
// Sources:
//   chainlink-logo-white.svg     https://cdn.prod.website-files.com/5f6b7190899f41fb70882d08/6aa7fef7d50e112425683256_Chainlink-Logo-White.svg  (chain.link/brand-assets)
//   chainlink-symbol-white.svg   https://cdn.prod.website-files.com/5f6b7190899f41fb70882d08/6aa7fef7a31aed5b1bf78dd7_Chainlink-Symbol-White.svg (chain.link/brand-assets)
//   robinhood-feather-light.svg  https://cdn.robinhood.com/assets/generated_assets/hoodchain_docsite/feather-light.svg (docs.robinhood.com/chain)
//   usdg-brandmark-reversed.svg  https://framerusercontent.com/assets/BuBtOHBB1SfqRghUGuwxOKhTbSY.zip → USDG/SVG/GDN_USDG_Brandmark_Reversed.svg (globaldollar.com/brand)
//   usdg-token.svg               https://framerusercontent.com/assets/llo5qqG8OQbvOU2QpFJPTdUyn0.zip → USDG Token/SVG/GDN_USDG_Token.svg (globaldollar.com/brand)
import chainlinkLogo from '@/assets/logos/chainlink-logo-white.svg?raw'
import chainlinkSymbol from '@/assets/logos/chainlink-symbol-white.svg?raw'
import robinhoodFeather from '@/assets/logos/robinhood-feather-light.svg?raw'
import usdgBrandmark from '@/assets/logos/usdg-brandmark-reversed.svg?raw'
import usdgToken from '@/assets/logos/usdg-token.svg?raw'

const LOGOS = {
  chainlink: chainlinkLogo,
  'chainlink-symbol': chainlinkSymbol,
  robinhood: robinhoodFeather,
  usdg: usdgBrandmark,
  'usdg-token': usdgToken,
} as const

export type BrandKey = keyof typeof LOGOS

export function BrandLogo({ name, label, className = '' }: { name: BrandKey; label: string; className?: string }) {
  return <span className={`brand-logo brand-logo--${name} ${className}`} role="img" aria-label={label} dangerouslySetInnerHTML={{ __html: LOGOS[name] }} />
}
