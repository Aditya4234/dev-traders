'use client'

import { BookOpen, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const entries = [
  { id: 'CL-001', date: '15 Jul 2026', type: 'credit', description: 'INV-2026-001 Payment', amount: '₹24,500', balance: '₹1,24,500' },
  { id: 'CL-002', date: '12 Jul 2026', type: 'debit', description: 'ORD-008 Purchase', amount: '₹10,000', balance: '₹1,00,000' },
  { id: 'CL-003', date: '10 Jul 2026', type: 'credit', description: 'INV-2026-002 Payment', amount: '₹18,200', balance: '₹1,10,000' },
  { id: 'CL-004', date: '05 Jul 2026', type: 'debit', description: 'ORD-005 Purchase', amount: '₹5,000', balance: '₹91,800' },
  { id: 'CL-005', date: '01 Jul 2026', type: 'credit', description: 'Opening Balance', amount: '₹86,800', balance: '₹96,800' },
]

export default function CreditLedgerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Credit Ledger</h1>
        <p className="text-sm text-[var(--muted)]">Track all credit transactions and balances</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Current Balance</p>
            <p className="text-3xl font-bold text-purple-600">₹1,24,500</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">ID</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Date</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Description</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Amount</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
                <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{e.id}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{e.date}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{e.description}</td>
                <td className="px-6 py-4">
                  <div className={`flex items-center gap-1 font-semibold ${e.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {e.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                    {e.amount}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{e.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
