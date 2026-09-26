import { parseAbi, type Address } from 'viem'
import { MARKETS } from '@/data/site'

// Robinhood Chain mainnet addresses. Sources, verified 2026-09-26:
//   stock tokens: api.robinhood.com/rhj/assets (official registry behind docs.robinhood.com/chain), symbol() and
//     decimals() read on-chain for every entry
//   USDG: docs.robinhood.com/chain/contracts + docs.paxos.com (Robinhood Mainnet), read on-chain
//   Chainlink feeds (standard proxies, 8 decimals, 24h heartbeat, 0.5% deviation): Chainlink reference data
//     directory feeds-robinhood-mainnet.json; the major ones read on-chain
// Stock feed prices already include the token's ERC-8056 uiMultiplier.
// Only markets that exist on-chain are listed. Markets without a Chainlink feed are shown but cannot be traded.

type Raw = { t: string; token: string; feed?: string }

const RAW: Raw[] = [
  { t: 'NVDA', token: '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', feed: '0x379EC4f7C378F34a1B47E4F3cbeBCbAC3E8E9F15' },
  { t: 'AAPL', token: '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', feed: '0x6B22A786bAa607d76728168703a39Ea9C99f2cD0' },
  { t: 'TSLA', token: '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', feed: '0x4A1166a659A55625345e9515b32adECea5547C38' },
  { t: 'AMZN', token: '0x12f190a9F9d7D37a250758b26824B97CE941bF54', feed: '0xD5a1508ceD74c084eBf3cBe853e2C968fB2a651C' },
  { t: 'MSFT', token: '0xe93237C50D904957Cf27E7B1133b510C669c2e74', feed: '0x45C3C877C15E6BA2EBB19eA114Ea508d14C1Af2E' },
  { t: 'GOOGL', token: '0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3', feed: '0xF6f373a037c30F0e5010d854385cA89185AE638b' },
  { t: 'META', token: '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', feed: '0x7C38C00C30BEe9378381E7B6135d7283356D71b1' },
  { t: 'AMD', token: '0x86923f96303D656E4aa86D9d42D1e57ad2023fdC', feed: '0x943A29E7ae51A4798823ca9eEd2ed533B2A22C72' },
  { t: 'PLTR', token: '0x894E1EC2D74FFE5AEF8Dc8A9e84686acCB964F2A', feed: '0x820ABedFF239034956B7A9d2F0a331f9F075eB4c' },
  { t: 'GME', token: '0x1b0E319c6A659F002271B69dB8A7df2F911c153E', feed: '0x27C71df6A64fB476468EdF256CF72c038baB5B67' },
  { t: 'QQQ', token: '0xD5f3879160bc7c32ebb4dC785F8a4F505888de68', feed: '0x80901d846d5D7B030F26B480776EE3b29374C2ae' },
  { t: 'SPY', token: '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', feed: '0x319724394D3A0e3669269846abE664Cd621f9f6A' },
  { t: 'COIN', token: '0x6330D8C3178a418788dF01a47479c0ce7CCF450b', feed: '0xA3a468A452940B7D6b69991207B508c609a98Ef2' },
  { t: 'MSTR', token: '0xec262a75e413fAfD0dF80480274532C79D42da09', feed: '0x396118bdFB181e6240E74D243F266B061c0edc3D' },
  { t: 'INTC', token: '0xc72b96e0E48ecd4DC75E1e45396e26300BC39681', feed: '0x3f390C5C24628Ac7C489515402235FeAD71D1913' },
  { t: 'BABA', token: '0xad25Ac6C84D497db898fa1E8387bf6Af3532a1c4', feed: '0x62Cc8F9b5f56a33c9C8A60c8B92779f523c4E984' },
  { t: 'NFLX', token: '0xE0444EF8BF4eD74f74FD73686e2ddF4C1c5591E8' },
  { t: 'SHOP', token: '0xF53F66751B1Eff985311b693531E3290F600c410' },
  { t: 'SNOW', token: '0xBa0CAB75495255d0cB58E22B648bFED4ECD1F47E' },
  { t: 'RBLX', token: '0xF0C4BF4C582cb3836e98394b1d4e7B7281101bE8' },
]

const lc = (a: string) => a.toLowerCase() as Address
const meta = new Map(MARKETS.list.map((m) => [m.t, m]))

export type Market = {
  ticker: string
  name: string
  sector: string
  token: Address
  decimals: 18
  feed?: Address
  tradable: boolean
}

export const MARKET_LIST: Market[] = RAW.map((r) => ({
  ticker: r.t,
  name: meta.get(r.t)?.n ?? r.t,
  sector: meta.get(r.t)?.s ?? 'Tech',
  token: lc(r.token),
  decimals: 18,
  feed: r.feed ? lc(r.feed) : undefined,
  tradable: !!r.feed,
}))

export const MARKET_BY_TICKER = new Map(MARKET_LIST.map((m) => [m.ticker, m]))

export const USDG = { symbol: 'USDG', name: 'Global Dollar', address: lc('0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168'), decimals: 6 } as const
export const USDG_FEED = lc('0x61B7e5650328764B076A108EFF5fa7282a1B9aD2')
export const ETH_FEED = lc('0x78F3556b67E17Df817D51Ef5a990cDaF09E8d3A9')

export const FEED_DECIMALS = 8
export const FEED_HEARTBEAT_S = 86_400
export const FEED_DEVIATION = 0.005

export const erc20Abi = parseAbi([
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
])

export const stockTokenAbi = parseAbi(['function uiMultiplier() view returns (uint256)'])

export const aggregatorAbi = parseAbi([
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function getRoundData(uint80 roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
])
