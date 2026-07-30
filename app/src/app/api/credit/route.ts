import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreditEntry, CreditAccount } from "@/lib/models/CreditLedger";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

    let account = await CreditAccount.findOne({ user: user.id });
    if (!account) {
      account = await CreditAccount.create({ user: user.id });
    }

    const entries = await CreditEntry.find({ user: user.id })
      .sort("-createdAt")
      .limit(100)
      .populate("orderId", "total status")
      .lean();

    return NextResponse.json({ success: true, account, entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}