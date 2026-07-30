import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { getTrendingProducts } from "@/lib/services/recommendations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const ids = await getTrendingProducts(limit);
    const products = await Product.find({ _id: { $in: ids }, isActive: true }).lean();
    return NextResponse.json({ success: true, recommendations: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}