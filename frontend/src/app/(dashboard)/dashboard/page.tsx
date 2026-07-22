"use client";

import { useState } from "react";
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
  ChevronRight,
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

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const monthlySales = [
  { month: "Jan", sales: 42000, orders: 18 },
  { month: "Feb", sales: 55000, orders: 24 },
  { month: "Mar", sales: 48000, orders: 20 },
  { month: "Apr", sales: 62000, orders: 28 },
  { month: "May", sales: 71000, orders: 32 },
  { month: "Jun", sales: 58000, orders: 25 },
  { month: "Jul", sales: 83000, orders: 37 },
];

const categoryBreakdown = [
  { name: "Bras", value: 42, color: "#E91E63" },
  { name: "Panties", value: 28, color: "#F06292" },
  { name: "Sets", value: 18, color: "#F48FB1" },
  { name: "Sports", value: 8, color: "#F8BBD0" },
  { name: "Other", value: 4, color: "#FCE4EC" },
];

const topProducts = [
  { name: "Silk Lace Push-Up Bra", sold: 124, revenue: 185876 },
  { name: "Cotton Comfort Hipster", sold: 98, revenue: 48902 },
  { name: "Lace Bra & Panty Set", sold: 87, revenue: 173913 },
  { name: "Wireless Everyday Bra", sold: 76, revenue: 75924 },
  { name: "Seamless Bikini Panty", sold: 71, revenue: 31879 },
];

const recentOrders = [
  { id: "RT-2024-001", date: "Jan 15, 2024", items: "Silk Lace Push-Up Bra, Cotton Panty Set", price: 2498, status: "delivered" },
  { id: "RT-2024-002", date: "Jan 22, 2024", items: "Sports Bra, Seamless Bikini Panty", price: 2048, status: "pending" },
  { id: "RT-2024-003", date: "Feb 01, 2024", items: "Lace Bra & Panty Set", price: 1999, status: "processing" },
  { id: "RT-2024-004", date: "Feb 10, 2024", items: "Bridal Lace Lingerie Set", price: 3499, status: "delivered" },
  { id: "RT-2024-005", date: "Feb 18, 2024", items: "Maternity Nursing Bra, Boyshort Cotton Panty", price: 1698, status: "cancelled" },
  { id: "RT-2024-006", date: "Feb 25, 2024", items: "Wireless Everyday Bra × 3", price: 2997, status: "delivered" },
  { id: "RT-2024-007", date: "Mar 02, 2024", items: "High-Impact Sports Bra, Shapewear Belt", price: 3098, status: "processing" },
];

const notifications = [
  { id: 1, title: "Order #RT-2024-002 shipped", desc: "Your order is on the way!", time: "2 hours ago", type: "shipping", read: false },
  { id: 2, title: "New coupon available", desc: "Use RIYA20 for 20% off", time: "5 hours ago", type: "promo", read: false },
  { id: 3, title: "Payment received", desc: "₹1,999 credited to your account", time: "1 day ago", type: "payment", read: true },
  { id: 4, title: "Order #RT-2024-001 delivered", desc: "Package delivered successfully", time: "3 days ago", type: "delivery", read: true },
  { id: 5, title: "Welcome to Riya Touch!", desc: "Complete your profile for exclusive offers", time: "1 week ago", type: "info", read: true },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600" },
  pending: { bg: "bg-amber-50", text: "text-amber-600" },
  processing: { bg: "bg-blue-50", text: "text-blue-600" },
  cancelled: { bg: "bg-red-50", text: "text-red-600" },
};

const coupons = [
  { code: "RIYA20", discount: "20% OFF", description: "On orders above ₹999", expires: "Dec 31, 2026" },
  { code: "WELCOME10", discount: "10% OFF", description: "First wholesale order", expires: "Dec 31, 2026" },
  { code: "BULK50", discount: "₹50 OFF", description: "On bulk orders above ₹5000", expires: "Nov 30, 2026" },
];

export default function DashboardPage() {
  const { user, wishlist } = useShop();
  const userName = user?.name?.split(" ")[0] || "Partner";
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"sales" | "orders">("sales");
  const [dateRange, setDateRange] = useState("7d");

  const totalRevenue = monthlySales.reduce((sum, m) => sum + m.sales, 0);
  const totalOrdersCount = monthlySales.reduce((sum, m) => sum + m.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrdersCount);

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

  return (
    <>
      {/* 1. Welcome Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-light text-[var(--dark-text)] md:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
              Welcome back, <span className="text-[var(--primary)]">{userName}</span> 👋
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
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]">
              <Download size={16} />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]">
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
          { icon: IndianRupee, label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, change: "+18.2%", up: true, gradient: "linear-gradient(135deg, #E91E63, #C2185B)", sub: "vs last period" },
          { icon: Package, label: "Total Orders", value: totalOrdersCount.toString(), change: "+12", up: true, gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)", sub: "this month" },
          { icon: TrendingUp, label: "Avg Order Value", value: `₹${avgOrderValue.toLocaleString("en-IN")}`, change: "+5.3%", up: true, gradient: "linear-gradient(135deg, #059669, #047857)", sub: "vs last month" },
          { icon: Repeat, label: "Repeat Rate", value: "68%", change: "+2.1%", up: true, gradient: "linear-gradient(135deg, #D97706, #B45309)", sub: "wholesale partners" },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg" style={{ background: stat.gradient }}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`} style={{ fontFamily: "var(--font-poppins)" }}>
                {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {stat.change}
              </span>
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
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Revenue & orders trend</p>
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
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>By Category</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Sales distribution</p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontFamily: "var(--font-poppins)", fontSize: 12 }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-[var(--dark-text)]/70" style={{ fontFamily: "var(--font-poppins)" }}>{cat.name}</span>
                </div>
                <span className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{cat.value}%</span>
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
            { icon: HeadphonesIcon, label: "Support", href: "#", color: "#2196F3" },
            { icon: MessageSquare, label: "Chat", href: "#", color: "#4CAF50" },
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
        {/* Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Recent Orders</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{recentOrders.length} recent transactions</p>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors" style={{ fontFamily: "var(--font-poppins)" }}>
              View All →
            </Link>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--accent)]/30">
                    {["Order ID", "Date", "Items", "Amount", "Status", "Action"].map((h) => (
                      <th key={h} className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] ${h === "Action" ? "text-right" : "text-left"}`} style={{ fontFamily: "var(--font-poppins)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--border)]/30 last:border-0 transition-colors hover:bg-[var(--accent)]/20">
                      <td className="px-5 py-3.5 text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{order.id}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--muted)]">{order.date}</td>
                      <td className="px-5 py-3.5 text-xs text-[var(--muted)] max-w-[200px] truncate">{order.items}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{order.price.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusConfig[order.status]?.bg || ""} ${statusConfig[order.status]?.text || ""}`} style={{ fontFamily: "var(--font-poppins)" }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80" style={{ fontFamily: "var(--font-poppins)" }}>
                          View <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="divide-y divide-[var(--border)]/30 md:hidden">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{order.id}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${statusConfig[order.status]?.bg || ""} ${statusConfig[order.status]?.text || ""}`} style={{ fontFamily: "var(--font-poppins)" }}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mb-1">{order.date}</p>
                  <p className="text-xs text-[var(--dark-text)] truncate mb-2">{order.items}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{order.price.toLocaleString("en-IN")}</span>
                    <button className="text-[11px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Top Products</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Best sellers this month</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[11px] font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                    #{i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{product.name}</p>
                    <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{product.sold} sold · ₹{product.revenue.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--accent)]">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${(product.sold / topProducts[0].sold) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
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
            <Link href="/dashboard/wishlist" className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View All →</Link>
          </div>
          {wishlist.length === 0 ? (
            <div className="py-6 text-center">
              <Heart size={24} className="mx-auto text-[var(--muted)]/30" />
              <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No items saved yet</p>
              <Link href="/shop" className="mt-2 inline-block text-[11px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>Browse Products →</Link>
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
            <Link href="/dashboard/coupons" className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>View All →</Link>
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
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Notifications</h4>
            </div>
            <button className="text-[10px] font-semibold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>Mark all read</button>
          </div>
          <div className="space-y-1">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex gap-3 rounded-xl p-2.5 transition-colors hover:bg-[var(--accent)]/30 ${!notif.read ? "bg-[var(--primary)]/5" : ""}`}>
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!notif.read ? "bg-[var(--primary)]" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium ${!notif.read ? "text-[var(--dark-text)]" : "text-[var(--dark-text)]/70"}`} style={{ fontFamily: "var(--font-poppins)" }}>{notif.title}</p>
                  <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{notif.time}</p>
                </div>
              </div>
            ))}
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
            View All →
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
                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[var(--primary)]/90" style={{ fontFamily: "var(--font-poppins)" }}>
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
            { label: "Customer Satisfaction", value: "4.8/5", icon: Star, detail: "Based on 342 reviews", color: "#FF9800" },
            { label: "On-Time Delivery", value: "96%", icon: Truck, detail: "Last 30 days", color: "#4CAF50" },
            { label: "Return Rate", value: "2.1%", icon: RotateCcw, detail: "Below industry avg", color: "#2196F3" },
            { label: "Avg Fulfillment", value: "1.8 days", icon: Clock, detail: "Order to dispatch", color: "#9C27B0" },
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
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlySales} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)", fontFamily: "var(--font-poppins)" }} />
              <Tooltip content={customTooltip} />
              <Bar dataKey="orders" fill="#E91E63" radius={[6, 6, 0, 0]} name="orders" />
            </BarChart>
          </ResponsiveContainer>
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
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-green-600 hover:shadow-lg" style={{ fontFamily: "var(--font-poppins)" }}>
              <MessageSquare size={14} />
              WhatsApp
              <ExternalLink size={10} />
            </a>
            <a href="tel:+919876543210" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--dark-text)] transition-all hover:bg-[var(--accent)]" style={{ fontFamily: "var(--font-poppins)" }}>
              <Users size={14} />
              Call Us
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}
