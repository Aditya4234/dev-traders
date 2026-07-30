import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const [
      revenueAgg,
      orderCounts,
      statusCounts,
      paymentCounts,
      recentOrders,
      topProducts,
      dailySalesAgg,
      monthlySalesAgg,
      categorySales,
    ] = await Promise.all([
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            today: { $sum: { $cond: [{ $gte: ["$createdAt", startOfDay] }, 1, 0] } },
            week: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, 1, 0] } },
            month: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0] } },
            lastMonth: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", lastMonthStart] }, { $lt: ["$createdAt", startOfMonth] }] }, 1, 0] } },
            revenueToday: { $sum: { $cond: [{ $gte: ["$createdAt", startOfDay] }, "$total", 0] } },
            revenueWeek: { $sum: { $cond: [{ $gte: ["$createdAt", startOfWeek] }, "$total", 0] } },
            revenueMonth: { $sum: { $cond: [{ $gte: ["$createdAt", startOfMonth] }, "$total", 0] } },
            revenueLastMonth: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", lastMonthStart] }, { $lt: ["$createdAt", startOfMonth] }] }, "$total", 0] } },
          },
        },
      ]),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      ]),
      Order.find().sort("-createdAt").limit(10).lean(),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 8 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            sales: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $lookup: { from: "products", let: { productName: "$items.name" }, pipeline: [{ $match: { $expr: { $eq: ["$name", "$$productName"] } } }, { $project: { category: 1 } }], as: "productInfo" } },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$productInfo.category", "Other"] }, total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalOrders = revenueAgg[0]?.count || 0;
    const counts = orderCounts[0] || {};
    const statusMap = Object.fromEntries(statusCounts.map((s: any) => [s._id, s.count]));
    const paymentMap = Object.fromEntries(paymentCounts.map((p: any) => [p._id, p.count]));

    const ordersToday = counts.today || 0;
    const ordersWeek = counts.week || 0;
    const ordersMonth = counts.month || 0;
    const ordersLastMonth = counts.lastMonth || 0;
    const revenueToday = counts.revenueToday || 0;
    const revenueWeek = counts.revenueWeek || 0;
    const revenueMonth = counts.revenueMonth || 0;
    const revenueLastMonth = counts.revenueLastMonth || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const revenueChange = revenueLastMonth > 0 ? Math.round(((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100) : revenueMonth > 0 ? 100 : 0;
    const orderChange = ordersLastMonth > 0 ? Math.round(((ordersMonth - ordersLastMonth) / ordersLastMonth) * 100) : ordersMonth > 0 ? 100 : 0;

    const dailySales: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = dailySalesAgg.find((d: any) => d._id === dateStr);
      dailySales.push({ date: dateStr, sales: found?.sales || 0, orders: found?.orders || 0 });
    }

    const monthlyChart: { month: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const found = monthlySalesAgg.find((m: any) => m._id === key);
      monthlyChart.push({ month: monthNames[d.getMonth()], sales: found?.sales || 0, orders: found?.orders || 0 });
    }

    return NextResponse.json({
      success: true,
      dashboard: {
        revenue: { total: totalRevenue, today: revenueToday, thisWeek: revenueWeek, thisMonth: revenueMonth, avgOrderValue, revenueChange },
        orders: { total: totalOrders, today: ordersToday, thisWeek: ordersWeek, thisMonth: ordersMonth, orderChange, pending: statusMap.pending || 0, confirmed: statusMap.confirmed || 0, shipped: statusMap.shipped || 0, delivered: statusMap.delivered || 0, cancelled: statusMap.cancelled || 0 },
        payments: { cod: paymentMap.cod || 0, online: paymentMap.online || 0, whatsapp: paymentMap.whatsapp || 0 },
        recentOrders,
        topProducts,
        dailySales,
        monthlyChart,
        categorySales,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}