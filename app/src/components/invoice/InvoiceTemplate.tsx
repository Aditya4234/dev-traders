'use client'

import Image from 'next/image'
import { INVOICE_COMPANY } from '@/lib/invoice-config'
import { getProductImagePath } from '@/lib/product-image-map'

interface Product {
  sl: number
  description: string
  image?: string | null
  hsn: string
  quantity: number
  rate: number
  per: string
  discount: number
  amount: number
  taxableValue: number
  cgst: number
  sgst: number
  igst: number
  gstRate: number
}

interface HsnSummaryRow {
  hsn: string
  taxableValue: number
  cgstRate: number
  cgstAmount: number
  sgstRate: number
  sgstAmount: number
  igstAmount: number
  totalTax: number
}

export interface InvoiceData {
  invoiceNo: string
  invoiceDate: string
  irn?: string
  ackNo?: string
  ackDate?: string
  ewayBillNo?: string
  deliveryNote?: string
  paymentTerms?: string
  referenceNo?: string
  dispatchedThrough?: string
  destination?: string
  vehicleNo?: string
  products: Product[]
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  totalGst: number
  roundOff: number
  grandTotal: number
  amountInWords: string
  taxAmountInWords?: string
  isInterState: boolean
  placeOfSupply: string
  customer: {
    name: string
    phone?: string
    address: string
    city: string
    state: string
    pincode: string
    gstNumber?: string
  }
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtSign(n: number) {
  const s = Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? '-' + s : s
}

function buildHsnSummary(products: Product[], isInterState: boolean): HsnSummaryRow[] {
  const map = new Map<string, HsnSummaryRow>()

  for (const item of products) {
    const existing = map.get(item.hsn) || {
      hsn: item.hsn,
      taxableValue: 0,
      cgstRate: isInterState ? 0 : item.gstRate / 2,
      cgstAmount: 0,
      sgstRate: isInterState ? 0 : item.gstRate / 2,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
    }

    existing.taxableValue += item.taxableValue
    existing.cgstAmount += item.cgst
    existing.sgstAmount += item.sgst
    existing.igstAmount += item.igst
    existing.totalTax += isInterState ? item.igst : item.cgst + item.sgst
    map.set(item.hsn, existing)
  }

  return Array.from(map.values())
}

function ProductThumb({ name, image }: { name: string; image?: string | null }) {
  const src = image || getProductImagePath(name)
  if (!src) return null

  return (
    <Image
      src={src}
      alt={name}
      width={28}
      height={28}
      className="inv-prod-img"
      unoptimized
    />
  )
}

export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const p = data
  const company = INVOICE_COMPANY
  const hsnSummary = buildHsnSummary(p.products, p.isInterState)
  const totalQty = p.products.reduce((sum, item) => sum + item.quantity, 0)
  const qtyUnit = p.products[0]?.per || 'DOZ'
  const gstRate = p.products[0]?.gstRate || 5

  return (
    <div className="invoice-wrap">
      <style>{`
        .invoice-wrap {
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
        }
        .inv-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff;
          padding: 4mm 5mm 6mm;
          box-sizing: border-box;
          font-size: 8px;
          line-height: 1.25;
        }
        .inv-title-row {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 3px;
        }
        .inv-title-row .title {
          font-size: 13px;
          font-weight: 700;
          text-decoration: underline;
        }
        .inv-title-row .copy {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 7px;
          font-weight: 600;
        }
        .irn-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border: 1px solid #000;
          margin-bottom: 4px;
        }
        .irn-row .irn-left {
          flex: 1;
          padding: 2px 4px;
          font-size: 6.5px;
          display: flex;
          flex-wrap: wrap;
          gap: 2px 8px;
        }
        .irn-row .irn-left b { font-weight: 700; }
        .irn-row .qr {
          width: 58px;
          height: 58px;
          border-left: 1px solid #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          text-align: center;
          flex-shrink: 0;
        }
        .top-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          border: 1px solid #000;
          margin-bottom: 4px;
        }
        .seller-block {
          border-right: 1px solid #000;
          padding: 3px 4px;
        }
        .seller-block .head {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 2px;
        }
        .seller-block .logo {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
        .seller-block .nm {
          font-size: 11px;
          font-weight: 700;
        }
        .seller-block .line { font-size: 7px; margin-bottom: 1px; }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr;
        }
        .meta-grid .row {
          display: grid;
          grid-template-columns: 92px 1fr;
          border-bottom: 1px solid #000;
          min-height: 14px;
        }
        .meta-grid .row:last-child { border-bottom: none; }
        .meta-grid .k {
          border-right: 1px solid #000;
          padding: 1px 3px;
          font-weight: 700;
          font-size: 6.5px;
          background: #fff;
        }
        .meta-grid .v {
          padding: 1px 3px;
          font-size: 7px;
        }
        .buyer-block {
          border: 1px solid #000;
          border-top: none;
          margin-bottom: 4px;
          padding: 2px 4px;
        }
        .buyer-block .lbl {
          font-weight: 700;
          font-size: 7px;
          margin-bottom: 1px;
        }
        .buyer-block .nm { font-weight: 700; font-size: 8px; }
        .buyer-block .line { font-size: 7px; }
        table.items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 0;
          font-size: 7px;
        }
        table.items th,
        table.items td {
          border: 1px solid #000;
          padding: 2px 3px;
          vertical-align: middle;
        }
        table.items th {
          font-weight: 700;
          text-align: center;
          font-size: 6.5px;
          background: #fff;
        }
        table.items td.c { text-align: center; }
        table.items td.r { text-align: right; }
        table.items td.l { text-align: left; }
        .desc-cell {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .inv-prod-img {
          width: 24px !important;
          height: 24px !important;
          object-fit: contain;
          border: 1px solid #ddd;
          background: #fff;
          flex-shrink: 0;
        }
        .totals-wrap {
          border: 1px solid #000;
          border-top: none;
        }
        .totals-wrap .row {
          display: flex;
          justify-content: space-between;
          padding: 1px 4px;
          font-size: 7px;
          border-bottom: 1px solid #000;
        }
        .totals-wrap .row:last-child { border-bottom: none; }
        .totals-wrap .row.bold { font-weight: 700; font-size: 8px; }
        .totals-wrap .row.grand {
          font-weight: 700;
          font-size: 9px;
          justify-content: flex-end;
          gap: 20px;
        }
        .words-row {
          border: 1px solid #000;
          border-top: none;
          padding: 3px 4px;
          font-size: 7px;
        }
        .words-row b { font-weight: 700; }
        table.hsn-sum {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 6.5px;
        }
        table.hsn-sum th,
        table.hsn-sum td {
          border: 1px solid #000;
          padding: 2px 3px;
          text-align: center;
        }
        table.hsn-sum th { font-weight: 700; }
        table.hsn-sum td.r { text-align: right; }
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          margin-top: 4px;
        }
        .footer-grid .box {
          border: 1px solid #000;
          padding: 3px 4px;
          font-size: 6.5px;
        }
        .footer-grid .box .lbl {
          font-weight: 700;
          font-size: 7px;
          margin-bottom: 2px;
        }
        .sign-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 8px;
          padding-top: 4px;
        }
        .sign-row .stamp {
          width: 70px;
          height: 70px;
          border: 1px dashed #666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          text-align: center;
          color: #444;
        }
        .sign-row .sig {
          text-align: right;
          font-size: 7px;
        }
        .sign-row .sig .for { font-weight: 700; margin-bottom: 18px; }
        .sign-row .sig .ln {
          border-top: 1px solid #000;
          padding-top: 2px;
          min-width: 120px;
        }
        .computer-note {
          text-align: center;
          font-size: 6.5px;
          margin-top: 4px;
          font-style: italic;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
          .inv-page { width: 100%; min-height: 100vh; padding: 4mm 5mm 6mm; margin: 0; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <div className="inv-page">
        <div className="inv-title-row">
          <div className="title">Tax Invoice</div>
          <div className="copy">(ORIGINAL FOR RECIPIENT)</div>
        </div>

        <div className="irn-row">
          <div className="irn-left">
            <span><b>IRN :</b> {p.irn || '—'}</span>
            <span><b>Ack No. :</b> {p.ackNo || '—'}</span>
            <span><b>Ack Date :</b> {p.ackDate || p.invoiceDate}</span>
          </div>
          <div className="qr">e-Invoice<br />QR Code</div>
        </div>

        <div className="top-grid">
          <div className="seller-block">
            <div className="head">
              <Image src={company.logo} alt="Logo" width={22} height={22} className="logo" unoptimized />
              <div className="nm">{company.name}</div>
            </div>
            <div className="line">{company.address}</div>
            <div className="line">{company.delhiOffice}</div>
            <div className="line"><b>GSTIN/UIN :</b> {company.gstin}</div>
            <div className="line"><b>State Name :</b> {company.state}, Code : {company.stateCode}</div>
            <div className="line"><b>E-Mail :</b> {company.email}</div>
            <div className="line">{company.website}</div>
          </div>

          <div className="meta-grid">
            <div className="row"><div className="k">Invoice No.</div><div className="v">{p.invoiceNo}</div></div>
            <div className="row"><div className="k">Dated</div><div className="v">{p.invoiceDate}</div></div>
            <div className="row"><div className="k">Delivery Note</div><div className="v">{p.deliveryNote || '—'}</div></div>
            <div className="row"><div className="k">Mode/Terms of Payment</div><div className="v">{p.paymentTerms || '—'}</div></div>
            <div className="row"><div className="k">Reference No. & Date.</div><div className="v">{p.referenceNo || '—'}</div></div>
            <div className="row"><div className="k">Dispatched through</div><div className="v">{p.dispatchedThrough || '—'}</div></div>
            <div className="row"><div className="k">Destination</div><div className="v">{p.destination || p.customer.city || '—'}</div></div>
            <div className="row"><div className="k">Motor Vehicle No.</div><div className="v">{p.vehicleNo || '—'}</div></div>
          </div>
        </div>

        <div className="buyer-block">
          <div className="lbl">Buyer (Bill to)</div>
          <div className="nm">{p.customer.name}</div>
          <div className="line">
            {p.customer.address}{p.customer.address && p.customer.city ? ', ' : ''}{p.customer.city}
            {p.customer.pincode ? ` - ${p.customer.pincode}` : ''}
          </div>
          {p.customer.gstNumber && <div className="line"><b>GSTIN/UIN :</b> {p.customer.gstNumber}</div>}
          <div className="line"><b>State Name :</b> {p.customer.state}, Code : 09</div>
          <div className="line"><b>Place of Supply :</b> {p.placeOfSupply}</div>
        </div>

        <table className="items">
          <thead>
            <tr>
              <th style={{ width: '4%' }}>Sl<br />No.</th>
              <th style={{ width: '28%' }}>Description of Goods</th>
              <th style={{ width: '10%' }}>HSN/SAC</th>
              <th style={{ width: '10%' }}>Quantity</th>
              <th style={{ width: '10%' }}>Rate</th>
              <th style={{ width: '5%' }}>per</th>
              <th style={{ width: '7%' }}>Disc. %</th>
              <th style={{ width: '12%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {p.products.length === 0 ? (
              <tr><td colSpan={8} className="c" style={{ padding: 8, color: '#999' }}>No items</td></tr>
            ) : (
              p.products.map((item) => (
                <tr key={item.sl}>
                  <td className="c">{item.sl}</td>
                  <td className="l">
                    <div className="desc-cell">
                      <ProductThumb name={item.description} image={item.image} />
                      <span>{item.description}</span>
                    </div>
                  </td>
                  <td className="c">{item.hsn}</td>
                  <td className="c">{fmt(item.quantity)} {item.per}</td>
                  <td className="r">{fmt(item.rate)}</td>
                  <td className="c">{item.per}</td>
                  <td className="r">{item.discount} %</td>
                  <td className="r">{fmt(item.amount)}</td>
                </tr>
              ))
            )}
            {p.products.length > 0 && (
              <tr>
                <td colSpan={3} className="r" style={{ fontWeight: 700 }}>Total</td>
                <td className="c" style={{ fontWeight: 700 }}>{fmt(totalQty)} {qtyUnit}</td>
                <td colSpan={3} />
                <td className="r" style={{ fontWeight: 700 }}>{fmt(p.subtotal)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="totals-wrap">
          {p.isInterState ? (
            <div className="row"><span>IGST @ {gstRate}%</span><span>{fmt(p.igst)}</span></div>
          ) : (
            <>
              <div className="row"><span>CGST @ {gstRate / 2}%</span><span>{fmt(p.cgst)}</span></div>
              <div className="row"><span>SGST @ {gstRate / 2}%</span><span>{fmt(p.sgst)}</span></div>
            </>
          )}
          <div className="row"><span>Round Off</span><span>{fmtSign(p.roundOff)}</span></div>
          <div className="row grand"><span>Total</span><span>₹ {fmt(p.grandTotal)}</span></div>
        </div>

        <div className="words-row">
          <b>Amount Chargeable (in words)</b><br />
          INR {p.amountInWords}
        </div>

        <table className="hsn-sum">
          <thead>
            <tr>
              <th rowSpan={2}>HSN/SAC</th>
              <th rowSpan={2}>Taxable<br />Value</th>
              {p.isInterState ? (
                <th colSpan={2}>Integrated Tax</th>
              ) : (
                <>
                  <th colSpan={2}>Central Tax</th>
                  <th colSpan={2}>State Tax</th>
                </>
              )}
              <th rowSpan={2}>Total<br />Tax Amount</th>
            </tr>
            <tr>
              {p.isInterState ? (
                <>
                  <th>Rate</th>
                  <th>Amount</th>
                </>
              ) : (
                <>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {hsnSummary.length === 0 ? (
              <tr><td colSpan={p.isInterState ? 5 : 7}>—</td></tr>
            ) : (
              hsnSummary.map((row) => (
                <tr key={row.hsn}>
                  <td>{row.hsn}</td>
                  <td className="r">{fmt(row.taxableValue)}</td>
                  {p.isInterState ? (
                    <>
                      <td>{row.cgstRate + row.sgstRate}%</td>
                      <td className="r">{fmt(row.igstAmount)}</td>
                    </>
                  ) : (
                    <>
                      <td>{row.cgstRate}%</td>
                      <td className="r">{fmt(row.cgstAmount)}</td>
                      <td>{row.sgstRate}%</td>
                      <td className="r">{fmt(row.sgstAmount)}</td>
                    </>
                  )}
                  <td className="r">{fmt(row.totalTax)}</td>
                </tr>
              ))
            )}
            {hsnSummary.length > 0 && (
              <tr style={{ fontWeight: 700 }}>
                <td>Total</td>
                <td className="r">{fmt(hsnSummary.reduce((s, r) => s + r.taxableValue, 0))}</td>
                {p.isInterState ? (
                  <>
                    <td />
                    <td className="r">{fmt(p.igst)}</td>
                  </>
                ) : (
                  <>
                    <td />
                    <td className="r">{fmt(p.cgst)}</td>
                    <td />
                    <td className="r">{fmt(p.sgst)}</td>
                  </>
                )}
                <td className="r">{fmt(p.totalGst)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {p.taxAmountInWords && (
          <div className="words-row" style={{ marginTop: 4 }}>
            <b>Tax Amount (in words) :</b> INR {p.taxAmountInWords}
          </div>
        )}

        <div className="footer-grid">
          <div className="box">
            <div className="lbl">Company&apos;s Bank Details</div>
            <div><b>Bank Name</b> : {company.bank.name}</div>
            <div><b>A/c No.</b> : {company.bank.accountNo}</div>
            <div><b>Branch & IFS Code :</b> {company.bank.branch} & {company.bank.ifsc}</div>
          </div>
          <div className="box">
            <div className="lbl">Declaration</div>
            <div>
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
              Goods once sold will not be taken back. Interest @ 18% p.a. will be charged if payment is not made within the stipulated period.
            </div>
          </div>
        </div>

        <div className="sign-row">
          <div className="stamp">Company<br />Stamp</div>
          <div className="sig">
            <div className="for">for {company.name}</div>
            <div className="ln">Authorised Signatory</div>
          </div>
        </div>

        <div className="computer-note">This is a Computer Generated Invoice</div>
      </div>
    </div>
  )
}
