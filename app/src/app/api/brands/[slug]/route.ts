import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  try {
    await connectDB();
    const brand = await Brand.findOne({ slug, isActive: true });
    if (!brand) {
      return NextResponse.json({ success: false, message: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, brand });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
