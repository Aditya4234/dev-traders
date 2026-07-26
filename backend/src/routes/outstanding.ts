import { Router, Response } from "express";
import Order from "../models/Order";
import { CreditAccount } from "../models/CreditLedger";
import { protect, adminOnly, wholesellerOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/outstanding - My outstanding dues
router.get("/", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const account = await CreditAccount.findOne({ user: req.user!.id });

    const pendingOrders = await Order.find({
      user: req.user!.id,
      status: { $in: ["pending", "confirmed", "shipped"] },
      paymentMethod: "cod",
    })
      .sort("-createdAt")
      .lean();

    const totalOutstanding = pendingOrders.reduce((sum, o) => sum + o.total, 0);
    const creditBalance = account?.currentBalance || 0;

    res.json({
      success: true,
      outstanding: {
        pendingOrders: pendingOrders.length,
        totalPending: totalOutstanding,
        creditBalance,
        totalOutstanding: totalOutstanding + creditBalance,
      },
      orders: pendingOrders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/outstanding/all - Admin: all dealers outstanding
router.get("/all", protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const dealers = await CreditAccount.find()
      .populate("user", "name email companyName phone")
      .sort("-currentBalance")
      .lean();

    const result = await Promise.all(
      dealers.map(async (d) => {
        const pendingOrders = await Order.countDocuments({
          user: d.user._id,
          status: { $in: ["pending", "confirmed", "shipped"] },
          paymentMethod: "cod",
        });
        const pendingAmount = await Order.aggregate([
          {
            $match: {
              user: d.user._id,
              status: { $in: ["pending", "confirmed", "shipped"] },
              paymentMethod: "cod",
            },
          },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);

        return {
          dealer: d.user,
          creditBalance: d.currentBalance,
          creditLimit: d.creditLimit,
          pendingOrders,
          pendingAmount: pendingAmount[0]?.total || 0,
          totalOutstanding: d.currentBalance + (pendingAmount[0]?.total || 0),
        };
      })
    );

    res.json({ success: true, dealers: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
