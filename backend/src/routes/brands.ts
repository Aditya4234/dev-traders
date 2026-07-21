import { Router, Request, Response } from "express";
import Brand from "../models/Brand";

const router = Router();

// GET /api/brands
router.get("/", async (_req: Request, res: Response) => {
  try {
    const brands = await Brand.find({ isActive: true });
    res.json({ success: true, brands });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/brands/:slug
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
    if (!brand) {
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }
    res.json({ success: true, brand });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
