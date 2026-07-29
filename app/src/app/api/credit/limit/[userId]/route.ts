import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreditAccount } from "@/lib/models/CreditLedger";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  const { userId } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { creditLimit } = await request.json();

    let account = await CreditAccount.findOne({ user: userId });
    if (!account) {
      account = await CreditAccount.create({ user: userId });
    }
    account.creditLimit = creditLimit || 0;
    await account.save();

    return NextResponse.json({ success: true, account });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}