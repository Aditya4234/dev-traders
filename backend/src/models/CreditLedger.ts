import mongoose, { Schema, Document } from "mongoose";

export interface ICreditEntry extends Document {
  user: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  balance: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ICreditAccount extends Document {
  user: mongoose.Types.ObjectId;
  creditLimit: number;
  currentBalance: number;
  totalCreditUsed: number;
  totalPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const creditEntrySchema = new Schema<ICreditEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },
    balance: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const creditAccountSchema = new Schema<ICreditAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    creditLimit: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    totalCreditUsed: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CreditEntry = mongoose.model<ICreditEntry>("CreditEntry", creditEntrySchema);
export const CreditAccount = mongoose.model<ICreditAccount>("CreditAccount", creditAccountSchema);
