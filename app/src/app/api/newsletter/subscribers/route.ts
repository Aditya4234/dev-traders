import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/lib/models/Newsletter";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);

    const subscribers = await Newsletter.find({ isActive: true }).sort("-createdAt");
    return NextResponse.json({ success: true, subscribers });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
