import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    await connectDB();
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const category = await Category.findByIdAndUpdate(slug, body, { new: true, runValidators: true });
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const category = await Category.findByIdAndDelete(slug);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
