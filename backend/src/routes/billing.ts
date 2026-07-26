import { Router, Request, Response } from "express";
import Invoice from "../models/Invoice";
import { protect, AuthRequest } from "../middleware/auth";
import { createInvoice, updateInvoicePayment, CreateInvoiceInput } from "../services/billing";

const router = Router();

// POST /api/billing/invoice - Create invoice
router.post("/invoice", protect, async (req: AuthRequest, res: Response) => {
  try {
    const input: CreateInvoiceInput = req.body;
    const invoice = await createInvoice(input);
    res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/billing/invoices - List all invoices
router.get("/invoices", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status, dealerId, page = "1", limit = "20" } = req.query as Record<string, string>;

    const filter: any = {};
    if (status) filter.status = status;
    if (dealerId) filter.dealer = dealerId;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate("dealer", "businessName dealerCode")
        .populate("orderId", "customer total")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Invoice.countDocuments(filter),
    ]);

    res.json({
      success: true,
      invoices,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/billing/invoices/:id - Get invoice by ID
router.get("/invoices/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("dealer", "businessName dealerCode gstNumber address")
      .populate("orderId");
    if (!invoice) {
      res.status(404).json({ success: false, message: "Invoice not found" });
      return;
    }
    res.json({ success: true, invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/billing/invoices/:id/status - Update invoice status
router.put("/invoices/:id/status", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!invoice) {
      res.status(404).json({ success: false, message: "Invoice not found" });
      return;
    }
    res.json({ success: true, invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/billing/invoices/:id/pay - Record payment against invoice
router.post("/invoices/:id/pay", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Valid amount required" });
      return;
    }

    const invoice = await updateInvoicePayment(
      req.params.id as string,
      amount,
      (paymentMethod as string) || "online"
    );

    res.json({ success: true, invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/billing/stats - Billing statistics
router.get("/stats", protect, async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyStats, statusStats, overdueCount] = await Promise.all([
      Invoice.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: "$totalAmount" },
            totalCollected: { $sum: "$paidAmount" },
            totalGST: { $sum: "$totalGST" },
            count: { $sum: 1 },
          },
        },
      ]),
      Invoice.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
      ]),
      Invoice.countDocuments({ status: "overdue" }),
    ]);

    res.json({
      success: true,
      stats: {
        monthly: monthlyStats[0] || { totalInvoiced: 0, totalCollected: 0, totalGST: 0, count: 0 },
        byStatus: statusStats,
        overdueCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
