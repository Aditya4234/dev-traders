import { Router, Request, Response } from "express";
import Offer from "../models/Offer";

const router = Router();

// GET /api/offers
router.get("/", async (_req: Request, res: Response) => {
  try {
    const offers = await Offer.find({
      isActive: true,
      validUntil: { $gte: new Date() },
    });
    res.json({ success: true, offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
