import { Router, Request, Response } from "express";
import Newsletter from "../models/Newsletter";

const router = Router();

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.json({ success: true, message: "You are already subscribed!" });
      return;
    }

    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: "Successfully subscribed to newsletter!" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/newsletter/subscribers (Admin)
router.get("/subscribers", async (_req: Request, res: Response) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort("-createdAt");
    res.json({ success: true, subscribers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
