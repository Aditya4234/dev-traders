"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Package,
  IndianRupee,
  ShoppingCart,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  MessageCircle,
  BarChart3,
  Activity,
  Search,
  ArrowRight,
  AlertTriangle,
  Shield,
  RefreshCw,
  Calendar,
  Download,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useShop } from "@/context/ShopContext";
import * as api from "@/lib/api";
import type { OrderData } from "@/types";

interface AdminOverview {
  users: {
    total: number;
    customers: number;
    dealers: number;
    admins: number;
    newThisMonth: number;
    newThisWeek: number;
    activeLast30Days: number;
    loggedInToday: number;
  };
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    avgOrderValue: number;
  };
  payments: {
    cod: number;
    online: number;
    whatsapp: number;
  };
  products: {
    total: number;
    active: number;
    lowStock: { product: { name: string; image: string }; quantity: number; sku: string }[];
  };
    recentOrders: OrderData[];
    dailySales: { date: string; sales: number; orders: number }[];
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyName?: string;
  dealerId?: string;
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-600" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600" },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-600" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600" },
  cancelled: { bg: "bg-red-50", text: "text-red-600" },
};

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: "bg-purple-50", text: "text-purple-600" },
  dealer: { bg: "bg-blue-50", text: "text-blue-600" },
  customer: { bg: "bg-gray-100", text: "text-gray-600" },
};

export default function AdminPage() {
  const { user } = useShop();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userPagination, setUserPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "orders" | "payments">("overview");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const isWholeseller = user?.role === "admin" || user?.role === "dealer";

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAdminOverview();
      if (data?.success) setOverview(data.overview);
    } catch {
      // stats may not be available
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, search = "", role = "all") => {
    try {
      setUsersLoading(true);
      const data = await api.getAdminUsers({ page, limit: 20, role, search });
      if (data?.success) {
        setUsers(data.users);
        setUserPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isWholeseller) {
      void fetchOverview();
      void fetchUsers();
    }
  }, [fetchOverview, fetchUsers, isWholeseller]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, userSearch, userRoleFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter, fetchUsers]);

  if (!isWholeseller) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Shield size={48} className="text-[var(--muted)]/30" />
        <h2 className="mt-4 text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Access Restricted</h2>
        <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Admin panel is available for wholesale partners only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart },
    { id: "payments" as const, label: "Payments", icon: CreditCard },
  ];

  const chartTooltipStyle = {
    contentStyle: {
      background: "white",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      fontSize: "12px",
      fontFamily: "var(--font-poppins)",
    },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-playfair)" }}>
            Admin <span className="text-[var(--primary)]">Panel</span>
          </h1>
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            Complete business overview and management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { void fetchOverview(); void fetchUsers(); }}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--accent)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[var(--dark-text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--dark-text)]"
            }`}
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === "overview" && overview && (
        <motion.div variants={stagger} initial="hidden" animate="visible">
          {/* Top Stats Row */}
          <motion.div variants={stagger} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { icon: IndianRupee, label: "Total Revenue", value: `₹${overview.revenue.total.toLocaleString("en-IN")}`, sub: `Today: ₹${overview.revenue.today.toLocaleString("en-IN")}`, gradient: "linear-gradient(135deg, #E91E63, #C2185B)" },
              { icon: ShoppingCart, label: "Total Orders", value: overview.orders.total.toString(), sub: `Today: ${overview.orders.today}`, gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)" },
              { icon: Users, label: "Total Users", value: overview.users.total.toString(), sub: `Today: ${overview.users.loggedInToday} online`, gradient: "linear-gradient(135deg, #2196F3, #1565C0)" },
              { icon: Package, label: "Active Products", value: overview.products.active.toString(), sub: `Total: ${overview.products.total}`, gradient: "linear-gradient(135deg, #059669, #047857)" },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg" style={{ background: s.gradient }}>
                  <s.icon size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.value}</p>
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</p>
                <p className="mt-0.5 text-[10px] text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Revenue Breakdown */}
          <motion.div variants={fadeUp} className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Daily Revenue (Last 7 Days)</h3>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview.dailySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip {...chartTooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} labelFormatter={(l) => `Date: ${l}`} />
                    <Bar dataKey="sales" fill="#E91E63" radius={[6, 6, 0, 0]} name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Cards */}
            <div className="space-y-4">
              {[
                { label: "This Month", value: overview.revenue.thisMonth, icon: Calendar, color: "text-[var(--primary)]" },
                { label: "This Week", value: overview.revenue.thisWeek, icon: TrendingUp, color: "text-emerald-600" },
                { label: "Avg Order Value", value: overview.revenue.avgOrderValue, icon: IndianRupee, color: "text-blue-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4 rounded-[16px] border border-[var(--border)] bg-white p-4 shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{item.label}</p>
                    <p className="text-lg font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{item.value.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Orders + Users + Payments */}
          <motion.div variants={fadeUp} className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Orders by Status */}
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Orders by Status</h3>
              <div className="space-y-3">
                {[
                  { label: "Pending", count: overview.orders.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
                  { label: "Confirmed", count: overview.orders.confirmed, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Shipped", count: overview.orders.shipped, icon: Truck, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { label: "Delivered", count: overview.orders.delivered, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { label: "Cancelled", count: overview.orders.cancelled, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-[var(--accent)]/30">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                        <s.icon size={14} />
                      </div>
                      <span className="text-xs font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users Overview */}
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Users Overview</h3>
              <div className="space-y-3">
                {[
                  { label: "Customers", count: overview.users.customers, icon: Users, color: "text-gray-600", bg: "bg-gray-100" },
                  { label: "Dealers", count: overview.users.dealers, icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Admins", count: overview.users.admins, icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
                  { label: "New This Month", count: overview.users.newThisMonth, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Active (30 days)", count: overview.users.activeLast30Days, icon: Activity, color: "text-[var(--primary)]", bg: "bg-pink-50" },
                  { label: "Online Today", count: overview.users.loggedInToday, icon: UserCheck, color: "text-green-600", bg: "bg-green-50" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-[var(--accent)]/30">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                        <s.icon size={14} />
                      </div>
                      <span className="text-xs font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Payment Methods</h3>
              <div className="space-y-3">
                {[
                  { label: "Cash on Delivery", count: overview.payments.cod, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Online (Razorpay)", count: overview.payments.online, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "WhatsApp Orders", count: overview.payments.whatsapp, icon: MessageCircle, color: "text-green-600", bg: "bg-green-50" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-[var(--accent)]/30">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                        <s.icon size={14} />
                      </div>
                      <span className="text-xs font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Low Stock Alert */}
              {overview.products.lowStock.length > 0 && (
                <div className="mt-5 border-t border-[var(--border)] pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <h4 className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Low Stock Alert</h4>
                  </div>
                  <div className="space-y-2">
                    {overview.products.lowStock.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[150px] text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          {item.product?.name || "Unknown"}
                        </span>
                        <span className="font-semibold text-amber-600" style={{ fontFamily: "var(--font-poppins)" }}>{item.quantity} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div variants={fadeUp} className="mb-6 overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Recent Orders</h3>
              <Link href="/dashboard/orders" className="text-xs font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View All</Link>
            </div>
            {overview.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ShoppingCart size={32} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Order ID</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Customer</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Items</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Amount</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Payment</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Status</th>
                      <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentOrders.map((order) => {
                      const sc = statusColors[order.status] || statusColors.pending;
                      return (
                        <tr key={order._id} className="border-b border-[var(--border)]/50 transition-colors hover:bg-[var(--accent)]/30">
                          <td className="px-6 py-3.5">
                            <span className="font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                              #{order._id?.slice(-8).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {order.customer?.name || "N/A"}
                          </td>
                          <td className="px-6 py-3.5 text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {order.items?.length || 0} item(s)
                          </td>
                          <td className="px-6 py-3.5 font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            ₹{order.total?.toLocaleString("en-IN")}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              order.paymentMethod === "online" ? "bg-blue-50 text-blue-600" : order.paymentMethod === "cod" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                            }`} style={{ fontFamily: "var(--font-poppins)" }}>
                              {order.paymentMethod === "online" ? "Online" : order.paymentMethod === "cod" ? "COD" : "WhatsApp"}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sc.bg} ${sc.text}`} style={{ fontFamily: "var(--font-poppins)" }}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-[11px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ═══ USERS TAB ═══ */}
      {activeTab === "users" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Search + Filter */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              />
            </div>
            <div className="flex gap-1.5">
              {["all", "customer", "dealer", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition-all ${
                    userRoleFilter === r ? "bg-[var(--primary)] text-white" : "bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--dark-text)]"
                  }`}
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {r === "all" ? "All" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            {usersLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Users size={32} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>User</th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Contact</th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Role</th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Logins</th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Last Login</th>
                      <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const rc = roleColors[u.role] || roleColors.customer;
                      return (
                        <tr key={u._id} className="border-b border-[var(--border)]/50 transition-colors hover:bg-[var(--accent)]/30">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>
                                {u.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{u.name}</p>
                                {u.companyName && <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{u.companyName}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-xs text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{u.email}</p>
                            {u.phone && <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{u.phone}</p>}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${rc.bg} ${rc.text}`} style={{ fontFamily: "var(--font-poppins)" }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                              {u.loginCount || 0}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[11px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "Never"}
                          </td>
                          <td className="px-5 py-3.5 text-[11px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {userPagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                  Showing {((userPagination.page - 1) * 20) + 1} - {Math.min(userPagination.page * 20, userPagination.total)} of {userPagination.total}
                </p>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.min(userPagination.pages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => void fetchUsers(p, userSearch, userRoleFilter)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                        p === userPagination.page ? "bg-[var(--primary)] text-white" : "bg-[var(--accent)] text-[var(--muted)] hover:text-[var(--dark-text)]"
                      }`}
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ═══ ORDERS TAB ═══ */}
      {activeTab === "orders" && overview && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Order Stats */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: "Total Orders", value: overview.orders.total, color: "text-[var(--primary)]", bg: "bg-pink-50" },
              { label: "Today", value: overview.orders.today, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "This Week", value: overview.orders.thisWeek, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "This Month", value: overview.orders.thisMonth, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Pending", value: overview.orders.pending, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-[16px] ${s.bg} p-4`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</p>
                <p className={`mt-1 text-2xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-poppins)" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Orders Chart */}
          <div className="mb-6 overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Daily Orders (Last 7 Days)</h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.dailySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <Tooltip {...chartTooltipStyle} formatter={(v) => [Number(v), "Orders"]} labelFormatter={(l) => `Date: ${l}`} />
                  <Bar dataKey="orders" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            <div className="border-b border-[var(--border)] px-6 py-4">
              <h3 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>All Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Order ID</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Customer</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Items</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Amount</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Payment</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Status</th>
                    <th className="px-6 py-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentOrders.map((order) => {
                    const sc = statusColors[order.status] || statusColors.pending;
                    return (
                      <tr key={order._id} className="border-b border-[var(--border)]/50 transition-colors hover:bg-[var(--accent)]/30">
                        <td className="px-6 py-3.5 font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          #{order._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-3.5 text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          {order.customer?.name || "N/A"}
                        </td>
                        <td className="px-6 py-3.5 text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          {order.items?.map((it) => `${it.name}×${it.quantity}`).join(", ")}
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          ₹{order.total?.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            order.paymentMethod === "online" ? "bg-blue-50 text-blue-600" : order.paymentMethod === "cod" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                          }`} style={{ fontFamily: "var(--font-poppins)" }}>
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${sc.bg} ${sc.text}`} style={{ fontFamily: "var(--font-poppins)" }}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[11px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══ PAYMENTS TAB ═══ */}
      {activeTab === "payments" && overview && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: `₹${overview.revenue.total.toLocaleString("en-IN")}`, icon: IndianRupee, gradient: "linear-gradient(135deg, #E91E63, #C2185B)" },
              { label: "Today's Revenue", value: `₹${overview.revenue.today.toLocaleString("en-IN")}`, icon: TrendingUp, gradient: "linear-gradient(135deg, #059669, #047857)" },
              { label: "This Week", value: `₹${overview.revenue.thisWeek.toLocaleString("en-IN")}`, icon: Calendar, gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)" },
              { label: "This Month", value: `₹${overview.revenue.thisMonth.toLocaleString("en-IN")}`, icon: BarChart3, gradient: "linear-gradient(135deg, #D97706, #B45309)" },
            ].map((s) => (
              <div key={s.label} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg" style={{ background: s.gradient }}>
                  <s.icon size={18} className="text-white" />
                </div>
                <p className="text-xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.value}</p>
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Payment Methods Breakdown */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                label: "Cash on Delivery",
                count: overview.payments.cod,
                percentage: overview.orders.total > 0 ? Math.round((overview.payments.cod / overview.orders.total) * 100) : 0,
                icon: IndianRupee,
                color: "#D97706",
                bg: "bg-amber-50",
              },
              {
                label: "Online (Razorpay)",
                count: overview.payments.online,
                percentage: overview.orders.total > 0 ? Math.round((overview.payments.online / overview.orders.total) * 100) : 0,
                icon: CreditCard,
                color: "#2196F3",
                bg: "bg-blue-50",
              },
              {
                label: "WhatsApp Orders",
                count: overview.payments.whatsapp,
                percentage: overview.orders.total > 0 ? Math.round((overview.payments.whatsapp / overview.orders.total) * 100) : 0,
                icon: MessageCircle,
                color: "#059669",
                bg: "bg-green-50",
              },
            ].map((pm) => (
              <div key={pm.label} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${pm.color}15`, color: pm.color }}>
                    <pm.icon size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{pm.label}</p>
                    <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{pm.percentage}% of total orders</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{pm.count}</p>
                <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>orders</p>
                {/* Progress bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${pm.percentage}%`, backgroundColor: pm.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Daily Chart */}
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Revenue Trend (Last 7 Days)</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview.dailySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip {...chartTooltipStyle} formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} labelFormatter={(l) => `Date: ${l}`} />
                  <Bar dataKey="sales" fill="#E91E63" radius={[6, 6, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
