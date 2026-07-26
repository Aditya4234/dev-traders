'use client'

import { useEffect, useState } from 'react'
import { CreditCard, ArrowUpRight, ArrowDownLeft, Loader2, ShieldAlert } from 'lucide-react'
import { getInvoices } from '@/lib/api'
import type { InvoiceData } from '@/types'
import { useShop } from '@/context/ShopContext'

interface Payment {
  id: string
  date: string
  amount: number
  method: string
  type: 'incoming' | 'outgoing'
  ref: string
  status: string
}

export default function PaymentsPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalPaid: 0, pending: 0, thisMonth: 0 })

  useEffect(() => {
    if (!isWholeseller) return
    async function load() {
      try {
        const [paidRes, pendingRes] = await Promise.all([
          getInvoices({ status: 'paid', limit: 50 }),
          getInvoices({ status: 'pending', limit: 50 }),
        ])

        const paidInvoices = paidRes.invoices || []
        const pendingInvoices = pendingRes.invoices || []

        const all = [
          ...paidInvoices.map((inv: InvoiceData) => ({
            id: inv.invoiceNumber,
            date: new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: inv.paidAmount || inv.totalAmount,
            method: inv.paymentMethod || 'N/A',
            type: 'incoming' as const,
            ref: inv.invoiceNumber,
            status: inv.status,
          })),
          ...pendingInvoices.map((inv: InvoiceData) => ({
            id: inv.invoiceNumber,
            date: new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: inv.totalAmount - (inv.paidAmount || 0),
            method: inv.paymentMethod || 'N/A',
            type: 'outgoing' as const,
            ref: inv.invoiceNumber,
            status: inv.status,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setPayments(all)

        const totalPaid = paidInvoices.reduce((s, i) => s + (i.paidAmount || i.totalAmount), 0)
        const pending = pendingInvoices.reduce((s, i) => s + (i.totalAmount - (i.paidAmount || 0)), 0)
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisMonthInvoices = [...paidInvoices, ...pendingInvoices].filter((i) => new Date(i.createdAt) >= thisMonthStart)
        const thisMonth = thisMonthInvoices.reduce((s, i) => s + (i.paidAmount || i.totalAmount), 0)

        setStats({ totalPaid, pending, thisMonth })
      } catch {
        // API not available — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Payments</h1>
        <p className="text-sm text-[var(--muted)]">Track all your payment transactions</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Paid', value: `₹${stats.totalPaid.toLocaleString('en-IN')}`, color: 'text-green-600' },
          { label: 'Pending', value: `₹${stats.pending.toLocaleString('en-IN')}`, color: 'text-amber-600' },
          { label: 'This Month', value: `₹${stats.thisMonth.toLocaleString('en-IN')}`, color: 'text-[var(--primary)]' },
        ].map(s => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{s.label}</p>
            <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <CreditCard size={40} className="text-[var(--muted)]/30" />
          <p className="mt-3 text-sm text-[var(--muted)]">No payment transactions yet</p>
        </div>
      ) : (
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
                {p.type === 'incoming' ? '+' : '-'}₹{p.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
