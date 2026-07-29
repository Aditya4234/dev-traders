import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { code } = await request.json();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return NextResponse.json({ success: false, message: "Coupon not found" }, { status: 404 });
    }

    coupon.usedCount += 1;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      coupon.isActive = false;
    }
    await coupon.save();

    return NextResponse.json({ success: true, message: "Coupon applied" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}