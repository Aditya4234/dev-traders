import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CreditAccount } from "@/lib/models/CreditLedger";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const accounts = await CreditAccount.find()
      .populate("user", "name email companyName")
      .sort("-currentBalance")
      .lean();
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}