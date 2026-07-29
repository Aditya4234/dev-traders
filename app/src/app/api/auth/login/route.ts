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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = generateToken(user._id.toString());

    return NextResponse.json({ success: true, token, user: sanitizeUser(user) });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
