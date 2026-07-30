import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/lib/models/Inventory";
import { protect, adminOnly } from "@/lib/middleware/auth";
import { cacheDelPattern } from "@/lib/middleware/cache";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const item = await Inventory.findOne({ product: id })
      .populate("product", "name brand image category price");
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const item = await Inventory.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }
    await cacheDelPattern("cache:/api/products*");
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}