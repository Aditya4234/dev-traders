import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/lib/models/Ticket";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const userId = user.id;

    const [open, inProgress, resolved, closed] = await Promise.all([
      Ticket.countDocuments({ userId, status: "open" }),
      Ticket.countDocuments({ userId, status: "in-progress" }),
      Ticket.countDocuments({ userId, status: "resolved" }),
      Ticket.countDocuments({ userId, status: "closed" }),
    ]);

    return NextResponse.json({
      success: true,
      stats: { open, inProgress, resolved, closed, total: open + inProgress + resolved + closed },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}