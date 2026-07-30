import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/lib/models/Newsletter";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: true, message: "You are already subscribed!" });
    }

    await Newsletter.create({ email });
    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter!" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
