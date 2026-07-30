import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyAccount, LoyaltyTransaction } from "@/lib/models/Loyalty";
import { protect } from "@/lib/middleware/auth";

const POINTS_PER_ORDER = 10;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { orderId, orderTotal } = await request.json();
    const points = Math.floor(orderTotal / 10) * POINTS_PER_ORDER;

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
      description: `Order #${orderId?.toString().slice(-6).toUpperCase()} placed`,
      orderId,
    });

    return NextResponse.json({ success: true, account, pointsEarned: points });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}