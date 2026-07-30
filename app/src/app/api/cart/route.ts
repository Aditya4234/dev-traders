import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/lib/models/Cart";
import Product from "@/lib/models/Product";
import { optionalAuth } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(request);
    const sessionId = request.headers.get("x-session-id") as string;

    let cart;
    if (user?.id) {
      cart = await Cart.findOne({ user: user.id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return NextResponse.json({ success: true, cart: { items: [] } });
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(request);
    const body = await request.json();
    const { product: productId, quantity, size } = body;
    const sessionId = request.headers.get("x-session-id") as string;

    if (!productId || !quantity) {
      return NextResponse.json(
        { success: false, message: "Product and quantity required" },
        { status: 400 }
      );
    }

    const dbProduct = await Product.findById(productId);
    if (!dbProduct || !dbProduct.isActive) {
      return NextResponse.json(
        { success: false, message: "Product not found or unavailable" },
        { status: 400 }
      );
    }

    const price = dbProduct.discountPrice || dbProduct.price;
    const name = dbProduct.name;
    const image = dbProduct.image;

    let cart;
    if (user?.id) {
      cart = await Cart.findOne({ user: user.id });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      const cartData: any = {
        items: [{ product: productId, name, price, quantity, image, size }],
      };
      if (user?.id) cartData.user = user.id;
      if (sessionId) cartData.sessionId = sessionId;
      cart = await Cart.create(cartData);
    } else {
      const existingItem = cart.items.find(
        (item: any) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = price;
      } else {
        cart.items.push({ product: productId, name, price, quantity, image, size });
      }
      await cart.save();
    }

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
