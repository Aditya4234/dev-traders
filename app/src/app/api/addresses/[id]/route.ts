import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Address from "@/lib/models/Address";
import { protect } from "@/lib/middleware/auth";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const address = await Address.findOne({ _id: id, user: user.id });
    if (!address) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    const body = await request.json();
    if (body.isDefault) {
      await Address.updateMany({ user: user.id }, { isDefault: false });
    }

    Object.assign(address, body);
    await address.save();

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    await connectDB();
    const user = await protect(request);
    const address = await Address.findOneAndDelete({ _id: id, user: user.id });
    if (!address) {
      return NextResponse.json({ success: false, message: "Address not found" }, { status: 404 });
    }

    if (address.isDefault) {
      const latest = await Address.findOne({ user: user.id }).sort("-createdAt");
      if (latest) {
        latest.isDefault = true;
        await latest.save();
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: error.status || 500 });
  }
}