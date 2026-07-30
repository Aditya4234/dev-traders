import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dealer from "@/lib/models/Dealer";
import Order from "@/lib/models/Order";
import Invoice from "@/lib/models/Invoice";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return NextResponse.json({ success: false, message: "Dealer not found" }, { status: 404 });
    }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const [recentOrders, pendingInvoices, totalInvoices, monthlyRevenue] = await Promise.all([
      Order.find({ user: dealer.user }).sort("-createdAt").limit(10).lean(),
      Invoice.countDocuments({ dealer: dealer._id, status: { $in: ["issued", "overdue"] } }),
      Invoice.countDocuments({ dealer: dealer._id }),
      Invoice.aggregate([
        { $match: { dealer: dealer._id, createdAt: { $gte: thirtyDaysAgo }, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    return NextResponse.json({
      success: true,
      dashboard: {
        dealer,
        recentOrders,
        pendingInvoices,
        totalInvoices,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        creditAvailable: dealer.creditLimit - dealer.outstandingBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}