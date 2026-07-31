'use client'

import { FileText, Download, Eye, Loader2, Plus, X, Printer } from 'lucide-react'
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as api from '@/lib/api'
import { generateInvoicePDF } from '@/lib/invoice-pdf'
import { toInvoiceTemplateData } from '@/lib/invoice-utils'
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
    state: string
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setViewInvoice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[95vh] overflow-y-auto rounded-lg bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Toolbar */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-white px-4 py-2">
                <span className="text-xs font-semibold text-gray-500">Invoice Preview</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      handleDownload(viewInvoice)
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    <Download size={13} />
                    PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    <Printer size={13} />
                    Print
                  </button>
                  <button
                    onClick={() => setViewInvoice(null)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="p-2" style={{ transform: 'scale(0.65)', transformOrigin: 'top center', width: '323mm' }}>
                <InvoiceTemplate data={toInvoiceTemplateData(viewInvoice)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
