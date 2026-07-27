import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const ADMIN_WHATSAPP = "919205778531";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "guptadharmendra280@gmail.com";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  note?: string;
}

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function buildOrderMessage(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number
): string {
  const itemLines = items
    .map(
      (item) =>
        `• ${item.name} (x${item.quantity}) — ${formatPrice(
          item.price * item.quantity
        )}`
    )
    .join("\n");

  const shippingText =
    shipping === 0 ? "FREE (above ₹999)" : formatPrice(shipping);

  return [
    `🛍️ *New Order — Riya Touch*`,
    `📦 Order ID: #${orderId.slice(-8).toUpperCase()}`,
    ``,
    `👤 *Customer:* ${customer.name}`,
    `📞 *Phone:* ${customer.phone}`,
    `📍 *Address:* ${customer.address}, ${customer.city} — ${customer.pincode}`,
    customer.note ? `📝 *Note:* ${customer.note}` : "",
    ``,
    `*Order Items:*`,
    itemLines,
    ``,
    `💰 *Subtotal:* ${formatPrice(subtotal)}`,
    `🚚 *Shipping:* ${shippingText}`,
    `✅ *Total:* ${formatPrice(total)}`,
    ``,
    `_Riya Touch — Wholesale Innerwear_`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOrderEmailHtml(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number
): string {
  const shortId = orderId.slice(-8).toUpperCase();
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const shippingText =
    shipping === 0 ? `<span style="color:#22c55e;font-weight:600;">FREE</span>` : formatPrice(shipping);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,sans-serif;background:#f8f9fa;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f472b6,#a855f7);padding:24px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">🛍️ New Order Received</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;">Order #${shortId}</p>
    </div>
    <div style="padding:24px 32px;">
      <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:16px;border-bottom:2px solid #f472b6;padding-bottom:8px;">Customer Details</h2>
      <table style="width:100%;font-size:14px;color:#4a5568;line-height:1.8;">
        <tr><td style="font-weight:600;width:120px;">Name</td><td>${customer.name}</td></tr>
        <tr><td style="font-weight:600;">Phone</td><td><a href="tel:${customer.phone}" style="color:#a855f7;">${customer.phone}</a></td></tr>
        <tr><td style="font-weight:600;">Address</td><td>${customer.address}, ${customer.city} — ${customer.pincode}</td></tr>
        ${customer.note ? `<tr><td style="font-weight:600;">Note</td><td style="color:#f59e0b;">${customer.note}</td></tr>` : ""}
      </table>

      <h2 style="color:#1a1a2e;margin:24px 0 16px;font-size:16px;border-bottom:2px solid #f472b6;padding-bottom:8px;">Order Items</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f8f9fa;">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#4a5568;">Item</th>
            <th style="padding:8px 12px;text-align:center;font-weight:600;color:#4a5568;">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-weight:600;color:#4a5568;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="margin-top:20px;padding:16px;background:#f8f9fa;border-radius:8px;">
        <table style="width:100%;font-size:14px;color:#4a5568;">
          <tr><td>Subtotal</td><td style="text-align:right;">${formatPrice(subtotal)}</td></tr>
          <tr><td>Shipping</td><td style="text-align:right;">${shippingText}</td></tr>
          <tr><td style="font-weight:700;font-size:16px;color:#1a1a2e;">Total</td><td style="text-align:right;font-weight:700;font-size:16px;color:#a855f7;">${formatPrice(total)}</td></tr>
        </table>
      </div>

      <div style="margin-top:20px;text-align:center;">
        <a href="https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`New Order #${shortId} from ${customer.name} — Total ${formatPrice(total)}\n\nOpen dashboard: ${process.env.FRONTEND_URL || "https://dev-traders-two.vercel.app"}/dashboard/admin`)}" 
           style="display:inline-block;padding:12px 32px;background:#25D366;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          💬 Reply on WhatsApp
        </a>
      </div>
    </div>
    <div style="background:#f8f9fa;padding:16px 32px;text-align:center;color:#9ca3af;font-size:12px;">
      Riya Touch — Wholesale Innerwear
    </div>
  </div>
</body>
</html>`;
}

function buildPlainOrderText(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number
): string {
  const shortId = orderId.slice(-8).toUpperCase();
  const itemLines = items
    .map((item) => `  ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  return [
    `NEW ORDER — Riya Touch`,
    `Order #${shortId}`,
    ``,
    `Customer: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}, ${customer.city} — ${customer.pincode}`,
    customer.note ? `Note: ${customer.note}` : "",
    ``,
    `Items:`,
    itemLines,
    ``,
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${shipping === 0 ? "FREE" : formatPrice(shipping)}`,
    `Total: ${formatPrice(total)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ─── Email (Gmail SMTP via nodemailer) ─────────────────────────────
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (_transporter) return _transporter;

  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!user || !pass) {
    console.log("[Notification] SMTP_EMAIL / SMTP_APP_PASSWORD not set, email disabled");
    return null;
  }

  _transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return _transporter;
}

// ─── Web3 Forms (free email — no SMTP needed) ──────────────────────
async function sendViaWeb3Forms(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number
): Promise<boolean> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.log("[Notification] WEB3FORMS_ACCESS_KEY not set, skipping Web3 Forms");
    return false;
  }

  const shortId = orderId.slice(-8).toUpperCase();
  const itemLines = items
    .map((item) => `• ${item.name} (x${item.quantity}) — ${formatPrice(item.price * item.quantity)}`)
    .join("\n");
  const shippingText = shipping === 0 ? "FREE (above ₹999)" : formatPrice(shipping);

  const message = [
    `New Order — Riya Touch`,
    `Order ID: #${shortId}`,
    ``,
    `Customer: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.address}, ${customer.city} — ${customer.pincode}`,
    customer.note ? `Note: ${customer.note}` : "",
    ``,
    `Items:`,
    itemLines,
    ``,
    `Subtotal: ${formatPrice(subtotal)}`,
    `Shipping: ${shippingText}`,
    `Total: ${formatPrice(total)}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New Order #${shortId} — ${formatPrice(total)}`,
        from_name: "Riya Touch Orders",
        to: ADMIN_EMAIL,
        message,
      }),
    });

    const data = (await res.json()) as { success?: boolean; message?: string };
    if (data.success) {
      console.log(`[Notification] Web3 Forms email sent for order #${shortId}`);
      return true;
    }

    console.error("[Notification] Web3 Forms error:", data.message || "unknown");
    return false;
  } catch (err) {
    console.error("[Notification] Web3 Forms failed:", err);
    return false;
  }
}

async function sendEmail(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const shortId = orderId.slice(-8).toUpperCase();
  const html = buildOrderEmailHtml(orderId, items, customer, subtotal, shipping, total);
  const text = buildPlainOrderText(orderId, items, customer, subtotal, shipping, total);

  try {
    await transporter.sendMail({
      from: `"Riya Touch Orders" <${process.env.SMTP_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🛒 New Order #${shortId} — ${formatPrice(total)}`,
      text,
      html,
      replyTo: "guptadharmendra280@gmail.com",
    });
    console.log(`[Notification] Email sent for order #${shortId} to ${ADMIN_EMAIL}`);
    return true;
  } catch (err) {
    console.error("[Notification] Email failed:", err);
    return false;
  }
}

// ─── WhatsApp Cloud API (Meta) ─────────────────────────────────────
async function sendWhatsAppViaCloudAPI(
  phone: string,
  message: string
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log("[Notification] WhatsApp Cloud API not configured, skipping");
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (res.ok) {
      console.log(`[Notification] WhatsApp Cloud sent to ${phone}`);
      return true;
    }

    const err = await res.text();
    console.error(`[Notification] WhatsApp Cloud API error: ${err}`);
    return false;
  } catch (err) {
    console.error("[Notification] WhatsApp Cloud send failed:", err);
    return false;
  }
}

// ─── CallMeBot (free WhatsApp) ─────────────────────────────────────
async function sendWhatsAppViaCallMeBot(
  phone: string,
  message: string
): Promise<boolean> {
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!apiKey) {
    console.log("[Notification] CallMeBot API key not configured, skipping");
    return false;
  }

  try {
    const encoded = encodeURIComponent(message);
    const res = await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`
    );

    if (res.ok) {
      console.log(`[Notification] CallMeBot WhatsApp sent to ${phone}`);
      return true;
    }

    console.error("[Notification] CallMeBot error:", await res.text());
    return false;
  } catch (err) {
    console.error("[Notification] CallMeBot failed:", err);
    return false;
  }
}

// ─── MSG91 SMS ─────────────────────────────────────────────────────
async function sendSMSViaMSG91(
  phone: string,
  message: string
): Promise<boolean> {
  const apiKey = process.env.MSG91_API_KEY;

  if (!apiKey) {
    console.log("[Notification] MSG91 API key not configured, skipping");
    return false;
  }

  try {
    const res = await fetch("https://api.msg91.com/api/v5/flow", {
      method: "POST",
      headers: {
        authkey: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flow_id: process.env.MSG91_FLOW_ID,
        mobiles: `91${phone}`,
        VAR1: message,
      }),
    });

    if (res.ok) {
      console.log(`[Notification] SMS sent to ${phone} via MSG91`);
      return true;
    }

    console.error("[Notification] MSG91 error:", await res.text());
    return false;
  } catch (err) {
    console.error("[Notification] MSG91 failed:", err);
    return false;
  }
}

// ─── Generic Webhook ───────────────────────────────────────────────
async function sendGenericWebhook(
  orderId: string,
  message: string,
  customer: OrderCustomer,
  total: number
): Promise<boolean> {
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;

  if (!webhookUrl) return false;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, message, customer, total }),
    });

    if (res.ok) {
      console.log(`[Notification] Webhook sent for order ${orderId}`);
      return true;
    }

    console.error("[Notification] Webhook error:", await res.text());
    return false;
  } catch (err) {
    console.error("[Notification] Webhook failed:", err);
    return false;
  }
}

// ─── Smart: try every provider until one succeeds ──────────────────
async function sendViaSmartFallback(
  orderId: string,
  items: OrderItem[],
  customer: OrderCustomer,
  subtotal: number,
  shipping: number,
  total: number,
  message: string
): Promise<boolean> {
  const shortId = orderId.slice(-8).toUpperCase();
  const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `New Order #${shortId} from ${customer.name}\nTotal: ${formatPrice(total)}\n\nOpen: ${process.env.FRONTEND_URL || "https://dev-traders-two.vercel.app"}/dashboard/admin`
  )}`;

  // 0. Try Web3 Forms first (free, no SMTP needed — just access key)
  if (await sendViaWeb3Forms(orderId, items, customer, subtotal, shipping, total)) return true;

  // 1. Try Gmail SMTP email
  if (await sendEmail(orderId, items, customer, subtotal, shipping, total)) return true;

  // 2. Try WhatsApp Cloud API
  if (await sendWhatsAppViaCloudAPI(ADMIN_WHATSAPP, message)) return true;

  // 3. Try CallMeBot
  if (await sendWhatsAppViaCallMeBot(ADMIN_WHATSAPP, message)) return true;

  // 4. Try SMS
  if (await sendSMSViaMSG91(ADMIN_WHATSAPP, message)) return true;

  // 5. Nothing worked — log the wa.me URL so user can open manually
  console.log(`[Notification] ⚠️  No provider sent. Open WhatsApp manually:`);
  console.log(`[Notification] 🔗 ${waUrl}`);
  console.log(`[Notification] 📋 Order message for #${shortId}:`);
  console.log(message);

  return false;
}

// ─── Main export ───────────────────────────────────────────────────
export async function sendOrderNotification(order: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id: any;
  items: OrderItem[];
  customer: OrderCustomer;
  subtotal: number;
  shipping: number;
  total: number;
}): Promise<void> {
  const orderId = String(order._id);
  const message = buildOrderMessage(
    orderId,
    order.items,
    order.customer,
    order.subtotal,
    order.shipping,
    order.total
  );

  const shortId = orderId.slice(-8).toUpperCase();
  console.log(`[Notification] New order #${shortId} — trying providers...`);

  const provider = process.env.NOTIFICATION_PROVIDER || "smart";

  let sent = false;

  switch (provider) {
    case "smart":
      sent = await sendViaSmartFallback(
        orderId,
        order.items,
        order.customer,
        order.subtotal,
        order.shipping,
        order.total,
        message
      );
      break;

    case "email":
      sent = await sendEmail(orderId, order.items, order.customer, order.subtotal, order.shipping, order.total);
      break;

    case "web3forms":
      sent = await sendViaWeb3Forms(orderId, order.items, order.customer, order.subtotal, order.shipping, order.total);
      break;

    case "whatsapp-cloud":
      sent = await sendWhatsAppViaCloudAPI(ADMIN_WHATSAPP, message);
      break;

    case "callmebot":
      sent = await sendWhatsAppViaCallMeBot(ADMIN_WHATSAPP, message);
      break;

    case "msg91":
      sent = await sendSMSViaMSG91(ADMIN_WHATSAPP, message);
      break;

    case "webhook":
      sent = await sendGenericWebhook(orderId, message, order.customer, order.total);
      break;

    default:
      sent = await sendViaSmartFallback(
        orderId,
        order.items,
        order.customer,
        order.subtotal,
        order.shipping,
        order.total,
        message
      );
  }

  if (sent) {
    console.log(`[Notification] ✅ Order #${shortId} notification sent`);
  } else {
    console.log(`[Notification] ⚠️  Order #${shortId} — no provider sent (check .env config)`);
  }
}
