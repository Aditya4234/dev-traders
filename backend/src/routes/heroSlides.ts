import { Router, Request, Response } from "express";
import HeroSlide from "../models/HeroSlide";

const router = Router();

// GET /api/hero-slides
router.get("/", async (_req: Request, res: Response) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort("sortOrder");
    res.json({ success: true, slides });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/hero-slides (Admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const slide = await HeroSlide.create(req.body);
    res.status(201).json({ success: true, slide });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/hero-slides/:id (Admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slide) {
      res.status(404).json({ success: false, message: "Slide not found" });
      return;
    }
    res.json({ success: true, slide });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/hero-slides/:id (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      res.status(404).json({ success: false, message: "Slide not found" });
      return;
    }
    res.json({ success: true, message: "Slide deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
