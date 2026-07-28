'use client'

import { useEffect, useState } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Loader2, ShieldAlert } from 'lucide-react'
import { getCreditAccount } from '@/lib/api'
import { useShop } from '@/context/ShopContext'

interface WalletTransaction {
  id: string
  date: string
  type: 'credit' | 'debit'
  description: string
  amount: number
}

export default function WalletPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isWholeseller) return
    async function load() {
      try {
        const res = await getCreditAccount()
        if (!res?.success) return

        const account = res.account
        const rawEntries = res.entries || []

        const txns = rawEntries
          .map((entry: Record<string, string | number>) => ({
            id: String(entry._id || ''),
            date: new Date(entry.createdAt as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            type: (entry.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
            description: String(entry.description || (entry.type === 'credit' ? 'Credit Added' : 'Payment')),
            amount: Number(entry.amount) || 0,
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setTransactions(txns)
        setBalance(account?.currentBalance || 0)
      } catch {
        // empty state
      } finally {
        setLoading(false)
      }
    }
    void load()
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
        <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Wallet</h1>
        <p className="text-sm text-[var(--muted)]">Manage your wallet balance and transactions</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <WalletIcon size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Wallet Balance</p>
            <p className="text-3xl font-bold text-blue-600">₹{Math.abs(balance).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <WalletIcon size={40} className="text-[var(--muted)]/30" />
          <p className="mt-3 text-sm text-[var(--muted)]">No wallet transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => {
            return (
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
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
