import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Notification from "@/lib/models/Notification";
import { protect } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    await Notification.updateMany({ user: user.id, read: false }, { read: true });
    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}