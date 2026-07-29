import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dealer from "@/lib/models/Dealer";
import Order from "@/lib/models/Order";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return NextResponse.json({ success: false, message: "Dealer not found" }, { status: 404 });
    }
    const orders = await Order.find({ user: dealer.user }).sort("-createdAt");
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}