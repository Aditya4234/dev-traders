import { Router, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import User from "../models/User";
import { protect, wholesellerOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/stats - Dashboard statistics
router.get("/stats", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      totalOrders,
      ordersThisMonth,
      _ordersLastMonth,
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
      topProducts,
      _monthlySales,
      totalProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: startOfMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.find().sort("-createdAt").limit(10).lean(),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            sales: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.countDocuments({ isActive: true }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const thisMonthRevenue = revenueThisMonthAgg[0]?.total || 0;
    const lastMonthRevenue = revenueLastMonthAgg[0]?.total || 0;
    const thisMonthOrders = revenueThisMonthAgg[0]?.count || 0;
    const lastMonthOrders = revenueLastMonthAgg[0]?.count || 0;

    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const thisMonthAvg = thisMonthOrders > 0 ? Math.round(thisMonthRevenue / thisMonthOrders) : 0;

    const revenueChange = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : thisMonthRevenue > 0 ? 100 : 0;
    const orderChange = lastMonthOrders > 0
      ? Math.round(((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100)
      : thisMonthOrders > 0 ? 100 : 0;

    const repeatCustomers = await Order.aggregate([
      { $group: { _id: "$user", orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "count" },
    ]);
    const totalCustomers = await Order.distinct("user").then((users) => users.length);
    const repeatRate = totalCustomers > 0
      ? Math.round(((repeatCustomers[0]?.count || 0) / totalCustomers) * 100)
      : 0;

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

    // Build monthly chart data for last 7 months
    const monthlyChart = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthData = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]);

      monthlyChart.push({
        month: monthNames[d.getMonth()],
        sales: monthData[0]?.sales || 0,
        orders: monthData[0]?.orders || 0,
      });
    }

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalProducts,
        totalCustomers,
        repeatRate,
        thisMonthRevenue,
        thisMonthOrders,
        thisMonthAvg,
        revenueChange,
        orderChange,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders,
        topProducts,
        monthlyChart,
        categorySales,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users/search - Search users for invoicing
router.get("/users/search", protect, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "dealer")) {
      res.status(403).json({ success: false, message: "Wholeseller access only" });
      return;
    }

    const { q } = req.query as { q?: string };
    if (!q || q.trim().length < 2) {
      res.json({ success: true, users: [] });
      return;
    }

    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select("name email phone role companyName dealerId")
      .limit(20)
      .lean();

    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users - List all users with login/activity data (admin/dealer)
router.get("/users", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "50", role, search } = req.query as Record<string, string>;

    const filter: any = {};
    if (role && role !== "all") filter.role = role;
    if (search && search.trim().length >= 2) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email phone role companyName dealerId lastLoginAt loginCount createdAt profileImage")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/overview - Comprehensive admin overview
router.get("/overview", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      // User stats
      totalUsers,
      totalCustomers,
      totalDealers,
      totalAdmins,
      newUsersThisMonth,
      newUsersThisWeek,
      activeUsers,
      usersLoggedInToday,
      // Order stats
      totalOrders,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      confirmedOrders,
      shippedOrders,
      // Revenue stats
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueTodayAgg,
      revenueThisWeekAgg,
      // Payment stats
      codOrders,
      onlineOrders,
      whatsappOrders,
      // Product stats
      totalProducts,
      activeProducts,
      lowStockProducts,
      // Recent orders
      recentOrders,
    ] = await Promise.all([
      // User stats
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "dealer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: startOfDay } }),
      // Order stats
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.countDocuments({ status: "confirmed" }),
      Order.countDocuments({ status: "shipped" }),
      // Revenue stats
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Payment stats
      Order.countDocuments({ paymentMethod: "cod" }),
      Order.countDocuments({ paymentMethod: "online" }),
      Order.countDocuments({ whatsappSent: true }),
      // Product stats
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      0,
      // Recent orders
      Order.find().sort("-createdAt").limit(10).lean(),
    ]);

    // Low stock products
    const lowStockData = await import("../models/Inventory").then(async (mod) => {
      const Inventory = mod.default;
      const lowStock = await Inventory.find({ $and: [{ quantity: { $lte: 10 } }, { quantity: { $gt: 0 } }] })
        .populate("product", "name image")
        .select("product quantity sku")
        .limit(10)
        .lean();
      return lowStock;
    }).catch(() => []);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueThisWeek = revenueThisWeekAgg[0]?.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Daily sales for last 7 days
    const dailySales: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const dayData = await Order.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
        { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]);
      dailySales.push({
        date: dayStart.toISOString().slice(0, 10),
        sales: dayData[0]?.sales || 0,
        orders: dayData[0]?.orders || 0,
      });
    }

    res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          dealers: totalDealers,
          admins: totalAdmins,
          newThisMonth: newUsersThisMonth,
          newThisWeek: newUsersThisWeek,
          activeLast30Days: activeUsers,
          loggedInToday: usersLoggedInToday,
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          total: totalRevenue,
          today: revenueToday,
          thisWeek: revenueThisWeek,
          thisMonth: revenueThisMonth,
          avgOrderValue,
        },
        payments: {
          cod: codOrders,
          online: onlineOrders,
          whatsapp: whatsappOrders,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockData,
        },
        recentOrders,
        dailySales,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
