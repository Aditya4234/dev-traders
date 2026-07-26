import { Router, Response } from "express";
import { CreditEntry, CreditAccount } from "../models/CreditLedger";
import { protect, adminOnly, wholesellerOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/credit - My credit account
router.get("/", protect, wholesellerOnly, async (req: AuthRequest, res: Response) => {
  try {
    let account = await CreditAccount.findOne({ user: req.user!.id });
    if (!account) {
      account = await CreditAccount.create({ user: req.user!.id });
    }
    const entries = await CreditEntry.find({ user: req.user!.id })
      .sort("-createdAt")
      .limit(100)
      .populate("orderId", "total status")
      .lean();
    res.json({ success: true, account, entries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/credit/credit - Add credit (admin gives credit to dealer)
router.post("/credit", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, description, orderId, invoiceId } = req.body;

    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: "userId and positive amount required" });
      return;
    }

    let account = await CreditAccount.findOne({ user: userId });
    if (!account) {
      account = await CreditAccount.create({ user: userId });
    }

    account.currentBalance += amount;
    account.totalCreditUsed += amount;
    await account.save();

    const entry = await CreditEntry.create({
      user: userId,
      type: "credit",
      amount,
      description: description || "Credit added",
      orderId,
      invoiceId,
      balance: account.currentBalance,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, entry, account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/credit/debit - Debit credit (payment received)
router.post("/debit", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, description, orderId, invoiceId } = req.body;

    if (!userId || !amount || amount <= 0) {
      res.status(400).json({ success: false, message: "userId and positive amount required" });
      return;
    }

    const account = await CreditAccount.findOne({ user: userId });
    if (!account) {
      res.status(404).json({ success: false, message: "No credit account found" });
      return;
    }

    account.currentBalance = Math.max(0, account.currentBalance - amount);
    account.totalPaid += amount;
    await account.save();

    const entry = await CreditEntry.create({
      user: userId,
      type: "debit",
      amount,
      description: description || "Payment received",
      orderId,
      invoiceId,
      balance: account.currentBalance,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, entry, account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/credit/limit/:userId - Set credit limit (admin)
router.put("/limit/:userId", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { creditLimit } = req.body;
    let account = await CreditAccount.findOne({ user: req.params.userId });
    if (!account) {
      account = await CreditAccount.create({ user: req.params.userId });
    }
    account.creditLimit = creditLimit || 0;
    await account.save();
    res.json({ success: true, account });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/credit/all - Admin: all credit accounts
router.get("/all", protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const accounts = await CreditAccount.find()
      .populate("user", "name email companyName")
      .sort("-currentBalance")
      .lean();
    res.json({ success: true, accounts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/credit/entries/:userId - Admin: credit entries for a user
router.get("/entries/:userId", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await CreditEntry.find({ user: req.params.userId })
      .sort("-createdAt")
      .populate("orderId", "total status")
      .lean();
    res.json({ success: true, entries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
