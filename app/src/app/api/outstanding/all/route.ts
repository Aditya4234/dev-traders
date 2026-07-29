import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { CreditAccount } from "@/lib/models/CreditLedger";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);

    const dealers = await CreditAccount.find()
      .populate("user", "name email companyName phone")
      .sort("-currentBalance")
      .lean();

    const result = await Promise.all(
      dealers.map(async (d: any) => {
        const pendingOrders = await Order.countDocuments({
          user: d.user._id,
          status: { $in: ["pending", "confirmed", "shipped"] },
          paymentMethod: "cod",
        });
        const pendingAmount = await Order.aggregate([
          { $match: { user: d.user._id, status: { $in: ["pending", "confirmed", "shipped"] }, paymentMethod: "cod" } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);

        return {
          dealer: d.user,
          creditBalance: d.currentBalance,
          creditLimit: d.creditLimit,
          pendingOrders,
          pendingAmount: pendingAmount[0]?.total || 0,
          totalOutstanding: d.currentBalance + (pendingAmount[0]?.total || 0),
        };
      })
    );

    return NextResponse.json({ success: true, dealers: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}