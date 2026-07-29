import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import HeroSlide from "@/lib/models/HeroSlide";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const slide = await HeroSlide.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!slide) {
      return NextResponse.json({ success: false, message: "Slide not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, slide });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const slide = await HeroSlide.findByIdAndDelete(id);
    if (!slide) {
      return NextResponse.json({ success: false, message: "Slide not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Slide deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
