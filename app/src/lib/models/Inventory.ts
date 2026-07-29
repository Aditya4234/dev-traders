import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  warehouse: string;
  lastRestockedAt?: Date;
  costPrice: number;
  gstRate: number;
  hsnCode: string;
}

const inventorySchema = new Schema<IInventory>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
    },
    sku: { type: String, required: true, unique: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    warehouse: { type: String, default: "Main" },
    lastRestockedAt: { type: Date },
    costPrice: { type: Number, required: true, min: 0 },
    gstRate: { type: Number, required: true, default: 5 },
    hsnCode: { type: String, required: true },
  },
  { timestamps: true }
);

inventorySchema.index({ quantity: 1 });

export default mongoose.model<IInventory>("Inventory", inventorySchema);
