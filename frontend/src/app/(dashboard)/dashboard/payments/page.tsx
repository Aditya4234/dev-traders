'use client'

import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const payments = [
  { id: 'PAY-001', date: '15 Jul 2026', amount: '₹24,500', method: 'UPI', type: 'outgoing', ref: 'INV-2026-001' },
  { id: 'PAY-002', date: '12 Jul 2026', amount: '₹10,000', method: 'Bank Transfer', type: 'incoming', ref: 'ORD-008' },
  { id: 'PAY-003', date: '10 Jul 2026', amount: '₹18,200', method: 'Credit Card', type: 'outgoing', ref: 'INV-2026-002' },
  { id: 'PAY-004', date: '05 Jul 2026', amount: '₹5,000', method: 'UPI', type: 'incoming', ref: 'ORD-005' },
]

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Payments</h1>
          <p className="text-sm text-[var(--muted)]">Track all your payment transactions</p>
        </div>
        <button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} />
          New Payment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Paid', value: '₹42,700', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending', value: '₹18,200', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'This Month', value: '₹52,700', color: 'text-[var(--primary)]', bg: 'bg-pink-50' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl border bg-white/80 p-4 transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.type === 'incoming' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
              {p.type === 'incoming' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--dark-text)]">{p.id} • {p.method}</p>
              <p className="text-xs text-[var(--muted)]">{p.date} • Ref: {p.ref}</p>
            </div>
            <p className={`text-sm font-bold ${p.type === 'incoming' ? 'text-green-600' : 'text-red-500'}`}>
              {p.type === 'incoming' ? '+' : '-'}{p.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
