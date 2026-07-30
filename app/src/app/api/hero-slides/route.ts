import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HeroSlide from "@/lib/models/HeroSlide";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const slides = await HeroSlide.find({ isActive: true }).sort("sortOrder");
    return NextResponse.json({ success: true, slides });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);

    const body = await request.json();
    const slide = await HeroSlide.create(body);
    return NextResponse.json({ success: true, slide }, { status: 201 });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
