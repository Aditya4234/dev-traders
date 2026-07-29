import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, default: "Home" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", addressSchema);
