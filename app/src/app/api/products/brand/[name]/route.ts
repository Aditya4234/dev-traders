import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET(request: NextRequest, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  try {
    await connectDB();
    const products = await Product.find({
      isActive: true,
      brand: { $regex: name, $options: "i" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
