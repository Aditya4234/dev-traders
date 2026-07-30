import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/lib/models/Wishlist";
import { protect } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId required" }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ user: user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user.id, products: [] });
    }

    const index = wishlist.products.indexOf(productId);
    let action: string;

    if (index > -1) {
      wishlist.products.splice(index, 1);
      action = "removed";
    } else {
      wishlist.products.push(productId);
      action = "added";
    }

    await wishlist.save();

    return NextResponse.json({ success: true, action, wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}