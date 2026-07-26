'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, ArrowLeft, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import * as api from '@/lib/api'
import Link from 'next/link'

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
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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
      })
      setSuccess(true)
      setTimeout(() => router.push('/dashboard/invoices'), 1500)
    } catch (err: any) {
      alert(err.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
    }
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
          <p className="text-sm text-[var(--muted)]">Fill in the details to generate a new tax invoice</p>
        </div>
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
