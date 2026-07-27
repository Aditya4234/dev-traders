import { Router, Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";
import { protect, optionalAuth, wholesellerOnly, AuthRequest } from "../middleware/auth";
import { sendOrderNotification } from "../services/notification";

const router = Router();

// POST /api/orders - Create order
router.post("/", optionalAuth, async (req: AuthRequest, res: Response) => {
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

    const validatedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          throw new Error(`Product ${item.product} not found or unavailable`);
        }
        const price = product.discountPrice || product.price;
        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        return {
          product: product._id,
          name: product.name,
          price,
          quantity,
          image: product.image,
        };
      })
    );

    const subtotal = validatedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;

    const orderData: any = {
      items: validatedItems,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || "cod",
      whatsappSent: whatsappSent || false,
    };

    if (req.user?.id) {
      orderData.user = req.user.id;
    }

    const order = await Order.create(orderData);

    sendOrderNotification(order).catch((err: any) =>
      console.error("[Order] Notification failed:", err)
    );

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders - Get all orders (admin)
router.get("/", protect, wholesellerOnly, async (_req: Request, res: Response) => {
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

// GET /api/orders/stats - Get order stats for logged-in user
router.get("/stats", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const isWholeseller = req.user?.role === "admin" || req.user?.role === "dealer";

    const matchStage: any = isWholeseller ? {} : { user: userId };

    const [stats] = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      stats: stats || {
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        shippedOrders: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (req.user?.role !== "admin" && req.user?.role !== "dealer" && order.user?.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/status (Admin/Dealer)
router.put("/:id/status", protect, wholesellerOnly, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      return;
    }
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

// GET /api/orders/:id/status - Poll order status (for real-time tracking)
router.get("/:id/status", protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).select("status updatedAt");
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (req.user?.role !== "admin" && req.user?.role !== "dealer" && order.user?.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    res.json({ success: true, status: order.status, updatedAt: order.updatedAt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id/stream - SSE for real-time order tracking
router.get("/:id/stream", protect, async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).select("status user");
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    if (req.user?.role !== "admin" && req.user?.role !== "dealer" && order.user?.toString() !== req.user?.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let lastStatus = order.status;

    const interval = setInterval(async () => {
      try {
        const updated = await Order.findById(req.params.id).select("status updatedAt");
        if (updated && updated.status !== lastStatus) {
          lastStatus = updated.status;
          res.write(`data: ${JSON.stringify({ status: updated.status, updatedAt: updated.updatedAt })}\n\n`);
        }
      } catch {
        // ignore
      }
    }, 5000);

    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
