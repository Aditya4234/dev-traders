"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Package,
  Clock,
  RotateCcw,
  Truck,
  Star,
  ArrowRight,
  Gift,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Users,
  Repeat,
  Copy,
  Check,
  Bell,
  Calendar,
  Download,
  RefreshCw,
  MessageSquare,
  HeadphonesIcon,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";
import { useShop } from "@/context/ShopContext";
import { products } from "@/data/mock-data";
import * as api from "@/lib/api";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  totalCustomers: number;
  repeatRate: number;
  thisMonthRevenue: number;
  thisMonthOrders: number;
  thisMonthAvg: number;
  revenueChange: number;
  orderChange: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: any[];
  topProducts: any[];
  monthlyChart: { month: string; sales: number; orders: number }[];
  categorySales: { _id: string; total: number }[];
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const PIE_COLORS = ["#E91E63", "#7C3AED", "#059669", "#D97706", "#2196F3", "#F44336", "#9C27B0"];

const statusConfig: Record<string, { bg: string; text: string }> = {
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600" },
  pending: { bg: "bg-amber-50", text: "text-amber-600" },
  processing: { bg: "bg-blue-50", text: "text-blue-600" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600" },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-600" },
  cancelled: { bg: "bg-red-50", text: "text-red-600" },
};

const coupons = [
  { code: "RIYA20", discount: "20% OFF", description: "On orders above ₹999", expires: "Dec 31, 2026" },
  { code: "WELCOME10", discount: "10% OFF", description: "First wholesale order", expires: "Dec 31, 2026" },
  { code: "BULK50", discount: "₹50 OFF", description: "On bulk orders above ₹5000", expires: "Nov 30, 2026" },
];

export default function DashboardPage() {
  const { user, wishlist, orderPlacedAt, addToCart } = useShop();
  const userName = user?.name?.split(" ")[0] || "Partner";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"sales" | "orders">("sales");
  const [dateRange, setDateRange] = useState("7d");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsRead, setNotificationsRead] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      if (data?.success) {
        setStats(data.stats);
      }
    } catch {
      // Stats endpoint may not exist yet on older backend deployments
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, orderPlacedAt]);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-strong rounded-xl border border-[var(--border)] p-3 shadow-xl">
        <p className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{label}</p>
        {payload.map((entry: { name: string; value: number }, i: number) => (
          <p key={i} className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            {entry.name === "sales" ? "Revenue" : "Orders"}:{" "}
            <span className="font-semibold text-[var(--dark-text)]">
              {entry.name === "sales" ? `₹${entry.value.toLocaleString("en-IN")}` : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  };

  const hasData = stats && stats.totalOrders > 0;
  const chartData = stats?.monthlyChart || [];
  const categoryData = (stats?.categorySales || []).map((c, i) => ({
    name: c._id || "Other",
    value: c.total,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const totalCategoryValue = categoryData.reduce((sum, c) => sum + c.value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-light text-[var(--dark-text)] md:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
              Welcome back, <span className="text-[var(--primary)]">{userName}</span>
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
              Here&apos;s your wholesale business overview for today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2">
              <Calendar size={14} className="text-[var(--muted)]" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-xs font-medium text-[var(--dark-text)] outline-none"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">This Year</option>
              </select>
            </div>
            <button
              onClick={() => {
                if (!stats) return;
                const rows = [
                  ["Metric", "Value"],
                  ["Total Revenue", `₹${stats.totalRevenue.toLocaleString("en-IN")}`],
                  ["Total Orders", String(stats.totalOrders)],
                  ["Avg Order Value", `₹${stats.avgOrderValue.toLocaleString("en-IN")}`],
                  ["This Month Revenue", `₹${stats.thisMonthRevenue.toLocaleString("en-IN")}`],
                  ["This Month Orders", String(stats.thisMonthOrders)],
                  ["Pending Orders", String(stats.pendingOrders)],
                  ["Delivered Orders", String(stats.deliveredOrders)],
                  ["Cancelled Orders", String(stats.cancelledOrders)],
                  ["Total Products", String(stats.totalProducts)],
                  ["Total Customers", String(stats.totalCustomers)],
                  ["Repeat Rate", `${stats.repeatRate}%`],
                ];
                const csv = rows.map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
              title="Download Report"
            >
              <Download size={16} />
            </button>
            <button
              onClick={fetchStats}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 2. Promotional Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mb-8 overflow-hidden rounded-[24px] relative" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark, #C2185B))" }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-white/10" />
          <div className="absolute -left-10 -bottom-10 h-[150px] w-[150px] rounded-full bg-white/10" />
          <div className="absolute right-1/4 top-1/4 h-[80px] w-[80px] rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-8 sm:flex-row sm:p-10">
          <div className="text-center sm:text-left">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
              <Gift size={14} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white" style={{ fontFamily: "var(--font-poppins)" }}>Wholesale Deal</span>
            </div>
            <h2 className="text-2xl font-light text-white sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
              Flat <span className="font-bold">20% OFF</span> on Bulk Orders
            </h2>
            <p className="mt-2 text-sm text-white/70">Use coupon code on your next wholesale order above ₹999</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-3 backdrop-blur-sm">
              <span className="text-lg font-bold tracking-wider text-white" style={{ fontFamily: "var(--font-poppins)" }}>RIYA20</span>
              <button
                onClick={() => handleCopyCoupon("RIYA20")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
              >
                {copiedCode === "RIYA20" ? <Check size={12} className="text-white" /> : <Copy size={12} className="text-white" />}
              </button>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-[var(--primary)] transition-all hover:shadow-lg hover:shadow-white/20"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Shop Wholesale
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 3. Key Metrics */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[
          {
            icon: IndianRupee,
            label: "Total Revenue",
            value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
            change: `${stats?.revenueChange || 0}%`,
            up: (stats?.revenueChange || 0) >= 0,
            gradient: "linear-gradient(135deg, #E91E63, #C2185B)",
            sub: `This month: ₹${(stats?.thisMonthRevenue || 0).toLocaleString("en-IN")}`,
          },
          {
            icon: Package,
            label: "Total Orders",
            value: (stats?.totalOrders || 0).toString(),
            change: `${stats?.orderChange || 0}%`,
            up: (stats?.orderChange || 0) >= 0,
            gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)",
            sub: `This month: ${stats?.thisMonthOrders || 0}`,
          },
          {
            icon: TrendingUp,
            label: "Avg Order Value",
            value: `₹${(stats?.avgOrderValue || 0).toLocaleString("en-IN")}`,
            change: "",
            up: true,
            gradient: "linear-gradient(135deg, #059669, #047857)",
            sub: `This month: ₹${(stats?.thisMonthAvg || 0).toLocaleString("en-IN")}`,
          },
          {
            icon: Repeat,
            label: "Repeat Rate",
            value: `${stats?.repeatRate || 0}%`,
            change: "",
            up: true,
            gradient: "linear-gradient(135deg, #D97706, #B45309)",
            sub: `${stats?.totalCustomers || 0} customers`,
          },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg" style={{ background: stat.gradient }}>
                <stat.icon size={20} className="text-white" />
              </div>
              {stat.change && (
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontFamily: "var(--font-poppins)" }}>
                  {stat.up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{stat.value}</p>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{stat.label}</p>
            <p className="mt-0.5 text-[10px] text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 4. Sales Chart + Category Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Area Chart */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Sales Overview</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Revenue & orders trend (last 7 months)</p>
            </div>
            <div className="flex gap-1 rounded-xl bg-[var(--accent)] p-1">
              {(["sales", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChartTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                    activeChartTab === tab ? "bg-white text-[var(--dark-text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--dark-text)]"
                  }`}
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E91E63" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E91E63" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} tickFormatter={(v) => activeChartTab === "sales" ? `₹${v / 1000}K` : v} />
                <Tooltip content={customTooltip} />
                {activeChartTab === "sales" ? (
                  <Area type="monotone" dataKey="sales" stroke="#E91E63" strokeWidth={2.5} fill="url(#gradientSales)" name="sales" />
                ) : (
                  <Area type="monotone" dataKey="orders" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gradientOrders)" name="orders" />
                )}
              </AreaChart>
            </ResponsiveContainer>
            {!hasData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
                <TrendingUp size={32} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-sm font-medium text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No sales data yet</p>
                <p className="text-xs text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>Start selling to see your revenue trend</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>By Category</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Sales distribution</p>
          </div>
          <div className="relative h-[220px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Package size={28} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-xs font-medium text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No category data</p>
                <p className="text-[10px] text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>Will appear after first sale</p>
              </div>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{cat.name}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                  {totalCategoryValue > 0 ? Math.round((cat.value / totalCategoryValue) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 5. Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="mb-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            { icon: ShoppingBag, label: "Bulk Order", href: "/shop", color: "#E91E63" },
            { icon: Package, label: "My Orders", href: "/dashboard/orders", color: "#7C3AED" },
            { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist", color: "#F44336" },
            { icon: Gift, label: "Coupons", href: "/dashboard/coupons", color: "#FF9800" },
            { icon: HeadphonesIcon, label: "Support", href: "/dashboard/support", color: "#2196F3" },
            { icon: MessageSquare, label: "Chat", href: "https://wa.me/919205778531", color: "#4CAF50" },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-3 rounded-[16px] border border-[var(--border)] bg-white p-4 shadow-sm transition-all hover:border-[var(--primary)]/20 hover:shadow-md"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.color}12`, color: action.color }}
              >
                <action.icon size={20} />
              </div>
              <span className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* 6. Recent Orders + Top Products */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Recent Orders</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Your latest order activity</p>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors" style={{ fontFamily: "var(--font-poppins)" }}>
              View All
            </Link>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="divide-y divide-[var(--border)]/50">
                {stats.recentOrders.slice(0, 5).map((order: any) => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <div key={order._id} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--accent)]/30">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]">
                          <Package size={16} className="text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                            {order.customer?.name} &middot; {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          ₹{order.total?.toLocaleString("en-IN")}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${sc.bg} ${sc.text}`} style={{ fontFamily: "var(--font-poppins)" }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Package size={28} className="text-[var(--muted)]/40" />
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>No orders yet</p>
                <p className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Place your first wholesale order to see it here</p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[var(--primary)]/90 hover:shadow-lg"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  <ShoppingBag size={14} />
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Top Products</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Best sellers</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((p: any, i: number) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-[11px] font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{p._id}</p>
                      <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{p.totalSold} sold</p>
                    </div>
                    <p className="text-xs font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                      ₹{p.revenue?.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]">
                  <TrendingUp size={24} className="text-[var(--muted)]/40" />
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>No products sold yet</p>
                <p className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Your top sellers will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 7. Wishlist Highlights + Coupons + Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Wishlist */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Heart size={14} />
              </div>
              <h4 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Wishlist</h4>
            </div>
            <Link href="/dashboard/wishlist" className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View All</Link>
          </div>
          {wishlist.length === 0 ? (
            <div className="py-6 text-center">
              <Heart size={24} className="mx-auto text-[var(--muted)]/30" />
              <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No items saved yet</p>
              <Link href="/shop" className="mt-2 inline-block text-[11px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>Browse Products</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {wishlist.slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[var(--accent)]/30">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--accent)]">
                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{p.name}</p>
                    <p className="text-[11px] font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{p.discountPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupons */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                <Gift size={14} />
              </div>
              <h4 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Coupons</h4>
            </div>
            <Link href="/dashboard/coupons" className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View All</Link>
          </div>
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.code} className="rounded-xl border border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>{coupon.discount}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{coupon.code}</span>
                    <button onClick={() => handleCopyCoupon(coupon.code)} className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10">
                      {copiedCode === coupon.code ? <Check size={10} /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{coupon.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <Bell size={14} />
              </div>
              <h4 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Notifications</h4>
            </div>
            <button
              onClick={() => setNotificationsRead(true)}
              className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}
            >
              {notificationsRead ? "All read ✓" : "Mark all read"}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell size={24} className="text-[var(--muted)]/30" />
              <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No notifications yet</p>
              <p className="text-[10px] text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>You&apos;ll see updates here</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 8. Recommended Products */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Recommended for You</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Based on your order history</p>
          </div>
          <Link href="/shop" className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors" style={{ fontFamily: "var(--font-poppins)" }}>
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
          {products.slice(0, 5).map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm transition-all hover:shadow-md">
              <div className="relative aspect-square overflow-hidden bg-[var(--accent)]">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {product.badge && (
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--primary)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white" style={{ fontFamily: "var(--font-poppins)" }}>
                    {product.badge}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent p-3 pt-10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[var(--primary)]/90" style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    <ShoppingBag size={12} />
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="p-3.5">
                <h4 className="text-xs font-semibold text-[var(--dark-text)] line-clamp-1" style={{ fontFamily: "var(--font-poppins)" }}>{product.name}</h4>
                <div className="mt-1 flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{product.rating} ({product.reviewCount})</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{product.discountPrice}</span>
                  <span className="text-[10px] text-[var(--muted)] line-through">₹{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 9. Business Insights */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mb-8">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Business Insights</h3>
          <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Key performance indicators</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, detail: "Awaiting processing", color: "#FF9800" },
            { label: "Delivered", value: stats?.deliveredOrders || 0, icon: Truck, detail: "Successfully delivered", color: "#4CAF50" },
            { label: "Cancelled", value: stats?.cancelledOrders || 0, icon: RotateCcw, detail: "Cancelled orders", color: "#2196F3" },
            { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, detail: "Active products", color: "#9C27B0" },
          ].map((insight) => (
            <div key={insight.label} className="rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${insight.color}12`, color: insight.color }}>
                <insight.icon size={18} />
              </div>
              <p className="text-xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{insight.value}</p>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{insight.label}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>{insight.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 10. Monthly Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }} className="mb-8 overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Order Volume</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Monthly order count comparison</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
              <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Orders</span>
            </div>
          </div>
        </div>
        <div className="relative h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="orders" fill="#E91E63" radius={[6, 6, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
          {!hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[1px]">
              <Package size={32} className="text-[var(--muted)]/30" />
              <p className="mt-2 text-sm font-medium text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No order data yet</p>
              <p className="text-xs text-[var(--muted)]/60" style={{ fontFamily: "var(--font-poppins)" }}>Place orders to see volume trends</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 11. Support CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mb-8 overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
        <div className="flex flex-col items-center justify-between gap-6 p-8 sm:flex-row sm:p-10">
          <div className="text-center sm:text-left">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
              <HeadphonesIcon size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600" style={{ fontFamily: "var(--font-poppins)" }}>Wholesale Support</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Need Help with Your Orders?</h3>
            <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Our dedicated wholesale support team is available Mon-Sat, 9AM-7PM</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/919205778531" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg" style={{ fontFamily: "var(--font-poppins)" }}>
              <MessageSquare size={14} />
              WhatsApp
              <ExternalLink size={10} />
            </a>
            <a href="tel:+919205778531" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--dark-text)] transition-all hover:bg-[var(--accent)]" style={{ fontFamily: "var(--font-poppins)" }}>
              <Users size={14} />
              Call Us
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
