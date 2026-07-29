import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);

    const userId = user.id;
    const isWholeseller = user.role === "admin" || user.role === "dealer";

    const matchStage: any = isWholeseller ? {} : { user: userId };

    const [stats] = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      stats: stats || {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        shippedOrders: 0,
      },
    });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
