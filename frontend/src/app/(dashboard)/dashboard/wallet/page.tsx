'use client'

import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const transactions = [
  { id: 'W-001', date: '15 Jul 2026', type: 'credit', description: 'UPI Payment Received', amount: '₹5,000', balance: '₹28,500' },
  { id: 'W-002', date: '12 Jul 2026', type: 'debit', description: 'Order Payment', amount: '₹12,000', balance: '₹23,500' },
  { id: 'W-003', date: '08 Jul 2026', type: 'credit', description: 'Refund Processed', amount: '₹3,200', balance: '₹35,500' },
  { id: 'W-004', date: '01 Jul 2026', type: 'credit', description: 'Wallet Recharge', amount: '₹20,000', balance: '₹32,300' },
]

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Wallet</h1>
          <p className="text-sm text-[var(--muted)]">Manage your wallet balance and transactions</p>
        </div>
        <button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} />
          Add Money
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <WalletIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Wallet Balance</p>
            <p className="text-3xl font-bold text-blue-600">₹28,500</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map(t => (
          <div key={t.id} className="flex items-center gap-4 rounded-2xl border bg-white/80 p-4 transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {t.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--dark-text)]">{t.description}</p>
              <p className="text-xs text-[var(--muted)]">{t.date}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                {t.type === 'credit' ? '+' : '-'}{t.amount}
              </p>
              <p className="text-xs text-[var(--muted)]">Bal: {t.balance}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
