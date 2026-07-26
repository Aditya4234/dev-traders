import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceItem {
  product: mongoose.Types.ObjectId;
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

export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId?: mongoose.Types.ObjectId;
  dealer?: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    gstNumber?: string;
  };
  items: IInvoiceItem[];
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
  status: "draft" | "issued" | "paid" | "cancelled" | "overdue";
  paymentStatus: "pending" | "partial" | "paid";
  paymentMethod?: string;
  paidAmount: number;
  dueDate?: Date;
  notes?: string;
  placeOfSupply: string;
  reverseCharge: boolean;
  isInterState: boolean;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  hsnCode: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  taxableAmount: { type: Number, required: true },
  gstRate: { type: Number, required: true },
  cgst: { type: Number, required: true },
  sgst: { type: Number, required: true },
  igst: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    dealer: { type: Schema.Types.ObjectId, ref: "Dealer" },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      gstNumber: { type: String },
    },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    totalCGST: { type: Number, required: true },
    totalSGST: { type: Number, required: true },
    totalIGST: { type: Number, default: 0 },
    totalGST: { type: Number, required: true },
    shippingCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    amountInWords: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "cancelled", "overdue"],
      default: "draft",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    paymentMethod: { type: String },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    notes: { type: String },
    placeOfSupply: { type: String, required: true },
    reverseCharge: { type: Boolean, default: false },
    isInterState: { type: Boolean, required: true },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ orderId: 1 });
invoiceSchema.index({ dealer: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ createdAt: -1 });

export default mongoose.model<IInvoice>("Invoice", invoiceSchema);
