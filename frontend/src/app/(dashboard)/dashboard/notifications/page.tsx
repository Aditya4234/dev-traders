'use client'

import { Bell, Check, Trash2, ShoppingCart, CreditCard, AlertTriangle } from 'lucide-react'

const notifications = [
  { id: 1, title: 'New Order Received', message: 'Order #ORD-012 has been placed successfully', time: '5 min ago', read: false, type: 'order' },
  { id: 2, title: 'Payment Confirmed', message: 'Payment of ₹24,500 received via UPI', time: '1 hour ago', read: false, type: 'payment' },
  { id: 3, title: 'Low Stock Alert', message: 'Silk Saree Premium has only 3 units left', time: '3 hours ago', read: true, type: 'alert' },
  { id: 4, title: 'Order Shipped', message: 'Order #ORD-009 has been shipped via Delhivery', time: '1 day ago', read: true, type: 'order' },
]

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Notifications</h1>
          <p className="text-sm text-[var(--muted)]">View all your notifications and alerts</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--dark-text)]" style={{ borderColor: 'var(--border)' }}>
          <Check size={16} />
          Mark All Read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:bg-[var(--accent)]/50 ${n.read ? 'bg-white/60' : 'bg-white/80 border-l-4 border-l-[var(--primary)]'}`} style={{ borderColor: 'var(--border)' }}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${n.type === 'order' ? 'bg-blue-50 text-blue-500' : n.type === 'payment' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
              {n.type === 'order' ? <ShoppingCart size={18} /> : n.type === 'payment' ? <CreditCard size={18} /> : <AlertTriangle size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--dark-text)]">{n.title}</p>
              <p className="text-xs text-[var(--muted)]">{n.message}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">{n.time}</span>
              {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
