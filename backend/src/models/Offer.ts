import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  discount: number;
  code?: string;
  minOrder?: number;
  validUntil: Date;
  isActive: boolean;
  image?: string;
}

const offerSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    discount: { type: Number, required: true, min: 1, max: 100 },
    code: { type: String, trim: true },
    minOrder: { type: Number, default: 0 },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    image: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IOffer>("Offer", offerSchema);
