import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { optionalAuth } from "@/lib/middleware/auth";
import { getPersonalizedRecommendations } from "@/lib/services/recommendations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await optionalAuth(request);
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const recommendations = await getPersonalizedRecommendations(user?.id, productId, limit);
    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}