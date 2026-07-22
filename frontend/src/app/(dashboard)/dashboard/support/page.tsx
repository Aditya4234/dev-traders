'use client'

import { Headphones, Plus, MessageCircle, Clock, CheckCircle } from 'lucide-react'

const tickets = [
  { id: 'TKT-001', subject: 'Order delivery delayed', status: 'open', date: '15 Jul 2026', priority: 'High' },
  { id: 'TKT-002', subject: 'Payment not reflected', status: 'in-progress', date: '12 Jul 2026', priority: 'Medium' },
  { id: 'TKT-003', subject: 'Product quality issue', status: 'resolved', date: '08 Jul 2026', priority: 'Low' },
]

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Support</h1>
          <p className="text-sm text-[var(--muted)]">Get help and manage support tickets</p>
        </div>
        <button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Open Tickets', value: '1', color: 'text-red-500', icon: <Headphones size={20} /> },
          { label: 'In Progress', value: '1', color: 'text-amber-500', icon: <Clock size={20} /> },
          { label: 'Resolved', value: '1', color: 'text-green-600', icon: <CheckCircle size={20} /> },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className={s.color}>{s.icon}</span>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{s.label}</p>
            </div>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {tickets.map(t => (
          <div key={t.id} className="flex items-center gap-4 rounded-2xl border bg-white/80 p-4 transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <MessageCircle size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--dark-text)]">{t.subject}</p>
              <p className="text-xs text-[var(--muted)]">{t.id} • {t.date}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.status === 'open' ? 'bg-red-50 text-red-500' : t.status === 'in-progress' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              {t.status === 'in-progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
