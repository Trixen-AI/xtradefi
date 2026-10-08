# QuiverFi

On-chain options on tokenized stocks: covered calls, cash-secured puts, binary options and a covered-call yield vault on Ethereum, settled at the Chainlink oracle price.

- Website: `/` (landing page)
- Docs: `/docs`
- App: `/app` (wallet dashboard, Reown AppKit + wagmi)

Production domain: **https://quiverfi.org**

## Stack

React 19 · Vite 8 · TypeScript · React Router 7 · GSAP + Lenis · Three.js (landing 3D stage) · Reown AppKit 1.8 + wagmi 2 + viem (dashboard only, lazy-loaded).

## Run locally

Requires Node 22.12 or newer.

```bash
npm install
cp .env.example .env   # then fill in VITE_REOWN_PROJECT_ID
npm run dev
```

Other scripts:

| Script | What it does |
|---|---|
| `npm run build` | Type-checks and builds to `dist/` (generates `public/sitemap.xml` first) |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | oxlint |
| `npm run brand` | Rebuilds the logo, favicon, OG image and app icons from `scripts/` |

## Environment variables

`VITE_*` variables are embedded into the client bundle **at build time**. After changing one on Vercel, redeploy.

| Variable | Required | Value |
|---|---|---|
| `VITE_REOWN_PROJECT_ID` | Yes | Project ID from https://dashboard.reown.com. Without it the app still shows live market data, but wallets cannot connect. |
| `VITE_RPC_URL` | No | A dedicated Ethereum mainnet RPC (Alchemy, Infura, QuickNode, dRPC…). Defaults to the public `https://ethereum-rpc.publicnode.com`, which is rate-limited. Recommended for production traffic. |

None of these are secrets in the usual sense (they ship to the browser), but keep `.env` out of git anyway.

## Deploy to Vercel

1. Import the GitHub repository in Vercel. `vercel.json` sets the framework (Vite), install/build commands and the `dist` output.
2. **Settings → Environment Variables**: add `VITE_REOWN_PROJECT_ID` (and optionally `VITE_RPC_URL`) for **Production** and **Preview**.
3. **Settings → Domains**: add `quiverfi.org` and `www.quiverfi.org`. `vercel.json` already redirects `www` to the apex domain.
4. **Reown dashboard** (dashboard.reown.com → your project):
   - Add `https://quiverfi.org` and `https://www.quiverfi.org` to the allowed domains (and your `*.vercel.app` preview domain if you test previews).
   - Turn off Email / Social login, Swaps and On-ramp. The dashboard settings override the app's local config.
5. Deploy. Routes like `/docs/fees` and `/app/trade` are served by the SPA fallback in `vercel.json`.

## SEO

- `index.html`: title, description, canonical, Open Graph + X card (`/og-image.png`, 1200×630), JSON-LD (Organization, WebSite, WebApplication).
- Per-route tags (docs pages, the app) are set at runtime by `src/lib/seo.ts`.
- `public/robots.txt` allows the site and docs and keeps `/app` out of the index; `public/sitemap.xml` is regenerated on every build from the docs pages.

## Protocol status

The option, vault and settlement contracts are not deployed yet. Until they are, every dashboard action is a real EIP-712 signature from the user's wallet (no gas, no funds moved), recorded per wallet in the browser (`src/pages/app/lib/ledger.ts`). At launch, switch `src/pages/app/hooks/useProtocol.ts` to ERC-20 `approve` and contract writes; the views only call that hook.

## Project layout

```
src/
  components/      landing page (layout, sections, 3D stage, brand, ui)
  pages/Home.tsx   landing route
  pages/docs/      documentation
  pages/app/       dashboard (wallet, data hooks, views)
  data/site.ts     landing copy and market list
  config/network.ts Ethereum network parameters
scripts/           logo, social images, sitemap
public/            static assets, brand exports, robots, manifest
```

Names and logos of third-party projects (Chainlink, Ethereum, Ondo Global Markets, USDC) identify the services QuiverFi uses; QuiverFi is not affiliated with them.
