import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyAccount } from "@/lib/models/Loyalty";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const accounts = await LoyaltyAccount.find().populate("user", "name email").sort("-totalPoints").lean();
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}