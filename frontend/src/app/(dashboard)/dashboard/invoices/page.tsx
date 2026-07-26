'use client'

import { FileText, Download, Eye, Calendar, Loader2, Plus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'
import { generateInvoicePDF } from '@/lib/invoice-pdf'
import { useShop } from '@/context/ShopContext'
import Link from 'next/link'

interface InvoiceItem {
  name: string
  hsnCode: string
  quantity: number
  unitPrice: number
  discount: number
  taxableAmount: number
  gstRate: number
  cgst: number
  sgst: number
  igst: number
  totalAmount: number
}

interface Invoice {
  _id: string
  invoiceNumber: string
  customer: {
    name: string
    phone: string
    address: string
    city: string
    pincode: string
    gstNumber?: string
  }
  items: InvoiceItem[]
  subtotal: number
  discount: number
  taxableAmount: number
  totalCGST: number
  totalSGST: number
  totalIGST: number
  totalGST: number
  shippingCharges: number
  totalAmount: number
  amountInWords: string
  status: string
  placeOfSupply: string
  isInterState: boolean
  createdAt: string
}

const statusColors: Record<string, string> = {
  paid: 'bg-green-50 text-green-600',
  issued: 'bg-blue-50 text-blue-600',
  draft: 'bg-gray-100 text-gray-500',
  pending: 'bg-amber-50 text-amber-600',
  overdue: 'bg-red-50 text-red-600',
  cancelled: 'bg-red-50 text-red-400',
}

export default function InvoicesPage() {
  const { user } = useShop()
  const isWholeseller = user?.role === 'admin' || user?.role === 'dealer'
  const [filter, setFilter] = useState('all')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filter !== 'all') params.status = filter
      const data = await api.getInvoices(params as any)
      if (data?.success) {
        setInvoices(data.invoices)
      }
    } catch {
      // API may not be available yet
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDownload = async (invoice: Invoice) => {
    setDownloadingId(invoice._id)
    try {
      await generateInvoicePDF(invoice)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  const handleView = async (invoice: Invoice) => {
    setViewInvoice(invoice)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>{isWholeseller ? 'Invoices' : 'My Invoices'}</h1>
          <p className="text-sm text-[var(--muted)]">{isWholeseller ? 'Manage and send invoices to customers' : 'Invoices sent to you by your wholeseller'}</p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-xs font-semibold text-[var(--dark-text)]">{user.name}</p>
              <p className="text-[10px] text-[var(--muted)]">{user.email}</p>
            </div>
          )}
          {isWholeseller && (
            <Link
              href="/dashboard/invoices/create"
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <Plus size={14} />
              Create Invoice
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'draft', 'issued', 'paid', 'overdue'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-[var(--primary)] text-white' : 'bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--dark-text)]'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
          <span className="ml-3 text-sm text-[var(--muted)]">Loading invoices...</span>
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]">
            <FileText size={28} className="text-[var(--muted)]/40" />
          </div>
          <p className="mt-4 text-sm font-medium text-[var(--dark-text)]">No invoices found</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {filter === 'all' ? 'No invoices have been created yet' : `No ${filter} invoices`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Invoice No</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Customer</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Date</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Items</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Amount</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Status</th>
                  <th className="px-6 py-4 font-semibold text-[var(--muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id} className="border-b transition-colors hover:bg-[var(--accent)]/50" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-6 py-4 font-medium text-[var(--dark-text)]">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">{inv.customer?.name}</td>
                    <td className="px-6 py-4 text-[var(--muted)]">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-[var(--muted)]">{inv.items?.length || 0}</td>
                    <td className="px-6 py-4 font-semibold text-[var(--dark-text)]">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(inv)}
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)]"
                          title="View Invoice"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={downloadingId === inv._id}
                          className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)] disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloadingId === inv._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setViewInvoice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <img src="/products/logo.png" alt="DevTraders" className="h-10 w-10 object-contain" />
                  <div>
                    <h2 className="text-lg font-bold text-[#E91E63]" style={{ fontFamily: 'var(--font-playfair)' }}>DevTraders</h2>
                    <p className="text-[10px] text-[var(--muted)]">Riya Touch Wholesale</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-[#E91E63] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Tax Invoice</span>
                  <p className="mt-1 text-xs text-[var(--muted)]">{viewInvoice.invoiceNumber}</p>
                </div>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#E91E63] mb-2">Bill To</p>
                  <p className="text-sm font-semibold text-[var(--dark-text)]">{viewInvoice.customer.name}</p>
                  <p className="text-xs text-[var(--muted)]">{viewInvoice.customer.phone}</p>
                  <p className="text-xs text-[var(--muted)]">{viewInvoice.customer.address}</p>
                  <p className="text-xs text-[var(--muted)]">{viewInvoice.customer.city} - {viewInvoice.customer.pincode}</p>
                  {viewInvoice.customer.gstNumber && (
                    <p className="text-xs mt-1"><span className="font-semibold">GSTIN:</span> {viewInvoice.customer.gstNumber}</p>
                  )}
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#E91E63] mb-2">Details</p>
                  <p className="text-xs"><span className="font-semibold">Date:</span> {new Date(viewInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  <p className="text-xs"><span className="font-semibold">Status:</span> <span className="capitalize">{viewInvoice.status}</span></p>
                  <p className="text-xs"><span className="font-semibold">Supply:</span> {viewInvoice.isInterState ? 'Inter-State' : 'Intra-State'}</p>
                  <p className="text-xs"><span className="font-semibold">Place:</span> {viewInvoice.placeOfSupply || 'N/A'}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="py-2 text-left font-semibold text-[var(--muted)]">#</th>
                      <th className="py-2 text-left font-semibold text-[var(--muted)]">Item</th>
                      <th className="py-2 text-center font-semibold text-[var(--muted)]">Qty</th>
                      <th className="py-2 text-right font-semibold text-[var(--muted)]">Rate</th>
                      <th className="py-2 text-right font-semibold text-[var(--muted)]">Taxable</th>
                      <th className="py-2 text-right font-semibold text-[var(--muted)]">GST</th>
                      <th className="py-2 text-right font-semibold text-[var(--muted)]">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items.map((item, i) => (
                      <tr key={i} className="border-b border-[var(--border)]/50">
                        <td className="py-2 text-[var(--muted)]">{i + 1}</td>
                        <td className="py-2 font-medium text-[var(--dark-text)]">{item.name}</td>
                        <td className="py-2 text-center text-[var(--muted)]">{item.quantity}</td>
                        <td className="py-2 text-right text-[var(--muted)]">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right text-[var(--muted)]">₹{item.taxableAmount.toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right text-[var(--muted)]">{item.gstRate}%</td>
                        <td className="py-2 text-right font-semibold text-[var(--dark-text)]">₹{item.totalAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Subtotal</span><span className="text-[var(--dark-text)]">₹{viewInvoice.subtotal.toLocaleString('en-IN')}</span></div>
                  {viewInvoice.discount > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Discount</span><span className="text-red-500">-₹{viewInvoice.discount.toLocaleString('en-IN')}</span></div>
                  )}
                  <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Taxable Amount</span><span className="text-[var(--dark-text)]">₹{viewInvoice.taxableAmount.toLocaleString('en-IN')}</span></div>
                  {!viewInvoice.isInterState && (
                    <>
                      <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">CGST</span><span className="text-[var(--dark-text)]">₹{viewInvoice.totalCGST.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">SGST</span><span className="text-[var(--dark-text)]">₹{viewInvoice.totalSGST.toLocaleString('en-IN')}</span></div>
                    </>
                  )}
                  {viewInvoice.isInterState && (
                    <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">IGST</span><span className="text-[var(--dark-text)]">₹{viewInvoice.totalIGST.toLocaleString('en-IN')}</span></div>
                  )}
                  {viewInvoice.shippingCharges > 0 && (
                    <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Shipping</span><span className="text-[var(--dark-text)]">₹{viewInvoice.shippingCharges.toLocaleString('en-IN')}</span></div>
                  )}
                  <div className="border-t border-[var(--border)] pt-1.5 flex justify-between text-sm font-bold">
                    <span className="text-[var(--dark-text)]">Total</span>
                    <span className="text-[#E91E63]">₹{viewInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Amount in words */}
              <div className="rounded-xl bg-pink-50 p-3 mb-4">
                <p className="text-[10px] font-bold text-[#E91E63] uppercase">Amount in Words</p>
                <p className="text-xs text-[var(--dark-text)] mt-0.5">{viewInvoice.amountInWords}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                <p className="text-[10px] text-[var(--muted)]">This is a computer-generated invoice.</p>
                <div className="text-right">
                  <div className="w-24 border-t border-[var(--dark-text)] mb-1" />
                  <p className="text-[10px] text-[var(--muted)] italic">Authorized Signatory</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setViewInvoice(null)}
                  className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--accent)]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownload(viewInvoice)
                    setViewInvoice(null)
                  }}
                  className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
