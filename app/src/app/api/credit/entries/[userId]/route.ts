import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreditEntry } from "@/lib/models/CreditLedger";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const entries = await CreditEntry.find({ user: userId })
      .sort("-createdAt")
      .populate("orderId", "total status")
      .lean();
    return NextResponse.json({ success: true, entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}