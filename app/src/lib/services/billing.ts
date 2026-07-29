import mongoose from "mongoose";
import Invoice from "@/lib/models/Invoice";

async function getNextInvoiceNumber(): Promise<string> {
  const now = new Date();
  const fy = now.getMonth() >= 3
    ? `${now.getFullYear()}-${(now.getFullYear() + 1).toString().slice(-2)}`
    : `${now.getFullYear() - 1}-${now.getFullYear().toString().slice(-2)}`;
  const lastInvoice = await Invoice.findOne({ invoiceNumber: { $regex: `RT-${fy}` } })
    .sort({ createdAt: -1 })
    .lean();
  let seq = 1;
  if (lastInvoice) {
    const parts = lastInvoice.invoiceNumber.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return `RT-${fy}-${seq.toString().padStart(4, "0")}`;
}

function calculateGST(taxableAmount: number, gstRate: number, isInterState: boolean): { cgst: number; sgst: number; igst: number } {
  const gstAmount = (taxableAmount * gstRate) / 100;
  if (isInterState) return { cgst: 0, sgst: 0, igst: gstAmount };
  const half = gstAmount / 2;
  return { cgst: half, sgst: half, igst: 0 };
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + " Rupees";
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  result += " Only";
  return result;
}

export interface InvoiceItemInput {
  productId: string;
  name: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  gstRate: number;
}

export interface CreateInvoiceInput {
  orderId?: string;
  dealerId?: string;
  userId?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
  };
  items: InvoiceItemInput[];
  shippingCharges?: number;
  discount?: number;
  notes?: string;
  placeOfSupply: string;
}

export async function createInvoice(input: CreateInvoiceInput) {
  if (!input.items || input.items.length === 0) throw new Error("At least one item is required");
  for (const item of input.items) {
    if (!item.name || !item.name.trim()) throw new Error("Each item must have a product name");
    if (!item.hsnCode || !item.hsnCode.trim()) throw new Error(`HSN code is required for "${item.name}"`);
    if (!item.quantity || item.quantity < 1) throw new Error(`Quantity must be at least 1 for "${item.name}"`);
    if (item.unitPrice === undefined || item.unitPrice < 0) throw new Error(`Unit price is required for "${item.name}"`);
  }

  const invoiceNumber = await getNextInvoiceNumber();
  const isInterState = input.customer.state !== process.env.BUSINESS_STATE;

  let totalTaxableAmount = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0;

  const items = input.items.map((item) => {
    const lineDiscount = item.discount || 0;
    const taxableAmount = (item.unitPrice * item.quantity) - lineDiscount;
    const { cgst, sgst, igst } = calculateGST(taxableAmount, item.gstRate, isInterState);
    const totalAmount = taxableAmount + cgst + sgst + igst;
    totalTaxableAmount += taxableAmount;
    totalCGST += cgst;
    totalSGST += sgst;
    totalIGST += igst;
    return {
      ...(item.productId && mongoose.Types.ObjectId.isValid(item.productId) ? { product: new mongoose.Types.ObjectId(item.productId) } : {}),
      name: item.name,
      hsnCode: item.hsnCode,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: lineDiscount,
      taxableAmount,
      gstRate: item.gstRate,
      cgst, sgst, igst, totalAmount,
    };
  });

  const totalDiscount = input.discount || 0;
  const shippingCharges = input.shippingCharges || 0;
  const totalGST = totalCGST + totalSGST + totalIGST;
  const totalAmount = totalTaxableAmount - totalDiscount + totalGST + shippingCharges;

  const invoice = await Invoice.create({
    invoiceNumber,
    orderId: input.orderId,
    dealer: input.dealerId,
    user: input.userId,
    customer: input.customer,
    items,
    subtotal: totalTaxableAmount + totalDiscount,
    discount: totalDiscount,
    taxableAmount: totalTaxableAmount,
    totalCGST, totalSGST, totalIGST, totalGST,
    shippingCharges,
    totalAmount,
    amountInWords: numberToWords(totalAmount),
    status: "draft",
    paymentStatus: "pending",
    paidAmount: 0,
    notes: input.notes,
    placeOfSupply: input.placeOfSupply,
    reverseCharge: false,
    isInterState,
  });

  return invoice;
}

export async function updateInvoicePayment(invoiceId: string, paidAmount: number, paymentMethod: string) {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  invoice.paidAmount += paidAmount;
  if (invoice.paidAmount >= invoice.totalAmount) {
    invoice.paymentStatus = "paid";
    invoice.status = "paid";
  } else if (invoice.paidAmount > 0) {
    invoice.paymentStatus = "partial";
  }
  invoice.paymentMethod = paymentMethod;
  invoice.status = invoice.status === "draft" ? "issued" : invoice.status;
  await invoice.save();
  return invoice;
}

export { numberToWords };
