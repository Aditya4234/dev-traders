import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/lib/models/Wishlist";
import { protect } from "@/lib/middleware/auth";

export async function DELETE(request: NextRequest, context: { params: Promise<{ productId: string }> }) {
  const { productId } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const wishlist = await Wishlist.findOne({ user: user.id });
    if (!wishlist) {
      return NextResponse.json({ success: false, message: "Wishlist not found" }, { status: 404 });
    }

    const idx = wishlist.products.indexOf(productId as any);
    if (idx > -1) {
      wishlist.products.splice(idx, 1);
      await wishlist.save();
    }

    return NextResponse.json({ success: true, wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}