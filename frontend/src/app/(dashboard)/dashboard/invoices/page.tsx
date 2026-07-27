'use client'

import { FileText, Download, Eye, Loader2, Plus, X } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'
import { generateInvoicePDF } from '@/lib/invoice-pdf'
import { useShop } from '@/context/ShopContext'
import Link from 'next/link'
import Image from 'next/image'

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
      const data = await api.getInvoices(params as Record<string, string>)
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
    void (async () => { await fetchInvoices(); })();
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: 'var(--font-playfair)' }}>Invoices</h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">View and manage your invoices</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {user && (
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-xs font-semibold text-[var(--dark-text)]">{user.name}</p>
              <p className="text-[10px] text-[var(--muted)]">{user.email}</p>
            </div>
          )}
          {(user?.role === 'admin' || user?.role === 'dealer') && (
            <Link
              href="/dashboard/invoices/create"
              className="flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 sm:px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Create</span> Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
        {['all', 'draft', 'issued', 'paid', 'overdue'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold capitalize transition-all ${filter === s ? 'bg-[var(--primary)] text-white' : 'bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--dark-text)]'}`}
          >
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
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
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
                          onClick={() => setViewInvoice(inv)}
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {invoices.map(inv => (
              <div
                key={inv._id}
                className="rounded-2xl border bg-white/80 backdrop-blur-sm p-4"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--dark-text)] truncate">{inv.invoiceNumber}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{inv.customer?.name}</p>
                  </div>
                  <span className={`shrink-0 ml-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${statusColors[inv.status] || 'bg-gray-100 text-gray-500'}`}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)]">Date</span>
                    <p className="font-medium text-[var(--dark-text)]">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)]">Items</span>
                    <p className="font-medium text-[var(--dark-text)]">{inv.items?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-base font-bold text-[var(--dark-text)]">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewInvoice(inv)}
                      className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--dark-text)] flex items-center gap-1"
                    >
                      <Eye size={12} />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(inv)}
                      disabled={downloadingId === inv._id}
                      className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-[11px] font-semibold text-white flex items-center gap-1 disabled:opacity-50"
                    >
                      {downloadingId === inv._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {viewInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
            onClick={() => setViewInvoice(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="invoice-preview w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Mobile Drag Handle */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-300" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setViewInvoice(null)}
                className="absolute top-3 right-3 sm:static sm:float-right sm:mr-4 sm:mt-4 z-10 rounded-full bg-gray-100 p-1.5 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Image src="/products/logo.png" alt="DevTraders" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-[#E91E63] leading-snug">DevTraders</h2>
                      <p className="text-[9px] sm:text-[10px] text-[var(--muted)] leading-snug">Riya Touch Wholesale</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="inline-block rounded-full bg-[#E91E63] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase text-white leading-snug">Tax Invoice</span>
                    <p className="mt-1 text-[11px] sm:text-xs text-[var(--muted)] leading-snug">{viewInvoice.invoiceNumber}</p>
                  </div>
                </div>

                {/* Invoice Info — stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                  <div className="rounded-xl bg-gray-50 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase text-[#E91E63] mb-2">Bill To</p>
                    <p className="text-sm font-semibold text-[var(--dark-text)] leading-relaxed break-words">{viewInvoice.customer.name}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{viewInvoice.customer.phone}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed break-words">{viewInvoice.customer.address}</p>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{viewInvoice.customer.city} - {viewInvoice.customer.pincode}</p>
                    {viewInvoice.customer.gstNumber && (
                      <p className="text-xs mt-1 leading-relaxed break-all"><span className="font-semibold">GSTIN:</span> {viewInvoice.customer.gstNumber}</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase text-[#E91E63] mb-2">Details</p>
                    <div className="space-y-1">
                      <p className="text-xs leading-relaxed"><span className="font-semibold">Date:</span> {new Date(viewInvoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <p className="text-xs leading-relaxed"><span className="font-semibold">Status:</span> <span className="capitalize">{viewInvoice.status}</span></p>
                      <p className="text-xs leading-relaxed"><span className="font-semibold">Supply:</span> {viewInvoice.isInterState ? 'Inter-State' : 'Intra-State'}</p>
                      <p className="text-xs leading-relaxed"><span className="font-semibold">Place:</span> {viewInvoice.placeOfSupply || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Items — Desktop Table */}
                <div className="hidden sm:block mb-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="py-2 text-left text-[10px] font-semibold text-[var(--muted)] leading-relaxed">#</th>
                        <th className="py-2 text-left text-[10px] font-semibold text-[var(--muted)] leading-relaxed">Item</th>
                        <th className="py-2 text-center text-[10px] font-semibold text-[var(--muted)] leading-relaxed">Qty</th>
                        <th className="py-2 text-right text-[10px] font-semibold text-[var(--muted)] leading-relaxed">Rate</th>
                        <th className="py-2 text-right text-[10px] font-semibold text-[var(--muted)] leading-relaxed">Taxable</th>
                        <th className="py-2 text-right text-[10px] font-semibold text-[var(--muted)] leading-relaxed">GST</th>
                        <th className="py-2 text-right text-[10px] font-semibold text-[var(--muted)] leading-relaxed">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b border-[var(--border)]/50">
                          <td className="py-2.5 text-[11px] text-[var(--muted)] leading-relaxed">{i + 1}</td>
                          <td className="py-2.5 text-[11px] font-medium text-[var(--dark-text)] leading-relaxed break-words max-w-[140px]">{item.name}</td>
                          <td className="py-2.5 text-[11px] text-center text-[var(--muted)] leading-relaxed">{item.quantity}</td>
                          <td className="py-2.5 text-[11px] text-right text-[var(--muted)] leading-relaxed whitespace-nowrap">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-[11px] text-right text-[var(--muted)] leading-relaxed whitespace-nowrap">₹{item.taxableAmount.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-[11px] text-right text-[var(--muted)] leading-relaxed whitespace-nowrap">{item.gstRate}%</td>
                          <td className="py-2.5 text-[11px] text-right font-semibold text-[var(--dark-text)] leading-relaxed whitespace-nowrap">₹{item.totalAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Items — Mobile Cards */}
                <div className="sm:hidden mb-5 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase text-[#E91E63]">Items</p>
                  {viewInvoice.items.map((item, i) => (
                    <div key={i} className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-xs font-semibold text-[var(--dark-text)] leading-relaxed break-words min-w-0">{i + 1}. {item.name}</p>
                        <p className="text-xs font-bold text-[var(--dark-text)] shrink-0 whitespace-nowrap">₹{item.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="text-[var(--muted)]">Qty</span>
                          <p className="font-medium text-[var(--dark-text)] leading-relaxed">{item.quantity}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">Rate</span>
                          <p className="font-medium text-[var(--dark-text)] leading-relaxed whitespace-nowrap">₹{item.unitPrice.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)]">GST</span>
                          <p className="font-medium text-[var(--dark-text)] leading-relaxed whitespace-nowrap">{item.gstRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals — full width on mobile */}
                <div className="flex justify-end mb-5 sm:mb-6">
                  <div className="w-full sm:w-64 space-y-1.5">
                    <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">Subtotal</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.subtotal.toLocaleString('en-IN')}</span></div>
                    {viewInvoice.discount > 0 && (
                      <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">Discount</span><span className="text-red-500 whitespace-nowrap">-₹{viewInvoice.discount.toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">Taxable Amount</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.taxableAmount.toLocaleString('en-IN')}</span></div>
                    {!viewInvoice.isInterState && (
                      <>
                        <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">CGST</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.totalCGST.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">SGST</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.totalSGST.toLocaleString('en-IN')}</span></div>
                      </>
                    )}
                    {viewInvoice.isInterState && (
                      <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">IGST</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.totalIGST.toLocaleString('en-IN')}</span></div>
                    )}
                    {viewInvoice.shippingCharges > 0 && (
                      <div className="flex justify-between text-xs leading-relaxed"><span className="text-[var(--muted)]">Shipping</span><span className="text-[var(--dark-text)] whitespace-nowrap">₹{viewInvoice.shippingCharges.toLocaleString('en-IN')}</span></div>
                    )}
                    <div className="border-t border-[var(--border)] pt-1.5 flex justify-between text-sm font-bold leading-relaxed">
                      <span className="text-[var(--dark-text)]">Total</span>
                      <span className="text-[#E91E63] whitespace-nowrap">₹{viewInvoice.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Amount in words */}
                <div className="rounded-xl bg-pink-50 p-3 mb-4">
                  <p className="text-[10px] font-bold text-[#E91E63] uppercase">Amount in Words</p>
                  <p className="text-xs text-[var(--dark-text)] mt-0.5 break-words whitespace-normal leading-relaxed">{viewInvoice.amountInWords}</p>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted)] leading-relaxed">This is a computer-generated invoice.</p>
                  <div className="text-right">
                    <div className="w-20 sm:w-24 border-t border-[var(--dark-text)] mb-1" />
                    <p className="text-[10px] text-[var(--muted)] italic leading-relaxed">Authorized Signatory</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-4 pt-3 sm:pt-0">
                  <button
                    onClick={() => setViewInvoice(null)}
                    className="flex-1 sm:flex-none rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--accent)] text-center"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleDownload(viewInvoice)
                      setViewInvoice(null)
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
