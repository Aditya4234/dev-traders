import Razorpay from "razorpay";
import crypto from "crypto";

let razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay | null {
  if (razorpay) return razorpay;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    console.log("[Payment] Razorpay credentials not set");
    return null;
  }
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpay;
}

export async function createRazorpayOrder(
  amount: number,
  receipt: string,
  notes?: Record<string, string>
): Promise<{ orderId: string; amount: number; currency: string } | null> {
  const rp = getRazorpay();
  if (!rp) return null;
  try {
    const order = await rp.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: notes || {},
    });
    return { orderId: order.id, amount: Number(order.amount), currency: order.currency };
  } catch (err) {
    console.error("[Payment] Create order error:", (err as Error).message);
    return null;
  }
}

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  try {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
    return expectedSignature === razorpaySignature;
  } catch {
    return false;
  }
}

export async function capturePayment(paymentId: string, amount?: number): Promise<boolean> {
  const rp = getRazorpay();
  if (!rp) return false;
  try {
    const captureAmount = amount ? Math.round(amount * 100) : undefined;
    await (rp.payments as any).capture(paymentId, captureAmount);
    return true;
  } catch (err) {
    console.error("[Payment] Capture error:", (err as Error).message);
    return false;
  }
}

export async function createRefund(paymentId: string, amount: number, notes?: Record<string, string>): Promise<{ refundId: string } | null> {
  const rp = getRazorpay();
  if (!rp) return null;
  try {
    const refund = await (rp.payments as any).refund(paymentId, {
      amount: Math.round(amount * 100),
      notes: notes || {},
    });
    return { refundId: refund.id };
  } catch (err) {
    console.error("[Payment] Refund error:", (err as Error).message);
    return null;
  }
}

export async function fetchPayment(paymentId: string): Promise<any | null> {
  const rp = getRazorpay();
  if (!rp) return null;
  try {
    return await (rp.payments as any).fetch(paymentId);
  } catch (err) {
    console.error("[Payment] Fetch error:", (err as Error).message);
    return null;
  }
}
