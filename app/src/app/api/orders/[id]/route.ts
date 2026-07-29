import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { protect } from "@/lib/middleware/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (user.role !== "admin" && user.role !== "dealer" && order.user?.toString() !== user.id) {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
