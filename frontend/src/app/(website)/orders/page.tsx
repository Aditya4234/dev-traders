"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  LogIn,
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { getMyOrders } from "@/lib/api";
import type { OrderData } from "@/types";

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
  "out-for-delivery": {
    label: "Out for Delivery",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    icon: MapPin,
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.color} ${config.bg} font-[family-name:var(--font-poppins)]`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function OrdersPage() {
  const { user, setLoginOpen } = useShop();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    getMyOrders()
      .then((res) => {
        if (!cancelled && res.success) {
          setOrders(res.orders || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load orders");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
            <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
                My Orders
              </span>
              <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl">
                Order History
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                <LogIn size={32} className="text-primary" />
              </div>
              <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text md:text-3xl">
                Please Login to View Orders
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted">
                You need to be logged in to view your order history. Sign in to
                track your orders and manage your account.
              </p>
              <button
                onClick={() => setLoginOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-[#2D2D2D] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#E8A0B0] hover:shadow-[#E8A0B0]/30 font-[family-name:var(--font-poppins)]"
              >
                Login / Sign Up
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
              <p className="mt-6 text-xs text-muted">
                <Link
                  href="/shop"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Continue browsing as guest
                </Link>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
            <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
                My Orders
              </span>
              <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl">
                Order History
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-soft-pink-dark border-t-rose-gold" />
            <p className="text-sm text-muted font-[family-name:var(--font-poppins)]">
              Loading your orders...
            </p>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
            <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
                My Orders
              </span>
              <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl">
                Order History
              </h1>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="mx-auto max-w-3xl px-4 text-center md:px-6 lg:px-8">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
            >
              Try Again
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
          <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
              My Orders
            </span>
            <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl">
              Order History
            </h1>
            <p className="mx-auto max-w-lg text-base text-white/70">
              Track your orders, view details, and manage your purchases all in
              one place.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                <ShoppingBag size={32} className="text-primary" />
              </div>
              <h2 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text md:text-3xl">
                No Orders Yet
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted">
                You haven&apos;t placed any orders yet. Start exploring our
                premium collection and place your first order today!
              </p>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-[#2D2D2D] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#E8A0B0] hover:shadow-[#E8A0B0]/30 font-[family-name:var(--font-poppins)]"
              >
                <ShoppingBag size={16} />
                Start Shopping
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text md:text-3xl">
                  Your Orders
                </h2>
                <p className="mt-1 text-sm text-muted font-[family-name:var(--font-poppins)]">
                  {orders.length} order{orders.length !== 1 ? "s" : ""} placed
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {orders.map((order) => (
                  <motion.div
                    key={order._id}
                    variants={fadeUp}
                    className="luxury-card overflow-hidden"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Package size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="divide-y divide-border/30">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 px-6 py-4"
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-accent">
                            <Image
                              src={item.image || "/products/placeholder.png"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-text line-clamp-1 font-[family-name:var(--font-poppins)]">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted mt-0.5">
                              Qty: {item.quantity} &times; ₹
                              {item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                            ₹{(item.quantity * item.price).toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 bg-accent/30 px-6 py-4">
                      <div className="flex items-center gap-4">
                        {order.paymentMethod && (
                          <span className="text-xs text-muted font-[family-name:var(--font-poppins)]">
                            Payment:{" "}
                            <span className="font-medium text-dark-text capitalize">
                              {order.paymentMethod}
                            </span>
                          </span>
                        )}
                        {order.whatsappSent && (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-[family-name:var(--font-poppins)]">
                            <CheckCircle2 size={12} /> WhatsApp Confirmed
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted font-[family-name:var(--font-poppins)]">
                          Total
                        </span>
                        <p className="text-lg font-bold text-primary font-[family-name:var(--font-poppins)]">
                          ₹{order.total.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
