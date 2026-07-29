import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyAccount, LoyaltyTransaction } from "@/lib/models/Loyalty";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { points, description, orderId } = await request.json();

    if (!points || points <= 0) {
      return NextResponse.json({ success: false, message: "Valid points required" }, { status: 400 });
    }

    let account = await LoyaltyAccount.findOne({ user: user.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: user.id, totalPoints: 0 });
    }

    account.totalPoints += points;
    await account.save();

    await LoyaltyTransaction.create({
      user: user.id,
      points,
      type: "earned",
      description: description || "Points earned",
      orderId,
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}