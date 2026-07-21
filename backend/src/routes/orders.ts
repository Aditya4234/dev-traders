import { Router, Request, Response } from "express";
import Order from "../models/Order";
import { protect, AuthRequest } from "../middleware/auth";
import { sendOrderNotification } from "../services/notification";

const router = Router();

// POST /api/orders - Create order
router.post("/", async (req: Request, res: Response) => {
  try {
    const { items, customer, paymentMethod, whatsappSent } = req.body;

    if (!items || !items.length) {
      res.status(400).json({ success: false, message: "Order must have at least one item" });
      return;
    }

    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city || !customer?.pincode) {
      res.status(400).json({ success: false, message: "Complete customer details required" });
      return;
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;

    const order = await Order.create({
      items,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || "cod",
      whatsappSent: whatsappSent || false,
    });

    // Send WhatsApp/SMS notification to admin
    sendOrderNotification(order).catch((err) =>
      console.error("[Order] Notification failed:", err)
    );

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders - Get all orders (admin)
router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort("-createdAt");
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/my - Get user orders
router.get("/my", protect, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user?.id }).sort("-createdAt");
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/status (Admin)
router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
