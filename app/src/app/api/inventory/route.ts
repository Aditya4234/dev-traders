import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/lib/models/Inventory";
import { protect, adminOnly } from "@/lib/middleware/auth";
import { cacheDelPattern } from "@/lib/middleware/cache";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const search = request.nextUrl.searchParams.get("search");
    const lowStock = request.nextUrl.searchParams.get("lowStock");
    const warehouse = request.nextUrl.searchParams.get("warehouse");
    const page = request.nextUrl.searchParams.get("page") || "1";
    const limit = request.nextUrl.searchParams.get("limit") || "50";
    const filter: any = {};
    if (search && typeof search === "string") {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
        { warehouse: { $regex: search, $options: "i" } },
      ];
    }
    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
    }
    if (warehouse && typeof warehouse === "string") {
      filter.warehouse = warehouse;
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate("product", "name brand image category")
        .sort({ quantity: 1 })
        .skip(skip)
        .limit(limitNum),
      Inventory.countDocuments(filter),
    ]);
    return NextResponse.json({
      success: true,
      items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const item = await Inventory.create(body);
    await cacheDelPattern("cache:/api/products*");
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}