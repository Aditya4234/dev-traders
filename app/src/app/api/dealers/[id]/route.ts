import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Dealer from "@/lib/models/Dealer";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const dealer = await Dealer.findById(id).populate("user", "name email phone");
    if (!dealer) {
      return NextResponse.json({ success: false, message: "Dealer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, dealer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const dealer = await Dealer.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!dealer) {
      return NextResponse.json({ success: false, message: "Dealer not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, dealer });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}