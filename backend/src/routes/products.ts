import { Router, Request, Response } from "express";
import Product from "../models/Product";

const router = Router();

// GET /api/products - List all products with search, filter, sort, pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      badge,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = "1",
      limit = "50",
    } = req.query;

    const filter: any = { isActive: true };

    if (search && typeof search === "string") {
      filter.$text = { $search: search };
    }

    if (category && typeof category === "string") {
      filter.category = category;
    }

    if (badge && typeof badge === "string") {
      filter.badge = badge;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    let sortOption: any = { createdAt: -1 };

    switch (sort) {
      case "price_asc":
        sortOption = { discountPrice: 1 };
        break;
      case "price_desc":
        sortOption = { discountPrice: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "new":
        sortOption = { createdAt: -1 };
        break;
      case "bestseller":
        sortOption = { reviewCount: -1 };
        break;
      case "popular":
        sortOption = { reviewCount: -1, rating: -1 };
        break;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      products,
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

// GET /api/products/search?q=bra
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ success: false, message: "Search query required" });
      return;
    }
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ],
    });
    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/category/:name
router.get("/category/:name", async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isActive: true,
      category: { $regex: req.params.name, $options: "i" },
    });
    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/brand/:name
router.get("/brand/:name", async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isActive: true,
      brand: { $regex: req.params.name, $options: "i" },
    });
    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products (Admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id (Admin)
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id (Admin)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
