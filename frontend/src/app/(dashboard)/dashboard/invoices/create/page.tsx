'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowLeft, Loader2, FileText, CheckCircle2, Search, UserCircle, X, ShieldAlert } from 'lucide-react'
import * as api from '@/lib/api'
import Link from 'next/link'
import { useShop } from '@/context/ShopContext'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Puducherry',
  'Andaman and Nicobar Islands',
]

const GST_RATES = [0, 5, 12, 18, 28]

interface LineItem {
  name: string
  hsnCode: string
  quantity: number
  unitPrice: number
  discount: number
  gstRate: number
}

interface UserResult {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  companyName?: string
  dealerId?: string
}

const emptyItem = (): LineItem => ({
  name: '',
  hsnCode: '',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  gstRate: 18,
})

export default function CreateInvoicePage() {
  const router = useRouter()
  const { user } = useShop()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'

  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [userSearchResults, setUserSearchResults] = useState<UserResult[]>([])
  const [userSearching, setUserSearching] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const userSearchRef = useRef<HTMLDivElement>(null)
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
  })

  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [shippingCharges, setShippingCharges] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [placeOfSupply, setPlaceOfSupply] = useState('')

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchUsers = useCallback(async (q: string) => {
    if (!isWholeseller) return
    if (q.trim().length < 2) {
      setUserSearchResults([])
      return
    }
    setUserSearching(true)
    try {
      const data = await api.searchUsers(q)
      if (data?.success) {
        setUserSearchResults(data.users)
      }
    } catch {
      // ignore
    } finally {
      setUserSearching(false)
    }
  }, [isWholeseller])

  const handleUserSearchChange = (value: string) => {
    setUserSearchQuery(value)
    setShowUserDropdown(true)
    if (userSearchTimer.current) clearTimeout(userSearchTimer.current)
    userSearchTimer.current = setTimeout(() => searchUsers(value), 300)
  }

  const selectUser = (u: UserResult) => {
    setSelectedUser(u)
    setCustomer(prev => ({
      ...prev,
      name: u.name,
      phone: u.phone || '',
      city: prev.city,
      state: prev.state,
      pincode: prev.pincode,
      address: prev.address,
      gstNumber: prev.gstNumber,
    }))
    setUserSearchQuery(u.name)
    setShowUserDropdown(false)
    setUserSearchResults([])
  }

  const clearSelectedUser = () => {
    setSelectedUser(null)
    setUserSearchQuery('')
    setCustomer({ name: '', phone: '', address: '', city: '', state: '', pincode: '', gstNumber: '' })
  }

  const updateCustomer = (field: string, value: string) => {
    setCustomer(prev => ({ ...prev, [field]: value }))
    if (field === 'state' && !placeOfSupply) {
      setPlaceOfSupply(value)
    }
  }

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  const addItem = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (index: number) => {
    if (items.length === 1) return
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const itemDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0)
  const taxableAmount = subtotal - itemDiscount - discount
  const totalGST = items.reduce((sum, item) => {
    const itemTaxable = (item.unitPrice * item.quantity) - (item.discount || 0)
    return sum + (itemTaxable * item.gstRate) / 100
  }, 0)
  const totalAmount = taxableAmount + totalGST + shippingCharges

  const canSubmit = customer.name && customer.phone && customer.city && customer.state && customer.pincode
    && placeOfSupply && items.length > 0 && items.every(i => i.name && i.hsnCode && i.quantity > 0 && i.unitPrice > 0)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await api.createInvoice({
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          state: customer.state,
          pincode: customer.pincode,
          gstNumber: customer.gstNumber || undefined,
        },
        items: items.map(i => ({
          productId: '',
          name: i.name,
          hsnCode: i.hsnCode,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount || undefined,
          gstRate: i.gstRate,
        })),
        shippingCharges: shippingCharges || undefined,
        discount: discount || undefined,
        notes: notes || undefined,
        placeOfSupply,
        userId: selectedUser?._id || undefined,
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/invoices'), 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create invoice';
      alert(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isWholeseller) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert size={28} className="text-red-400" />
        </div>
        <p className="mt-4 text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Access Restricted</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Only wholesalers can create invoices.</p>
        <Link href="/dashboard/invoices" className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90" style={{ fontFamily: 'var(--font-poppins)' }}>
          Back to Invoices
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <CheckCircle2 size={64} className="text-green-500" />
        </motion.div>
        <p className="mt-4 text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Invoice Created!</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Redirecting to invoices...</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices" className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Create Invoice</h1>
          <p className="text-sm text-[var(--muted)]">Wholeseller - fill details to generate a new tax invoice</p>
        </div>
      </div>

      {/* Send To (User Search) */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6" style={{ borderColor: 'var(--border)' }}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>Send Invoice To</h2>
        {selectedUser ? (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
              <UserCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--dark-text)] truncate">{selectedUser.name}</p>
              <p className="text-xs text-[var(--muted)] truncate">{selectedUser.email}{selectedUser.phone ? ` · ${selectedUser.phone}` : ''}</p>
              <span className="inline-block mt-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] capitalize">{selectedUser.role}</span>
            </div>
            <button onClick={clearSelectedUser} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-500 transition-colors" title="Remove">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative" ref={userSearchRef}>
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => handleUserSearchChange(e.target.value)}
                onFocus={() => userSearchQuery.length >= 2 && setShowUserDropdown(true)}
                className="input-luxury text-sm pl-10"
                placeholder="Search by name, email, or phone..."
              />
              {userSearching && (
                <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[var(--primary)]" />
              )}
            </div>
            {showUserDropdown && userSearchResults.length > 0 && (
              <div className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-[var(--border)] bg-white shadow-xl">
                {userSearchResults.map(u => (
                  <button key={u._id} onClick={() => selectUser(u)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--accent)] border-b border-[var(--border)]/50 last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--dark-text)] truncate">{u.name}</p>
                      <p className="text-[11px] text-[var(--muted)] truncate">{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--muted)] capitalize bg-[var(--accent)] rounded-full px-2 py-0.5">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
            {showUserDropdown && userSearchQuery.length >= 2 && userSearchResults.length === 0 && !userSearching && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-[var(--border)] bg-white p-4 text-center shadow-xl">
                <p className="text-xs text-[var(--muted)]">No users found</p>
              </div>
            )}
            <p className="mt-2 text-[11px] text-[var(--muted)]">Search and select the user to send this invoice to. You can also fill customer details manually below.</p>
          </div>
        )}
      </div>

      {/* Customer Details */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6" style={{ borderColor: 'var(--border)' }}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>Customer Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Name *</label>
            <input value={customer.name} onChange={e => updateCustomer('name', e.target.value)} className="input-luxury text-sm" placeholder="Customer name" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Phone *</label>
            <input value={customer.phone} onChange={e => updateCustomer('phone', e.target.value)} className="input-luxury text-sm" placeholder="Phone number" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Address</label>
            <input value={customer.address} onChange={e => updateCustomer('address', e.target.value)} className="input-luxury text-sm" placeholder="Full address" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">City *</label>
            <input value={customer.city} onChange={e => updateCustomer('city', e.target.value)} className="input-luxury text-sm" placeholder="City" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Pincode *</label>
            <input value={customer.pincode} onChange={e => updateCustomer('pincode', e.target.value)} className="input-luxury text-sm" placeholder="Pincode" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">State *</label>
            <select value={customer.state} onChange={e => updateCustomer('state', e.target.value)} className="input-luxury text-sm">
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">GSTIN (optional)</label>
            <input value={customer.gstNumber} onChange={e => updateCustomer('gstNumber', e.target.value)} className="input-luxury text-sm" placeholder="GSTIN number" />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6" style={{ borderColor: 'var(--border)' }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>Line Items</h2>
          <button onClick={addItem} className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20">
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-[var(--border)]/60 bg-[var(--accent)]/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--muted)]" style={{ fontFamily: 'var(--font-poppins)' }}>Item {idx + 1}</span>
                {items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="rounded-lg p-1 text-red-400 transition-colors hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">Product Name *</label>
                  <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="input-luxury text-sm" placeholder="Product name" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">HSN Code *</label>
                  <input value={item.hsnCode} onChange={e => updateItem(idx, 'hsnCode', e.target.value)} className="input-luxury text-sm" placeholder="HSN" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">Qty *</label>
                  <input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} className="input-luxury text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">Unit Price *</label>
                  <input type="number" min={0} step={0.01} value={item.unitPrice || ''} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="input-luxury text-sm" placeholder="₹0" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">GST %</label>
                  <select value={item.gstRate} onChange={e => updateItem(idx, 'gstRate', parseInt(e.target.value))} className="input-luxury text-sm">
                    {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-[var(--muted)]">Discount</label>
                  <input type="number" min={0} step={0.01} value={item.discount || ''} onChange={e => updateItem(idx, 'discount', parseFloat(e.target.value) || 0)} className="input-luxury text-sm" placeholder="₹0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Details */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6" style={{ borderColor: 'var(--border)' }}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>Additional Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Place of Supply *</label>
            <select value={placeOfSupply} onChange={e => setPlaceOfSupply(e.target.value)} className="input-luxury text-sm">
              <option value="">Select state</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Shipping Charges</label>
            <input type="number" min={0} step={0.01} value={shippingCharges || ''} onChange={e => setShippingCharges(parseFloat(e.target.value) || 0)} className="input-luxury text-sm" placeholder="₹0" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Additional Discount</label>
            <input type="number" min={0} step={0.01} value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="input-luxury text-sm" placeholder="₹0" />
          </div>
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-luxury text-sm resize-none" placeholder="Additional notes..." />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border bg-white/80 backdrop-blur-sm p-6" style={{ borderColor: 'var(--border)' }}>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--primary)]" style={{ fontFamily: 'var(--font-poppins)' }}>Invoice Summary</h2>
        <div className="w-full max-w-sm space-y-2 ml-auto">
          <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Subtotal</span><span className="text-[var(--dark-text)]">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          {itemDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Item Discount</span><span className="text-red-500">-₹{itemDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Additional Discount</span><span className="text-red-500">-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Taxable Amount</span><span className="text-[var(--dark-text)]">₹{Math.max(0, taxableAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">GST</span><span className="text-[var(--dark-text)]">₹{totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
          {shippingCharges > 0 && <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Shipping</span><span className="text-[var(--dark-text)]">₹{shippingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>}
          <div className="border-t border-[var(--border)] pt-2 flex justify-between text-base font-bold">
            <span className="text-[var(--dark-text)]">Total</span>
            <span className="text-[var(--primary)]">₹{Math.max(0, totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/dashboard/invoices" className="rounded-xl border border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--accent)]" style={{ fontFamily: 'var(--font-poppins)' }}>
          Cancel
        </Link>
        <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {submitting ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </motion.div>
  )
}
