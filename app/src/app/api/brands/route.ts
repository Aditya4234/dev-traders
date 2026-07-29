import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Brand from "@/lib/models/Brand";

export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    const brands = await Brand.find({ isActive: true });
    return NextResponse.json({ success: true, brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
