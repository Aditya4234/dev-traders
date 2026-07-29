import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/lib/models/Review";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const filter: any = { isActive: true };
    const productId = request.nextUrl.searchParams.get("productId");
    if (productId) {
      filter.productId = productId;
    }
    const reviews = await Review.find(filter).sort("-createdAt");
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const body = await request.json();
    const review = await Review.create({ ...body, userId: user.id });
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
