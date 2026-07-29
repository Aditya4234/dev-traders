import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Inventory from "@/lib/models/Inventory";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const [totalProducts, lowStockItems, outOfStockItems, totalValue, warehouseStats] =
      await Promise.all([
        Inventory.countDocuments(),
        Inventory.countDocuments({
          $expr: {
            $and: [
              { $gt: ["$quantity", 0] },
              { $lte: ["$quantity", "$lowStockThreshold"] },
            ],
          },
        }),
        Inventory.countDocuments({ quantity: 0 }),
        Inventory.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$costPrice"] } },
            },
          },
        ]),
        Inventory.aggregate([
          { $group: { _id: "$warehouse", count: { $sum: 1 }, totalQty: { $sum: "$quantity" } } },
        ]),
      ]);
    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.total || 0,
        warehouseStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}