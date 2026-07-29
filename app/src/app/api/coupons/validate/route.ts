import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { code, orderAmount } = await request.json();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return NextResponse.json({ success: false, message: "Invalid coupon code" }, { status: 404 });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ success: false, message: "Coupon has expired or is not yet valid" }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, message: "Coupon usage limit reached" }, { status: 400 });
    }

    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` }, { status: 400 });
    }

    let discount = coupon.discountType === "percentage"
      ? (orderAmount || 0) * (coupon.discountValue / 100)
      : coupon.discountValue;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
      },
      discount,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}