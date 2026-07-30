import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import { protect, wholesellerOnly } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

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
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.find().sort('-createdAt').limit(10).lean(),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            sales: { $sum: '$total' },
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
      { $group: { _id: '$user', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'count' },
    ]);
    const totalCustomers = await Order.distinct('user').then((users: any) => users.length);
    const repeatRate = totalCustomers > 0
      ? Math.round(((repeatCustomers[0]?.count || 0) / totalCustomers) * 100)
      : 0;

    const categorySales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          let: { productName: '$items.name' },
          pipeline: [
            { $match: { $expr: { $eq: ['$name', '$$productName'] } } },
            { $project: { category: 1 } },
          ],
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$productInfo.category', 'Other'] },
          total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const monthlyChart = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthData = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: null, sales: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]);

      monthlyChart.push({
        month: monthNames[d.getMonth()],
        sales: monthData[0]?.sales || 0,
        orders: monthData[0]?.orders || 0,
      });
    }

    return NextResponse.json({
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
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
