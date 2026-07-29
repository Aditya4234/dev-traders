import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>("Contact", contactSchema);
