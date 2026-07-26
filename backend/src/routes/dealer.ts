import { Router, Request, Response } from "express";
import Dealer from "../models/Dealer";
import Order from "../models/Order";
import Invoice from "../models/Invoice";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/dealers - List all dealers (admin)
router.get("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { tier, active, page = "1", limit = "20" } = req.query;

    const filter: any = {};
    if (tier) filter.tier = tier;
    if (active !== undefined) filter.isActive = active === "true";

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [dealers, total] = await Promise.all([
      Dealer.find(filter)
        .populate("user", "name email phone")
        .sort({ totalRevenue: -1 })
        .skip(skip)
        .limit(limitNum),
      Dealer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      dealers,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/dealers - Create dealer (admin)
router.post("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const dealer = await Dealer.create(req.body);
    res.status(201).json({ success: true, dealer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dealers/:id - Get dealer by ID
router.get("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const dealer = await Dealer.findById(req.params.id).populate("user", "name email phone");
    if (!dealer) {
      res.status(404).json({ success: false, message: "Dealer not found" });
      return;
    }
    res.json({ success: true, dealer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/dealers/:id - Update dealer
router.put("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dealer) {
      res.status(404).json({ success: false, message: "Dealer not found" });
      return;
    }
    res.json({ success: true, dealer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dealers/:id/dashboard - Dealer dashboard data
router.get("/:id/dashboard", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) {
      res.status(404).json({ success: false, message: "Dealer not found" });
      return;
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentOrders,
      pendingInvoices,
      totalInvoices,
      monthlyRevenue,
    ] = await Promise.all([
      Order.find({ user: dealer.user })
        .sort("-createdAt")
        .limit(10)
        .lean(),
      Invoice.countDocuments({ dealer: dealer._id, status: { $in: ["issued", "overdue"] } }),
      Invoice.countDocuments({ dealer: dealer._id }),
      Invoice.aggregate([
        {
          $match: {
            dealer: dealer._id,
            createdAt: { $gte: thirtyDaysAgo },
            status: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    res.json({
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
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dealers/:id/orders - Get dealer orders
router.get("/:id/orders", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const dealer = await Dealer.findById(req.params.id);
    if (!dealer) {
      res.status(404).json({ success: false, message: "Dealer not found" });
      return;
    }

    const orders = await Order.find({ user: dealer.user }).sort("-createdAt");
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
