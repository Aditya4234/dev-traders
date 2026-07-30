import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetPasswordToken");
    if (!user) {
      return NextResponse.json({ success: true, message: "If the email exists, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    (user as any).resetPasswordToken = hashedToken;
    (user as any).resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    return NextResponse.json({ success: true, message: "If the email exists, a password reset link has been sent" });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
