import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { optionalAuth } from "@/lib/middleware/auth";
import { createRazorpayOrder } from "@/lib/services/payment";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(request);
    const body = await request.json();
    const { amount, orderId, description } = body;
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Valid amount required" }, { status: 400 });
    }
    const receipt = orderId || `order_${Date.now()}`;
    const rpOrder = await createRazorpayOrder(amount, receipt, { orderId: orderId || "" });
    if (!rpOrder) {
      return NextResponse.json({ success: false, message: "Failed to create payment order" }, { status: 500 });
    }
    const payment = await Payment.create({
      orderId: orderId || undefined,
      razorpayOrderId: rpOrder.orderId,
      amount,
      currency: rpOrder.currency,
      method: "online",
      status: "created",
      customer: {
        name: user?.name || body.customerName || "Guest",
        email: user?.email || body.customerEmail,
        phone: body.customerPhone || user?.phone || "",
      },
      description,
    });
    return NextResponse.json({
      success: true,
      razorpayOrderId: rpOrder.orderId,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}