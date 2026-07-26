import { Router, Request, Response } from "express";
import Payment from "../models/Payment";
import Order from "../models/Order";
import { protect, optionalAuth, adminOnly, AuthRequest } from "../middleware/auth";
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  capturePayment,
  createRefund,
} from "../services/payment";

const router = Router();

// POST /api/payments/create-order - Create Razorpay order
router.post("/create-order", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: "Valid amount required" });
      return;
    }

    const receipt = orderId || `order_${Date.now()}`;
    const rpOrder = await createRazorpayOrder(amount, receipt, {
      orderId: orderId || "",
    });

    if (!rpOrder) {
      res.status(500).json({ success: false, message: "Failed to create payment order" });
      return;
    }

    const payment = await Payment.create({
      orderId: orderId || undefined,
      razorpayOrderId: rpOrder.orderId,
      amount,
      currency: rpOrder.currency,
      method: "online",
      status: "created",
      customer: {
        name: req.user?.name || req.body.customerName || "Guest",
        email: req.user?.email || req.body.customerEmail,
        phone: req.body.customerPhone || req.user?.phone || "",
      },
      description,
    });

    res.status(201).json({
      success: true,
      razorpayOrderId: rpOrder.orderId,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/verify - Verify payment
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ success: false, message: "Payment verification data required" });
      return;
    }

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
      await Payment.findByIdAndUpdate(paymentId, {
        status: "failed",
        failureReason: "Invalid signature",
      });
      res.status(400).json({ success: false, message: "Payment verification failed" });
      return;
    }

    const captured = await capturePayment(razorpayPaymentId);

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId,
        razorpaySignature,
        status: captured ? "captured" : "authorized",
      },
      { new: true }
    );

    if (payment?.orderId && captured) {
      await Order.findByIdAndUpdate(payment.orderId, { paymentMethod: "online" });
    }

    res.json({
      success: true,
      status: captured ? "captured" : "authorized",
      payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/refund - Process refund
router.post("/refund", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    if (!payment.razorpayPaymentId) {
      res.status(400).json({ success: false, message: "No Razorpay payment to refund" });
      return;
    }

    const refundAmount = amount || payment.amount;
    const refund = await createRefund(payment.razorpayPaymentId, refundAmount, {
      reason: reason || "Refund requested",
    });

    if (refund) {
      payment.refundId = refund.refundId;
      payment.refundAmount = refundAmount;
      payment.refundStatus = "processed";
      payment.status = "refunded";
      await payment.save();
    }

    res.json({
      success: true,
      refund: refund ? { refundId: refund.refundId, amount: refundAmount } : null,
      payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments - List all payments (admin)
router.get("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status, method, page = "1", limit = "20" } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (method) filter.method = method;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("orderId", "customer total")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      payments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/payments/:id
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("orderId");
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }
    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
