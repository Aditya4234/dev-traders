import dotenv from "dotenv";

dotenv.config();

const ADMIN_WHATSAPP = "919205778531";

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
      console.log(`[Notification] WhatsApp sent to ${phone}`);
      return true;
    }

    const err = await res.text();
    console.error(`[Notification] WhatsApp API error: ${err}`);
    return false;
  } catch (err) {
    console.error("[Notification] WhatsApp send failed:", err);
    return false;
  }
}

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

async function sendSMSViaMSG91(
  phone: string,
  message: string
): Promise<boolean> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "RIYATC";

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

async function sendGenericWebhook(
  orderId: string,
  message: string,
  customer: OrderCustomer,
  total: number
): Promise<boolean> {
  const webhookUrl = process.env.ORDER_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

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

export async function sendOrderNotification(order: {
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

  console.log(`[Notification] Sending notification for order #${orderId.slice(-8).toUpperCase()}`);

  const provider = process.env.NOTIFICATION_PROVIDER || "whatsapp";

  let sent = false;

  switch (provider) {
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

    case "all":
      const results = await Promise.allSettled([
        sendWhatsAppViaCloudAPI(ADMIN_WHATSAPP, message),
        sendWhatsAppViaCallMeBot(ADMIN_WHATSAPP, message),
        sendSMSViaMSG91(ADMIN_WHATSAPP, message),
      ]);
      sent = results.some((r) => r.status === "fulfilled" && r.value === true);
      break;

    default:
      console.log(`[Notification] Unknown provider: ${provider}`);
  }

  if (!sent) {
    console.log(`[Notification] No notification provider configured. Order message for #${orderId.slice(-8).toUpperCase()}:`);
    console.log(message);
  }
}
