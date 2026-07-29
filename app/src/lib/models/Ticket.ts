import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  userId: mongoose.Types.ObjectId;
  ticketId: string;
  subject: string;
  message: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in-progress" | "resolved" | "closed";
  replies: { message: string; by: string; date: Date }[];
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketId: { type: String, required: true, unique: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },
    replies: [
      {
        message: { type: String, required: true },
        by: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITicket>("Ticket", ticketSchema);
