import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });

export default mongoose.model<ICart>("Cart", cartSchema);
