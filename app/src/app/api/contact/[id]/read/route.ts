import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/lib/models/Contact";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const msg = await Contact.findByIdAndUpdate(id, { status: "read" }, { new: true });
    if (!msg) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Marked as read", contact: msg });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}