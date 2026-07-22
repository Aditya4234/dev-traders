"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, Eye, ArrowRight } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { useEffect } from "react";
import * as api from "@/lib/api";

const statusColors: Record<string, string> = {
  delivered: "badge-delivered",
  pending: "badge-pending",
  processing: "badge-processing",
  cancelled: "badge-cancelled",
};

export default function OrdersPage() {
  const { user } = useShop();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      api
        .getMyOrders()
        .then((data) => {
          setOrders(data.orders || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          My <span className="text-primary">Orders</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Track and manage your orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "pending", "processing", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors font-[family-name:var(--font-poppins)] ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white border border-border text-dark-text/60 hover:border-primary hover:text-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-border/50">
          <Package size={48} className="text-muted/30" />
          <h3 className="mt-4 text-lg font-semibold text-dark-text">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-muted">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders.`}
          </p>
          <a
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
          >
            Start Shopping <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="luxury-card p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-poppins)] ${
                        statusColors[order.status] || ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary font-[family-name:var(--font-poppins)]">
                    ₹{order.total?.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className="mt-4 border-t border-border/50 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item: any, i: number) => (
                      <span
                        key={i}
                        className="rounded-full bg-accent/50 px-3 py-1 text-[11px] text-dark-text/70 font-[family-name:var(--font-poppins)]"
                      >
                        {item.name} × {item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
