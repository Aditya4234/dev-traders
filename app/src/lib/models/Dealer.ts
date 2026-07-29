import mongoose, { Schema, Document } from "mongoose";

export interface IDealer extends Document {
  user: mongoose.Types.ObjectId;
  businessName: string;
  dealerCode: string;
  gstNumber: string;
  panNumber: string;
  contactPhone: string;
  contactEmail: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  creditLimit: number;
  outstandingBalance: number;
  discountPercent: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalOrders: number;
  totalRevenue: number;
  isActive: boolean;
  paymentTerms: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const dealerSchema = new Schema<IDealer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    businessName: { type: String, required: true, trim: true },
    dealerCode: { type: String, required: true, unique: true, uppercase: true },
    gstNumber: { type: String, required: true, unique: true },
    panNumber: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    creditLimit: { type: Number, default: 0, min: 0 },
    outstandingBalance: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 50 },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    paymentTerms: { type: String, default: "net30" },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
  },
  { timestamps: true }
);

dealerSchema.index({ tier: 1 });

export default mongoose.model<IDealer>("Dealer", dealerSchema);
