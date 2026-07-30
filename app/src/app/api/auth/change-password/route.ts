import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { protect } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await protect(request);
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Current and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "New password must be at least 6 characters" }, { status: 400 });
    }

    const user = await User.findById(authUser.id).select("+password");
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
    }

    user.password = newPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.status === 401 ? "Not authorized" : "Something went wrong" }, { status: error.status || 500 });
  }
}
