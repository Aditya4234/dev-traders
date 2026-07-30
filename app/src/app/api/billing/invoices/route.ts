import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const status = request.nextUrl.searchParams.get("status");
    const dealerId = request.nextUrl.searchParams.get("dealerId");
    const page = request.nextUrl.searchParams.get("page") || "1";
    const limit = request.nextUrl.searchParams.get("limit") || "20";
    const filter: any = {};
    if (status) filter.status = status;
    if (dealerId) filter.dealer = dealerId;
    if (user?.role === "customer") {
      filter.user = user.id;
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate("dealer", "businessName dealerCode")
        .populate("orderId", "customer total")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Invoice.countDocuments(filter),
    ]);
    return NextResponse.json({
      success: true,
      invoices,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}