import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Offer from "@/lib/models/Offer";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const offers = await Offer.find({
      isActive: true,
      validUntil: { $gte: new Date() },
    });
    return NextResponse.json({ success: true, offers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
