import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { searchProducts } from "@/lib/services/elasticsearch";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category") || undefined;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || undefined;
    const from = searchParams.get("from");
    const size = searchParams.get("size");

    if (!q) {
      return NextResponse.json({ success: false, message: "Search query required" }, { status: 400 });
    }

    const result = await searchProducts(q, {
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      from: from ? Number(from) : undefined,
      size: size ? Number(size) : undefined,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}