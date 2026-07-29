import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "order" | "payment" | "invoice" | "alert" | "system";
  read: boolean;
  link?: string;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["order", "payment", "invoice", "alert", "system"],
      default: "system",
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
