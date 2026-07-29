import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const q = request.nextUrl.searchParams.get("q");
    if (!q) {
      return NextResponse.json({ success: false, message: "Search query required" }, { status: 400 });
    }
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ],
    });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
