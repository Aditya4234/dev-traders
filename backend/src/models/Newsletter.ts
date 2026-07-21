import mongoose, { Schema, Document } from "mongoose";

export interface INewsletter extends Document {
  email: string;
  isActive: boolean;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<INewsletter>("Newsletter", newsletterSchema);
