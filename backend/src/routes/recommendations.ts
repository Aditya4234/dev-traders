import { Router, Request, Response } from "express";
import { optionalAuth, AuthRequest } from "../middleware/auth";
import {
  getPersonalizedRecommendations,
  getContentBasedRecommendations,
  getTrendingProducts,
} from "../services/recommendations";
import { searchProducts } from "../services/elasticsearch";
import Product from "../models/Product";

const router = Router();

// GET /api/recommendations/personalized
router.get("/personalized", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, limit = "10" } = req.query;
    const recommendations = await getPersonalizedRecommendations(
      req.user?.id,
      productId as string,
      parseInt(limit as string, 10)
    );
    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/recommendations/similar/:productId
router.get("/similar/:productId", async (req: Request, res: Response) => {
  try {
    const { limit = "10" } = req.query;
    const ids = await getContentBasedRecommendations(
      req.params.productId as string,
      parseInt(limit as string, 10)
    );

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    }).lean();

    res.json({ success: true, recommendations: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/recommendations/trending
router.get("/trending", async (req: Request, res: Response) => {
  try {
    const { limit = "10" } = req.query;
    const ids = await getTrendingProducts(parseInt(limit as string, 10));

    const products = await Product.find({
      _id: { $in: ids },
      isActive: true,
    }).lean();

    res.json({ success: true, recommendations: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/recommendations/search - Elasticsearch powered search
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q, category, minPrice, maxPrice, sort, from, size } = req.query as Record<string, string>;

    if (!q || typeof q !== "string") {
      res.status(400).json({ success: false, message: "Search query required" });
      return;
    }

    const result = await searchProducts(q, {
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort: sort as string,
      from: from ? Number(from) : undefined,
      size: size ? Number(size) : undefined,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
