import { Router, Response } from "express";
import Coupon from "../models/Coupon";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/coupons - List available coupons (admin sees all, users see active)
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === "admin";
    const filter: any = isAdmin ? {} : { isActive: true, validUntil: { $gte: new Date() } };

    const coupons = await Coupon.find(filter)
      .populate("createdBy", "name")
      .sort("-createdAt")
      .lean();

    res.json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/coupons - Create coupon (admin only)
router.post("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, applicableTo, specificUser, validFrom, validUntil } = req.body;

    if (!code || !description || !discountType || !discountValue || !validUntil) {
      res.status(400).json({ success: false, message: "Code, description, discountType, discountValue and validUntil are required" });
      return;
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: "Coupon code already exists" });
      return;
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      usageLimit,
      applicableTo: applicableTo || "all",
      specificUser,
      validFrom: validFrom || new Date(),
      validUntil,
      createdBy: req.user!.id,
    });

    res.status(201).json({ success: true, coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/coupons/validate - Validate a coupon code
router.post("/validate", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid coupon code" });
      return;
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      res.status(400).json({ success: false, message: "Coupon has expired or is not yet valid" });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      return;
    }

    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` });
      return;
    }

    let discount = coupon.discountType === "percentage"
      ? (orderAmount || 0) * (coupon.discountValue / 100)
      : coupon.discountValue;

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        description: coupon.description,
      },
      discount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/coupons/apply - Mark coupon as used
router.post("/apply", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }

    coupon.usedCount += 1;
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      coupon.isActive = false;
    }
    await coupon.save();

    res.json({ success: true, message: "Coupon applied" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/coupons/:id - Update coupon (admin)
router.put("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json({ success: true, coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/coupons/:id - Delete coupon (admin)
router.delete("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
