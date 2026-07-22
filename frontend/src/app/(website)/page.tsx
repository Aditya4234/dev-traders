"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Shield,
  Truck,
  Star,
  ArrowRight,
  Heart,
  Award,
  ChevronRight,
  Eye,
  ShoppingBag,
  Zap,
  Clock,
  RefreshCw,
  Gem,
  Headphones,
  Check,
  Package,
  Store,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { products } from "@/data/mock-data";

const heroStats = [
  { value: "500+", label: "Dealers", icon: Store },
  { value: "50,000+", label: "Orders Delivered", icon: Package },
  { value: "Since 2019", label: "Trusted Brand", icon: BadgeCheck },
];

const floatingBadges = [
  {
    icon: TrendingUp,
    label: "Wholesale Price",
    color: "from-emerald-500 to-emerald-600",
    position: "top-[12%] -right-2 md:-right-4 md:top-[15%]",
    delay: 1.0,
  },
  {
    icon: Sparkles,
    label: "New Collection",
    color: "from-[#E8A0B0] to-[#D4858F]",
    position: "top-[42%] -right-3 md:-right-6 md:top-[45%]",
    delay: 1.2,
  },
  {
    icon: Truck,
    label: "Fast Delivery",
    color: "from-violet-500 to-violet-600",
    position: "bottom-[28%] -right-2 md:-right-4 md:bottom-[30%]",
    delay: 1.4,
  },
  {
    icon: Shield,
    label: "Trusted Brand",
    color: "from-amber-500 to-amber-600",
    position: "bottom-[8%] right-2 md:right-0 md:bottom-[10%]",
    delay: 1.6,
  },
];

const trustBadges = [
  { icon: Gem, label: "Premium Fabric", desc: "Finest materials" },
  { icon: Heart, label: "Skin Friendly", desc: "Dermatologically tested" },
  { icon: Sparkles, label: "Perfect Fit", desc: "All sizes available" },
  { icon: Truck, label: "Fast Delivery", desc: "Across India" },
  { icon: RefreshCw, label: "Easy Return", desc: "30-day returns" },
];

const categories = [
  { name: "Bra", image: "/products/image1.png", count: "50+ Styles" },
  { name: "Panty", image: "/products/image2.png", count: "40+ Styles" },
  { name: "Sports Bra", image: "/products/image6.png", count: "20+ Styles" },
  { name: "Lingerie Set", image: "/products/image3.png", count: "30+ Styles" },
  { name: "Shapewear", image: "/products/image5.png", count: "15+ Styles" },
  { name: "Nightwear", image: "/products/image4.png", count: "25+ Styles" },
  { name: "Camisole", image: "/products/sonam.png", count: "10+ Styles" },
  { name: "Accessories", image: "/products/perry.png", count: "12+ Styles" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  const { setLoginOpen } = useShop();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════════ HERO SECTION ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FDF2F5] via-[#FAE8EE] to-[#F7DCE3]">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#E8A0B0]/15 to-[#D4858F]/5 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, 20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-[#E8A0B0]/10 to-[#D4858F]/8 blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute left-1/3 top-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-[#E8A0B0]/8 to-transparent blur-2xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute right-[15%] top-[10%] h-24 w-24 rounded-3xl border border-[#E8A0B0]/10 md:h-32 md:w-32"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[15%] left-[10%] h-16 w-16 rounded-full border border-[#E8A0B0]/10 md:h-20 md:w-20"
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #b76e79 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* ─── Left: Content ─── */}
            <div className="text-center lg:text-left">
              {/* Top Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E8A0B0]/30 bg-white/60 px-5 py-2.5 shadow-sm backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8A0B0] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E8A0B0]" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C48A96] font-[family-name:var(--font-poppins)]">
                    India&apos;s Trusted Wholesale Brand
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 font-[family-name:var(--font-playfair)] text-5xl font-light leading-[1.1] tracking-tight text-[#2D2D2D] sm:text-6xl md:text-7xl lg:text-[72px]"
              >
                India&apos;s Trusted{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-[#C48A96] via-[#E8A0B0] to-[#D4858F] bg-clip-text text-transparent">
                    Wholesale
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="absolute bottom-1 left-0 z-0 h-3 w-full origin-left bg-[#E8A0B0]/10 sm:bottom-2 sm:h-4 md:bottom-3 md:h-5"
                  />
                </span>
                <br />
                <span className="text-[#2D2D2D]">Women&apos;s Innerwear</span>
                <br />
                <span className="text-[#2D2D2D]">Brand</span>
              </motion.h1>

              {/* Sub Heading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mx-auto mb-8 max-w-md text-base leading-relaxed text-[#8B7B82] sm:text-lg md:mx-0 md:max-w-lg md:text-xl"
              >
                Premium bras, panties and lingerie for retailers, distributors and
                wholesale partners. Competitive pricing, premium quality and fast
                nationwide delivery.
              </motion.p>

              {/* Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="mb-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
              >
                {["Wholesale Pricing", "Bulk Orders", "Fast Dispatch", "Premium Quality"].map(
                  (pill, i) => (
                    <motion.span
                      key={pill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#E8A0B0]/25 bg-white/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#C48A96] shadow-sm backdrop-blur-sm font-[family-name:var(--font-poppins)]"
                    >
                      <Check size={12} className="text-[#E8A0B0]" />
                      {pill}
                    </motion.span>
                  )
                )}
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link
                  href="/l/lingerie"
                  className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#2D2D2D] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-[#E8A0B0] hover:shadow-[#E8A0B0]/30 sm:w-auto sm:px-10 sm:py-4.5 font-[family-name:var(--font-poppins)]"
                >
                  <ShoppingBag size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  Browse Wholesale Collection
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </Link>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#2D2D2D]/15 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#2D2D2D] transition-all duration-300 hover:border-[#E8A0B0] hover:bg-[#E8A0B0]/5 hover:text-[#C48A96] sm:w-auto sm:px-10 sm:py-4.5 font-[family-name:var(--font-poppins)]"
                >
                  Become a Dealer
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </motion.div>

              {/* Hero Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex flex-wrap items-center justify-center gap-6 lg:justify-start"
              >
                {heroStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A0B0]/10">
                      <stat.icon size={16} className="text-[#C48A96]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-[#2D2D2D] font-[family-name:var(--font-poppins)]">
                        {stat.value}
                      </span>
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-[#8B7B82] font-[family-name:var(--font-poppins)]">
                        {stat.label}
                      </span>
                    </div>
                    {i < heroStats.length - 1 && (
                      <div className="ml-4 h-8 w-px bg-[#2D2D2D]/10" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ─── Right: Premium Image Card ─── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            >
              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
                <div className="relative overflow-hidden rounded-[1.5rem] bg-[#FDF2F5]">
                  <Image
                    src="/products/home-page.png"
                    alt="Riya Touch Premium Wholesale Innerwear Collection"
                    width={1341}
                    height={1173}
                    priority
                    className="h-auto w-full object-contain"
                  />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#E8A0B0]/15 to-transparent" />
                </div>
              </div>

              {/* ─── Floating Badges ─── */}
              {floatingBadges.map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    delay: badge.delay,
                    type: "spring",
                    stiffness: 180,
                  }}
                  className={`absolute ${badge.position} hidden md:block`}
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-2.5 shadow-lg backdrop-blur-xl">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${badge.color}`}
                      >
                        <badge.icon size={13} className="text-white" />
                      </div>
                      <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-[#2D2D2D] font-[family-name:var(--font-poppins)]">
                        {badge.label}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}

              {/* Decorative floating shapes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute -right-4 bottom-1/4 h-12 w-12 rounded-full border border-[#E8A0B0]/10 md:-right-8 md:h-16 md:w-16"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full border-2 border-dashed border-[#E8A0B0]/10 md:-bottom-8 md:-left-8 md:h-28 md:w-28"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ TRUST BADGES ═══════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5"
          >
            {trustBadges.map((badge) => (
              <motion.div
                key={badge.label}
                variants={fadeUp}
                className="text-center group"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent transition-all duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                  <badge.icon size={22} className="text-primary transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  {badge.label}
                </h3>
                <p className="mt-0.5 text-xs text-muted">{badge.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ SHOP BY CATEGORIES ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Shop By Categories
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl lg:text-5xl">
              Explore Our Collection
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-6"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  href="/shop"
                  className="group luxury-card block overflow-hidden p-3"
                >
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-accent">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-text/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">
                        View All
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                  <h3 className="text-center text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                    {cat.name}
                  </h3>
                  <p className="mt-0.5 text-center text-xs text-muted">
                    {cat.count}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ TRENDING PRODUCTS ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 flex items-end justify-between"
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
                Trending Now
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/shop"
              className="group hidden items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:inline-flex font-[family-name:var(--font-poppins)]"
            >
              View All
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-6"
          >
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <div className="luxury-card group overflow-hidden">
                  <div className="relative aspect-square overflow-hidden bg-accent">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">
                        {product.badge}
                      </span>
                    )}
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-primary hover:text-white">
                      <Heart size={14} />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent p-4 pt-10 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]">
                        <ShoppingBag size={14} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-dark-text line-clamp-1 font-[family-name:var(--font-poppins)]">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted">{product.rating} ({product.reviewCount})</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-bold text-primary font-[family-name:var(--font-poppins)]">
                        ₹{product.discountPrice}
                      </span>
                      <span className="text-xs text-muted line-through">
                        ₹{product.price}
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-primary bg-accent px-2 py-0.5 rounded-full font-[family-name:var(--font-poppins)]">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/shop"
              className="btn-primary group inline-flex items-center gap-2"
            >
              View All Products
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ WHY CHOOSE US ═══════════════════════════════════════════════ */}
      <section className="py-24 gradient-soft">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Why Choose Us
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
              The Riya Touch Difference
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
          >
            {[
              { icon: Truck, title: "Free Shipping", desc: "Free delivery on all orders across India" },
              { icon: Eye, title: "100% Original", desc: "Every product is genuine & quality tested" },
              { icon: Award, title: "GST Invoice", desc: "Full GST billing for wholesale buyers" },
              { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy" },
              { icon: Shield, title: "Secure Payment", desc: "100% safe & encrypted checkout" },
              { icon: Headphones, title: "24/7 Support", desc: "Always here to help you" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="luxury-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ CTA SECTION ═══════════════════════════════════════════════ */}
      <section className="py-28 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute left-10 top-10 h-[200px] w-[200px] opacity-20" />
          <div className="floating-circle absolute bottom-10 right-10 h-[250px] w-[250px] opacity-20" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
              Join Riya Touch
            </span>
            <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-3xl font-light text-white sm:text-4xl md:text-5xl">
              Ready to Experience Premium Comfort?
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-white/70">
              Create your account to unlock exclusive deals, track orders, and
              get access to our complete collection.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => setLoginOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-sm font-semibold uppercase tracking-wider text-primary shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 font-[family-name:var(--font-poppins)]"
              >
                Create Account
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white/10 font-[family-name:var(--font-poppins)]"
              >
                Continue as Guest
                <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
