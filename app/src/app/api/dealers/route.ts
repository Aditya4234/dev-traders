import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Dealer from '@/lib/models/Dealer';
import { protect, adminOnly } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);

    const searchParams = request.nextUrl.searchParams;
    const tier = searchParams.get('tier');
    const active = searchParams.get('active');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const filter: any = {};
    if (tier) filter.tier = tier;
    if (active !== undefined) filter.isActive = active === 'true';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [dealers, total] = await Promise.all([
      Dealer.find(filter)
        .populate('user', 'name email phone')
        .sort({ totalRevenue: -1 })
        .skip(skip)
        .limit(limitNum),
      Dealer.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      dealers,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    adminOnly(user);

    const body = await request.json();
    const dealer = await Dealer.create(body);

    return NextResponse.json({ success: true, dealer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
