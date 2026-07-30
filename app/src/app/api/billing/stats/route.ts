import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/lib/models/Invoice";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyStats, statusStats, overdueCount] = await Promise.all([
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: "$totalAmount" },
            totalCollected: { $sum: "$paidAmount" },
            totalGST: { $sum: "$totalGST" },
            count: { $sum: 1 },
          },
        },
      ]),
      Invoice.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
      ]),
      Invoice.countDocuments({ status: "overdue" }),
    ]);
    return NextResponse.json({
      success: true,
      stats: {
        monthly: monthlyStats[0] || { totalInvoiced: 0, totalCollected: 0, totalGST: 0, count: 0 },
        byStatus: statusStats,
        overdueCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}