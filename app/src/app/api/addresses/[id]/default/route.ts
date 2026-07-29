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

    await Address.updateMany({ user: user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}