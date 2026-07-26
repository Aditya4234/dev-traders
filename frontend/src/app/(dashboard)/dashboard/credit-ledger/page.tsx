'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ArrowUpRight, ArrowDownLeft, Loader2, ShieldAlert } from 'lucide-react'
import { getInvoices } from '@/lib/api'
import type { InvoiceData } from '@/types'
import { useShop } from '@/context/ShopContext'

interface LedgerEntry {
  id: string
  date: Date
  description: string
  amount: number
  type: 'credit' | 'debit'
  dateStr: string
  balance: number
}

export default function CreditLedgerPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBalance, setCurrentBalance] = useState(0)

  useEffect(() => {
    if (!isWholeseller) return
    async function load() {
      try {
        const res = await getInvoices({ limit: 100 })
        const invoices = res.invoices || []

        const ledger = invoices
          .map((inv: InvoiceData) => ({
            id: inv.invoiceNumber,
            date: new Date(inv.createdAt),
            description: inv.status === 'paid' ? `${inv.invoiceNumber} Payment` : `${inv.invoiceNumber} Purchase`,
            amount: inv.status === 'paid' ? (inv.paidAmount || inv.totalAmount) : inv.totalAmount,
            type: inv.status === 'paid' ? 'credit' as const : 'debit' as const,
          }))
          .sort((a, b) => a.date.getTime() - b.date.getTime())

        let running = 0
        const withBalance = ledger.map(e => {
          if (e.type === 'credit') running += e.amount
          else running -= e.amount
          return {
            ...e,
            dateStr: e.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            balance: running,
          }
        }).reverse()

        setEntries(withBalance)
        setCurrentBalance(running)
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
            <p className="text-3xl font-bold text-purple-600">₹{Math.abs(currentBalance).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <BookOpen size={40} className="text-[var(--muted)]/30" />
          <p className="mt-3 text-sm text-[var(--muted)]">No credit ledger entries yet</p>
        </div>
      ) : (
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
                <tr key={e.id + e.dateStr} className="border-b transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{e.id}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{e.dateStr}</td>
                  <td className="px-6 py-4 text-[var(--muted)]">{e.description}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 font-semibold ${e.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {e.type === 'credit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      ₹{e.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--dark-text)]">₹{Math.abs(e.balance).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
