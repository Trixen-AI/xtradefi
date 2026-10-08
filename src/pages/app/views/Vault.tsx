import { useState } from 'react'
import { USDG } from '../data/tokens'
import { PROTOCOL } from '../data/protocol'
import { useOracles, useWalletBalances } from '../hooks/chainData'
import { useWallet } from '../hooks/useWallet'
import { actionError, useProtocol } from '../hooks/useProtocol'
import { lockedBySymbol, useLedger, vaultBalance } from '../lib/ledger'
import { fmtNum, fmtPct, fmtUsd, shortAddr } from '../lib/format'
import { fmtNyTime } from '../lib/time'
import { hasProjectId } from '../wallet/appkit'
import { ConnectCta, SwitchChainButton } from '../components/wallet'
import { Empty, Panel, Stat } from '../components/ui'
import { AddTokenButton } from '../components/AddToken'

const STEPS = [
  ['Deposit USDG', 'Your deposit joins the vault pool and is represented by a vault share.'],
  ['The vault writes covered calls', 'Each cycle the vault sells covered calls and collects USDG premium.'],
  ['Premium compounds', 'Premium goes back into the pool, so your share grows without you managing positions.'],
  ['Withdraw', 'Redeem your share for your part of the pool at that time.'],
]

const USDG_REF = { symbol: USDG.symbol, address: USDG.address, decimals: USDG.decimals }

export default function Vault() {
  const { address, isConnected, wrongChain } = useWallet()
  const { quotes } = useOracles()
  const { balances } = useWalletBalances(address)
  const book = useLedger(address)
  const protocol = useProtocol()
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState<'approve' | 'submit' | null>(null)
  const [msg, setMsg] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null)

  const inVault = vaultBalance(book)
  const locked = lockedBySymbol(book).get('USDG') ?? 0
  const walletFree = Math.max(0, (balances.get('USDG')?.amount ?? 0) - locked)
  const usdgPrice = quotes.get('USDG')?.price
  const available = mode === 'deposit' ? walletFree : inVault
  const amount = Number(input) || 0
  const enough = amount <= available + 1e-9
  const allowance = book.approvals.USDG?.amount ?? 0
  const needsApproval = mode === 'deposit' && allowance + 1e-9 < amount

  const run = async (kind: 'approve' | 'submit') => {
    setMsg(null)
    setBusy(kind)
    try {
      if (kind === 'approve') {
        await protocol.approve(USDG_REF, amount)
        setMsg({ tone: 'ok', text: 'USDG approved. Now confirm the deposit.' })
      } else {
        await protocol.vault(mode, amount, USDG_REF)
        setInput('')
        setMsg({ tone: 'ok', text: mode === 'deposit' ? `Deposited ${fmtNum(amount, 2)} USDG.` : `Withdrew ${fmtNum(amount, 2)} USDG.` })
      }
    } catch (e) {
      setMsg({ tone: 'err', text: actionError(e) })
    } finally {
      setBusy(null)
    }
  }

  const action = (() => {
    if (!hasProjectId) return <button className="dbtn dbtn--block" disabled type="button">Wallet setup needed</button>
    if (!isConnected) return <ConnectCta className="dbtn--block" label="Connect wallet to continue" />
    if (wrongChain) return <SwitchChainButton className="dbtn--block" />
    if (mode === 'withdraw' && inVault <= 0) return <button className="dbtn dbtn--block" disabled type="button">Nothing to withdraw</button>
    if (amount <= 0) return <button className="dbtn dbtn--block" disabled type="button">Enter an amount</button>
    if (!enough) return <button className="dbtn dbtn--block" disabled type="button">{mode === 'deposit' ? 'Not enough USDG' : 'More than your vault balance'}</button>
    return (
      <div className="dflow">
        {mode === 'deposit' ? (
          <ol className="dflow__steps" aria-label="Steps">
            <li className={needsApproval ? 'is-current' : 'is-done'}>
              <span>{needsApproval ? '1' : '✓'}</span> Approve USDG
            </li>
            <li className={needsApproval ? '' : 'is-current'}>
              <span>2</span> Deposit
            </li>
          </ol>
        ) : null}
        {needsApproval ? (
          <button type="button" className="dbtn dbtn--primary dbtn--block" disabled={busy !== null} onClick={() => run('approve')}>
            {busy === 'approve' ? 'Confirm in your wallet…' : `Approve ${fmtNum(amount, 2)} USDG`}
          </button>
        ) : (
          <button type="button" className="dbtn dbtn--primary dbtn--block" disabled={busy !== null} onClick={() => run('submit')}>
            {busy === 'submit' ? 'Confirm in your wallet…' : mode === 'deposit' ? `Deposit ${fmtNum(amount, 2)} USDG` : `Withdraw ${fmtNum(amount, 2)} USDG`}
          </button>
        )}
      </div>
    )
  })()

  return (
    <div className="dview">
      <header className="dview__head">
        <div>
          <p className="dview__pre">Vault</p>
          <h1 className="dview__title">Yield vault</h1>
          <p className="dview__sub">Deposit USDG and let the vault write covered calls on your behalf. Compounding yield, no active management.</p>
        </div>
      </header>

      <div className="dstats">
        <Stat label="Your USDG" value={isConnected ? fmtNum(walletFree, 2) : '–'} sub={usdgPrice ? `Free to use · oracle ${fmtUsd(usdgPrice)}` : 'Global Dollar on Ethereum'} />
        <Stat label="In the vault" value={isConnected ? fmtUsd(inVault * (usdgPrice ?? 1)) : '–'} sub={`${fmtNum(inVault, 2)} USDG deposited`} />
        <Stat label="Strategy" value="Covered calls" sub="Premium is reinvested each cycle" />
        <Stat label="Protocol fee" value={fmtPct(PROTOCOL.feeRate, 1)} sub="Per trade" />
      </div>

      <div className="dtrade">
        <Panel title="Deposit or withdraw" className="dtrade__form">
          <div className="dseg" role="tablist" aria-label="Vault action">
            {(['deposit', 'withdraw'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={mode === m ? 'is-on' : ''}
                onClick={() => {
                  setMode(m)
                  setInput('')
                  setMsg(null)
                }}
              >
                {m === 'deposit' ? 'Deposit' : 'Withdraw'}
              </button>
            ))}
          </div>
          <div className="dfield">
            <label htmlFor="v-amount">Amount (USDG)</label>
            <div className="dinput-wrap">
              <input id="v-amount" className="dinput" inputMode="decimal" placeholder="0.00" value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="button" className="dinput-max" disabled={!isConnected || available <= 0} onClick={() => setInput(String(Math.floor(available * 100) / 100))}>
                Max
              </button>
            </div>
            <div className="dfield__meta">{isConnected ? `Available: ${fmtNum(available, 2)} ${mode === 'deposit' ? 'USDG' : 'USDG in the vault'}` : 'Connect a wallet to see your balance'}</div>
          </div>
          {action}
          {msg ? (
            <p className={`dmsg is-${msg.tone}`} role={msg.tone === 'err' ? 'alert' : 'status'}>
              {msg.text}
            </p>
          ) : null}
          {isConnected ? (
            <div className="dfield__row dfield__row--end">
              <AddTokenButton address={USDG.address} symbol="USDG" decimals={USDG.decimals} />
            </div>
          ) : null}
        </Panel>

        <div className="dtrade__side">
          <Panel title="Your vault activity" pad={book.vault.length > 0}>
            {book.vault.length ? (
              <ul className="dact">
                {book.vault.map((v) => (
                  <li key={v.id}>
                    <span className={`dact__kind is-${v.action}`}>{v.action === 'deposit' ? 'Deposit' : 'Withdraw'}</span>
                    <span className="dact__amt">
                      {v.action === 'deposit' ? '+' : '−'}
                      {fmtNum(v.amount, 2)} USDG
                    </span>
                    <span className="dact__meta">
                      {fmtNyTime(new Date(v.at * 1000))} · {shortAddr(v.signature)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="No vault activity yet">Your deposits and withdrawals show up here.</Empty>
            )}
          </Panel>
          <Panel title="How the vault works">
            <ol className="dsteps">
              {STEPS.map(([t, b], i) => (
                <li key={t}>
                  <span className="dsteps__n">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <b>{t}</b>
                    <p>{b}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="dfine">
              Vault yield is not guaranteed and the pool can be worth less than you deposited. Read the <a href="/docs/yield-vault">vault docs</a> and <a href="/docs/risks">risks</a>.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
