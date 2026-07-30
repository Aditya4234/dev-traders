import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
      return NextResponse.json({ success: false, message: "Search query required" }, { status: 400 });
    }
    const safe = escapeRegex(q);
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } },
        { brand: { $regex: safe, $options: "i" } },
      ],
    });
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ success: false, message: "Search failed" }, { status: 500 });
  }
}
