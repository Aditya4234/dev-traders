import { Router, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import { protect, wholesellerOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/wholeseller/dashboard - Wholeseller dashboard data
router.get("/dashboard", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      // Revenue
      totalRevenueAgg,
      revenueTodayAgg,
      revenueWeekAgg,
      revenueMonthAgg,
      revenueLastMonthAgg,
      // Orders
      totalOrders,
      ordersToday,
      ordersWeek,
      ordersMonth,
      ordersLastMonth,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      // Payments
      codOrders,
      onlineOrders,
      whatsappOrders,
      // Recent orders
      recentOrders,
      // Top products
      topProducts,
      // Daily sales (7 days)
      dailySalesData,
    ] = await Promise.all([
      // Revenue
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
              $lt: startOfMonth,
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      // Orders
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          $lt: startOfMonth,
        },
      }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      // Payments
      Order.countDocuments({ paymentMethod: "cod" }),
      Order.countDocuments({ paymentMethod: "online" }),
      Order.countDocuments({ whatsappSent: true }),
      // Recent orders
      Order.find().sort("-createdAt").limit(10).lean(),
      // Top products
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 8 },
      ]),
      // Daily sales (7 days)
      (async () => {
        const daily: { date: string; sales: number; orders: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
          const dayData = await Order.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
            { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
          ]);
          daily.push({
            date: dayStart.toISOString().slice(0, 10),
            sales: dayData[0]?.sales || 0,
            orders: dayData[0]?.orders || 0,
          });
        }
        return daily;
      })(),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueWeek = revenueWeekAgg[0]?.total || 0;
    const revenueMonth = revenueMonthAgg[0]?.total || 0;
    const revenueLastMonth = revenueLastMonthAgg[0]?.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const revenueChange = revenueLastMonth > 0
      ? Math.round(((revenueMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : revenueMonth > 0 ? 100 : 0;

    const ordersLastMonthCount = ordersLastMonth;
    const orderChange = ordersLastMonthCount > 0
      ? Math.round(((ordersMonth - ordersLastMonthCount) / ordersLastMonthCount) * 100)
      : ordersMonth > 0 ? 100 : 0;

    // Monthly chart (last 7 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyChart: { month: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const mData = await Order.aggregate([
        { $match: { createdAt: { $gte: mStart, $lte: mEnd } } },
        { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]);
      monthlyChart.push({
        month: monthNames[d.getMonth()],
        sales: mData[0]?.sales || 0,
        orders: mData[0]?.orders || 0,
      });
    }

    // Category sales
    const categorySales = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          let: { productName: "$items.name" },
          pipeline: [
            { $match: { $expr: { $eq: ["$name", "$$productName"] } } },
            { $project: { category: 1 } },
          ],
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$productInfo.category", "Other"] },
          total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      dashboard: {
        revenue: {
          total: totalRevenue,
          today: revenueToday,
          thisWeek: revenueWeek,
          thisMonth: revenueMonth,
          avgOrderValue,
          revenueChange,
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersWeek,
          thisMonth: ordersMonth,
          orderChange,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        payments: {
          cod: codOrders,
          online: onlineOrders,
          whatsapp: whatsappOrders,
        },
        recentOrders,
        topProducts,
        dailySales: dailySalesData,
        monthlyChart,
        categorySales,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
