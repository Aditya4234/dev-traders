import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/lib/models/Ticket";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, message: "Reply message is required" }, { status: 400 });
    }

    const ticket = await Ticket.findOne({ _id: id, userId: user.id });
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }

    ticket.replies.push({ message: message.trim(), by: user.name, date: new Date() });
    await ticket.save();

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}