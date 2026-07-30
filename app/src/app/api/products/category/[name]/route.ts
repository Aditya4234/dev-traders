import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  try {
    await connectDB();
    const products = await Product.find({
      isActive: true,
      category: { $regex: escapeRegex(name), $options: "i" },
    });
    return NextResponse.json({ success: true, products });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}
