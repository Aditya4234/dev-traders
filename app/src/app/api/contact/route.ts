import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Contact from "@/lib/models/Contact";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: "Name, email, subject and message are required" }, { status: 400 });
    }

    const contact = await Contact.create({ name, email, phone, subject, message });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent. We will get back to you soon.",
      contact,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status");

    const filter: any = {};
    if (status && status !== "all") filter.status = status;

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Contact.find(filter).sort("-createdAt").skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      messages,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}