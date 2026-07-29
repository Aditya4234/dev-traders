import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import { protect, optionalAuth, wholesellerOnly } from "@/lib/middleware/auth";
import { sendOrderNotification } from "@/lib/services/notification";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(request);
    const body = await request.json();
    const { items, customer, paymentMethod, whatsappSent } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { success: false, message: "Order must have at least one item" },
        { status: 400 }
      );
    }

    if (!customer?.name || !customer?.phone || !customer?.address || !customer?.city || !customer?.pincode) {
      return NextResponse.json(
        { success: false, message: "Complete customer details required" },
        { status: 400 }
      );
    }

    const validatedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
          throw new Error(`Product ${item.product} not found or unavailable`);
        }
        const price = product.discountPrice || product.price;
        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        return {
          product: product._id,
          name: product.name,
          price,
          quantity,
          image: product.image,
        };
      })
    );

    const subtotal = validatedItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const shipping = subtotal >= 999 ? 0 : 49;
    const total = subtotal + shipping;

    const orderData: any = {
      items: validatedItems,
      customer,
      subtotal,
      shipping,
      total,
      paymentMethod: paymentMethod || "cod",
      whatsappSent: whatsappSent || false,
    };

    if (user?.id) {
      orderData.user = user.id;
    }

    const order = await Order.create(orderData);

    sendOrderNotification(order).catch((err: any) =>
      console.error("[Order] Notification failed:", err)
    );

    try {
      const wholesellerUsers = await User.find({ role: { $in: ["admin", "dealer"] } }).select("_id");
      if (wholesellerUsers.length > 0) {
        const shortId = String(order._id).slice(-8).toUpperCase();
        const itemNames = order.items.map((i: any) => i.name).join(", ");
        const notifications = wholesellerUsers.map((u: any) => ({
          user: u._id,
          title: "New Order Received",
          message: `Order #${shortId} from ${customer.name} — ₹${total.toLocaleString("en-IN")} (${itemNames})`,
          type: "order" as const,
          link: "/dashboard/orders",
        }));
        await Notification.insertMany(notifications);
      }
    } catch (err: any) {
      console.error("[Order] In-app notification failed:", err);
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);

    const orders = await Order.find().sort("-createdAt");
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    if (error.status) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
