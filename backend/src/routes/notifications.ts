import { Router, Request, Response } from "express";
import Notification from "../models/Notification";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/notifications - Get user notifications
router.get("/", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { page = "1", limit = "50" } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user?.id })
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments({ user: req.user?.id }),
      Notification.countDocuments({ user: req.user?.id, read: false }),
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/read - Mark as read
router.put("/:id/read", protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }
    res.json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put("/read-all", protect, async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user?.id, read: false },
      { read: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/notifications - Create notification (Admin)
router.post("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", protect, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user?.id,
    });
    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }
    res.json({ success: true, message: "Notification deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
