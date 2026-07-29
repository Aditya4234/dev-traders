import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/lib/models/Ticket";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const ticket = await Ticket.findOne({ _id: id, userId: user.id }).lean();
    if (!ticket) {
      return NextResponse.json({ success: false, message: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}