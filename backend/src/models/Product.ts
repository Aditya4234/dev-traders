import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  badge?: "new" | "sale" | "bestseller" | "trending";
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, default: "Riya Touch" },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    image: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    badge: {
      type: String,
      enum: ["new", "sale", "bestseller", "trending"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });
productSchema.index({ badge: 1 });
productSchema.index({ name: "text", category: "text" });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

export default mongoose.model<IProduct>("Product", productSchema);
