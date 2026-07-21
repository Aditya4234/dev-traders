"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Package,
  Clock,
  Truck,
  Star,
  ArrowRight,
  Gift,
  ShoppingBag,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { products } from "@/data/mock-data";

const statsCards = [
  { icon: Package, label: "Total Orders", value: "12", gradient: "from-primary to-primary-dark", change: "+2 this month" },
  { icon: Clock, label: "Pending Orders", value: "3", gradient: "from-amber-500 to-amber-600", change: "2 shipping" },
  { icon: Truck, label: "Delivered Orders", value: "9", gradient: "from-emerald-500 to-emerald-600", change: "100% rate" },
  { icon: Heart, label: "Wishlist", value: "8", gradient: "from-rose-400 to-rose-500", change: "3 new" },
];

const recentOrders = [
  { id: "RT-2024-001", date: "Jan 15, 2024", items: "Silk Lace Push-Up Bra, Cotton Panty Set", price: 2498, status: "delivered" },
  { id: "RT-2024-002", date: "Jan 22, 2024", items: "Sports Bra, Seamless Bikini Panty", price: 2048, status: "pending" },
  { id: "RT-2024-003", date: "Feb 01, 2024", items: "Lace Bra & Panty Set", price: 1999, status: "processing" },
  { id: "RT-2024-004", date: "Feb 10, 2024", items: "Bridal Lace Lingerie Set", price: 3499, status: "delivered" },
  { id: "RT-2024-005", date: "Feb 18, 2024", items: "Maternity Nursing Bra, Boyshort Cotton Panty", price: 1698, status: "cancelled" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function DashboardPage() {
  const { user } = useShop();
  const userName = user?.name || "User";

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText("RIYA20");
  };

  return (
    <>
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          Welcome back, <span className="text-primary">{userName}</span> 👋
        </h1>
        <p className="mt-2 text-sm text-muted">Here&apos;s what&apos;s happening with your account today.</p>
      </motion.div>

      {/* PROMOTIONAL BANNER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8 overflow-hidden rounded-[24px] gradient-primary relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute -right-10 -top-10 h-[200px] w-[200px] opacity-20" />
          <div className="floating-circle absolute -left-10 -bottom-10 h-[150px] w-[150px] opacity-20" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-8 sm:flex-row sm:p-10">
          <div className="text-center sm:text-left">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5">
              <Gift size={14} className="text-white" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">Exclusive Offer</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-white sm:text-4xl">
              Flat <span className="font-bold">20% OFF</span>
            </h2>
            <p className="mt-2 text-sm text-white/70">Use coupon code on your next purchase</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/20 px-6 py-3">
              <span className="text-lg font-bold tracking-wider text-white font-[family-name:var(--font-poppins)]">RIYA20</span>
              <button onClick={handleCopyCoupon} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30">
                <span className="text-[10px] text-white font-semibold">COPY</span>
              </button>
            </div>
            <Link href="/shop" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary transition-all hover:shadow-lg hover:shadow-white/20 font-[family-name:var(--font-poppins)]">
              Shop Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* STATISTICS CARDS */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {statsCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp} className="luxury-card p-5">
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-dark-text font-[family-name:var(--font-poppins)]">{stat.value}</p>
            <p className="text-xs text-muted font-[family-name:var(--font-poppins)]">{stat.label}</p>
            <p className="mt-1 text-[10px] text-primary font-[family-name:var(--font-poppins)]">{stat.change}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* RECENT ORDERS TABLE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light text-dark-text md:text-2xl">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
            View All →
          </Link>
        </div>
        <div className="overflow-hidden rounded-[24px] bg-white shadow-sm border border-border/50">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-accent/30">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Order ID</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Date</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Items</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Price</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/30 last:border-0 transition-colors hover:bg-accent/20">
                    <td className="px-6 py-4 text-sm font-medium text-dark-text font-[family-name:var(--font-poppins)]">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-muted">{order.date}</td>
                    <td className="px-6 py-4 text-sm text-muted max-w-[250px] truncate">{order.items}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">₹{order.price.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-poppins)] badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
                        View Details <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="divide-y divide-border/30 md:hidden">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-dark-text font-[family-name:var(--font-poppins)]">{order.id}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider font-[family-name:var(--font-poppins)] badge-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-muted mb-1">{order.date}</p>
                <p className="text-sm text-dark-text truncate mb-2">{order.items}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary font-[family-name:var(--font-poppins)]">₹{order.price.toLocaleString("en-IN")}</span>
                  <button className="text-xs font-semibold text-primary font-[family-name:var(--font-poppins)]">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* RECOMMENDED PRODUCTS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-light text-dark-text md:text-2xl">Recommended For You</h2>
          <Link href="/shop" className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="luxury-card group overflow-hidden">
              <div className="relative aspect-square overflow-hidden bg-accent">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">{product.badge}</span>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent p-4 pt-10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]">
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-dark-text line-clamp-1 font-[family-name:var(--font-poppins)]">{product.name}</h3>
                <div className="mt-1 flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span className="text-xs text-muted">{product.rating} ({product.reviewCount})</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-bold text-primary font-[family-name:var(--font-poppins)]">₹{product.discountPrice}</span>
                  <span className="text-xs text-muted line-through">₹{product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
