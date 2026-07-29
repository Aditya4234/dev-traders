import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { protect, adminOnly } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const filter: any = { isActive: true };
    const type = request.nextUrl.searchParams.get("type");
    if (type) {
      filter.type = type;
    }
    const collections = await Collection.find(filter).sort("sortOrder");
    return NextResponse.json({ success: true, collections });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);
    const body = await request.json();
    const collection = await Collection.create(body);
    return NextResponse.json({ success: true, collection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}
