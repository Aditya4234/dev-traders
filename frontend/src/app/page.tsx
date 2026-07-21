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
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { products } from "@/data/mock-data";

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
      <section className="relative min-h-screen overflow-hidden gradient-hero">
        {/* Floating decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="floating-circle absolute -left-32 -top-32 h-[500px] w-[500px]"
          />
          <motion.div
            animate={{ y: [0, 20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="floating-circle absolute -bottom-48 -right-48 h-[600px] w-[600px]"
          />
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="floating-circle absolute left-1/3 top-1/4 h-[300px] w-[300px]"
          />
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #E91E63 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] items-center px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-full glass px-5 py-2.5 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
                    Premium Innerwear Brand
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6 font-[family-name:var(--font-playfair)] text-5xl font-light leading-[1.1] tracking-tight text-dark-text sm:text-6xl md:text-7xl lg:text-[82px]"
              >
                Feel{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary-dark via-primary to-primary-light bg-clip-text text-transparent">
                    Beautiful.
                  </span>
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="absolute bottom-1 left-0 z-0 h-3 w-full origin-left bg-primary/10 sm:bottom-2 sm:h-4 md:bottom-3 md:h-5"
                  />
                </span>
                <br />
                <span className="text-dark-text">Feel </span>
                <span className="text-primary">Comfortable.</span>
                <br />
                <span className="text-dark-text">Feel </span>
                <span className="text-primary">Confident.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mx-auto mb-10 max-w-md text-base leading-relaxed text-muted sm:text-lg md:mx-0 md:max-w-lg md:text-xl"
              >
                Premium bras and lingerie designed for modern women.
                Discover comfort, style, and confidence with every piece.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link
                  href="/shop"
                  className="btn-primary group inline-flex w-full items-center justify-center gap-3 sm:w-auto"
                >
                  Shop Now
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/shop"
                  className="btn-outline group inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  Explore Collection
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex flex-wrap items-center justify-center gap-6 lg:justify-start"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted">4.9/5 Rating</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs font-medium text-muted">500+ Wholesale Partners</span>
                <div className="h-4 w-px bg-border" />
                <span className="text-xs font-medium text-muted">Since 2019</span>
              </motion.div>
            </div>

            {/* Right: Hero Banner Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            >
              <div className="relative overflow-hidden rounded-[2rem] glass-strong p-3 shadow-2xl sm:p-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src="/products/home page banner.png"
                    alt="Riya Touch Premium Innerwear Collection"
                    fill
                    priority
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Floating Discount Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0, type: "spring", stiffness: 200 }}
                className="absolute -left-4 top-8 sm:-left-6 md:-left-8 md:top-12"
              >
                <div className="glass-badge relative flex h-20 w-20 flex-col items-center justify-center rounded-2xl shadow-xl glass sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark sm:text-xs font-[family-name:var(--font-poppins)]">
                    UP TO
                  </span>
                  <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-none text-primary sm:text-3xl md:text-4xl">
                    30%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-dark sm:text-xs font-[family-name:var(--font-poppins)]">
                    OFF
                  </span>
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white sm:h-6 sm:w-6 sm:text-[9px]">
                    HOT
                  </div>
                </div>
              </motion.div>

              {/* Floating Free Shipping Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.2, type: "spring", stiffness: 180 }}
                className="absolute -right-2 top-1/3 hidden md:block"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  <div className="glass-badge flex items-center gap-2 rounded-full glass px-4 py-2.5 shadow-lg">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                      <Truck size={13} className="text-white" />
                    </div>
                    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-dark-text font-[family-name:var(--font-poppins)]">
                      Free Shipping
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating Premium Quality Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4, type: "spring", stiffness: 180 }}
                className="absolute -right-4 bottom-1/4 hidden md:block"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
                  <div className="glass-badge flex items-center gap-2 rounded-full glass px-4 py-2.5 shadow-lg">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600">
                      <Heart size={13} className="text-white" />
                    </div>
                    <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-dark-text font-[family-name:var(--font-poppins)]">
                      Premium Quality
                    </span>
                  </div>
                </motion.div>
              </motion.div>
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
