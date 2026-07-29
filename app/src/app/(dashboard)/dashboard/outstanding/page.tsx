'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, IndianRupee, Loader2, ShieldAlert } from 'lucide-react'
import { getInvoices } from '@/lib/api'
import type { InvoiceData } from '@/types'
import { useShop } from '@/context/ShopContext'

interface OutstandingItem {
  id: string
  amount: number
  dueDate: string
  daysLeft: number
  status: string
}

export default function OutstandingPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [outstanding, setOutstanding] = useState<OutstandingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [totalOutstanding, setTotalOutstanding] = useState(0)

  useEffect(() => {
    if (!isWholeseller) return
    async function load() {
      try {
        const res = await getInvoices({ status: 'pending', limit: 50 })
        const invoices = res.invoices || []

        const items = invoices.map((inv: InvoiceData) => {
          const dueDate = inv.dueDate ? new Date(inv.dueDate) : null
          const now = new Date()
          const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 999
          const amount = inv.totalAmount - (inv.paidAmount || 0)

          let status = 'Upcoming'
          if (daysLeft < 0) status = 'Overdue'
          else if (daysLeft <= 7) status = 'Due Soon'

          return {
            id: inv.invoiceNumber,
            amount,
            dueDate: dueDate ? dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
            daysLeft,
            status,
          }
        })

        setOutstanding(items)
        setTotalOutstanding(items.reduce((s, i) => s + i.amount, 0))
      } catch {
        // empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isWholeseller])

  if (!isWholeseller) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <ShieldAlert size={48} className="text-[var(--muted)]/30" />
        <h2 className="mt-4 text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-poppins)' }}>Access Restricted</h2>
        <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>This section is available for wholesale partners only.</p>
      </div>
    )
  }

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
            <p className="text-3xl font-bold text-red-500">₹{totalOutstanding.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : outstanding.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <IndianRupee size={40} className="text-[var(--muted)]/30" />
          <p className="mt-3 text-sm text-[var(--muted)]">No outstanding payments</p>
        </div>
      ) : (
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
                <p className="text-sm font-bold text-[var(--dark-text)]">₹{o.amount.toLocaleString('en-IN')}</p>
                <span className={`text-xs font-semibold ${o.daysLeft < 0 ? 'text-red-500' : o.daysLeft <= 5 ? 'text-amber-600' : 'text-blue-500'}`}>
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
