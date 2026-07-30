import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { CreditAccount } from "@/lib/models/CreditLedger";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

    const account = await CreditAccount.findOne({ user: user.id });

    const pendingOrders = await Order.find({
      user: user.id,
      status: { $in: ["pending", "confirmed", "shipped"] },
      paymentMethod: "cod",
    })
      .sort("-createdAt")
      .lean();

    const totalOutstanding = pendingOrders.reduce((sum: number, o: any) => sum + o.total, 0);
    const creditBalance = account?.currentBalance || 0;

    return NextResponse.json({
      success: true,
      outstanding: {
        pendingOrders: pendingOrders.length,
        totalPending: totalOutstanding,
        creditBalance,
        totalOutstanding: totalOutstanding + creditBalance,
      },
      orders: pendingOrders,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}