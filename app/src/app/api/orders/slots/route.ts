import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const slots = [
    { label: "Morning (9 AM - 12 PM)", value: "morning" },
    { label: "Afternoon (12 PM - 3 PM)", value: "afternoon" },
    { label: "Evening (3 PM - 6 PM)", value: "evening" },
  ];
  return NextResponse.json({ success: true, slots });
}
