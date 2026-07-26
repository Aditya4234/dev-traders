import { Router, Response } from "express";
import Wishlist from "../models/Wishlist";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/wishlist - Get my wishlist
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user!.id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user!.id, products: [] });
    }
    res.json({ success: true, wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/wishlist/toggle - Add/remove product from wishlist
router.post("/toggle", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: "productId required" });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user!.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user!.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let action: string;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = "removed";
    } else {
      wishlist.products.push(productId);
      action = "added";
    }

    await wishlist.save();

    res.json({ success: true, action, wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/wishlist/:productId - Remove specific product
router.delete("/:productId", protect, async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user!.id });
    if (!wishlist) {
      res.status(404).json({ success: false, message: "Wishlist not found" });
      return;
    }

    const idx = wishlist.products.indexOf(req.params.productId as any);
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
    }

    res.json({ success: true, wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
