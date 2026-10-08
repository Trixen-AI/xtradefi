import { parseAbi, type Address } from 'viem'
import { MARKETS } from '@/data/site'

// Ethereum mainnet addresses. Sources, verified 2026-10-08:
//   stock tokens: Ondo Global Markets official token list
//     https://raw.githubusercontent.com/ondoprotocol/ondo-global-markets-token-list/main/tokenlist.json
//     (matches the CSV linked from docs.ondo.finance/addresses); symbol() and decimals() read on-chain for every entry.
//     Ondo tokens do not rebase: splits and dividends are carried by a per-token "sValue" (shares per token).
//   Chainlink feeds (standard proxies, 8 decimals, 24h heartbeat, 0.5% deviation, US equities 24/5): Chainlink
//     reference data directory feeds-mainnet.json; every proxy read on-chain. Ethereum only has equity feeds for
//     NVDA, TSLA, GOOGL, SPY and QQQ, so only those markets can be traded; the rest are listed without options.
//   USDG: globaldollar.com (Etherscan link) + on-chain symbol/decimals; USDG/USD and ETH/USD Chainlink proxies.

type Raw = { t: string; token: string; feed?: string }

const RAW: Raw[] = [
  { t: 'NVDA', token: '0x2D1F7226Bd1F780AF6B9A49DCC0aE00E8Df4bDEE', feed: '0x2c47b8CD75C818969b398911b70C633e280552d4' },
  { t: 'TSLA', token: '0xf6b1117ec07684D3958caD8BEb1b302bfD21103f', feed: '0xB204328559E17F84eE7A285036AA0d47124F85D5' },
  { t: 'GOOGL', token: '0xbA47214eDd2bb43099611b208f75E4b42FDcfEDc', feed: '0x4720bcC6f940d709D7e2F510936e611Db07C240E' },
  { t: 'SPY', token: '0xFeDC5f4a6c38211c1338aa411018DFAf26612c08', feed: '0x25efbA0d9b115D233cfA849F16BA743E8FFba2a1' },
  { t: 'QQQ', token: '0x0e397938C1Aa0680954093495B70A9F5e2249aBa', feed: '0xA1D955b4E582C784583df7071B8a3Fb6d4bcaC42' },
  { t: 'AAPL', token: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c' },
  { t: 'AMZN', token: '0xbb8774FB97436d23d74C1b882E8E9A69322cFD31' },
  { t: 'MSFT', token: '0xB812837b81a3a6b81d7CD74CfB19A7f2784555E5' },
  { t: 'META', token: '0x59644165402b611b350645555B50Afb581C71EB2' },
  { t: 'AMD', token: '0x0C1f3412A44Ff99E40bF14e06e5Ea321aE7B3938' },
  { t: 'PLTR', token: '0x0c666485b02F7A87d21AdD7AEb9F5e64975AA490' },
  { t: 'GME', token: '0x71d24Baeb0A033ec5F90FF65C4210545AF378D97' },
  { t: 'COIN', token: '0xF042cfa86cf1D598a75Bdb55c3507a1F39f9493b' },
  { t: 'MSTR', token: '0xCabD955322dfbf94C084929ac5E9Eca3fEB5556F' },
  { t: 'INTC', token: '0xFdA09936DbD717368De0835bA441d9E62069d36f' },
  { t: 'BABA', token: '0x41765F0FCddC276309195166C7A62AE522FA09ef' },
  { t: 'NFLX', token: '0x032deC3372F25C41EA8054B4987a7c4832CDB338' },
  { t: 'SHOP', token: '0x908266C1192628371Cff7AD2F5Eba4dE061a0ac5' },
  { t: 'SNOW', token: '0x5D1a9a9B118fF19721e0111f094f2360b6Ef7A2f' },
]

const lc = (a: string) => a.toLowerCase() as Address
const meta = new Map(MARKETS.list.map((m) => [m.t, m]))

export type Market = {
  ticker: string
  /** On-chain token symbol, e.g. NVDAon */
  symbol: string
  name: string
  sector: string
  token: Address
  decimals: 18
  feed?: Address
  tradable: boolean
}

export const MARKET_LIST: Market[] = RAW.map((r) => ({
  ticker: r.t,
  symbol: `${r.t}on`,
  name: meta.get(r.t)?.n ?? r.t,
  sector: meta.get(r.t)?.s ?? 'Tech',
  token: lc(r.token),
  decimals: 18,
  feed: r.feed ? lc(r.feed) : undefined,
  tradable: !!r.feed,
}))

export const MARKET_BY_TICKER = new Map(MARKET_LIST.map((m) => [m.ticker, m]))

export const USDG = { symbol: 'USDG', name: 'Global Dollar', address: lc('0xe343167631d89B6Ffc58B88d6b7fB0228795491D'), decimals: 6 } as const
export const USDG_FEED = lc('0x14f0737d6b705259e521EA6E9E3506AC78dBd311')
export const ETH_FEED = lc('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419')

/** Ondo SyntheticSharesOracle: getSValue(token) → shares per token (1e18 = 1.0). Reverts for tokens with no
 *  corporate action recorded, which means 1 token = 1 share. */
export const ONDO_SVALUE_ORACLE = lc('0x9BC39DB6fbB44B91a48b8D5A6C208B82B1741bE6')

export const FEED_DECIMALS = 8
export const FEED_HEARTBEAT_S = 86_400
export const FEED_DEVIATION = 0.005

export const erc20Abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
])

export const sValueAbi = parseAbi(['function getSValue(address asset) view returns (uint128 sValue, bool paused)'])

export const aggregatorAbi = parseAbi([
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function getRoundData(uint80 roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
])
