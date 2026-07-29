import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const payment = await Payment.findById(id).populate("orderId");
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}