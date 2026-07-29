import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/lib/models/Wishlist";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    let wishlist = await Wishlist.findOne({ user: user.id }).populate("products");
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user.id, products: [] });
    }
    return NextResponse.json({ success: true, wishlist });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}