"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  IndianRupee,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowRight,
  RefreshCw,
  Download,
  MessageSquare,
  ExternalLink,
  HeadphonesIcon,
  ShoppingBag,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useShop } from "@/context/ShopContext";
import { getWholesellerDashboard } from "@/lib/api";

interface WholesellerDashboard {
  revenue: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    avgOrderValue: number;
    revenueChange: number;
  };
  orders: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    orderChange: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  payments: {
    cod: number;
    online: number;
    whatsapp: number;
  };
  recentOrders: {
    _id: string;
    status: string;
    total: number;
    createdAt: string;
    items: { name: string; quantity: number }[];
    customer?: { name: string };
    paymentMethod?: string;
  }[];
  topProducts: { _id: string; totalSold: number; revenue: number }[];
  dailySales: { date: string; sales: number; orders: number }[];
  monthlyChart: { month: string; sales: number; orders: number }[];
  categorySales: { _id: string; total: number }[];
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const PIE_COLORS = ["#E91E63", "#7C3AED", "#059669", "#D97706", "#2196F3", "#F44336", "#9C27B0"];

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-600", icon: Clock },
  confirmed: { bg: "bg-blue-50", text: "text-blue-600", icon: CheckCircle2 },
  shipped: { bg: "bg-indigo-50", text: "text-indigo-600", icon: Truck },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
  cancelled: { bg: "bg-red-50", text: "text-red-600", icon: XCircle },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white p-3 shadow-xl">
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

export default function WholesellerDashboardPage() {
  const { user } = useShop();
  const userName = user?.name?.split(" ")[0] || "Partner";
  const [data, setData] = useState<WholesellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"revenue" | "orders">("revenue");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getWholesellerDashboard();
      if (res?.success) setData(res.dashboard);
    } catch {
      // dashboard may not have data yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getWholesellerDashboard();
        if (active && res?.success) setData(res.dashboard);
      } catch {
        // dashboard may not have data yet
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

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

  const r = data?.revenue;
  const o = data?.orders;
  const p = data?.payments;
  const totalPayments = (p?.cod || 0) + (p?.online || 0) + (p?.whatsapp || 0);

  const categoryData = (data?.categorySales || []).map((c, i) => ({
    name: c._id || "Other",
    value: c.total,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const totalCatValue = categoryData.reduce((s, c) => s + c.value, 0);

  const hasData = o && o.total > 0;

  return (
    <div className="space-y-8">
      {/* ═══ Welcome ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-light text-[var(--dark-text)] md:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
            Welcome back, <span className="text-[var(--primary)]">{userName}</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            Here&apos;s your wholesale business overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!data) return;
              const rows = [
                ["Metric", "Value"],
                ["Total Revenue", `₹${r?.total?.toLocaleString("en-IN") || 0}`],
                ["Total Orders", String(o?.total || 0)],
                ["Avg Order Value", `₹${r?.avgOrderValue?.toLocaleString("en-IN") || 0}`],
                ["This Month Revenue", `₹${r?.thisMonth?.toLocaleString("en-IN") || 0}`],
                ["This Month Orders", String(o?.thisMonth || 0)],
                ["Pending", String(o?.pending || 0)],
                ["Delivered", String(o?.delivered || 0)],
                ["Cancelled", String(o?.cancelled || 0)],
              ];
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `wholeseller-report-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
            title="Download Report"
          >
            <Download size={16} />
          </button>
          <button
            onClick={fetchData}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* ═══ Revenue Cards ═══ */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[
          { label: "Total Revenue", value: `₹${(r?.total || 0).toLocaleString("en-IN")}`, change: `${r?.revenueChange || 0}%`, up: (r?.revenueChange || 0) >= 0, gradient: "linear-gradient(135deg, #E91E63, #C2185B)", sub: `This month: ₹${(r?.thisMonth || 0).toLocaleString("en-IN")}` },
          { label: "Today's Revenue", value: `₹${(r?.today || 0).toLocaleString("en-IN")}`, gradient: "linear-gradient(135deg, #7C3AED, #5B21B6)", sub: `This week: ₹${(r?.thisWeek || 0).toLocaleString("en-IN")}` },
          { label: "Avg Order Value", value: `₹${(r?.avgOrderValue || 0).toLocaleString("en-IN")}`, gradient: "linear-gradient(135deg, #059669, #047857)", sub: "Per order average" },
          { label: "Total Orders", value: String(o?.total || 0), change: `${o?.orderChange || 0}%`, up: (o?.orderChange || 0) >= 0, gradient: "linear-gradient(135deg, #D97706, #B45309)", sub: `This month: ${o?.thisMonth || 0}` },
        ].map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg" style={{ background: stat.gradient }}>
                <IndianRupee size={20} className="text-white" />
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

      {/* ═══ Order Status Cards ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="mb-4 text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Order Status</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Pending", value: o?.pending || 0, color: "#FF9800", icon: Clock },
            { label: "Confirmed", value: o?.confirmed || 0, color: "#2196F3", icon: CheckCircle2 },
            { label: "Shipped", value: o?.shipped || 0, color: "#6366F1", icon: Truck },
            { label: "Delivered", value: o?.delivered || 0, color: "#10B981", icon: CheckCircle2 },
            { label: "Cancelled", value: o?.cancelled || 0, color: "#EF4444", icon: XCircle },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}12`, color: s.color }}>
                  <s.icon size={16} />
                </div>
                <span className="text-xs font-medium text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.label}</span>
              </div>
              <p className="text-xl font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══ Daily Sales + Payment Methods ═══ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Daily Sales Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Daily Sales</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Last 7 days performance</p>
            </div>
            <div className="flex gap-1 rounded-xl bg-[var(--accent)] p-1">
              {(["revenue", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${
                    activeTab === tab ? "bg-white text-[var(--dark-text)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--dark-text)]"
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
              {activeTab === "revenue" ? (
                <BarChart data={data?.dailySales || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="sales" fill="#E91E63" radius={[6, 6, 0, 0]} name="sales" />
                </BarChart>
              ) : (
                <BarChart data={data?.dailySales || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted)" }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="orders" fill="#7C3AED" radius={[6, 6, 0, 0]} name="orders" />
                </BarChart>
              )}
            </ResponsiveContainer>
            {!hasData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                <BarChart3 size={32} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-sm font-medium text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No sales data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Payment Methods</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Order breakdown</p>
          </div>
          {totalPayments > 0 ? (
            <>
              <div className="relative mx-auto mb-6 h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "COD", value: p?.cod || 0, color: "#E91E63" },
                        { name: "Online", value: p?.online || 0, color: "#7C3AED" },
                        { name: "WhatsApp", value: p?.whatsapp || 0, color: "#10B981" },
                      ].filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {[0, 1, 2].map((i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{totalPayments}</span>
                  <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>orders</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "COD", value: p?.cod || 0, color: "#E91E63" },
                  { label: "Online", value: p?.online || 0, color: "#7C3AED" },
                  { label: "WhatsApp", value: p?.whatsapp || 0, color: "#10B981" },
                ].filter((d) => d.value > 0).map((pm) => (
                  <div key={pm.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pm.color }} />
                        <span className="text-xs font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{pm.label}</span>
                      </div>
                      <span className="text-xs font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{pm.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--accent)]">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPayments > 0 ? (pm.value / totalPayments) * 100 : 0}%`, backgroundColor: pm.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ShoppingCart size={28} className="text-[var(--muted)]/30" />
              <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No payment data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ═══ Monthly Chart + Category ═══ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Monthly Revenue</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Last 7 months trend</p>
          </div>
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyChart || []} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E91E63" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E91E63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sales" stroke="#E91E63" strokeWidth={2.5} fill="url(#gradRevenue)" name="sales" />
              </AreaChart>
            </ResponsiveContainer>
            {!hasData && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                <TrendingUp size={32} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No revenue data yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>By Category</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Sales distribution</p>
          </div>
          <div className="relative h-[180px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChartIcon size={28} className="text-[var(--muted)]/30" />
                <p className="mt-2 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No category data</p>
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
                  {totalCatValue > 0 ? Math.round((cat.value / totalCatValue) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Recent Orders + Top Products ═══ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Recent Orders</h3>
              <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Latest 10 orders</p>
            </div>
            <Link href="/dashboard/orders" className="text-xs font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity" style={{ fontFamily: "var(--font-poppins)" }}>
              View All <ArrowRight size={12} className="inline" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <div className="divide-y divide-[var(--border)]/50">
                {data.recentOrders.map((order) => {
                  const sc = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
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
                            {order.customer?.name || "Customer"} &middot; {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
                          ₹{order.total?.toLocaleString("en-IN")}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${sc.bg} ${sc.text}`} style={{ fontFamily: "var(--font-poppins)" }}>
                          <StatusIcon size={8} />
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Package size={28} className="text-[var(--muted)]/40" />
                </div>
                <p className="mt-4 text-sm font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>No orders yet</p>
                <Link href="/shop" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white transition-all hover:shadow-lg" style={{ fontFamily: "var(--font-poppins)" }}>
                  <ShoppingBag size={14} /> Start Shopping
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>Top Products</h3>
            <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Best sellers</p>
          </div>
          <div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white p-5 shadow-sm">
            {data?.topProducts && data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((p, i) => (
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
                <TrendingUp size={24} className="text-[var(--muted)]/40" />
                <p className="mt-3 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No products sold yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Support CTA ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-white shadow-sm">
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
              <MessageSquare size={14} /> WhatsApp <ExternalLink size={10} />
            </a>
            <a href="tel:+919205778531" className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--dark-text)] transition-all hover:bg-[var(--accent)]" style={{ fontFamily: "var(--font-poppins)" }}>
              <HeadphonesIcon size={14} /> Call Us
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
