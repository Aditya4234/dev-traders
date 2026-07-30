import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/lib/models/Ticket";
import { protect } from "@/lib/middleware/auth";

function generateTicketId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `TKT-${num}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { subject, message, category, priority } = await request.json();

    if (!subject || !message || !category) {
      return NextResponse.json({ success: false, message: "Subject, message and category are required" }, { status: 400 });
    }

    const ticket = await Ticket.create({
      userId: user.id,
      ticketId: generateTicketId(),
      subject: subject.trim(),
      message: message.trim(),
      category: category.trim(),
      priority: priority || "medium",
      status: "open",
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: Record<string, unknown> = { userId: user.id };
    if (status && status !== "all") filter.status = status;

    const skip = (page - 1) * limit;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort("-createdAt").skip(skip).limit(limit).lean(),
      Ticket.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}