import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}

export async function generateInvoicePDF(invoice: InvoiceData): Promise<void> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let y = 15;

  // Load logo
  let logoBase64 = "";
  try {
    const img = await loadImage("/products/logo.png");
    logoBase64 = imageToBase64(img);
  } catch {
    // Logo not available, skip
  }

  // ─── HEADER: Logo + Company Info ───
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, y, 18, 18);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(233, 30, 99);
    doc.text("DevTraders", margin + 22, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Riya Touch Wholesale", margin + 22, y + 13);
    doc.text("Premium Innerwear & Lingerie", margin + 22, y + 17);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(233, 30, 99);
    doc.text("DevTraders", margin, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Riya Touch Wholesale", margin, y + 13);
  }

  // Invoice badge top-right
  const badgeX = pageWidth - margin;
  doc.setFillColor(233, 30, 99);
  doc.roundedRect(badgeX - 38, y, 38, 12, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", badgeX - 19, y + 7.5, { align: "center" });

  y += 26;

  // ─── DIVIDER ───
  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // ─── INVOICE META ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  doc.text("Invoice No:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber, margin + 28, y);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin + 90, y);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
  doc.text(dateStr, margin + 103, y);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin + 140, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.status.toUpperCase(), margin + 155, y);

  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Place of Supply:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.placeOfSupply || "N/A", margin + 32, y);

  doc.setFont("helvetica", "bold");
  doc.text("Supply Type:", margin + 90, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.isInterState ? "Inter-State" : "Intra-State", margin + 113, y);

  y += 10;

  // ─── BILL TO / SHIP TO ───
  // Bill To box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, contentWidth / 2 - 3, 30, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(233, 30, 99);
  doc.text("BILL TO", margin + 4, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(invoice.customer.name, margin + 4, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(invoice.customer.phone, margin + 4, y + 17);
  doc.text(invoice.customer.address, margin + 4, y + 22);
  doc.text(`${invoice.customer.city} - ${invoice.customer.pincode}`, margin + 4, y + 27);

  if (invoice.customer.gstNumber) {
    doc.setFont("helvetica", "bold");
    doc.text("GSTIN:", margin + 4, y + 32);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.customer.gstNumber, margin + 18, y + 32);
  }

  // Company info box (right)
  const rightBoxX = margin + contentWidth / 2 + 3;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(rightBoxX, y, contentWidth / 2 - 3, 30, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(233, 30, 99);
  doc.text("FROM", rightBoxX + 4, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("DevTraders (Riya Touch)", rightBoxX + 4, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Plot 123, Industrial Area", rightBoxX + 4, y + 17);
  doc.text("Rajasthan, India - 302001", rightBoxX + 4, y + 22);
  doc.text("GSTIN: 08XXXXX1234X1Z5", rightBoxX + 4, y + 27);
  doc.text("Ph: +91 9205778531", rightBoxX + 4, y + 32);

  y += 38;

  // ─── ITEMS TABLE ───
  const isInterState = invoice.isInterState;
  const tableHeaders = [
    [
      { content: "#", styles: { halign: "center" as const } },
      { content: "Item Description", styles: { halign: "left" as const } },
      { content: "HSN", styles: { halign: "center" as const } },
      { content: "Qty", styles: { halign: "center" as const } },
      { content: "Rate", styles: { halign: "right" as const } },
      { content: "Disc.", styles: { halign: "right" as const } },
      { content: "Taxable", styles: { halign: "right" as const } },
      { content: isInterState ? "IGST" : "GST", styles: { halign: "right" as const } },
      { content: "Amount", styles: { halign: "right" as const } },
    ],
  ];

  const tableBody = invoice.items.map((item, i) => [
    { content: String(i + 1), styles: { halign: "center" as const } },
    { content: item.name, styles: { halign: "left" as const } },
    { content: item.hsnCode || "-", styles: { halign: "center" as const } },
    { content: String(item.quantity), styles: { halign: "center" as const } },
    { content: `₹${item.unitPrice.toLocaleString("en-IN")}`, styles: { halign: "right" as const } },
    { content: item.discount > 0 ? `-₹${item.discount.toLocaleString("en-IN")}` : "-", styles: { halign: "right" as const } },
    { content: `₹${item.taxableAmount.toLocaleString("en-IN")}`, styles: { halign: "right" as const } },
    {
      content: isInterState
        ? `₹${item.igst.toLocaleString("en-IN")}`
        : `${item.gstRate}%`,
      styles: { halign: "right" as const },
    },
    { content: `₹${item.totalAmount.toLocaleString("en-IN")}`, styles: { halign: "right" as const } },
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHeaders,
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [40, 40, 40],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [233, 30, 99],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { cellWidth: 8 },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── TOTALS SECTION ───
  const totalsX = margin + contentWidth - 75;

  const drawTotalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(bold ? 40 : 80, bold ? 40 : 80, bold ? 40 : 80);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 5.5;
  };

  drawTotalRow("Subtotal:", `₹${invoice.subtotal.toLocaleString("en-IN")}`);
  if (invoice.discount > 0) {
    drawTotalRow("Discount:", `-₹${invoice.discount.toLocaleString("en-IN")}`);
  }
  drawTotalRow("Taxable Amount:", `₹${invoice.taxableAmount.toLocaleString("en-IN")}`);

  if (isInterState) {
    drawTotalRow(`IGST:`, `₹${invoice.totalIGST.toLocaleString("en-IN")}`);
  } else {
    drawTotalRow("CGST:", `₹${invoice.totalCGST.toLocaleString("en-IN")}`);
    drawTotalRow("SGST:", `₹${invoice.totalSGST.toLocaleString("en-IN")}`);
  }
  drawTotalRow("Total GST:", `₹${invoice.totalGST.toLocaleString("en-IN")}`);

  if (invoice.shippingCharges > 0) {
    drawTotalRow("Shipping:", `₹${invoice.shippingCharges.toLocaleString("en-IN")}`);
  }

  // Total line
  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(233, 30, 99);
  doc.text("TOTAL:", totalsX, y);
  doc.text(`₹${invoice.totalAmount.toLocaleString("en-IN")}`, pageWidth - margin, y, { align: "right" });
  y += 8;

  // ─── AMOUNT IN WORDS ───
  doc.setFillColor(255, 243, 247);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(233, 30, 99);
  doc.text("AMOUNT IN WORDS:", margin + 4, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text(invoice.amountInWords, margin + 4, y + 8.5, { maxWidth: contentWidth - 8 });
  y += 16;

  // ─── NOTES ───
  if (invoice.status === "paid") {
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(46, 125, 50);
    doc.text("✓ Payment Received", margin + 4, y + 5.5);
    y += 12;
  }

  // ─── BANK DETAILS ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("BANK DETAILS", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Bank: State Bank of India", margin, y);
  doc.text("A/C No: XXXXXXXXXXXX1234", margin + 60, y);
  doc.text("IFSC: SBIN0001234", margin + 120, y);
  y += 4.5;
  doc.text("Branch: Industrial Area Branch", margin, y);
  doc.text("A/C Type: Current Account", margin + 60, y);
  y += 10;

  // ─── FOOTER ───
  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text("This is a computer-generated invoice.", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("For queries, contact: sales@devtraders.com | +91 9205778531", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("DevTraders | www.dev-traders.vercel.app", pageWidth / 2, y, { align: "center" });

  // ─── SIGNATURE ───
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Authorized Signatory", pageWidth - margin, y + 8, { align: "right" });
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 30, y + 6, pageWidth - margin, y + 6);

  // Save
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}
