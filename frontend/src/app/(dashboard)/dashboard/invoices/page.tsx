'use client'

import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react'
import { useState } from 'react'

const invoices = [
  { id: 'INV-2026-001', date: '15 Jul 2026', amount: '₹24,500', status: 'Paid', items: 12 },
  { id: 'INV-2026-002', date: '10 Jul 2026', amount: '₹18,200', status: 'Pending', items: 8 },
  { id: 'INV-2026-003', date: '05 Jul 2026', amount: '₹32,100', status: 'Paid', items: 15 },
  { id: 'INV-2026-004', date: '28 Jun 2026', amount: '₹11,800', status: 'Overdue', items: 5 },
  { id: 'INV-2026-005', date: '20 Jun 2026', amount: '₹45,600', status: 'Paid', items: 22 },
]

export default function InvoicesPage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status.toLowerCase() === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Invoices</h1>
          <p className="text-sm text-[var(--muted)]">Manage and view all your invoices</p>
        </div>
        <button className="btn-primary flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
          <FileText size={16} />
          Download All
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'paid', 'pending', 'overdue'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-[var(--primary)] text-white' : 'bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--dark-text)]'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Invoice ID</th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Date</th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Items</th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Amount</th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Status</th>
                <th className="px-6 py-4 font-semibold text-[var(--muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv.id} className="border-b transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{inv.id}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{inv.date}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{inv.items}</td>
                  <td className="px-6 py-4 font-semibold text-[var(--dark-text)]">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${inv.status === 'Paid' ? 'bg-green-50 text-green-600' : inv.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)]"><Eye size={14} /></button>
                      <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)]"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
