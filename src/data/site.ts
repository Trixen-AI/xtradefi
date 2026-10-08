// All page copy and lists in one place. Written for QuiverFi; no em dashes anywhere in this file.

export const LINKS = {
  app: '/app',
  docs: '/docs',
  terms: '#terms',
  privacy: '#privacy',
  x: 'https://x.com/QuiverFi_',
}

export type NavItem = { label: string; href: string; menu?: { title: string; links: { label: string; href: string; muted?: boolean }[]; cta: string }[] }

const productLinks = [
  { label: 'Covered Calls', href: '#products' },
  { label: 'Cash-Secured Puts', href: '#products' },
  { label: 'Binary Options', href: '#products' },
  { label: 'Yield Vault', href: '#products' },
]

export const NAV: NavItem[] = [
  {
    label: 'Products',
    href: '#products',
    menu: [
      { title: 'Write options', links: productLinks.slice(0, 2), cta: 'Open the app' },
      { title: 'Take a view', links: [productLinks[2], { label: 'Pick a strike', href: '#how-it-works' }, { label: 'Pick an expiry', href: '#how-it-works' }], cta: 'How it works' },
      { title: 'Earn passively', links: [productLinks[3], { label: 'Auto-written calls', href: '#products' }, { label: 'Compounding premium', href: '#products', muted: true }], cta: 'Vault docs' },
      { title: 'Settlement', links: [{ label: 'Chainlink price feeds', href: '#settlement' }, { label: 'Auto-settlement at expiry', href: '#settlement' }, { label: 'Protocol info', href: '#fees' }], cta: 'Read the docs' },
    ],
  },
  {
    label: 'Markets',
    href: '#markets',
    menu: [
      { title: 'Stocks', links: [{ label: 'NVDA · NVIDIA', href: '#markets' }, { label: 'TSLA · Tesla', href: '#markets' }, { label: 'GOOGL · Alphabet', href: '#markets' }], cta: 'All stocks' },
      { title: 'Index ETFs', links: [{ label: 'SPY · S&P 500 ETF', href: '#markets' }, { label: 'QQQ · QQQ ETF', href: '#markets' }], cta: 'All ETFs' },
      { title: 'Coming next', links: [{ label: 'AAPL · Apple', href: '#markets', muted: true }, { label: 'MSFT · Microsoft', href: '#markets', muted: true }, { label: 'AMZN · Amazon', href: '#markets', muted: true }, { label: 'META · Meta', href: '#markets', muted: true }], cta: 'Listed tokens' },
      { title: 'Feed details', links: [{ label: '24/5 trading', href: '#markets' }, { label: 'Chainlink on Ethereum', href: '#markets' }, { label: 'More markets soon', href: '#markets', muted: true }], cta: 'Browse markets' },
    ],
  },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Docs', href: LINKS.docs },
]

export const PRODUCT_TILES = [
  { name: 'Calls', sub: 'Covered calls', href: '#products', tone: 'call' },
  { name: 'Puts', sub: 'Cash-secured puts', href: '#products', tone: 'put' },
  { name: 'Binary', sub: 'Up or down bets', href: '#products', tone: 'mix' },
  { name: 'Vault', sub: 'Auto-written yield', href: '#products', tone: 'call' },
  { name: 'Markets', sub: '5 tokenized markets', href: '#markets', tone: 'mix' },
  { name: 'Docs', sub: 'Protocol reference', href: LINKS.docs, tone: 'put' },
] as const

export const SECTIONS = [
  { id: 'intro', label: 'Intro' },
  { id: 'overview', label: 'Overview' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'products', label: 'Products' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'fees', label: 'Fees' },
  { id: 'settlement', label: 'Settlement' },
  { id: 'guides', label: 'Guides' },
  { id: 'markets', label: 'Markets' },
  { id: 'faq', label: 'F.A.Q' },
  { id: 'start', label: 'Start' },
]

/* Hero: each order cycles through the prompt list, the status box and the four rows on the right. */
export const HERO_ORDERS = [
  { prompt: 'Sell a 7-day covered call on my NVDA tokens', status: 'Writing on…', tool: 'Covered call', rows: ['Collateral: NVDA tokens', 'Premium paid in USDC', 'Custom strike', 'Settles at expiry'] },
  { prompt: 'Write a cash-secured put on TSLA at my strike', status: 'Locking…', tool: 'Cash-secured put', rows: ['Collateral: USDC', 'Premium paid upfront', 'Buy the dip at strike', 'Oracle-priced expiry'] },
  { prompt: 'Bet GOOGL closes above today’s price by Friday', status: 'Opening…', tool: 'Binary option', rows: ['Pick up or down', 'Near 2x payout', 'Fixed stake', 'Paid out on-chain'] },
  { prompt: 'Put my idle USDC to work on autopilot', status: 'Depositing…', tool: 'Yield vault', rows: ['Auto-written calls', 'Compounding premium', 'No active management', 'Withdraw any time'] },
  { prompt: 'Settle my QQQ position at the oracle price', status: 'Settling via…', tool: 'Chainlink oracle', rows: ['Price pulled on-chain', 'Same-call settlement', 'Instant payout', 'No manual steps'] },
]

export const HERO = {
  pre: 'Meet QuiverFi',
  top: 'On-chain',
  bottom: 'Options',
  side: 'Covered calls, cash-secured puts and binary bets on tokenized NVDA, TSLA, GOOGL, SPY and QQQ.',
  scroll: 'Scroll',
}

export const TRACK = {
  items: [
    'Covered calls',
    'Cash-secured puts',
    'Binary options',
    'Yield vault',
    'Chainlink settlement',
    'One USDC balance',
    'Custom strikes',
    '24/5 markets',
    'No KYC',
  ],
  headTop: 'Global stocks.',
  headBottom: 'Tokenized.',
  side: 'Options, on-chain. For holders, yield hunters and directional traders.',
}

export const HIGHLIGHTS = {
  label: 'Built for',
  items: [
    { big: '5', title: 'Tokenized markets', sub: 'NVDA, TSLA, GOOGL, SPY, QQQ', icon: 'grid' },
    { big: '4', title: 'Product types', sub: 'Calls, puts, binaries, vault', icon: 'stack' },
    { big: '0.5%', title: 'Protocol fee', sub: 'Per trade, nothing hidden', icon: 'fee' },
    { big: '30s', title: 'Price updates', sub: 'Chainlink feeds, 24/5', icon: 'pulse' },
    { big: '0', title: 'KYC forms', sub: 'Your wallet is the account', icon: 'key' },
    { big: '1', title: 'Stablecoin balance', sub: 'Margin across every market', icon: 'coin' },
  ],
}

export type Product = { kind: 'call' | 'put' | 'binary' | 'vault'; title: string[]; body: string; feats: string[]; ctas: { label: string; href: string }[] }

export const PRODUCTS: { title: string; items: Product[] } = {
  title: 'Four ways to trade',
  items: [
    {
      kind: 'call',
      title: ['Covered', 'Calls'],
      body: 'Lock the stock tokens you already hold and sell call options against them. The USDC premium lands in your wallet upfront, whatever the stock does next.',
      feats: ['Earn premium', 'Yield strategy', 'Stock tokens as collateral', 'Choose strike and expiry', 'Paid in USDC upfront'],
      ctas: [{ label: 'Write a covered call', href: LINKS.app }],
    },
    {
      kind: 'put',
      title: ['Cash-Secured', 'Puts'],
      body: 'Lock USDC and sell a put. You keep the premium now, and if the stock falls to your strike by expiry you buy it at the price you picked.',
      feats: ['Buy the dip', 'Earn income', 'USDC as collateral', 'Strike you choose', 'Premium paid upfront'],
      ctas: [{ label: 'Sell a put', href: LINKS.app }],
    },
    {
      kind: 'binary',
      title: ['Binary', 'Options'],
      body: 'A plain directional call: up or down. Be right at expiry and collect close to 2x your stake. Be wrong and the stake is all you lose.',
      feats: ['Up or down', 'Near 2x payout', 'Fixed, known risk', 'Oracle-priced expiry', 'Paid out on-chain'],
      ctas: [{ label: 'Place a binary bet', href: LINKS.app }],
    },
    {
      kind: 'vault',
      title: ['Yield', 'Vault'],
      body: 'Deposit USDC and the vault writes covered calls for you, rolling premium back in each cycle. Compounding yield without watching a chart.',
      feats: ['Automated', 'Compounding', 'Covered calls on autopilot', 'No active management', 'Deposit USDC once'],
      ctas: [{ label: 'Deposit to the vault', href: LINKS.app }],
    },
  ],
}

export const STEPS = {
  headTop: 'How it',
  headBoxed: 'works',
  tabs: ['Three steps', 'Read the docs'],
  more: 'From wallet to position',
  items: [
    { n: '01', title: 'Connect your wallet', body: 'Any EVM wallet works. No account to create, no email, no KYC. Connect and you are in.', chips: ['EVM wallet', 'No email', 'No sign-up'], art: 'wallet' },
    { n: '02', title: 'Pick a product and market', body: 'Covered call, put, binary or vault. Then a stock, a strike and an expiry. One stablecoin balance covers margin everywhere.', chips: ['5 markets', 'Custom strikes', 'One balance'], art: 'pick' },
    { n: '03', title: 'Settle on the oracle price', body: 'At expiry, Chainlink delivers the final price on-chain and the contract settles every position automatically.', chips: ['Chainlink oracles', 'Auto-settlement', 'Trustless'], art: 'settle' },
  ],
}

export const LAYERS = {
  headTop: 'Inside the',
  headBoxed: 'Protocol',
  side: 'What happens between your click and your payout, one layer at a time.',
  items: [
    { n: '01', title: 'Wallet Layer', nodes: ['EVM wallet', 'One-click connect', 'No KYC', 'Sign once'], center: 'wallet', chips: ['USDC deposit', 'Stock tokens'] },
    { n: '02', title: 'Product Layer', nodes: ['Covered calls', 'Cash-secured puts', 'Binary options', 'Yield vault'], center: 'x', chips: ['Strike', 'Expiry', 'Size'] },
    { n: '03', title: 'Margin Layer', nodes: ['One USDC balance', 'Collateral lock', 'Cross-market margin', 'Fee 0.5%'], center: 'coin', chips: ['Locked', 'Free'] },
    { n: '04', title: 'Settlement Layer', nodes: ['Chainlink feed', 'Expiry check', 'Auto-settle', 'Payout'], center: 'oracle', chips: ['30s updates', 'Same-call payout'] },
  ],
}

export const FEES = {
  headTop: 'What it',
  headBoxed: 'costs',
  side: 'One flat protocol fee per trade. Collateral stays in the contract and returns to you at expiry.',
  note: 'Protocol fee: 0.5% per trade',
  toggle: ['Show protocol info', 'Show product fees'],
  products: [
    { name: 'Covered Calls', icon: 'call', rows: [['Protocol fee', '0.5%'], ['Collateral', 'Stock tokens']] },
    { name: 'Cash-Secured Puts', icon: 'put', rows: [['Protocol fee', '0.5%'], ['Collateral', 'USDC']] },
    { name: 'Binary Options', icon: 'binary', rows: [['Protocol fee', '0.5%'], ['Max payout', 'Near 2x']] },
    { name: 'Yield Vault', icon: 'vault', rows: [['Protocol fee', '0.5%'], ['Deposit', 'USDC']] },
  ],
  info: [
    { name: 'Network', icon: 'network', rows: [['Chain', 'Ethereum'], ['Chain ID', '1']] },
    { name: 'Oracle', icon: 'oracle', rows: [['Provider', 'Chainlink'], ['Price update', '30 seconds']] },
    { name: 'Settlement', icon: 'settle', rows: [['Mode', 'Automated · on-chain'], ['Payout', 'Same call']] },
  ],
  cta: 'Open the protocol docs',
}

export const SETTLE = {
  head: 'Settled',
  body: 'Nobody can move an expiry price. Chainlink delivers it on-chain and the contract settles in the same transaction.',
  featsTitle: 'At every expiry',
  feats: ['Feeds update every 30s', 'Deviation triggers', 'Price pulled at expiry', 'Settled in the same call', 'Payout sent instantly', 'No manual step'],
  pricedBy: 'Priced by:',
  runsOn: 'Markets:',
  marquee: ['NVDA', 'TSLA', 'GOOGL', 'SPY', 'QQQ', 'NVDA', 'TSLA', 'GOOGL', 'SPY', 'QQQ'],
}

export const GUIDES = {
  headTop: 'Learn the',
  tabs: ['basics', 'strategies', 'risk'] as const,
  more: 'Plain-language guides',
  cta: 'All guides',
  items: {
    basics: [
      { tag: 'Basics', time: '4 min read', title: 'What an on-chain option is, and what it is not', art: 'a' },
      { tag: 'Basics', time: '3 min read', title: 'Strike, expiry and premium in one picture', art: 'b' },
      { tag: 'Basics', time: '5 min read', title: 'Tokenized stocks: what you actually hold', art: 'c' },
      { tag: 'Basics', time: '2 min read', title: 'Connecting a wallet on Ethereum', art: 'd' },
    ],
    strategies: [
      { tag: 'Strategy', time: '6 min read', title: 'Covered calls on stock tokens you already own', art: 'b' },
      { tag: 'Strategy', time: '5 min read', title: 'Using puts to set the price you want to buy at', art: 'c' },
      { tag: 'Strategy', time: '4 min read', title: 'When a binary bet fits better than an option', art: 'a' },
      { tag: 'Strategy', time: '3 min read', title: 'Letting the vault write calls for you', art: 'd' },
    ],
    risk: [
      { tag: 'Risk', time: '4 min read', title: 'How much can you lose on each product', art: 'c' },
      { tag: 'Risk', time: '3 min read', title: 'How Chainlink settles an expiry, step by step', art: 'd' },
      { tag: 'Risk', time: '5 min read', title: 'Collateral, locks and what happens at expiry', art: 'a' },
      { tag: 'Risk', time: '2 min read', title: 'Checking a contract before you sign', art: 'b' },
    ],
  },
  by: 'QuiverFi docs',
}

/** o: options available (the stock token has a Chainlink feed on Ethereum). Tokens without a feed are
 *  listed for the dashboard and docs but not offered on the landing page. */
export type Market = { t: string; n: string; s: 'Tech' | 'Fintech' | 'ETF' | 'Consumer'; o: boolean }
export const MARKETS = {
  headBoxed: '5',
  headTop: 'markets.',
  headBottom: 'One balance.',
  side: 'Options on the most liquid tokenized stocks, priced by Chainlink with 30-second updates, 24/5.',
  filters: ['All', 'Tech', 'Fintech', 'ETF', 'Consumer'] as const,
  list: [
    { t: 'NVDA', n: 'NVIDIA', s: 'Tech', o: true },
    { t: 'TSLA', n: 'Tesla', s: 'Consumer', o: true },
    { t: 'GOOGL', n: 'Alphabet', s: 'Tech', o: true },
    { t: 'SPY', n: 'S&P 500 ETF', s: 'ETF', o: true },
    { t: 'QQQ', n: 'QQQ ETF', s: 'ETF', o: true },
    { t: 'AAPL', n: 'Apple', s: 'Tech', o: false },
    { t: 'AMZN', n: 'Amazon', s: 'Consumer', o: false },
    { t: 'MSFT', n: 'Microsoft', s: 'Tech', o: false },
    { t: 'META', n: 'Meta', s: 'Tech', o: false },
    { t: 'AMD', n: 'AMD', s: 'Tech', o: false },
    { t: 'PLTR', n: 'Palantir', s: 'Tech', o: false },
    { t: 'GME', n: 'GameStop', s: 'Consumer', o: false },
    { t: 'COIN', n: 'Coinbase', s: 'Fintech', o: false },
    { t: 'MSTR', n: 'MicroStrategy', s: 'Fintech', o: false },
    { t: 'INTC', n: 'Intel', s: 'Tech', o: false },
    { t: 'BABA', n: 'Alibaba', s: 'Consumer', o: false },
    { t: 'NFLX', n: 'Netflix', s: 'Consumer', o: false },
    { t: 'SHOP', n: 'Shopify', s: 'Consumer', o: false },
    { t: 'SNOW', n: 'Snowflake', s: 'Tech', o: false },
  ] as Market[],
  groups: [
    { label: 'Trading hours', count: '24/5' },
    { label: 'Price updates', count: '30s' },
  ],
  stackTitle: 'The settlement stack',
  stackCount: '(3)',
  stackCta: 'Protocol info',
}

export const FAQ = {
  headTop: 'Questions,',
  headBoxed: 'answered',
  side: ['Still unsure about something?', 'Ask us on X at '],
  tabs: ['The basics', 'Settlement', 'Risk'],
  items: [
    [
      { q: 'What is an on-chain option?', a: 'An option is a contract that gives the buyer the right, but not the obligation, to buy or sell an asset at a set price before a set date. On QuiverFi the whole lifecycle runs in smart contracts: creation, margin, expiry and settlement. No counterparty can default and nobody can freeze your funds.' },
      { q: 'What do I need to start?', a: 'An EVM wallet on Ethereum and some USDC. To write covered calls you also need the stock tokens you want to write against. There is no sign-up and no KYC.' },
      { q: 'Do I own the underlying stocks?', a: 'You hold tokenized stocks: tokens that track the price of the listed share. QuiverFi lets you write and buy options on those tokens. It does not give you shareholder rights in the company itself.' },
    ],
    [
      { q: 'How does settlement work?', a: 'Chainlink price feeds update every 30 seconds, with deviation triggers in between. At expiry the oracle price is pulled on-chain and every position in that market settles in the same call. Payouts are calculated and sent immediately, with no manual step.' },
      { q: 'What is the Yield Vault?', a: 'A pool that writes covered calls for you. You deposit USDC, the vault sells calls each cycle and rolls the premium back in, so yield compounds without you managing positions.' },
      { q: 'Which network does QuiverFi run on?', a: 'Ethereum mainnet, chain ID 1. The main contract address will be published in the docs at launch.' },
    ],
    [
      { q: 'Can I lose more than I deposit?', a: 'No. Every position is fully collateralized when it opens: stock tokens for covered calls, USDC for puts and binaries. The most you can lose is the collateral or stake you locked.' },
      { q: 'What does it cost?', a: 'A 0.5% protocol fee per trade. Premiums, payouts and collateral move between wallets and the contract; there is no subscription and no withdrawal fee.' },
      { q: 'Is QuiverFi affiliated with the stocks it lists?', a: 'No. Tickers and company names identify the tokenized assets. QuiverFi is an independent protocol and is not affiliated with or endorsed by those companies.' },
    ],
  ],
}

export const CTA = {
  pre: 'Trade options on',
  wordA: 'Global',
  wordB: 'Stocks',
  stackLabel: 'Settles with:',
  stack: [
    { key: 'chainlink', name: 'Chainlink', handle: 'Oracle provider', body: 'Price feeds update every 30 seconds and set the final price at every expiry.' },
    { key: 'ethereum', name: 'Ethereum', handle: 'Network · Mainnet', body: 'Every position, lock and payout lives on Ethereum mainnet.' },
    { key: 'usdc', name: 'USDC', handle: 'Collateral & premium', body: 'One stablecoin balance covers margin and receives premium across all markets.' },
    { key: 'wallet', name: 'EVM wallet', handle: 'Wallet', body: 'Connect any EVM wallet. No account, no email, no KYC.' },
  ],
}

/* Community links. X is the only channel for now; add more entries here (key, label, href) when they exist. */
export const SOCIALS = [{ key: 'x', label: 'X', href: LINKS.x, pre: 'Follow on', handle: '@QuiverFi_' }]

export const FOOTER = {
  subscribe: 'Get launch updates*',
  subNote: '*Launch news and new markets only.',
  placeholder: 'Your e-mail',
  button: 'Notify me',
  cols: [
    { title: 'Products', links: [['Covered Calls', '#products'], ['Cash-Secured Puts', '#products'], ['Binary Options', '#products'], ['Yield Vault', '#products'], ['Launch App', LINKS.app]] },
    { title: 'Protocol', links: [['Markets', '#markets'], ['How it works', '#how-it-works'], ['Settlement', '#settlement'], ['Fees', '#fees'], ['Docs', LINKS.docs], ['FAQ', '#faq']] },
    { title: 'Legal', links: [['Terms', LINKS.terms], ['Privacy', LINKS.privacy], ['Risk disclosure', '/docs/risks']] },
  ],
  badge: ['Network', 'Ethereum Mainnet'],
  copy: 'QuiverFi · On-chain options on tokenized stocks',
  risk: 'Options carry risk. Tokenized stocks track share prices and do not grant shareholder rights.',
}
