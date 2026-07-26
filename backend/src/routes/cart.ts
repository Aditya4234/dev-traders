import { Router, Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import { optionalAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/cart
router.get("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    const userId = req.user?.id;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      res.json({ success: true, cart: { items: [] } });
      return;
    }

    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cart - Add item to cart
router.post("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { product: productId, quantity, size } = req.body;
    const sessionId = req.headers["x-session-id"] as string;
    const userId = req.user?.id;

    if (!productId || !quantity) {
      res.status(400).json({ success: false, message: "Product and quantity required" });
      return;
    }

    const dbProduct = await Product.findById(productId);
    if (!dbProduct || !dbProduct.isActive) {
      res.status(400).json({ success: false, message: "Product not found or unavailable" });
      return;
    }

    const price = dbProduct.discountPrice || dbProduct.price;
    const name = dbProduct.name;
    const image = dbProduct.image;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      const cartData: any = {
        items: [{ product: productId, name, price, quantity, image, size }],
      };
      if (userId) cartData.user = userId;
      if (sessionId) cartData.sessionId = sessionId;
      cart = await Cart.create(cartData);
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = price;
      } else {
        cart.items.push({ product: productId, name, price, quantity, image, size });
      }
      await cart.save();
    }

    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cart/:itemId - Remove item from cart
router.delete("/:itemId", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = req.headers["x-session-id"] as string;
    const userId = req.user?.id;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      res.status(404).json({ success: false, message: "Cart not found" });
      return;
    }

    cart.items = cart.items.filter(
      (item) => item._id?.toString() !== req.params.itemId
    );
    await cart.save();

    res.json({ success: true, cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
