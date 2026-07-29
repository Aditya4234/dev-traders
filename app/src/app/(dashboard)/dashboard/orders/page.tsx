"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, ArrowRight, RotateCcw, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import * as api from "@/lib/api";
import OrderTimeline from "@/components/ui/OrderTimeline";
import ReturnRequestForm from "@/components/ui/ReturnRequestForm";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  delivered: "badge-delivered",
  pending: "badge-pending",
  processing: "badge-processing",
  cancelled: "badge-cancelled",
  shipped: "bg-indigo-50 text-indigo-600",
  confirmed: "bg-blue-50 text-blue-600",
};

export default function OrdersPage() {
  const { user, addToCart } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    pendingOrders: number;
    deliveredOrders: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (user) {
      api
        .getMyOrders()
        .then((data) => {
          if (!cancelled) setOrders(data.orders || []);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      api
        .getMyOrderStats()
        .then((res) => {
          if (!cancelled && res?.success) setStats(res.stats);
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const mockProduct = {
        id: `reorder-${Date.now()}-${Math.random()}`,
        name: item.name,
        brand: "Riya Touch",
        price: item.price,
        discountPrice: item.price,
        rating: 4.7,
        reviewCount: 0,
        image: item.image,
        category: "Bra & Panty Sets",
        sizes: ["M"],
      };
      for (let i = 0; i < item.quantity; i++) {
        addToCart(mockProduct);
      }
    });
  };

  const downloadInvoice = (order: Order) => {
    const rows = [
      ["Order Invoice"],
      [""],
      ["Order ID", `#${order._id?.slice(-8).toUpperCase()}`],
      ["Date", new Date(order.createdAt).toLocaleDateString("en-IN")],
      ["Status", order.status],
      [""],
      ["Item", "Qty", "Price", "Total"],
      ...order.items.map((item) => [
        item.name,
        String(item.quantity),
        `₹${item.price}`,
        `₹${item.price * item.quantity}`,
      ]),
      [""],
      ["Total", `₹${order.total?.toLocaleString("en-IN")}`],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order._id?.slice(-8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1
          className="text-3xl font-light text-[var(--dark-text)] md:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          My <span className="text-[var(--primary)]">Orders</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
          Track and manage your orders
        </p>
      </div>

      {/* Order Stats */}
      {stats && stats.totalOrders > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Orders", value: stats.totalOrders, color: "text-[var(--primary)]" },
            { label: "Total Spent", value: `₹${stats.totalSpent.toLocaleString("en-IN")}`, color: "text-[var(--primary)]" },
            { label: "Pending", value: stats.pendingOrders, color: "text-amber-600" },
            { label: "Delivered", value: stats.deliveredOrders, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] bg-white p-4 shadow-sm border border-[var(--border)]/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                {s.label}
              </p>
              <p className={`mt-1 text-xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-poppins)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--dark-text)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-[var(--border)]/50">
          <Package size={48} className="text-[var(--muted)]/30" />
          <h3 className="mt-4 text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
            No orders found
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders.`}
          </p>
          <a
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:opacity-90"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Start Shopping <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            return (
              <div
                key={order._id}
                className="rounded-[20px] bg-white p-5 shadow-sm border border-[var(--border)]/50"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          statusColors[order.status] || ""
                        }`}
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>
                        ₹{order.total?.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                        {order.items?.length || 0} item(s)
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--accent)]"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mt-4 border-t border-[var(--border)]/50 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: OrderItem, i: number) => (
                        <span
                          key={i}
                          className="rounded-full bg-[var(--accent)]/50 px-3 py-1 text-[11px] text-[var(--dark-text)]/70"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expanded Section */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 border-t border-[var(--border)]/50 pt-4"
                  >
                    {/* Order Tracking Timeline */}
                    <OrderTimeline status={order.status} />

                    {/* Action Buttons */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[11px] font-semibold text-[var(--dark-text)] transition-colors hover:bg-[var(--accent)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        <RotateCcw size={12} />
                        Re-order
                      </button>
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-[11px] font-semibold text-[var(--dark-text)] transition-colors hover:bg-[var(--accent)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        <Download size={12} />
                        Invoice
                      </button>
                      {order.status === "delivered" && (
                        <button
                          onClick={() => setReturnOrder(order)}
                          className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-semibold text-orange-600 transition-colors hover:bg-orange-100"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          Return / Exchange
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Return/Exchange Modal */}
      {returnOrder && (
        <ReturnRequestForm
          orderId={returnOrder._id}
          items={returnOrder.items}
          onClose={() => setReturnOrder(null)}
        />
      )}
    </motion.div>
  );
}
