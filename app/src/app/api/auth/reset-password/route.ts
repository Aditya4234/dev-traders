import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { generateToken } from "@/lib/middleware/auth";

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 });
    }

    user.password = password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpiry = undefined;
    await user.save();

    const newToken = generateToken(user._id.toString());
    return NextResponse.json({ success: true, message: "Password reset successful", token: newToken, user: sanitizeUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
