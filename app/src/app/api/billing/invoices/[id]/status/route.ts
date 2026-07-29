import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);
    const { status } = await request.json();
    const validStatuses = ["draft", "issued", "paid", "cancelled", "overdue"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }
    const invoice = await Invoice.findByIdAndUpdate(id, { status }, { new: true });
    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}