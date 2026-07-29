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
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      confirmedOrders,
      shippedOrders,
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueTodayAgg,
      revenueThisWeekAgg,
      codOrders,
      onlineOrders,
      whatsappOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      recentOrders,
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
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ paymentMethod: 'cod' }),
      Order.countDocuments({ paymentMethod: 'online' }),
      Order.countDocuments({ whatsappSent: true }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      0,
      Order.find().sort('-createdAt').limit(10).lean(),
    ]);

    const lowStockData = await import('@/lib/models/Inventory').then(async (mod: any) => {
      const Inventory = mod.default;
      const lowStock = await Inventory.find({ $and: [{ quantity: { $lte: 10 } }, { quantity: { $gt: 0 } }] })
        .populate('product', 'name image')
        .select('product quantity sku')
        .limit(10)
        .lean();
      return lowStock;
    }).catch(() => []);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const revenueThisMonth = revenueThisMonthAgg[0]?.total || 0;
    const revenueToday = revenueTodayAgg[0]?.total || 0;
    const revenueThisWeek = revenueThisWeekAgg[0]?.total || 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const dailySales: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      const dayData = await Order.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
        { $group: { _id: null, sales: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]);
      dailySales.push({
        date: dayStart.toISOString().slice(0, 10),
        sales: dayData[0]?.sales || 0,
        orders: dayData[0]?.orders || 0,
      });
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
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
