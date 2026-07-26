import { Router, Request, Response } from "express";
import Inventory from "../models/Inventory";
import { protect, adminOnly, AuthRequest } from "../middleware/auth";
import { cacheDelPattern } from "../services/redis";

const router = Router();

// GET /api/inventory - List all inventory items (admin)
router.get("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { search, lowStock, warehouse, page = "1", limit = "50" } = req.query;

    const filter: any = {};

    if (search && typeof search === "string") {
      filter.$or = [
        { sku: { $regex: search, $options: "i" } },
        { warehouse: { $regex: search, $options: "i" } },
      ];
    }

    if (lowStock === "true") {
      filter.$expr = { $lte: ["$quantity", "$lowStockThreshold"] };
    }

    if (warehouse && typeof warehouse === "string") {
      filter.warehouse = warehouse;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate("product", "name brand image category")
        .sort({ quantity: 1 })
        .skip(skip)
        .limit(limitNum),
      Inventory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/inventory/stats
router.get("/stats", protect, adminOnly, async (_req: AuthRequest, res: Response) => {
  try {
    const [totalProducts, lowStockItems, outOfStockItems, totalValue, warehouseStats] =
      await Promise.all([
        Inventory.countDocuments(),
        Inventory.countDocuments({ $expr: { $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", "$lowStockThreshold"] }] } }),
        Inventory.countDocuments({ quantity: 0 }),
        Inventory.aggregate([
          { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$costPrice"] } } } },
        ]),
        Inventory.aggregate([
          { $group: { _id: "$warehouse", count: { $sum: 1 }, totalQty: { $sum: "$quantity" } } },
        ]),
      ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue[0]?.total || 0,
        warehouseStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/inventory/:productId
router.get("/:productId", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Inventory.findOne({ product: req.params.productId })
      .populate("product", "name brand image category price");
    if (!item) {
      res.status(404).json({ success: false, message: "Inventory item not found" });
      return;
    }
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inventory - Create inventory record
router.post("/", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Inventory.create(req.body);
    await cacheDelPattern("cache:/api/products*");
    res.status(201).json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/inventory/:id - Update inventory
router.put("/:id", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      res.status(404).json({ success: false, message: "Inventory item not found" });
      return;
    }
    await cacheDelPattern("cache:/api/products*");
    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inventory/:id/restock - Restock inventory
router.post("/:id/restock", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { quantity, costPrice } = req.body;
    if (!quantity || quantity <= 0) {
      res.status(400).json({ success: false, message: "Valid quantity required" });
      return;
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: "Inventory item not found" });
      return;
    }

    item.quantity += quantity;
    if (costPrice) item.costPrice = costPrice;
    item.lastRestockedAt = new Date();
    await item.save();

    res.json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/inventory/bulk-update - Bulk inventory update
router.post("/bulk-update", protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
      res.status(400).json({ success: false, message: "Updates array required" });
      return;
    }

    const operations = updates.map((u: any) => ({
      updateOne: {
        filter: { product: u.productId },
        update: { $set: { quantity: u.quantity, costPrice: u.costPrice } },
      },
    }));

    const result = await Inventory.bulkWrite(operations);
    await cacheDelPattern("cache:/api/products*");

    res.json({ success: true, modified: result.modifiedCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
