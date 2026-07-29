import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { protect, wholesellerOnly } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const sevenDaysAgoStart = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    sevenDaysAgoStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCustomers,
      totalDealers,
      totalAdmins,
      newUsersThisMonth,
      newUsersThisWeek,
      activeUsers,
      usersLoggedInToday,
      totalOrders,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
      orderStatusCounts,
      revenueAgg,
      revenueTodayAgg,
      revenueWeekAgg,
      revenueMonthAgg,
      paymentCounts,
      totalProducts,
      activeProducts,
      recentOrders,
      lowStockData,
      dailySalesAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'dealer' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ lastLoginAt: { $gte: startOfDay } }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: sevenDaysAgo } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } },
      ]),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find().sort('-createdAt').limit(10).lean(),
      (async () => {
        try {
          const { default: Inventory } = await import('@/lib/models/Inventory');
          return await Inventory.find({ quantity: { $lte: 10, $gt: 0 } })
            .populate('product', 'name image')
            .select('product quantity sku')
            .limit(10)
            .lean();
        } catch { return []; }
      })(),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgoStart } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const statusMap = Object.fromEntries(orderStatusCounts.map((o: any) => [o._id, o.count]));
    const paymentMap = Object.fromEntries(paymentCounts.map((p: any) => [p._id, p.count]));
    const totalRevenue = revenueAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueThisWeek = revenueWeekAgg[0]?.total || 0;
    const revenueThisMonth = revenueMonthAgg[0]?.total || 0;

    const dailySales: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const found = dailySalesAgg.find((d: any) => d._id === dateStr);
      dailySales.push({ date: dateStr, sales: found?.sales || 0, orders: found?.orders || 0 });
    }

    return NextResponse.json({
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
          pending: statusMap.pending || 0,
          confirmed: statusMap.confirmed || 0,
          shipped: statusMap.shipped || 0,
          delivered: statusMap.delivered || 0,
          cancelled: statusMap.cancelled || 0,
        },
        revenue: {
          total: totalRevenue,
          today: revenueToday,
          thisWeek: revenueThisWeek,
          thisMonth: revenueThisMonth,
          avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        },
        payments: {
          cod: paymentMap.cod || 0,
          online: paymentMap.online || 0,
          whatsapp: paymentMap.whatsapp || 0,
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
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
