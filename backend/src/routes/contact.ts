import { Router, Request, Response } from "express";
import Contact from "../models/Contact";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

// POST /api/contact - Submit contact form
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: "Name, email, subject and message are required" });
      return;
    }

    const contact = await Contact.create({ name, email, phone, subject, message });

    res.status(201).json({
      success: true,
      message: "Your message has been sent. We will get back to you soon.",
      contact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contact - List all messages (admin only)
router.get("/", protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20", status } = req.query as Record<string, string>;

    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
      Contact.find(filter).sort("-createdAt").skip(skip).limit(limitNum).lean(),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      messages,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/contact/:id/read - Mark as read (admin only)
router.put("/:id/read", protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const msg = await Contact.findByIdAndUpdate(req.params.id, { status: "read" }, { new: true });
    if (!msg) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    res.json({ success: true, message: "Marked as read", contact: msg });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
