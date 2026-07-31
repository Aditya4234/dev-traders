import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { INVOICE_COMPANY } from "@/lib/invoice-config";
import { getProductImagePath } from "@/lib/product-image-map";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function imageToBase64(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

interface InvoiceItem {
  name: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  shippingCharges: number;
  totalAmount: number;
  amountInWords: string;
  status: string;
  placeOfSupply: string;
  isInterState: boolean;
  deliveryNote?: string;
  paymentTerms?: string;
  referenceNo?: string;
  dispatchedThrough?: string;
  destination?: string;
  vehicleNo?: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function drawBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);
  doc.rect(x, y, w, h);
}

function drawMetaRow(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string,
  rowH = 5.5
) {
  const labelW = 38;
  doc.rect(x, y, w, rowH);
  doc.line(x + labelW, y, x + labelW, y + rowH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text(label, x + 1.5, y + 3.6);
  doc.setFont("helvetica", "normal");
  doc.text(value || "—", x + labelW + 1.5, y + 3.6);
  return rowH;
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;
  const company = INVOICE_COMPANY;

  const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  const productImages = new Map<string, string>();
  try {
    const logoImg = await loadImage(company.logo);
    productImages.set("__logo__", imageToBase64(logoImg));
  } catch {
    // logo optional
  }

  for (const item of invoice.items) {
    const path = getProductImagePath(item.name);
    if (!path || productImages.has(path)) continue;
    try {
      const img = await loadImage(path);
      productImages.set(path, imageToBase64(img));
    } catch {
      // skip missing image
    }
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Tax Invoice", pageWidth / 2, y, { align: "center" });
  doc.setFontSize(6.5);
  doc.text("(ORIGINAL FOR RECIPIENT)", pageWidth - margin, y, { align: "right" });
  y += 5;

  // IRN row
  const irnH = 16;
  drawBox(doc, margin, y, contentWidth, irnH);
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.text("IRN :", margin + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.text("—", margin + 10, y + 4);
  doc.setFont("helvetica", "bold");
  doc.text("Ack No. :", margin + 2, y + 8);
  doc.setFont("helvetica", "normal");
  doc.text("—", margin + 16, y + 8);
  doc.setFont("helvetica", "bold");
  doc.text("Ack Date :", margin + 2, y + 12);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, margin + 18, y + 12);
  const qrW = 16;
  doc.line(pageWidth - margin - qrW, y, pageWidth - margin - qrW, y + irnH);
  doc.setFontSize(5.5);
  doc.text("e-Invoice", pageWidth - margin - qrW / 2, y + 6, { align: "center" });
  doc.text("QR Code", pageWidth - margin - qrW / 2, y + 10, { align: "center" });
  y += irnH;

  // Seller + meta grid
  const topH = 44;
  const leftW = contentWidth * 0.58;
  const rightW = contentWidth - leftW;
  drawBox(doc, margin, y, contentWidth, topH);
  doc.line(margin + leftW, y, margin + leftW, y + topH);

  if (productImages.has("__logo__")) {
    doc.addImage(productImages.get("__logo__")!, "PNG", margin + 2, y + 2, 8, 8);
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(company.name, margin + 12, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const sellerLines = [
    company.address,
    company.delhiOffice,
    `GSTIN/UIN : ${company.gstin}`,
    `State Name : ${company.state}, Code : ${company.stateCode}`,
    `E-Mail : ${company.email}`,
    company.website,
  ];
  let sy = y + 10;
  for (const line of sellerLines) {
    doc.text(line, margin + 2, sy);
    sy += 3.8;
  }

  const metaX = margin + leftW;
  const metaRows: [string, string][] = [
    ["Invoice No.", invoice.invoiceNumber || "—"],
    ["Dated", dateStr],
    ["Delivery Note", invoice.deliveryNote || "—"],
    ["Mode/Terms of Payment", invoice.paymentTerms || "—"],
    ["Reference No. & Date.", invoice.referenceNo || "—"],
    ["Dispatched through", invoice.dispatchedThrough || "—"],
    ["Destination", invoice.destination || invoice.customer.city || "—"],
    ["Motor Vehicle No.", invoice.vehicleNo || "—"],
  ];
  let my = y;
  const rowH = topH / metaRows.length;
  for (const [label, value] of metaRows) {
    drawMetaRow(doc, metaX, my, rightW, label, value, rowH);
    my += rowH;
  }
  y += topH;

  // Buyer
  const buyerH = 18;
  drawBox(doc, margin, y, contentWidth, buyerH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Buyer (Bill to)", margin + 2, y + 4);
  doc.setFontSize(8);
  doc.text(invoice.customer.name || "—", margin + 2, y + 8.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const buyerAddr = `${invoice.customer.address || ""}${invoice.customer.city ? `, ${invoice.customer.city}` : ""}${invoice.customer.pincode ? ` - ${invoice.customer.pincode}` : ""}`;
  doc.text(buyerAddr, margin + 2, y + 12);
  if (invoice.customer.gstNumber) {
    doc.text(`GSTIN/UIN : ${invoice.customer.gstNumber}`, margin + 2, y + 15.5);
  }
  doc.text(`State Name : ${invoice.customer.state || "—"}, Code : 09`, margin + 90, y + 15.5);
  y += buyerH + 1;

  // Products table
  const tableBody = invoice.items.map((item, i) => {
    const total = item.unitPrice * item.quantity;
    const discPct = total > 0 ? Math.round(((item.discount || 0) / total) * 100) : 0;
    return [
      String(i + 1),
      item.name,
      item.hsnCode,
      `${fmt(item.quantity)} DOZ`,
      fmt(item.unitPrice),
      "DOZ",
      `${discPct} %`,
      fmt(item.taxableAmount),
    ];
  });

  const totalQty = invoice.items.reduce((s, it) => s + it.quantity, 0);
  if (invoice.items.length > 0) {
    tableBody.push(["", "Total", "", `${fmt(totalQty)} DOZ`, "", "", "", fmt(invoice.subtotal)]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Sl No.", "Description of Goods", "HSN/SAC", "Quantity", "Rate", "per", "Disc. %", "Amount"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.15,
      textColor: [0, 0, 0],
      minCellHeight: 8,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "center", cellWidth: 18 },
      4: { halign: "right", cellWidth: 16 },
      5: { halign: "center", cellWidth: 10 },
      6: { halign: "right", cellWidth: 12 },
      7: { halign: "right", cellWidth: 20 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1 && data.row.index < invoice.items.length) {
        data.cell.text = [];
      }
    },
    didDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 1) return;
      const rowIndex = data.row.index;
      if (rowIndex >= invoice.items.length) return;
      const item = invoice.items[rowIndex];
      const path = getProductImagePath(item.name);
      const imgData = path ? productImages.get(path) : undefined;
      if (!imgData) return;

      const pad = 1.5;
      const imgSize = 6;
      doc.addImage(imgData, "PNG", data.cell.x + pad, data.cell.y + pad, imgSize, imgSize);
      doc.setFontSize(6.5);
      doc.text(item.name, data.cell.x + pad + imgSize + 1.5, data.cell.y + 5);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY;

  const gstRate = invoice.items[0]?.gstRate || 5;
  const roundOff = Math.round(invoice.totalAmount) - invoice.totalAmount;
  const totalsW = 70;
  const totalsX = pageWidth - margin - totalsW;

  const totalRows: [string, string][] = invoice.isInterState
    ? [[`IGST @ ${gstRate}%`, fmt(invoice.totalIGST)]]
    : [
        [`CGST @ ${gstRate / 2}%`, fmt(invoice.totalCGST)],
        [`SGST @ ${gstRate / 2}%`, fmt(invoice.totalSGST)],
      ];
  totalRows.push(["Round Off", fmt(roundOff)]);
  totalRows.push(["Total", `₹ ${fmt(invoice.totalAmount)}`]);

  let ty = y;
  for (const [label, value] of totalRows) {
    drawBox(doc, totalsX, ty, totalsW, 5);
    doc.setFont("helvetica", label === "Total" ? "bold" : "normal");
    doc.setFontSize(label === "Total" ? 8 : 6.5);
    doc.text(label, totalsX + 2, ty + 3.5);
    doc.text(value, totalsX + totalsW - 2, ty + 3.5, { align: "right" });
    ty += 5;
  }
  y = ty + 2;

  // Amount in words
  drawBox(doc, margin, y, contentWidth, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Amount Chargeable (in words)", margin + 2, y + 3.5);
  doc.setFont("helvetica", "normal");
  doc.text(`INR ${invoice.amountInWords || "—"}`, margin + 2, y + 6.5);
  y += 10;

  // HSN summary
  const hsnMap = new Map<string, { taxable: number; cgst: number; sgst: number; igst: number; rate: number }>();
  for (const item of invoice.items) {
    const row = hsnMap.get(item.hsnCode) || { taxable: 0, cgst: 0, sgst: 0, igst: 0, rate: item.gstRate };
    row.taxable += item.taxableAmount;
    row.cgst += item.cgst;
    row.sgst += item.sgst;
    row.igst += item.igst;
    hsnMap.set(item.hsnCode, row);
  }

  const hsnBody = Array.from(hsnMap.entries()).map(([hsn, row]) =>
    invoice.isInterState
      ? [hsn, fmt(row.taxable), `${row.rate}%`, fmt(row.igst), fmt(row.igst)]
      : [
          hsn,
          fmt(row.taxable),
          `${row.rate / 2}%`,
          fmt(row.cgst),
          `${row.rate / 2}%`,
          fmt(row.sgst),
          fmt(row.cgst + row.sgst),
        ]
  );

  autoTable(doc, {
    startY: y,
    head: invoice.isInterState
      ? [["HSN/SAC", "Taxable Value", "Rate", "IGST Amount", "Total Tax"]]
      : [["HSN/SAC", "Taxable Value", "CGST Rate", "CGST Amt", "SGST Rate", "SGST Amt", "Total Tax"]],
    body: hsnBody,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 6, cellPadding: 1.2, lineColor: [0, 0, 0], lineWidth: 0.15 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", halign: "center" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 4;

  // Footer boxes
  const footH = 22;
  const footLeftW = contentWidth * 0.42;
  drawBox(doc, margin, y, footLeftW, footH);
  drawBox(doc, margin + footLeftW + 2, y, contentWidth - footLeftW - 2, footH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("Company's Bank Details", margin + 2, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(`Bank Name : ${company.bank.name}`, margin + 2, y + 8);
  doc.text(`A/c No. : ${company.bank.accountNo}`, margin + 2, y + 11.5);
  doc.text(`Branch & IFS Code : ${company.bank.branch} & ${company.bank.ifsc}`, margin + 2, y + 15);

  doc.setFont("helvetica", "bold");
  doc.text("Declaration", margin + footLeftW + 4, y + 4);
  doc.setFont("helvetica", "normal");
  const decl = doc.splitTextToSize(
    "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. Goods once sold will not be taken back.",
    contentWidth - footLeftW - 6
  );
  doc.text(decl, margin + footLeftW + 4, y + 8);
  y += footH + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`for ${company.name}`, pageWidth - margin, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.line(pageWidth - margin - 35, y + 10, pageWidth - margin, y + 10);
  doc.text("Authorised Signatory", pageWidth - margin, y + 14, { align: "right" });

  doc.setFontSize(6);
  doc.setFont("helvetica", "italic");
  doc.text("This is a Computer Generated Invoice", pageWidth / 2, y + 20, { align: "center" });

  doc.save(`Invoice-${invoice.invoiceNumber || "draft"}.pdf`);
}
