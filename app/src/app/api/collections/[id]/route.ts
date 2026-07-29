import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json({ success: false, message: "Collection not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, collection });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const collection = await Collection.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!collection) {
      return NextResponse.json({ success: false, message: "Collection not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, collection });
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
    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) {
      return NextResponse.json({ success: false, message: "Collection not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Collection deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
