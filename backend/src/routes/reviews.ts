import { Router, Request, Response } from "express";
import Review from "../models/Review";

const router = Router();

// GET /api/reviews
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.productId) {
      filter.productId = req.query.productId;
    }

    const reviews = await Review.find(filter).sort("-createdAt");
    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reviews
router.post("/", async (req: Request, res: Response) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/reviews/:id
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      res.status(404).json({ success: false, message: "Review not found" });
      return;
    }
    res.json({ success: true, message: "Review deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
