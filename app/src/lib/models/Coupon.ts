import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  applicableTo: "all" | "new_users" | "specific_dealer";
  specificUser?: mongoose.Types.ObjectId;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    applicableTo: { type: String, enum: ["all", "new_users", "specific_dealer"], default: "all" },
    specificUser: { type: Schema.Types.ObjectId, ref: "User" },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.model<ICoupon>("Coupon", couponSchema);
