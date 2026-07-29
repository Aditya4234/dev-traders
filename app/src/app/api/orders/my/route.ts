import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);

    const orders = await Order.find({ user: user.id }).sort("-createdAt");
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
