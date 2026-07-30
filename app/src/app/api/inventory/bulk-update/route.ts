import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/lib/models/Inventory";
import { protect, adminOnly } from "@/lib/middleware/auth";
import { cacheDelPattern } from "@/lib/middleware/cache";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { updates } = await request.json();
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ success: false, message: "Updates array required" }, { status: 400 });
    }
    const operations = updates.map((u: any) => ({
      updateOne: {
        filter: { product: u.productId },
        update: { $set: { quantity: u.quantity, costPrice: u.costPrice } },
      },
    }));
    const result = await Inventory.bulkWrite(operations);
    await cacheDelPattern("cache:/api/products*");
    return NextResponse.json({ success: true, modified: result.modifiedCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}