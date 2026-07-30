import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { protect } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);

    if (user.role !== 'admin' && user.role !== 'dealer') {
      return NextResponse.json({ success: false, message: 'Wholeseller access only' }, { status: 403 });
    }

    const q = request.nextUrl.searchParams.get('q');
    if (!q || q.trim().length < 2) {
      return NextResponse.json({ success: true, users: [] });
    }

    const regex = new RegExp(q.trim(), 'i');
    const users = await User.find({
      $or: [
        { name: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select('name email phone role companyName dealerId')
      .limit(20)
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}
