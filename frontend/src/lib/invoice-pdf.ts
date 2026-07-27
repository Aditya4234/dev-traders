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

function splitTextIntoLines(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth);
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
  const pageHeight = doc.internal.pageSize.getHeight();
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
    doc.setFontSize(18);
    doc.setTextColor(233, 30, 99);
    doc.text("DevTraders", margin + 22, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Riya Touch Wholesale", margin + 22, y + 12);
    doc.text("Premium Innerwear & Lingerie", margin + 22, y + 16);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(233, 30, 99);
    doc.text("DevTraders", margin, y + 7);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Riya Touch Wholesale", margin, y + 12);
  }

  // Invoice badge top-right
  const badgeX = pageWidth - margin;
  doc.setFillColor(233, 30, 99);
  doc.roundedRect(badgeX - 36, y, 36, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", badgeX - 18, y + 7, { align: "center" });

  y += 24;

  // ─── DIVIDER ───
  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // ─── INVOICE META ───
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  doc.text("Invoice No:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNumber || "-", margin + 26, y);

  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin + 85, y);
  doc.setFont("helvetica", "normal");
  const dateStr = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.text(dateStr, margin + 97, y);

  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin + 135, y);
  doc.setFont("helvetica", "normal");
  doc.text((invoice.status || "draft").toUpperCase(), margin + 150, y);

  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Place of Supply:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.placeOfSupply || "N/A", margin + 30, y);

  doc.setFont("helvetica", "bold");
  doc.text("Supply Type:", margin + 85, y);
  doc.setFont("helvetica", "normal");
  doc.text(
    invoice.isInterState ? "Inter-State" : "Intra-State",
    margin + 108,
    y
  );

  y += 9;

  // ─── BILL TO / FROM ───
  const halfBox = contentWidth / 2 - 2;

  // Bill To box
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(margin, y, halfBox, 32, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(233, 30, 99);
  doc.text("BILL TO", margin + 4, y + 5);

  // Customer name — truncate if too long
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  const custNameLines = splitTextIntoLines(
    doc,
    invoice.customer.name || "N/A",
    halfBox - 8,
    9
  );
  doc.text(custNameLines[0], margin + 4, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  const phoneText = invoice.customer.phone || "";
  if (phoneText) {
    doc.text(phoneText, margin + 4, y + 17);
  }

  // Address — wrap long text
  const addrText = invoice.customer.address || "";
  const addrLines = splitTextIntoLines(doc, addrText, halfBox - 8, 7.5);
  let addrY = y + 22;
  for (const line of addrLines.slice(0, 2)) {
    doc.text(line, margin + 4, addrY);
    addrY += 4;
  }

  const cityLine = `${invoice.customer.city || ""} - ${
    invoice.customer.pincode || ""
  }`.trim();
  if (cityLine !== "-") {
    doc.text(cityLine, margin + 4, addrY > y + 30 ? y + 30 : addrY);
  }

  if (invoice.customer.gstNumber) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("GSTIN:", margin + 4, y + 31);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.customer.gstNumber, margin + 17, y + 31);
  }

  // From box (right)
  const rightBoxX = margin + halfBox + 4;
  doc.setFillColor(248, 248, 248);
  doc.roundedRect(rightBoxX, y, halfBox, 32, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(233, 30, 99);
  doc.text("FROM", rightBoxX + 4, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("DevTraders (Riya Touch)", rightBoxX + 4, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text("Plot 123, Industrial Area", rightBoxX + 4, y + 17);
  doc.text("Rajasthan, India - 302001", rightBoxX + 4, y + 22);
  doc.text("GSTIN: 09BZKPP9250K1ZL", rightBoxX + 4, y + 27);
  doc.text("Ph: +91 9205778531", rightBoxX + 4, y + 31);

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
      {
        content: isInterState ? "IGST" : "GST",
        styles: { halign: "right" as const },
      },
      { content: "Amount", styles: { halign: "right" as const } },
    ],
  ];

  const tableBody = invoice.items.map((item, i) => [
    {
      content: String(i + 1),
      styles: { halign: "center" as const },
    },
    {
      content: item.name || "Item",
      styles: { halign: "left" as const },
    },
    {
      content: item.hsnCode || "-",
      styles: { halign: "center" as const },
    },
    {
      content: String(item.quantity || 0),
      styles: { halign: "center" as const },
    },
    {
      content: `₹${(item.unitPrice || 0).toLocaleString("en-IN")}`,
      styles: { halign: "right" as const },
    },
    {
      content:
        item.discount > 0
          ? `-₹${item.discount.toLocaleString("en-IN")}`
          : "-",
      styles: { halign: "right" as const },
    },
    {
      content: `₹${(item.taxableAmount || 0).toLocaleString("en-IN")}`,
      styles: { halign: "right" as const },
    },
    {
      content: isInterState
        ? `₹${(item.igst || 0).toLocaleString("en-IN")}`
        : `${item.gstRate || 0}%`,
      styles: { halign: "right" as const },
    },
    {
      content: `₹${(item.totalAmount || 0).toLocaleString("en-IN")}`,
      styles: { halign: "right" as const },
    },
  ]);

  autoTable(doc, {
    startY: y,
    head: tableHeaders,
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [40, 40, 40],
      lineColor: [230, 230, 230],
      lineWidth: 0.2,
      overflow: "linebreak",
      cellWidth: "wrap",
      minCellHeight: 6,
    },
    headStyles: {
      fillColor: [233, 30, 99],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 2.5,
      minCellHeight: 7,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 14 },
      3: { cellWidth: 12 },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
      6: { cellWidth: 22 },
      7: { cellWidth: 18 },
      8: { cellWidth: 24 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && [4, 5, 6, 7, 8].includes(data.column.index)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data as any).styles.halign = "right";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ─── TOTALS SECTION ───
  const totalsX = margin + contentWidth - 72;

  const drawTotalRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(bold ? 40 : 80, bold ? 40 : 80, bold ? 40 : 80);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - margin, y, { align: "right" });
    y += 5;
  };

  drawTotalRow(
    "Subtotal:",
    `₹${(invoice.subtotal || 0).toLocaleString("en-IN")}`
  );
  if (invoice.discount > 0) {
    drawTotalRow(
      "Discount:",
      `-₹${invoice.discount.toLocaleString("en-IN")}`
    );
  }
  drawTotalRow(
    "Taxable Amount:",
    `₹${(invoice.taxableAmount || 0).toLocaleString("en-IN")}`
  );

  if (isInterState) {
    drawTotalRow(
      "IGST:",
      `₹${(invoice.totalIGST || 0).toLocaleString("en-IN")}`
    );
  } else {
    drawTotalRow(
      "CGST:",
      `₹${(invoice.totalCGST || 0).toLocaleString("en-IN")}`
    );
    drawTotalRow(
      "SGST:",
      `₹${(invoice.totalSGST || 0).toLocaleString("en-IN")}`
    );
  }
  drawTotalRow(
    "Total GST:",
    `₹${(invoice.totalGST || 0).toLocaleString("en-IN")}`
  );

  if (invoice.shippingCharges > 0) {
    drawTotalRow(
      "Shipping:",
      `₹${invoice.shippingCharges.toLocaleString("en-IN")}`
    );
  }

  // Total line
  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, pageWidth - margin, y);
  y += 5.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(233, 30, 99);
  doc.text("TOTAL:", totalsX, y);
  doc.text(
    `₹${(invoice.totalAmount || 0).toLocaleString("en-IN")}`,
    pageWidth - margin,
    y,
    { align: "right" }
  );
  y += 8;

  // ─── AMOUNT IN WORDS ───
  doc.setFillColor(255, 243, 247);
  const amountWordsText = invoice.amountInWords || "N/A";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(233, 30, 99);

  // Measure how many lines the amount in words will take
  const amountWordLines = splitTextIntoLines(
    doc,
    amountWordsText,
    contentWidth - 8,
    7
  );
  const amountBoxHeight = Math.max(10, 4 + amountWordLines.length * 4 + 3);

  // Check if we need a new page
  if (y + amountBoxHeight > pageHeight - 20) {
    doc.addPage();
    y = 15;
  }

  doc.setFillColor(255, 243, 247);
  doc.roundedRect(margin, y, contentWidth, amountBoxHeight, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(233, 30, 99);
  doc.text("AMOUNT IN WORDS:", margin + 4, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.text(amountWordLines, margin + 4, y + 8.5);
  y += amountBoxHeight + 4;

  // ─── NOTES ───
  if (invoice.status === "paid") {
    if (y + 10 > pageHeight - 20) {
      doc.addPage();
      y = 15;
    }
    doc.setFillColor(232, 245, 233);
    doc.roundedRect(margin, y, contentWidth, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(46, 125, 50);
    doc.text("Payment Received", margin + 4, y + 4.5);
    y += 10;
  }

  // ─── BANK DETAILS ───
  if (y + 18 > pageHeight - 20) {
    doc.addPage();
    y = 15;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text("BANK DETAILS", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text("Bank: State Bank of India", margin, y);
  doc.text("A/C No: XXXXXXXXXXXX1234", margin + 55, y);
  doc.text("IFSC: SBIN0001234", margin + 115, y);
  y += 4;
  doc.text("Branch: Industrial Area Branch", margin, y);
  doc.text("A/C Type: Current Account", margin + 55, y);
  y += 9;

  // ─── FOOTER ───
  if (y + 16 > pageHeight - 10) {
    doc.addPage();
    y = 15;
  }

  doc.setDrawColor(233, 30, 99);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "This is a computer-generated invoice.",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 3.5;
  doc.text(
    "For queries, contact: sales@devtraders.com | +91 9205778531",
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 3.5;
  doc.text(
    "DevTraders | www.dev-traders.vercel.app",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // ─── SIGNATURE ───
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  doc.text("Authorized Signatory", pageWidth - margin, y + 8, {
    align: "right",
  });
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 28, y + 6, pageWidth - margin, y + 6);

  // Save
  doc.save(`Invoice-${invoice.invoiceNumber || "draft"}.pdf`);
}
