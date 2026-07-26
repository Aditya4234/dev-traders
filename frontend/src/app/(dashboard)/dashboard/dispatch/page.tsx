"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Truck, Package, CheckCircle2, Clock, Filter } from "lucide-react";
import * as api from "@/lib/api";

interface DispatchItem {
  name: string;
  quantity: number;
  price: number;
}

interface DispatchOrder {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: DispatchItem[];
  customer: {
    name: string;
    email: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50" },
  shipped: { label: "Shipped", color: "text-indigo-600", bg: "bg-indigo-50" },
  delivered: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50" },
};

const statusSteps = ["pending", "confirmed", "shipped", "delivered"];

export default function DispatchPage() {
  const [orders, setOrders] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getMyOrders();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      // silent fail
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-light text-[var(--dark-text)] md:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Dispatch <span className="text-[var(--primary)]">Management</span>
        </h1>
        <p
          className="mt-2 text-sm text-[var(--muted)]"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Track and manage order shipments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statusSteps.map((step) => {
          const cfg = statusConfig[step];
          const count = orders.filter((o) => o.status === step).length;
          return (
            <div
              key={step}
              className="rounded-[16px] border border-[var(--border)]/50 bg-white p-4 shadow-sm"
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {cfg.label}
              </p>
              <p
                className={`mt-1 text-xl font-bold ${cfg.color}`}
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {count}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-[var(--muted)]" />
        {["all", ...statusSteps].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f
                ? "bg-[var(--primary)] text-white"
                : "border border-[var(--border)] bg-white text-[var(--dark-text)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-[var(--border)]/50">
          <Truck size={48} className="text-[var(--muted)]/30" />
          <h3
            className="mt-4 text-lg font-semibold text-[var(--dark-text)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            No orders found
          </h3>
          <p
            className="mt-1 text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {filter === "all" ? "No orders to dispatch yet." : `No ${filter} orders.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]/50 bg-white shadow-sm">
          <table className="w-full text-left" style={{ fontFamily: "var(--font-poppins)" }}>
            <thead>
              <tr className="border-b border-[var(--border)]/50 bg-[var(--accent)]/30">
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Order ID
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Customer
                </th>
                <th className="hidden px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] sm:table-cell">
                  Items
                </th>
                <th className="hidden px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] md:table-cell">
                  Total
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Status
                </th>
                <th className="hidden px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] lg:table-cell">
                  Date
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const cfg = statusConfig[order.status] || statusConfig.pending;
                const isExpanded = expandedOrder === order._id;
                const currentIdx = getStatusIndex(order.status);
                const nextStatus =
                  currentIdx >= 0 && currentIdx < statusSteps.length - 1
                    ? statusSteps[currentIdx + 1]
                    : null;

                return (
                  <motion.tr
                    key={order._id}
                    layout
                    className="border-b border-[var(--border)]/30 transition-colors hover:bg-[var(--accent)]/30"
                  >
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                        className="text-sm font-semibold text-[var(--primary)] hover:underline"
                      >
                        #{order._id?.slice(-8).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--dark-text)]">
                      {order.customer?.name || "N/A"}
                    </td>
                    <td className="hidden px-5 py-4 text-sm text-[var(--dark-text)]/60 sm:table-cell">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="hidden px-5 py-4 text-sm font-semibold text-[var(--dark-text)] md:table-cell">
                      ₹{order.total?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-xs text-[var(--muted)] lg:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {nextStatus && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => handleStatusUpdate(order._id, nextStatus)}
                          className="flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1.5 text-[10px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                        >
                          {updatingId === order._id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          ) : (
                            <>
                              {nextStatus === "shipped" ? <Truck size={10} /> : <CheckCircle2 size={10} />}
                              {nextStatus === "shipped" ? "Ship" : "Deliver"}
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {/* Expanded Packing Slip */}
          {orders
            .filter((o) => expandedOrder === o._id)
            .map((order) => (
              <motion.div
                key={`detail-${order._id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-[var(--border)]/50 bg-[var(--accent)]/20 px-6 py-5"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
                  {/* Packing Slip */}
                  <div className="flex-1">
                    <h3
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      <Package size={16} className="text-[var(--primary)]" />
                      Packing Slip
                    </h3>
                    <div className="mt-3 space-y-2">
                      {order.items?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-[var(--border)]/30 bg-white px-4 py-2"
                        >
                          <span
                            className="text-sm text-[var(--dark-text)]"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            {item.name}
                          </span>
                          <span
                            className="text-xs font-semibold text-[var(--muted)]"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="lg:w-64">
                    <h3
                      className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      <Clock size={16} className="text-[var(--primary)]" />
                      Status Timeline
                    </h3>
                    <div className="mt-3 space-y-0">
                      {statusSteps.map((step, idx) => {
                        const reached = getStatusIndex(order.status) >= idx;
                        const stepCfg = statusConfig[step];
                        return (
                          <div key={step} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  reached ? "bg-[var(--primary)]" : "bg-gray-300"
                                }`}
                              />
                              {idx < statusSteps.length - 1 && (
                                <div
                                  className={`w-0.5 h-6 ${
                                    reached ? "bg-[var(--primary)]" : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                            <div className="pb-4">
                              <p
                                className={`text-xs font-semibold ${
                                  reached ? stepCfg.color : "text-[var(--muted)]"
                                }`}
                                style={{ fontFamily: "var(--font-poppins)" }}
                              >
                                {stepCfg.label}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </motion.div>
  );
}
