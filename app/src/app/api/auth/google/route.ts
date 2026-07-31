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
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ success: false, message: "Google credential is required" }, { status: 400 });
    }

    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const tokenData: any = await googleRes.json();

    if (tokenData.error_description || tokenData.error) {
      return NextResponse.json({ success: false, message: "Invalid Google token" }, { status: 401 });
    }

    const { email, name, picture } = tokenData;

    if (!email) {
      return NextResponse.json({ success: false, message: "Could not extract email from Google token" }, { status: 401 });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-16) + "A1!",
        profileImage: picture || undefined,
        lastLoginAt: new Date(),
        loginCount: 1,
      });
    } else {
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    }

    const token = generateToken(user._id.toString());

    const response = NextResponse.json({ success: true, token, user: sanitizeUser(user) });
    response.cookies.set("riya_session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
    return response;
  } catch (error: any) {
    console.error("[GOOGLE LOGIN ERROR]", error?.message || error);
    return NextResponse.json({ success: false, message: error?.message || "Google login failed" }, { status: 500 });
  }
}
