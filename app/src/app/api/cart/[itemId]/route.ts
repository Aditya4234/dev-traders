import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Cart from "@/lib/models/Cart";
import { optionalAuth } from "@/lib/middleware/auth";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await context.params;
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
      return NextResponse.json({ success: false, message: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item._id?.toString() !== itemId
    );
    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
