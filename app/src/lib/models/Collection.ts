import mongoose, { Schema, Document } from "mongoose";

export interface ICollection extends Document {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  type: "featured" | "premium";
  sortOrder: number;
  isActive: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true },
    image: { type: String, required: true },
    href: { type: String, required: true },
    type: { type: String, enum: ["featured", "premium"], required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICollection>("Collection", collectionSchema);
