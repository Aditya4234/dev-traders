import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const status = request.nextUrl.searchParams.get("status");
    const method = request.nextUrl.searchParams.get("method");
    const page = request.nextUrl.searchParams.get("page") || "1";
    const limit = request.nextUrl.searchParams.get("limit") || "20";
    const filter: any = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("orderId", "customer total")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(filter),
    ]);
    return NextResponse.json({
      success: true,
      payments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}