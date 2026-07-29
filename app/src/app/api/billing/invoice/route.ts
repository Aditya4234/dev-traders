import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { protect, wholesellerOnly } from "@/lib/middleware/auth";
import { createInvoice, CreateInvoiceInput } from "@/lib/services/billing";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await protect(request);
    wholesellerOnly(user);
    const input: CreateInvoiceInput = await request.json();
    if (!input.customer?.name || !input.customer?.phone || !input.customer?.city || !input.customer?.state || !input.customer?.pincode) {
      return NextResponse.json({ success: false, message: "Customer name, phone, city, state, and pincode are required" }, { status: 400 });
    }
    if (!input.placeOfSupply) {
      return NextResponse.json({ success: false, message: "Place of supply is required" }, { status: 400 });
    }
    if (!input.items || input.items.length === 0) {
      return NextResponse.json({ success: false, message: "At least one item is required" }, { status: 400 });
    }
    const invoice = await createInvoice(input);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("required") || error.message.includes("must have") || error.message.includes("must be at least")) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 500 });
  }
}