'use client'

interface Product {
  sl: number
  description: string
  hsn: string
  quantity: number
  rate: number
  per: string
  discount: number
  amount: number
  taxableValue: number
  cgst: number
  sgst: number
}

interface InvoiceData {
  invoiceNo: string
  invoiceDate: string
  ewayBillNo: string
  deliveryNote: string
  paymentTerms: string
  referenceNo: string
  buyerOrderNo: string
  dispatchNo: string
  vehicleNo: string
  products: Product[]
  subtotal: number
  cgst: number
  sgst: number
  roundOff: number
  grandTotal: number
  amountInWords: string
}

function fmt(n: number) {
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtSign(n: number) {
  const s = Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? '₹ -' + s : '₹ ' + s
}

export default function InvoiceTemplate({ data }: { data: InvoiceData }) {
  const p = data

  return (
    <div className="invoice-wrap">
      <style>{`
        .invoice-wrap {
          font-family: 'Noto Sans', 'DejaVu Sans', Arial, Helvetica, sans-serif;
          color: #000;
        }
        .inv-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #fff;
          padding: 7mm 5mm;
          box-sizing: border-box;
          font-size: 8.5px;
          line-height: 1.35;
        }
        .inv-hdr {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000;
          padding-bottom: 5px;
          margin-bottom: 5px;
        }
        .inv-hdr .co .nm {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .inv-hdr .co .g {
          font-weight: 600;
        }
        .inv-hdr .ts {
          text-align: right;
        }
        .inv-hdr .ts .ti {
          font-size: 15px;
          font-weight: 700;
          border: 2px solid #000;
          padding: 1px 10px;
          display: inline-block;
        }
        .inv-hdr .ts .or {
          font-size: 8px;
          font-weight: 600;
          margin-top: 2px;
        }
        .irn-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }
        .irn-bar .irn {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 3px 10px;
          font-size: 7px;
          border: 1px solid #000;
          padding: 2px 5px;
          background: #fafafa;
          margin-right: 5px;
        }
        .irn-bar .irn .it {
          display: flex;
          gap: 2px;
        }
        .irn-bar .irn .it .k {
          font-weight: 700;
        }
        .irn-bar .qr {
          border: 1px solid #000;
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6px;
          text-align: center;
          color: #555;
          flex-shrink: 0;
        }
        .det-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          margin-bottom: 5px;
        }
        .det-grid .r {
          display: flex;
          border: 1px solid #000;
        }
        .det-grid .r + .r {
          border-top: none;
        }
        .det-grid .r .k {
          width: 105px;
          font-weight: 700;
          font-size: 7.5px;
          padding: 2px 5px;
          border-right: 1px solid #000;
          background: #f5f5f5;
          flex-shrink: 0;
        }
        .det-grid .r .v {
          flex: 1;
          font-size: 7.5px;
          padding: 2px 5px;
        }
        .det-grid .col {
          display: flex;
          flex-direction: column;
          border: 1px solid #000;
        }
        .det-grid .col .r:first-child {
          border-top: none;
        }
        .bs {
          display: flex;
          gap: 5px;
          margin-bottom: 5px;
        }
        .bs .blk {
          border: 1px solid #000;
          flex: 1;
          padding: 3px 5px;
          min-height: 60px;
        }
        .bs .blk .lbl {
          font-weight: 700;
          font-size: 7.5px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 3px;
          text-transform: uppercase;
        }
        .bs .blk .ct {
          font-size: 7.5px;
          line-height: 1.5;
        }
        table.pd {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
          font-size: 7.5px;
        }
        table.pd th {
          border: 1px solid #000;
          padding: 3px 2px;
          font-weight: 700;
          text-align: center;
          background: #f5f5f5;
          font-size: 7px;
        }
        table.pd td {
          border: 1px solid #000;
          padding: 2px 3px;
          text-align: center;
          font-size: 7.5px;
        }
        table.pd td.l { text-align: left; }
        table.pd td.r { text-align: right; }
        .tsx {
          display: flex;
          gap: 5px;
          margin-bottom: 5px;
        }
        .tsx .tl { flex: 1; }
        .tsx .tr { width: 190px; }
        table.tt {
          width: 100%;
          border-collapse: collapse;
          font-size: 8px;
        }
        table.tt td {
          border: 1px solid #000;
          padding: 2px 6px;
        }
        table.tt td.k {
          font-weight: 600;
          background: #f5f5f5;
        }
        table.tt td.v { text-align: right; }
        table.tt td.tg {
          font-weight: 700;
          font-size: 10px;
        }
        .aw {
          border: 1px solid #000;
          padding: 4px 6px;
          margin-bottom: 0;
          font-size: 8px;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .aw .lb { font-weight: 700; }
        .aw .tx { font-weight: 600; font-size: 9px; }
        .bd {
          display: flex;
          gap: 5px;
          margin-bottom: 5px;
        }
        .bd .blk {
          border: 1px solid #000;
          padding: 3px 5px;
        }
        .bd .bnk { flex: 0 0 200px; }
        .bd .dec { flex: 1; }
        .bd .blk .lbl {
          font-weight: 700;
          font-size: 7.5px;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .bd .blk .ct {
          font-size: 7.5px;
          line-height: 1.6;
        }
        .ft {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 2px solid #000;
          padding-top: 5px;
        }
        .ft .stmp {
          text-align: center;
          font-size: 8px;
        }
        .ft .stmp .box {
          border: 1px dashed #000;
          width: 90px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 6.5px;
          color: #666;
          margin: 0 auto;
        }
        .ft .sig {
          text-align: right;
          font-size: 8px;
        }
        .ft .sig .ln {
          width: 130px;
          border-top: 1px solid #000;
          margin: 3px 0 2px auto;
          padding-top: 3px;
        }
        @media print {
          body { margin: 0; padding: 0; }
          .invoice-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; }
          .inv-page { width: 100%; min-height: 100vh; padding: 7mm 5mm; margin: 0; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      <div className="inv-page">
        {/* ─── Header ─── */}
        <div className="inv-hdr">
          <div className="co">
            <div className="nm">RIYA ENTERPRISES</div>
            <div>PLOT NO G-168, SECTOR D-1, P-3, TDS CITY, LONI,</div>
            <div>GHAZIABAD, UTTAR PRADESH - 201103</div>
            <div className="g">GSTIN: 09BZKPP9250K1ZL &nbsp;|&nbsp; State: Uttar Pradesh (Code 09)</div>
            <div>Email: RIYATOUCHUG@gmail.com &nbsp;|&nbsp; www.riyatouch.com</div>
          </div>
          <div className="ts">
            <div className="ti">TAX INVOICE</div>
            <div className="or">ORIGINAL FOR RECIPIENT</div>
          </div>
        </div>

        {/* ─── IRN + QR ─── */}
        <div className="irn-bar">
          <div className="irn">
            <span className="it"><span className="k">IRN:</span><span>642024c0e4b0cb1e2345abcd</span></span>
            <span className="it"><span className="k">Ack No.:</span><span>1624024</span></span>
            <span className="it"><span className="k">Ack Date:</span><span>2024-11-20</span></span>
            <span className="it"><span className="k">Doc Type:</span><span>INV</span></span>
          </div>
          <div className="qr">e-Invoice<br />QR Code</div>
        </div>

        {/* ─── Invoice Details ─── */}
        <div className="det-grid">
          <div className="col">
            <div className="r"><span className="k">Invoice No.</span><span className="v">{p.invoiceNo}</span></div>
            <div className="r"><span className="k">e-Way Bill No.</span><span className="v">{p.ewayBillNo}</span></div>
            <div className="r"><span className="k">Delivery Note</span><span className="v">{p.deliveryNote}</span></div>
            <div className="r"><span className="k">Payment Terms</span><span className="v">{p.paymentTerms}</span></div>
            <div className="r"><span className="k">Reference No.</span><span className="v">{p.referenceNo}</span></div>
          </div>
          <div className="col">
            <div className="r"><span className="k">Invoice Date</span><span className="v">{p.invoiceDate}</span></div>
            <div className="r"><span className="k">Buyer&rsquo;s Order No.</span><span className="v">{p.buyerOrderNo}</span></div>
            <div className="r"><span className="k">Dispatch Doc No.</span><span className="v">{p.dispatchNo}</span></div>
            <div className="r"><span className="k">Vehicle Number</span><span className="v">{p.vehicleNo}</span></div>
            <div className="r"><span className="k">Terms of Delivery</span><span className="v">F.O.R. Destination</span></div>
          </div>
        </div>

        {/* ─── Buyer & Seller ─── */}
        <div className="bs">
          <div className="blk">
            <div className="lbl">Buyer (Consignee)</div>
            <div className="ct">
              <div style={{ fontWeight: 700, fontSize: 8.5 }}>DEV TRADERS</div>
              <div>BAHUPUR, PATTI, PRATAPGARH</div>
              <div>UTTAR PRADESH</div>
              <div><strong>GSTIN:</strong> 09AABCD1234E1Z5</div>
              <div><strong>State:</strong> Uttar Pradesh (Code 09)</div>
              <div><strong>Place of Supply:</strong> Uttar Pradesh</div>
            </div>
          </div>
          <div className="blk">
            <div className="lbl">Seller (Supplier)</div>
            <div className="ct">
              <div style={{ fontWeight: 700, fontSize: 8.5 }}>RIYA ENTERPRISES</div>
              <div>PLOT NO G-168, SECTOR D-1, P-3, TDS CITY, LONI,</div>
              <div>GHAZIABAD, UTTAR PRADESH - 201103</div>
              <div><strong>GSTIN:</strong> 09BZKPP9250K1ZL</div>
              <div><strong>State:</strong> Uttar Pradesh (Code 09)</div>
            </div>
          </div>
        </div>

        {/* ─── Products Table ─── */}
        <table className="pd">
          <thead>
            <tr>
              <th style={{ width: '4%' }}>Sl.<br/>No.</th>
              <th style={{ width: '26%' }}>Description of Goods</th>
              <th style={{ width: '10%' }}>HSN/SAC</th>
              <th style={{ width: '5%' }}>Qty</th>
              <th style={{ width: '9%' }}>Rate</th>
              <th style={{ width: '4%' }}>Per</th>
              <th style={{ width: '7%' }}>Disc.%</th>
              <th style={{ width: '11%' }}>Amount</th>
              <th style={{ width: '11%' }}>Taxable Val.</th>
              <th style={{ width: '7%' }}>CGST</th>
              <th style={{ width: '7%' }}>SGST</th>
            </tr>
          </thead>
          <tbody>
            {p.products.length === 0 ? (
              <tr><td colSpan={11} style={{ textAlign: 'center', padding: 10, color: '#999' }}>No items</td></tr>
            ) : p.products.map((item, i) => (
              <tr key={i}>
                <td>{item.sl}</td>
                <td className="l">{item.description}</td>
                <td>{item.hsn}</td>
                <td>{item.quantity}</td>
                <td className="r">{fmt(item.rate)}</td>
                <td>{item.per}</td>
                <td className="r">{item.discount}%</td>
                <td className="r">{fmt(item.amount)}</td>
                <td className="r">{fmt(item.taxableValue)}</td>
                <td className="r">{fmt(item.cgst)}</td>
                <td className="r">{fmt(item.sgst)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ─── Totals ─── */}
        <div className="tsx">
          <div className="tl">
            <div className="aw">
              <span className="lb">Amount Chargeable (in words):</span>
              <span className="tx">{p.amountInWords}</span>
            </div>
          </div>
          <div className="tr">
            <table className="tt">
              <tbody>
                <tr><td className="k">Subtotal</td><td className="v">{fmt(p.subtotal)}</td></tr>
                <tr><td className="k">CGST @ 9%</td><td className="v">{fmt(p.cgst)}</td></tr>
                <tr><td className="k">SGST @ 9%</td><td className="v">{fmt(p.sgst)}</td></tr>
                <tr><td className="k">Round Off</td><td className="v">{fmtSign(p.roundOff)}</td></tr>
                <tr><td className="k" style={{ fontSize: 10, fontWeight: 700 }}>Grand Total</td><td className="v tg">{fmt(p.grandTotal)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Tax Summary ─── */}
        <div style={{ marginBottom: 5 }}>
          <div style={{ fontWeight: 700, fontSize: 7.5, border: '1px solid #000', borderBottom: 'none', padding: '2px 5px', background: '#f5f5f5' }}>Tax Summary</div>
          <table className="pd" style={{ marginBottom: 0 }}>
            <thead>
              <tr>
                <th>HSN/SAC</th>
                <th>Taxable Value</th>
                <th>CGST Rate</th>
                <th>CGST Amt</th>
                <th>SGST Rate</th>
                <th>SGST Amt</th>
                <th>Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {p.products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 8, color: '#999' }}>No items</td></tr>
              ) : p.products.map((item, i) => (
                <tr key={i}>
                  <td>{item.hsn}</td>
                  <td className="r">{fmt(item.taxableValue)}</td>
                  <td className="r">9%</td>
                  <td className="r">{fmt(item.cgst)}</td>
                  <td className="r">9%</td>
                  <td className="r">{fmt(item.sgst)}</td>
                  <td className="r">{fmt(item.cgst + item.sgst)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ─── Bank & Declaration ─── */}
        <div className="bd">
          <div className="blk bnk">
            <div className="lbl">Bank Details</div>
            <div className="ct">
              <strong>Bank:</strong> State Bank of India<br />
              <strong>A/C No.:</strong> 12345678901234<br />
              <strong>IFSC:</strong> SBIN0001234<br />
              <strong>Branch:</strong> Loni, Ghaziabad<br />
              <strong>A/C Type:</strong> Current Account
            </div>
          </div>
          <div className="blk dec">
            <div className="lbl">Declaration</div>
            <div className="ct">
              We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. This is a system-generated invoice and does not require a physical signature.
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="ft">
          <div className="stmp">
            <div className="box">Company Stamp</div>
            <div style={{ marginTop: 1, fontWeight: 600, fontSize: 7.5 }}>RIYA ENTERPRISES</div>
          </div>
          <div className="sig">
            <div style={{ fontWeight: 600, marginBottom: 1 }}>for RIYA ENTERPRISES</div>
            <div className="ln">Authorized Signatory</div>
          </div>
        </div>

      </div>
    </div>
  )
}
