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
    const { name, email, password, phone, role, companyName, dealerId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Name, email and password are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
    }

    const userRole = role === "dealer" ? "dealer" : "customer";

    const userData: any = {
      name,
      email,
      password,
      phone,
      role: userRole,
      lastLoginAt: new Date(),
      loginCount: 1,
    };

    if (userRole === "dealer") {
      if (companyName) userData.companyName = companyName;
      if (dealerId) userData.dealerId = dealerId;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id.toString());

    const response = NextResponse.json({ success: true, token, user: sanitizeUser(user) }, { status: 201 });
    response.cookies.set("riya_session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
  }
}
