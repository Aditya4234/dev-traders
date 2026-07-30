import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { LoyaltyAccount, LoyaltyTransaction } from "@/lib/models/Loyalty";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { points, description } = await request.json();

    if (!points || points <= 0) {
      return NextResponse.json({ success: false, message: "Valid points required" }, { status: 400 });
    }

    const account = await LoyaltyAccount.findOne({ user: user.id });
    if (!account || account.totalPoints < points) {
      return NextResponse.json({ success: false, message: "Insufficient points" }, { status: 400 });
    }

    account.totalPoints -= points;
    await account.save();

    await LoyaltyTransaction.create({
      user: user.id,
      points: -points,
      type: "redeemed",
      description: description || "Points redeemed",
    });

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}