import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";
import { updateInvoicePayment } from "@/lib/services/billing";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);
    const { amount, paymentMethod } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Valid amount required" }, { status: 400 });
    }
    const invoice = await updateInvoicePayment(id, amount, paymentMethod || "online");
    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}