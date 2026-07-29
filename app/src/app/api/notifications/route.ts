import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: user.id }).sort("-createdAt").skip(skip).limit(limit),
      Notification.countDocuments({ user: user.id }),
      Notification.countDocuments({ user: user.id, read: false }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const notification = await Notification.create(body);
    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}