import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  productId?: mongoose.Types.ObjectId;
  isActive: boolean;
}

const reviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, required: true },
    avatar: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", reviewSchema);
