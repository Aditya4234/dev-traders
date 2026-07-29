import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { protect } from "@/lib/middleware/auth";

function sanitizeUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
    profileImage: user.profileImage || null,
    companyName: user.companyName || null,
    dealerId: user.dealerId || null,
    permissions: user.permissions || [],
    lastLoginAt: user.lastLoginAt || null,
    loginCount: user.loginCount || 0,
  };
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await protect(request);
    const { name, phone, companyName, dealerId, preferences } = await request.json();
    const user = await User.findById(authUser.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (companyName) user.companyName = companyName;
    if (dealerId) user.dealerId = dealerId;
    if (preferences) {
      if (!user.preferences) user.preferences = { notifications: true, emailUpdates: true };
      if (typeof preferences.notifications === 'boolean') user.preferences.notifications = preferences.notifications;
      if (typeof preferences.emailUpdates === 'boolean') user.preferences.emailUpdates = preferences.emailUpdates;
    }
    await user.save();

    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
