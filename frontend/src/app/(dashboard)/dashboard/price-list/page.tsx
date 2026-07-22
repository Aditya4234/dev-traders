'use client'

import { Tag, Search, Edit2, Eye } from 'lucide-react'
import { useState } from 'react'

const products = [
  { id: 1, name: 'Cotton Kurti Set', sku: 'CKS-001', mrp: '₹1,200', wholesale: '₹850', margin: '29%' },
  { id: 2, name: 'Silk Saree Premium', sku: 'SSP-002', mrp: '₹3,500', wholesale: '₹2,400', margin: '31%' },
  { id: 3, name: 'Denim Jeans Classic', sku: 'DJC-003', mrp: '₹999', wholesale: '₹650', margin: '35%' },
  { id: 4, name: 'Printed Lawn Suit', sku: 'PLS-004', mrp: '₹750', wholesale: '₹480', margin: '36%' },
  { id: 5, name: 'Leather Jacket Urban', sku: 'LJU-005', mrp: '₹4,500', wholesale: '₹3,100', margin: '31%' },
  { id: 6, name: 'Embroidered Lehenga', sku: 'EL-006', mrp: '₹8,500', wholesale: '₹5,800', margin: '32%' },
]

export default function PriceListPage() {
  const [search, setSearch] = useState('')
  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Price List</h1>
        <p className="text-sm text-[var(--muted)]">View wholesale and MRP pricing for all products</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border bg-white/80 py-3 pl-11 pr-4 text-sm text-[var(--dark-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          style={{ borderColor: 'var(--border)' }}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Product</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">SKU</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">MRP</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Wholesale</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Margin</th>
              <th className="px-6 py-4 font-semibold text-[var(--muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
                <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{p.name}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{p.sku}</td>
                <td className="px-6 py-4 text-[var(--muted)] line-through">{p.mrp}</td>
                <td className="px-6 py-4 font-bold text-green-600">{p.wholesale}</td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">{p.margin}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)]"><Eye size={14} /></button>
                    <button className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)]"><Edit2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
