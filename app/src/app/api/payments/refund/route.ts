import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { protect, adminOnly } from "@/lib/middleware/auth";
import { createRefund } from "@/lib/services/payment";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { paymentId, amount, reason } = await request.json();
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }
    if (!payment.razorpayPaymentId) {
      return NextResponse.json({ success: false, message: "No Razorpay payment to refund" }, { status: 400 });
    }
    const refundAmount = amount || payment.amount;
    const refund = await createRefund(payment.razorpayPaymentId, refundAmount, {
      reason: reason || "Refund requested",
    });
    if (refund) {
      payment.refundId = refund.refundId;
      payment.refundAmount = refundAmount;
      payment.refundStatus = "processed";
      payment.status = "refunded";
      await payment.save();
    }
    return NextResponse.json({
      success: true,
      refund: refund ? { refundId: refund.refundId, amount: refundAmount } : null,
      payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}