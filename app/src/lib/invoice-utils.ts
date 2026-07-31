import { getProductImagePath } from '@/lib/product-image-map'
import type { InvoiceData } from '@/components/invoice/InvoiceTemplate'

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

interface InvoiceSource {
  invoiceNumber: string
  createdAt: string
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
  totalAmount: number
  amountInWords: string
  placeOfSupply: string
  isInterState: boolean
  notes?: string
}

export function toInvoiceTemplateData(invoice: InvoiceSource): InvoiceData {
  const roundOff = Math.round(invoice.totalAmount) - invoice.totalAmount

  return {
    invoiceNo: invoice.invoiceNumber,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    deliveryNote: '',
    paymentTerms: '',
    referenceNo: '',
    dispatchedThrough: '',
    destination: invoice.customer.city,
    vehicleNo: '',
    customer: {
      name: invoice.customer.name,
      phone: invoice.customer.phone,
      address: invoice.customer.address,
      city: invoice.customer.city,
      state: invoice.customer.state,
      pincode: invoice.customer.pincode,
      gstNumber: invoice.customer.gstNumber,
    },
    isInterState: invoice.isInterState,
    placeOfSupply: invoice.placeOfSupply,
    products: invoice.items.map((item, i) => {
      const total = item.unitPrice * item.quantity
      const discPct = total > 0 ? Math.round(((item.discount || 0) / total) * 100) : 0
      return {
        sl: i + 1,
        description: item.name,
        image: getProductImagePath(item.name),
        hsn: item.hsnCode,
        quantity: item.quantity,
        rate: item.unitPrice,
        per: 'DOZ',
        discount: discPct,
        amount: item.taxableAmount,
        taxableValue: item.taxableAmount,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        gstRate: item.gstRate,
      }
    }),
    subtotal: invoice.subtotal,
    cgst: invoice.totalCGST,
    sgst: invoice.totalSGST,
    igst: invoice.totalIGST,
    totalGst: invoice.totalGST,
    roundOff,
    grandTotal: invoice.totalAmount,
    amountInWords: invoice.amountInWords || 'N/A',
  }
}
