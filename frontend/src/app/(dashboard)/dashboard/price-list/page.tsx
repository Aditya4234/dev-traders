'use client'

import { Search, ShieldAlert, Download, Tag } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useShop } from '@/context/ShopContext'
import * as api from '@/lib/api'
import type { Product } from '@/types'

const pricingTiers = [
  { name: 'Bronze', minQty: 1, discount: 0, color: '#CD7F32' },
  { name: 'Silver', minQty: 10, discount: 5, color: '#C0C0C0' },
  { name: 'Gold', minQty: 50, discount: 10, color: '#FFD700' },
  { name: 'Platinum', minQty: 100, discount: 15, color: '#E5E4E2' },
]

export default function PriceListPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState(0)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await api.getProducts({ limit: 100 })
      if (res?.success) setProducts(res.products || [])
    } catch {
      // fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const getTierPrice = (product: Product, tierIdx: number) => {
    const tier = pricingTiers[tierIdx]
    const basePrice = product.discountPrice
    const discountAmount = (basePrice * tier.discount) / 100
    return Math.round(basePrice - discountAmount)
  }

  const downloadPriceList = () => {
    const rows = [
      ['Product', 'Brand', 'Category', 'MRP', 'Wholesale Price', 'Bronze (1+)', 'Silver (10+)', 'Gold (50+)', 'Platinum (100+)'],
      ...filtered.map(p => [
        p.name,
        p.brand,
        p.category,
        `₹${p.price}`,
        `₹${p.discountPrice}`,
        `₹${getTierPrice(p, 0)}`,
        `₹${getTierPrice(p, 1)}`,
        `₹${getTierPrice(p, 2)}`,
        `₹${getTierPrice(p, 3)}`,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riya-touch-price-list.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>
            Price <span className="text-[var(--primary)]">List</span>
          </h1>
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>
            Wholesale pricing with volume-based dealer tiers ({filtered.length} products)
          </p>
        </div>
        <button
          onClick={downloadPriceList}
          className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--dark-text)] hover:bg-[var(--accent)]"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          <Download size={14} />
          Download CSV
        </button>
      </div>

      {/* Pricing Tier Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pricingTiers.map((tier, idx) => (
          <button
            key={tier.name}
            onClick={() => setSelectedTier(idx)}
            className={`rounded-[16px] border-2 p-4 text-left transition-all ${
              selectedTier === idx
                ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm'
                : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-poppins)' }}>
                {tier.name}
              </span>
            </div>
            <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>
              {tier.minQty}+ pieces
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>
              {tier.discount > 0 ? `-${tier.discount}%` : 'Base Price'}
            </p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search products, brands, categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--dark-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          style={{ fontFamily: 'var(--font-poppins)' }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--accent)]/30">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>Product</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>MRP</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>Wholesale</th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>
                    <div className="flex items-center gap-1">
                      <Tag size={10} />
                      {pricingTiers[selectedTier].name} Price
                    </div>
                  </th>
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filtered.map(p => {
                  const tierPrice = getTierPrice(p, selectedTier)
                  const margin = p.price > 0 ? Math.round(((p.price - tierPrice) / p.price) * 100) : 0
                  return (
                    <tr key={p._id || p.id} className="hover:bg-[var(--accent)]/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--accent)]">
                            <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-poppins)' }}>{p.name}</p>
                            <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>{p.brand} · {p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[var(--muted)] line-through" style={{ fontFamily: 'var(--font-poppins)' }}>₹{p.price}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-poppins)' }}>₹{p.discountPrice}</td>
                      <td className="px-5 py-3 text-sm font-bold text-emerald-600" style={{ fontFamily: 'var(--font-poppins)' }}>₹{tierPrice}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600" style={{ fontFamily: 'var(--font-poppins)' }}>
                          {margin}% OFF
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Search size={32} className="mx-auto text-[var(--muted)]/30" />
              <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
