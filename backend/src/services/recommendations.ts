import Product from "../models/Product";
import Order from "../models/Order";
import { cacheGet, cacheSet } from "./redis";

interface ProductScore {
  productId: string;
  score: number;
}

export async function getCollaborativeRecommendations(
  userId: string,
  limit: number = 10
): Promise<string[]> {
  const cacheKey = `rec:collab:${userId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const userOrders = await Order.find({ user: userId }).lean();
    if (!userOrders.length) return [];

    const purchasedProductIds = new Set<string>();
    const purchasedCategories = new Map<string, number>();
    const purchasedBrands = new Map<string, number>();

    for (const order of userOrders) {
      for (const item of order.items) {
        const pid = item.product.toString();
        purchasedProductIds.add(pid);
      }
    }

    const purchasedProducts = await Product.find({
      _id: { $in: Array.from(purchasedProductIds) },
    }).lean();

    for (const p of purchasedProducts) {
      purchasedCategories.set(p.category, (purchasedCategories.get(p.category) || 0) + 1);
      purchasedBrands.set(p.brand, (purchasedBrands.get(p.brand) || 0) + 1);
  }

    const relatedProducts = await Product.find({
      _id: { $nin: Array.from(purchasedProductIds) },
      isActive: true,
      $or: [
        { category: { $in: Array.from(purchasedCategories.keys()) } },
        { brand: { $in: Array.from(purchasedBrands.keys()) } },
      ],
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit * 2)
      .lean();

    const scored: ProductScore[] = relatedProducts.map((p) => {
      let score = 0;
      score += (purchasedCategories.get(p.category) || 0) * 2;
      score += (purchasedBrands.get(p.brand) || 0) * 1.5;
      score += p.rating * 0.5;
      score += Math.min(p.reviewCount / 100, 1) * 0.5;
      return { productId: p._id.toString(), score };
    });

    scored.sort((a, b) => b.score - a.score);
    const result = scored.slice(0, limit).map((s) => s.productId);

    await cacheSet(cacheKey, JSON.stringify(result), 3600);
    return result;
  } catch (err) {
    console.error("[Recommendations] Collaborative error:", (err as Error).message);
    return [];
  }
}

export async function getContentBasedRecommendations(
  productId: string,
  limit: number = 10
): Promise<string[]> {
  const cacheKey = `rec:content:${productId}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const product = await Product.findById(productId).lean();
    if (!product) return [];

    const similar = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand },
      ],
    })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();

    const result = similar.map((p) => p._id.toString());
    await cacheSet(cacheKey, JSON.stringify(result), 1800);
    return result;
  } catch (err) {
    console.error("[Recommendations] Content-based error:", (err as Error).message);
    return [];
  }
}

export async function getTrendingProducts(limit: number = 10): Promise<string[]> {
  const cacheKey = "rec:trending";
  const cached = await cacheGet(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trending = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", orderCount: { $sum: "$items.quantity" } } },
      { $sort: { orderCount: -1 } },
      { $limit: limit },
    ]);

    const result = trending.map((t: any) => t._id.toString());
    await cacheSet(cacheKey, JSON.stringify(result), 600);
    return result;
  } catch (err) {
    console.error("[Recommendations] Trending error:", (err as Error).message);
    return [];
  }
}

export async function getPersonalizedRecommendations(
  userId: string | undefined,
  currentProductId?: string,
  limit: number = 10
): Promise<any[]> {
  let productIds: string[] = [];

  if (userId) {
    productIds = await getCollaborativeRecommendations(userId, limit);
  }

  if (productIds.length < limit && currentProductId) {
    const contentIds = await getContentBasedRecommendations(
      currentProductId,
      limit - productIds.length
    );
    const idSet = new Set(productIds);
    for (const id of contentIds) {
      if (!idSet.has(id)) productIds.push(id);
    }
  }

  if (productIds.length < limit) {
    const trendingIds = await getTrendingProducts(limit - productIds.length);
    const idSet = new Set(productIds);
    for (const id of trendingIds) {
      if (!idSet.has(id)) productIds.push(id);
    }
  }

  if (productIds.length === 0) {
    return Product.find({ isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .lean();
  }

  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  }).lean();

  const orderMap = new Map(products.map((p, i) => [p._id.toString(), i]));
  return productIds
    .map((id) => {
      const idx = orderMap.get(id);
      return idx !== undefined ? products[idx] : null;
    })
    .filter(Boolean)
    .slice(0, limit);
}
