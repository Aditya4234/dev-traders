import { Router, Response } from "express";
import Ticket from "../models/Ticket";
import { protect, AuthRequest } from "../middleware/auth";

const router = Router();

function generateTicketId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${num}`;
}

// POST /api/tickets - Create a new ticket
router.post("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message, category, priority } = req.body;

    if (!subject || !message || !category) {
      res.status(400).json({ success: false, message: "Subject, message and category are required" });
      return;
    }

    const ticket = await Ticket.create({
      userId: req.user!.id,
      ticketId: generateTicketId(),
      subject: subject.trim(),
      message: message.trim(),
      category: category.trim(),
      priority: priority || "medium",
      status: "open",
    });

    res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tickets - List current user's tickets
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { userId: req.user!.id };
    if (status && status !== "all") filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort("-createdAt").skip(skip).limit(limitNum).lean(),
      Ticket.countDocuments(filter),
    ]);

    res.json({
      success: true,
      tickets,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tickets/stats - Get ticket counts by status
router.get("/stats", protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const [open, inProgress, resolved, closed] = await Promise.all([
      Ticket.countDocuments({ userId, status: "open" }),
      Ticket.countDocuments({ userId, status: "in-progress" }),
      Ticket.countDocuments({ userId, status: "resolved" }),
      Ticket.countDocuments({ userId, status: "closed" }),
    ]);

    res.json({
      success: true,
      stats: { open, inProgress, resolved, closed, total: open + inProgress + resolved + closed },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tickets/:id - Get single ticket
router.get("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user!.id }).lean();
    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }
    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tickets/:id/reply - Add a reply to ticket
router.post("/:id/reply", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: "Reply message is required" });
      return;
    }

    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    ticket.replies.push({ message: message.trim(), by: req.user!.name, date: new Date() });
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
