import { Router, Request, Response } from "express";
import Product from "../models/Product";

const router = Router();

// POST /api/admin/product
router.post("/product", async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/product/:id
router.put("/product/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/product/:id
router.delete("/product/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
