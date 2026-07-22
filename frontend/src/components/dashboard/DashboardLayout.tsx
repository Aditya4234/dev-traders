'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  FileText,
  CreditCard,
  AlertCircle,
  Wallet,
  Receipt,
  HeadphonesIcon,
  Bell,
  User,
  Settings,
  LogOut,
  Search,
  Heart,
  Menu,
  X,
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  Zap,
  Store,
} from 'lucide-react'
import { useShop } from '@/context/ShopContext'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { label: 'Wholesale Catalog', href: '/shop', icon: <Store size={18} /> },
      { label: 'Bulk Orders', href: '/dashboard/orders', icon: <Package size={18} /> },
      { label: 'My Orders', href: '/dashboard/orders', icon: <ShoppingBag size={18} /> },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Invoices', href: '/dashboard/invoices', icon: <FileText size={18} /> },
      { label: 'Payments', href: '/dashboard/payments', icon: <CreditCard size={18} /> },
      { label: 'Outstanding', href: '/dashboard/outstanding', icon: <AlertCircle size={18} /> },
      { label: 'Credit Ledger', href: '/dashboard/credit-ledger', icon: <Receipt size={18} /> },
      { label: 'Wallet', href: '/dashboard/wallet', icon: <Wallet size={18} /> },
    ],
  },
  {
    title: 'Products',
    items: [
      { label: 'Price List', href: '/dashboard/price-list', icon: <FileText size={18} /> },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Support', href: '/dashboard/support', icon: <HeadphonesIcon size={18} /> },
      { label: 'Notifications', href: '/dashboard/notifications', icon: <Bell size={18} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Profile', href: '/dashboard/profile', icon: <User size={18} /> },
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, authLoading, logout, setWishlistOpen } = useShop()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const userName = user?.name || 'Partner'
  const companyName = user?.companyName || 'Riya Touch'
  const userDealerId = user?.dealerId || ''
  const userEmail = user?.email || ''
  const userRole = user?.role || 'customer'

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RT'

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <User size={28} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-poppins)' }}>
            Authentication Required
          </h2>
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>
            Please log in to access the dashboard.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '#') return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Menu
          </h1>
        </div>
      </div>

      <div className="mx-4 mb-6">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #E91E63, #C2185B)',
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-[var(--dark-text)]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {userName}
              </p>
              <p
                className="text-[11px] text-[var(--muted)]"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {userDealerId ? `Dealer ID: ${userDealerId}` : companyName}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
            >
              <Zap size={10} />
              {userRole === 'dealer' ? 'Wholesale Dealer' : userRole === 'admin' ? 'Admin' : 'Partner'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'thin' }}>
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            <p
              className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'active bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'text-[var(--dark-text)]/70 hover:bg-[var(--accent)] hover:text-[var(--dark-text)]'
                      }`}
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          active
                            ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                            : 'bg-transparent text-[var(--muted)]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.href !== '#' && (
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${active ? 'translate-x-0.5 text-[var(--primary)]' : 'text-[var(--muted)]/50'}`}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-4 mb-4">
        <div className="glass-card rounded-2xl p-4">
          <p
            className="mb-3 text-xs font-semibold text-[var(--dark-text)]"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Contact Sales Manager
          </p>
          <div className="space-y-2">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--dark-text)]/70 transition-colors hover:bg-green-50 hover:text-green-600"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-100 text-green-600">
                <Phone size={12} />
              </div>
              <span className="flex-1">WhatsApp</span>
              <ExternalLink size={10} className="opacity-40" />
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--dark-text)]/70 transition-colors hover:bg-blue-50 hover:text-blue-600"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600">
                <Phone size={12} />
              </div>
              <span className="flex-1">Phone</span>
              <ExternalLink size={10} className="opacity-40" />
            </a>
            <a
              href="mailto:sales@riytouch.com"
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-[var(--dark-text)]/70 transition-colors hover:bg-purple-50 hover:text-purple-600"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                <Mail size={12} />
              </div>
              <span className="flex-1">Email</span>
              <ExternalLink size={10} className="opacity-40" />
            </a>
          </div>
        </div>
      </div>

      <div className="px-4 pb-6">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 transition-all hover:bg-red-50 hover:text-red-600"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500/80">
            <LogOut size={16} />
          </span>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header
        className="glass-strong sticky top-0 z-50 flex h-16 items-center border-b px-4 md:px-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--dark-text)] transition-colors hover:bg-[var(--accent)]"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-lg bg-white shadow-sm">
              <Image src="/products/logo.png" alt="Riya Touch" fill className="object-contain p-0.5" />
            </div>
            <span
              className="text-sm font-bold text-[var(--dark-text)]"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Riya Touch
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 md:ml-0">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shadow-sm">
            <Image src="/products/logo.png" alt="Riya Touch" fill className="object-contain p-0.5" />
          </div>
          <span
            className="text-sm font-bold text-[var(--dark-text)]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Riya Touch
          </span>
        </div>

        <div className="hidden flex-1 md:block md:ml-4">
          <div className="relative mx-auto max-w-xl">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search Products, Orders, Invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-luxury h-10 w-full rounded-xl border bg-white/60 pl-10 pr-4 text-sm text-[var(--dark-text)] placeholder:text-[var(--muted)]/60 focus:bg-white focus:shadow-md"
              style={{
                fontFamily: 'var(--font-poppins)',
                borderColor: 'var(--border)',
              }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link href="/dashboard/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--dark-text)]/70 transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--primary)] shadow-sm ring-2 ring-white" />
          </Link>

          <button
            onClick={() => setWishlistOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--dark-text)]/70 transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
          >
            <Heart size={18} />
          </button>

          <Link
            href="/shop"
            className="btn-primary hidden items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg sm:inline-flex"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            <Zap size={14} />
            Quick Order
          </Link>

          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-[var(--accent)]"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #E91E63, #C2185B)',
                }}
              >
                {initials}
              </div>
              <div className="hidden text-left sm:block">
                <p
                  className="text-xs font-semibold text-[var(--dark-text)] leading-tight"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  {userName}
                </p>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-white">
                  {userRole === 'dealer' ? 'Dealer' : userRole === 'admin' ? 'Admin' : 'Partner'}
                </span>
              </div>
            </button>

            <AnimatePresence>
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="glass-strong absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border p-2 shadow-xl"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="mb-1 border-b px-3 py-2" style={{ borderColor: 'var(--border)' }}>
                      <p
                        className="text-sm font-semibold text-[var(--dark-text)]"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {userName}
                      </p>
                      <p
                        className="text-xs text-[var(--muted)]"
                        style={{ fontFamily: 'var(--font-poppins)' }}
                      >
                        {userEmail}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--dark-text)]/70 transition-colors hover:bg-[var(--accent)]"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User size={15} />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-[var(--dark-text)]/70 transition-colors hover:bg-[var(--accent)]"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-500/80 transition-colors hover:bg-red-50"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="relative flex">
        <aside className="pointer-events-none fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r bg-white/80 backdrop-blur-xl md:pointer-events-auto md:block"
          style={{ borderColor: 'var(--border)' }}
        >
          {sidebarContent}
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                onClick={closeMobile}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed left-0 top-0 z-50 h-full w-72 overflow-y-auto border-r bg-white shadow-2xl md:hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between px-6 py-5">
                  <span
                    className="text-sm font-bold text-[var(--dark-text)]"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Riya Touch
                  </span>
                  <button
                    onClick={closeMobile}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
                  >
                    <X size={18} />
                  </button>
                </div>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-h-[calc(100vh-4rem)] flex-1 p-4 md:ml-72 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
