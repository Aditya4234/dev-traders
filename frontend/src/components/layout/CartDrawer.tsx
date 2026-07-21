"use client";

import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/lib/utils";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  MessageCircle,
  CheckCircle2,
  Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createOrder } from "@/lib/api";

type Step = "cart" | "order-form" | "success";

interface OrderForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  note: string;
}

const WHATSAPP_NUMBER = "919205778531";

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useShop();

  const [step, setStep] = useState<Step>("cart");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    note: "",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.discountPrice * item.quantity,
    0
  );

  const shippingThreshold = 999;
  const isFreeShipping = subtotal >= shippingThreshold;
  const shippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100);
  const neededForFreeShipping = shippingThreshold - subtotal;

  const handleClose = () => {
    setCartOpen(false);
    setTimeout(() => {
      setStep("cart");
      setFormError("");
    }, 400);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setOrderForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const buildWhatsAppMessage = () => {
    const itemLines = cart
      .map(
        (item) =>
          `• ${item.product.name} (x${item.quantity}) — ${formatPrice(
            item.product.discountPrice * item.quantity
          )}`
      )
      .join("\n");

    const message = `🛍️ *Wholesale Order — Riya Touch*
📍 Pratapgarh / Amethi District

*Customer Details:*
👤 Name: ${orderForm.name}
📞 Phone: ${orderForm.phone}
📍 Address: ${orderForm.address}, ${orderForm.city} — ${orderForm.pincode}
${orderForm.note ? `📝 Note: ${orderForm.note}` : ""}

*Order Items:*
${itemLines}

*💰 Total: ${formatPrice(subtotal)}*
${isFreeShipping ? "🚚 Shipping: FREE (above ₹999)" : "🚚 Shipping: Delivery par calculate hoga"}

Riya Touch se order karne ke liye shukriya! 💕
*Bulk / Wholesale orders welcome.*`;

    return encodeURIComponent(message);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForm.name.trim()) {
      setFormError("Apna naam enter karein.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(orderForm.phone.trim())) {
      setFormError("Valid 10-digit Indian phone number enter karein.");
      return;
    }
    if (!orderForm.address.trim() || !orderForm.city.trim() || !orderForm.pincode.trim()) {
      setFormError("Complete delivery address fill karein.");
      return;
    }
    if (!/^\d{6}$/.test(orderForm.pincode.trim())) {
      setFormError("Valid 6-digit pincode enter karein.");
      return;
    }

    setSubmitting(true);

    try {
      // Save order to backend
      await createOrder({
        items: cart.map((item) => ({
          product: item.product.id,
          name: item.product.name,
          price: item.product.discountPrice,
          quantity: item.quantity,
          image: item.product.image,
        })),
        customer: {
          name: orderForm.name,
          phone: orderForm.phone,
          address: orderForm.address,
          city: orderForm.city,
          pincode: orderForm.pincode,
          note: orderForm.note || undefined,
        },
        paymentMethod: "cod",
        whatsappSent: true,
      });
    } catch {
      // Continue even if backend save fails - WhatsApp order still goes through
    }

    // Open WhatsApp with pre-filled message
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    window.open(waUrl, "_blank");

    setStep("success");
    setTimeout(() => {
      clearCart();
    }, 1000);
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-soft-pink-dark px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                {step === "order-form" && (
                  <button
                    onClick={() => setStep("cart")}
                    className="mr-1 rounded-full p-1 text-muted hover:bg-soft-pink hover:text-charcoal transition-colors"
                    aria-label="Back to cart"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <ShoppingBag className="text-rose-gold" size={20} />
                <h2 className="font-serif text-xl font-light text-charcoal">
                  {step === "cart"
                    ? "Your Cart"
                    : step === "order-form"
                    ? "Delivery Details"
                    : "Order Placed!"}
                </h2>
                {step === "cart" && cart.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-soft-pink text-[10px] font-bold text-rose-gold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="rounded-full p-1.5 text-muted hover:bg-soft-pink hover:text-charcoal transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Steps */}
            {(step === "cart" || step === "order-form") && cart.length > 0 && (
              <div className="flex items-center gap-0 border-b border-soft-pink-dark bg-soft-pink/20 px-6 py-3 shrink-0">
                {["Cart", "Details", "Confirm"].map((label, i) => {
                  const isActive =
                    (label === "Cart" && step === "cart") ||
                    (label === "Details" && step === "order-form");
                  const isDone =
                    (label === "Cart" && (step as Step) !== "cart") ||
                    (label === "Details" && (step as Step) === "success");
                  return (
                    <div key={label} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                            isActive
                              ? "bg-rose-gold text-white"
                              : isDone
                              ? "bg-emerald-500 text-white"
                              : "bg-soft-pink-dark text-muted"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </span>
                        <span
                          className={`mt-0.5 text-[9px] font-medium uppercase tracking-wider ${
                            isActive ? "text-rose-gold" : "text-muted"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {i < 2 && (
                        <div className="mx-2 mb-4 h-px w-8 bg-soft-pink-dark" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP: SUCCESS */}
            <AnimatePresence mode="wait">
              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-1 flex-col items-center justify-center p-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
                  >
                    <CheckCircle2 size={42} className="text-emerald-600" />
                  </motion.div>
                  <h3 className="font-serif text-2xl font-light text-charcoal mb-2">
                    Order Placed Successfully!
                  </h3>
                  <p className="text-sm text-muted max-w-xs leading-relaxed mb-2">
                    Aapka order successfully place ho gaya hai! Humare team ko
                    WhatsApp notification mil gaya hai. Hum jald hi aapse
                    contact karenge delivery details ke liye.
                  </p>
                  <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4 text-left w-full max-w-xs">
                    <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                      <Package size={13} /> Order Summary
                    </p>
                    <p className="text-xs text-emerald-700">
                      👤 {orderForm.name}
                    </p>
                    <p className="text-xs text-emerald-700">
                      📞 {orderForm.phone}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-semibold">
                      Total: {formatPrice(subtotal)}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#1ebe5c] transition-colors shadow-md"
                  >
                    <MessageCircle size={14} />
                    Open WhatsApp Chat
                  </a>
                  <button
                    onClick={handleClose}
                    className="mt-3 text-xs text-muted hover:text-charcoal underline underline-offset-2 transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              )}

              {/* STEP: ORDER FORM */}
              {step === "order-form" && (
                <motion.form
                  key="order-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  onSubmit={handlePlaceOrder}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    <p className="text-xs text-muted leading-relaxed">
                      Order WhatsApp par send hoga. Apni delivery details fill
                      karein:
                    </p>

                    {formError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                        ⚠️ {formError}
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                        Full Name *
                      </label>
                      <div className="relative">
                        <input
                          name="name"
                          value={orderForm.name}
                          onChange={handleFormChange}
                          placeholder="Aapka poora naam"
                          className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all"
                          required
                        />
                        <User
                          size={15}
                          className="absolute left-3 top-3 text-muted"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <input
                          name="phone"
                          value={orderForm.phone}
                          onChange={handleFormChange}
                          placeholder="10-digit phone number"
                          maxLength={10}
                          inputMode="numeric"
                          className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all"
                          required
                        />
                        <Phone
                          size={15}
                          className="absolute left-3 top-3 text-muted"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                        Delivery Address *
                      </label>
                      <div className="relative">
                        <textarea
                          name="address"
                          value={orderForm.address}
                          onChange={handleFormChange}
                          placeholder="House No., Street, Colony..."
                          rows={2}
                          className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all resize-none"
                          required
                        />
                        <MapPin
                          size={15}
                          className="absolute left-3 top-3 text-muted"
                        />
                      </div>
                    </div>

                    {/* City + Pincode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                          City *
                        </label>
                        <input
                          name="city"
                          value={orderForm.city}
                          onChange={handleFormChange}
                          placeholder="Aapka shehar"
                          className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 px-3 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                          Pincode *
                        </label>
                        <input
                          name="pincode"
                          value={orderForm.pincode}
                          onChange={handleFormChange}
                          placeholder="6-digit"
                          maxLength={6}
                          inputMode="numeric"
                          className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 px-3 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70">
                        Special Note (Optional)
                      </label>
                      <textarea
                        name="note"
                        value={orderForm.note}
                        onChange={handleFormChange}
                        placeholder="Size preference, color, etc."
                        rows={2}
                        className="w-full rounded-xl border border-soft-pink-dark bg-soft-pink/20 py-2.5 px-3 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-all resize-none"
                      />
                    </div>

                    {/* Order Summary mini */}
                    <div className="rounded-xl bg-soft-pink/30 border border-soft-pink-dark p-4 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/70 mb-2">
                        Order Summary
                      </p>
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex justify-between text-xs text-charcoal"
                        >
                          <span className="truncate max-w-[200px]">
                            {item.product.name}{" "}
                            <span className="text-muted">×{item.quantity}</span>
                          </span>
                          <span className="font-semibold ml-2">
                            {formatPrice(
                              item.product.discountPrice * item.quantity
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-soft-pink-dark pt-2 flex justify-between text-sm font-semibold">
                        <span>Total</span>
                        <span className="text-rose-gold">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t border-soft-pink-dark px-6 py-4 shrink-0 bg-white">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-4 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1ebe5c] transition-colors shadow-lg hover:shadow-green-500/25 disabled:opacity-50"
                    >
                      <MessageCircle size={16} />
                      {submitting ? "Placing Order..." : "Place Order via WhatsApp"}
                    </button>
                    <p className="mt-2 text-center text-[10px] text-muted">
                      Order WhatsApp par send hoga — koi payment abhi nahi
                    </p>
                  </div>
                </motion.form>
              )}

              {/* STEP: CART */}
              {step === "cart" && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  {cart.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-soft-pink text-rose-gold-light">
                        <ShoppingBag size={36} />
                      </div>
                      <h3 className="font-serif text-2xl font-light text-charcoal mb-2">
                        Aapka cart khali hai
                      </h3>
                      <p className="mb-8 text-sm text-muted max-w-xs">
                        Premium bras, panties aur innerwear collections
                        explore karein.
                      </p>
                      <Link
                        href="/l/lingerie"
                        onClick={() => setCartOpen(false)}
                        className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-rose-gold hover:shadow-lg hover:shadow-rose-gold/25"
                      >
                        Shop Lingerie
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Shipping Progress bar */}
                      <div className="border-b border-soft-pink-dark bg-soft-pink/30 px-6 py-3 shrink-0">
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-medium text-charcoal">
                            {isFreeShipping
                              ? "🎉 Free Shipping Unlocked!"
                              : `${formatPrice(neededForFreeShipping)} aur add karein — Free Shipping paayein`}
                          </span>
                          <span className="font-semibold text-rose-gold">
                            {isFreeShipping ? "FREE" : `₹${shippingThreshold}`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-soft-pink-dark overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${shippingProgress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-rose-gold"
                          />
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                        <AnimatePresence>
                          {cart.map((item) => (
                            <motion.div
                              layout
                              key={item.product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0, marginTop: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 rounded-xl border border-soft-pink-dark bg-white p-3"
                            >
                              {/* Image */}
                              <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-lg bg-soft-pink">
                                <Image
                                  src={item.product.image}
                                  alt={item.product.name}
                                  fill
                                  className="object-contain p-1.5"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-rose-gold">
                                  {item.product.brand}
                                </p>
                                <h4 className="line-clamp-1 font-serif text-sm font-medium text-charcoal">
                                  {item.product.name}
                                </h4>
                                <p className="text-[10px] text-muted mb-1.5">
                                  {item.product.category}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center rounded-full border border-soft-pink-dark bg-soft-pink/20 p-0.5">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.quantity - 1
                                        )
                                      }
                                      className="rounded-full p-1.5 text-muted hover:bg-white hover:text-charcoal transition-colors"
                                      aria-label="Decrease"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="w-8 text-center text-xs font-semibold text-charcoal">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.quantity + 1
                                        )
                                      }
                                      className="rounded-full p-1.5 text-muted hover:bg-white hover:text-charcoal transition-colors"
                                      aria-label="Increase"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                  <span className="font-mono text-sm font-semibold text-charcoal">
                                    {formatPrice(
                                      item.product.discountPrice * item.quantity
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Remove */}
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-500 transition-colors self-start shrink-0"
                                aria-label="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Cart Footer */}
                      <div className="border-t border-soft-pink-dark px-6 py-4 bg-white shrink-0 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted">Subtotal</span>
                          <span className="font-mono font-semibold text-charcoal">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted border-b border-soft-pink/50 pb-2">
                          <span>Shipping</span>
                          <span>
                            {isFreeShipping ? "FREE 🎉" : "Checkout par calculate hoga"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-charcoal">Total Amount</span>
                          <span className="font-mono text-lg font-bold text-rose-gold">
                            {formatPrice(subtotal)}
                          </span>
                        </div>

                        <button
                          onClick={() => setStep("order-form")}
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-charcoal py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-rose-gold transition-colors shadow-lg hover:shadow-rose-gold/20"
                        >
                          Proceed to Order
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
