import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/lib/models/Coupon";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const isAdmin = user.role === "admin";
    const filter: any = isAdmin ? {} : { isActive: true, validUntil: { $gte: new Date() } };

    const coupons = await Coupon.find(filter).populate("createdBy", "name").sort("-createdAt").lean();

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, applicableTo, specificUser, validFrom, validUntil } = await request.json();

    if (!code || !description || !discountType || !discountValue || !validUntil) {
      return NextResponse.json({ success: false, message: "Code, description, discountType, discountValue and validUntil are required" }, { status: 400 });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: "Coupon code already exists" }, { status: 400 });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      usageLimit,
      applicableTo: applicableTo || "all",
      specificUser,
      validFrom: validFrom || new Date(),
      validUntil,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}