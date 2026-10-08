import type { Address } from 'viem'
import { ethereumChain } from '../wallet/chain'

// How the dashboard executes actions.
//
// Until the QuiverFi contracts are deployed, every action is a real EIP-712 signature from the connected wallet
// (the same pattern as Permit2 approvals and signed intents): no gas, and no token leaves the wallet. Signed
// approvals and orders are kept per wallet in this browser (lib/ledger.ts), positions are valued on live Chainlink
// prices and settle at the oracle price at expiry.
//
// At contract launch: switch `mode` to 'onchain', add the contract address + ABI, and replace the sign calls in
// hooks/useProtocol.ts with ERC-20 approve / contract writes. The views call only that hook.
export const PROTOCOL = {
  mode: 'signature' as 'signature' | 'onchain',
  feeRate: 0.005,
  /** Binary payout per unit staked when right. The concept sets it "close to 2x"; the exact figure comes from the
   *  contract at launch, so the dashboard uses 2x as the upper bound. */
  binaryMaxMultiple: 2,
}

export const EIP712_DOMAIN = {
  name: 'QuiverFi',
  version: '1',
  chainId: ethereumChain.id,
} as const

export const EIP712_TYPES = {
  Approval: [
    { name: 'owner', type: 'address' },
    { name: 'asset', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
  Order: [
    { name: 'owner', type: 'address' },
    { name: 'product', type: 'string' },
    { name: 'market', type: 'address' },
    { name: 'direction', type: 'string' },
    { name: 'strike', type: 'uint256' },
    { name: 'expiry', type: 'uint256' },
    { name: 'size', type: 'uint256' },
    { name: 'premium', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
  Vault: [
    { name: 'owner', type: 'address' },
    { name: 'action', type: 'string' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
  Close: [
    { name: 'owner', type: 'address' },
    { name: 'order', type: 'string' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const

export type AssetRef = { symbol: string; address: Address; decimals: number }
