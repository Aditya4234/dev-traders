import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/lib/models/Inventory";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { quantity, costPrice } = await request.json();
    if (!quantity || quantity <= 0) {
      return NextResponse.json({ success: false, message: "Valid quantity required" }, { status: 400 });
    }
    const item = await Inventory.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: "Inventory item not found" }, { status: 404 });
    }
    item.quantity += quantity;
    if (costPrice) item.costPrice = costPrice;
    item.lastRestockedAt = new Date();
    await item.save();
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}