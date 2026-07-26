import mongoose, { Schema, Document } from "mongoose";

export interface ILoyaltyTransaction extends Document {
  user: mongoose.Types.ObjectId;
  points: number;
  type: "earned" | "redeemed" | "bonus" | "adjustment";
  description: string;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ILoyaltyAccount extends Document {
  user: mongoose.Types.ObjectId;
  totalPoints: number;
  tier: "bronze" | "silver" | "gold";
  createdAt: Date;
  updatedAt: Date;
}

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ["earned", "redeemed", "bonus", "adjustment"], required: true },
    description: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

const loyaltyAccountSchema = new Schema<ILoyaltyAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    tier: { type: String, enum: ["bronze", "silver", "gold"], default: "bronze" },
  },
  { timestamps: true }
);

loyaltyAccountSchema.pre("save", function (next) {
  if (this.totalPoints >= 5000) this.tier = "gold";
  else if (this.totalPoints >= 1000) this.tier = "silver";
  else this.tier = "bronze";
  next();
});

export const LoyaltyTransaction = mongoose.model<ILoyaltyTransaction>("LoyaltyTransaction", loyaltyTransactionSchema);
export const LoyaltyAccount = mongoose.model<ILoyaltyAccount>("LoyaltyAccount", loyaltyAccountSchema);
