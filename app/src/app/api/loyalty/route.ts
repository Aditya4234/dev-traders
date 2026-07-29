import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyAccount, LoyaltyTransaction } from "@/lib/models/Loyalty";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    let account = await LoyaltyAccount.findOne({ user: user.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: user.id, totalPoints: 0 });
    }
    const transactions = await LoyaltyTransaction.find({ user: user.id }).sort("-createdAt").limit(50).lean();
    return NextResponse.json({ success: true, account, transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}