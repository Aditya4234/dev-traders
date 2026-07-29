import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Address from "@/lib/models/Address";
import { protect } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const addresses = await Address.find({ user: user.id }).sort("-isDefault -createdAt");
    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    const { label, name, phone, address, city, pincode, isDefault } = await request.json();

    if (!name || !phone || !address || !city || !pincode) {
      return NextResponse.json({ success: false, message: "Name, phone, address, city, and pincode are required" }, { status: 400 });
    }

    if (isDefault) {
      await Address.updateMany({ user: user.id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: user.id });
    const newAddress = await Address.create({
      user: user.id,
      label: label || "Home",
      name,
      phone,
      address,
      city,
      pincode,
      isDefault: isDefault || count === 0,
    });

    return NextResponse.json({ success: true, address: newAddress }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}