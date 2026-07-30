import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import Order from "@/lib/models/Order";
import { verifyPaymentSignature, capturePayment } from "@/lib/services/payment";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await protect(request);
    await connectDB();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = await request.json();
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, message: "Payment verification data required" }, { status: 400 });
    }
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      await Payment.findByIdAndUpdate(paymentId, { status: "failed", failureReason: "Invalid signature" });
      return NextResponse.json({ success: false, message: "Payment verification failed" }, { status: 400 });
    }
    const captured = await capturePayment(razorpayPaymentId);
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { razorpayPaymentId, razorpaySignature, status: captured ? "captured" : "authorized" },
      { new: true }
    );
    if (payment?.orderId && captured) {
      await Order.findByIdAndUpdate(payment.orderId, { paymentMethod: "online" });
    }
    return NextResponse.json({ success: true, status: captured ? "captured" : "authorized", payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}