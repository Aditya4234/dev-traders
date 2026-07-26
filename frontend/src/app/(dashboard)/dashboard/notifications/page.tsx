'use client'

import { useEffect, useState } from 'react'
import { Bell, Check, ShoppingCart, CreditCard, AlertTriangle, Loader2 } from 'lucide-react'
import { getNotifications, markAllNotificationsRead } from '@/lib/api'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [mountedAt] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await getNotifications({ limit: 50 })
        if (!cancelled) {
          setNotifications(res.notifications || [])
          setUnreadCount(res.unreadCount || 0)
        }
      } catch {
        // empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const getTimeAgo = (date: string) => {
    const diff = mountedAt - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Notifications</h1>
          <p className="text-sm text-[var(--muted)]">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--dark-text)] transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            <Check size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <Bell size={40} className="text-[var(--muted)]/30" />
          <p className="mt-3 text-sm text-[var(--muted)]">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n._id} className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:bg-[var(--accent)]/50 ${n.read ? 'bg-white/60' : 'bg-white/80 border-l-4 border-l-[var(--primary)]'}`} style={{ borderColor: 'var(--border)' }}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${n.type === 'order' ? 'bg-blue-50 text-blue-500' : n.type === 'payment' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-500'}`}>
                {n.type === 'order' ? <ShoppingCart size={18} /> : n.type === 'payment' ? <CreditCard size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--dark-text)]">{n.title}</p>
                <p className="text-xs text-[var(--muted)]">{n.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">{getTimeAgo(n.createdAt)}</span>
                {!n.read && <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
