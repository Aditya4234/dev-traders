import { Router, Request, Response } from "express";
import Category from "../models/Category";

const router = Router();

// GET /api/categories
router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort("sortOrder");
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories/:slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories (Admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id (Admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
