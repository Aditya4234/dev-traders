import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreditEntry, CreditAccount } from "@/lib/models/CreditLedger";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { userId, amount, description, orderId, invoiceId } = await request.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "userId and positive amount required" }, { status: 400 });
    }

    const account = await CreditAccount.findOne({ user: userId });
    if (!account) {
      return NextResponse.json({ success: false, message: "No credit account found" }, { status: 404 });
    }

    account.currentBalance = Math.max(0, account.currentBalance - amount);
    account.totalPaid += amount;
    await account.save();

    const entry = await CreditEntry.create({
      user: userId,
      type: "debit",
      amount,
      description: description || "Payment received",
      orderId,
      invoiceId,
      balance: account.currentBalance,
      createdBy: user.id,
    });

    return NextResponse.json({ success: true, entry, account }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}