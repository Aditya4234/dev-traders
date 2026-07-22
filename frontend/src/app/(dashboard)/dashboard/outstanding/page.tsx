'use client'

import { AlertCircle, Clock, IndianRupee } from 'lucide-react'

const outstanding = [
  { id: 'INV-2026-002', amount: '₹18,200', dueDate: '25 Jul 2026', daysLeft: 3, status: 'Due Soon' },
  { id: 'INV-2026-004', amount: '₹11,800', dueDate: '05 Jul 2026', daysLeft: -17, status: 'Overdue' },
  { id: 'INV-2026-006', amount: '₹8,500', dueDate: '30 Jul 2026', daysLeft: 8, status: 'Upcoming' },
]

export default function OutstandingPage() {
  const totalOutstanding = '₹38,500'
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Outstanding</h1>
        <p className="text-sm text-[var(--muted)]">View your pending payments and dues</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <IndianRupee size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-500">{totalOutstanding}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {outstanding.map(o => (
          <div key={o.id} className="flex items-center gap-4 rounded-2xl border bg-white/80 p-4 transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${o.daysLeft < 0 ? 'bg-red-50 text-red-500' : o.daysLeft <= 5 ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
              <AlertCircle size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--dark-text)]">{o.id}</p>
              <p className="text-xs text-[var(--muted)]">Due: {o.dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--dark-text)]">{o.amount}</p>
              <span className={`text-xs font-semibold ${o.daysLeft < 0 ? 'text-red-500' : o.daysLeft <= 5 ? 'text-amber-600' : 'text-blue-500'}`}>
                {o.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
