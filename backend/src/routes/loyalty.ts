import { Router, Response } from "express";
import { LoyaltyAccount, LoyaltyTransaction } from "../models/Loyalty";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

const POINTS_PER_ORDER = 10;
const POINTS_PER_REVIEW = 25;
const POINTS_PER_REFERRAL = 100;
const POINTS_PROFILE_BONUS = 50;

// GET /api/loyalty - Get my loyalty account
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    let account = await LoyaltyAccount.findOne({ user: req.user!.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: req.user!.id, totalPoints: 0 });
    }
    const transactions = await LoyaltyTransaction.find({ user: req.user!.id })
      .sort("-createdAt")
      .limit(50)
      .lean();
    res.json({ success: true, account, transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/loyalty/earn - Earn points (internal/system)
router.post("/earn", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { points, description, orderId } = req.body;
    if (!points || points <= 0) {
      res.status(400).json({ success: false, message: "Valid points required" });
      return;
    }

    let account = await LoyaltyAccount.findOne({ user: req.user!.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: req.user!.id, totalPoints: 0 });
    }

    account.totalPoints += points;
    await account.save();

    await LoyaltyTransaction.create({
      user: req.user!.id,
      points,
      type: "earned",
      description: description || "Points earned",
      orderId,
    });

    res.json({ success: true, account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/loyalty/redeem - Redeem points
router.post("/redeem", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { points, description } = req.body;
    if (!points || points <= 0) {
      res.status(400).json({ success: false, message: "Valid points required" });
      return;
    }

    const account = await LoyaltyAccount.findOne({ user: req.user!.id });
    if (!account || account.totalPoints < points) {
      res.status(400).json({ success: false, message: "Insufficient points" });
      return;
    }

    account.totalPoints -= points;
    await account.save();

    await LoyaltyTransaction.create({
      user: req.user!.id,
      points: -points,
      type: "redeemed",
      description: description || "Points redeemed",
    });

    res.json({ success: true, account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/loyalty/all - Admin: all accounts
router.get("/all", protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const accounts = await LoyaltyAccount.find().populate("user", "name email").sort("-totalPoints").lean();
    res.json({ success: true, accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/loyalty/earn-on-order - Called internally when order is delivered
router.post("/earn-on-order", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, orderTotal } = req.body;
    const points = Math.floor(orderTotal / 10) * POINTS_PER_ORDER;

    let account = await LoyaltyAccount.findOne({ user: req.user!.id });
    if (!account) {
      account = await LoyaltyAccount.create({ user: req.user!.id, totalPoints: 0 });
    }

    account.totalPoints += points;
    await account.save();

    await LoyaltyTransaction.create({
      user: req.user!.id,
      points,
      type: "earned",
      description: `Order #${orderId?.toString().slice(-6).toUpperCase()} placed`,
      orderId,
    });

    res.json({ success: true, account, pointsEarned: points });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
