import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  method: "online" | "cod" | "bank_transfer" | "upi";
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  refundId?: string;
  refundAmount?: number;
  refundStatus?: "pending" | "processed" | "failed";
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  description?: string;
  failureReason?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    method: {
      type: String,
      enum: ["online", "cod", "bank_transfer", "upi"],
      default: "online",
    },
    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded"],
      default: "created",
    },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
    },
    description: { type: String },
    failureReason: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>("Payment", paymentSchema);
