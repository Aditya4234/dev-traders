import { Router, Request, Response } from "express";
import Collection from "../models/Collection";

const router = Router();

// GET /api/collections
router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const collections = await Collection.find(filter).sort("sortOrder");
    res.json({ success: true, collections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/collections/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }
    res.json({ success: true, collection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/collections (Admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const collection = await Collection.create(req.body);
    res.status(201).json({ success: true, collection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/collections/:id (Admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }
    res.json({ success: true, collection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/collections/:id (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }
    res.json({ success: true, message: "Collection deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
