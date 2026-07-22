"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Truck,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
} from "lucide-react";

const floatingBadges = [
  {
    icon: Sparkles,
    label: "50% OFF",
    color: "from-rose-gold to-rose-gold-dark",
    position: "top-[15%] right-[8%] md:top-[20%] md:right-[5%]",
    delay: 0.8,
  },
  {
    icon: Truck,
    label: "Free Shipping",
    color: "from-emerald-500 to-emerald-600",
    position: "top-[55%] right-[2%] md:top-[60%] md:right-[0%]",
    delay: 1.0,
  },
  {
    icon: Award,
    label: "Premium Quality",
    color: "from-amber-500 to-amber-600",
    position: "bottom-[20%] right-[10%] md:bottom-[25%] md:right-[8%]",
    delay: 1.2,
  },
  {
    icon: Shield,
    label: "Secure Payment",
    color: "from-violet-500 to-violet-600",
    position: "bottom-[35%] right-[2%] md:bottom-[38%] md:right-[0%]",
    delay: 1.4,
  },
];

export default function HeroBanner() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -80]);
  const y2 = useTransform(scrollY, [0, 500], [0, 40]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-br from-[#FDF2F5] via-[#F7E8EE] to-[#F7DCE3]">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating circles */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-gold/10 to-rose-gold-light/5 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-rose-gold/8 to-soft-pink-dark/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute left-1/3 top-1/4 h-[300px] w-[300px] rounded-full bg-gradient-to-r from-rose-gold-light/8 to-transparent blur-2xl"
        />

        {/* Geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute right-[15%] top-[10%] h-24 w-24 rounded-3xl border border-rose-gold/10 md:h-32 md:w-32"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[15%] left-[10%] h-16 w-16 rounded-full border border-rose-gold/10 md:h-20 md:w-20"
        />

        {/* Dotted pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #b76e79 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div style={{ opacity }} className="relative z-10">
        <div className="mx-auto flex min-h-[100dvh] max-w-[1600px] items-center px-4 py-20 sm:px-6 md:px-8 lg:px-12">
          <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-20">
            {/* Left Content */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              {/* Heading */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <h1 className="mb-2 font-serif text-5xl font-light leading-[1.1] tracking-tight text-charcoal sm:text-6xl md:text-7xl lg:text-8xl xl:text-[6.5rem]">
                  Flat{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-rose-gold-dark via-rose-gold to-rose-gold-light bg-clip-text text-transparent">
                      50% OFF
                    </span>
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={mounted ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.8, delay: 1.2 }}
                      className="absolute bottom-1 left-0 z-0 h-3 w-full origin-left bg-rose-gold/10 sm:bottom-2 sm:h-4 md:bottom-3 md:h-5"
                    />
                  </span>
                </h1>
              </motion.div>

              {/* Subheading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-4 font-serif text-xl font-light tracking-wide text-charcoal/80 sm:text-2xl md:text-3xl"
              >
                Premium Bras, Panties & Lingerie Collection
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted sm:text-base md:mx-0 md:max-w-lg md:text-lg"
              >
                Discover premium comfort, stylish designs and affordable
                wholesale prices. Pratapgarh & Amethi&apos;s most trusted
                innerwear brand.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link
                  href="/l/lingerie"
                  className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-charcoal px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white shadow-xl transition-all duration-300 hover:bg-rose-gold hover:shadow-rose-gold/30 sm:w-auto sm:px-10 sm:py-4.5"
                >
                  <ShoppingBag size={18} className="transition-transform duration-300 group-hover:scale-110" />
                  Shop Now
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </Link>
                <Link
                  href="/shop"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-charcoal/15 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-charcoal transition-all duration-300 hover:border-rose-gold hover:bg-rose-gold/5 hover:text-rose-gold sm:w-auto sm:px-10 sm:py-4.5"
                >
                  View Collection
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={mounted ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.3 }}
                className="flex flex-wrap items-center justify-center gap-6 lg:justify-start"
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-muted">
                    4.9/5 Rating
                  </span>
                </div>
                <div className="h-4 w-px bg-charcoal/10" />
                <span className="text-xs font-medium text-muted">
                  500+ Wholesale Partners
                </span>
                <div className="h-4 w-px bg-charcoal/10" />
                <span className="text-xs font-medium text-muted">
                  Since 2019
                </span>
              </motion.div>
            </div>

            {/* Right Side - Model Image */}
            <motion.div
              style={{ y: y1 }}
              className="relative order-1 lg:order-2"
            >
              {/* Main Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 40 }}
                animate={mounted ? { opacity: 1, scale: 1, x: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
                className="relative mx-auto w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] lg:max-w-[600px]"
              >
                {/* Glow effect behind image */}
                <div className="absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-gradient-to-br from-rose-gold/20 via-rose-gold-light/15 to-soft-pink-dark/20 blur-3xl" />

                {/* Image frame */}
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/80 to-soft-pink/60 p-2 shadow-2xl backdrop-blur-sm sm:p-3">
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-[#FDF2F5]">
                    <Image
                      src="/products/home-page.png"
                      alt="Riya Touch Premium Innerwear Collection"
                      width={1341}
                      height={1173}
                      priority
                      className="h-auto w-full object-contain"
                    />
                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-rose-gold/10 to-transparent" />
                  </div>
                </div>

                {/* Main floating discount badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={mounted ? { opacity: 1, scale: 1 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 1.0,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="absolute -left-4 top-8 sm:-left-6 md:-left-8 md:top-12"
                >
                  <div className="glass-badge relative flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/70 shadow-xl backdrop-blur-xl sm:h-24 sm:w-24 md:h-28 md:w-28">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold-dark sm:text-xs">
                      Flat
                    </span>
                    <span className="font-serif text-2xl font-bold leading-none text-rose-gold sm:text-3xl md:text-4xl">
                      50%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-gold-dark sm:text-xs">
                      OFF
                    </span>
                    {/* Decorative corner */}
                    <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-gold text-[8px] font-bold text-white sm:h-6 sm:w-6 sm:text-[9px]">
                      HOT
                    </div>
                  </div>
                </motion.div>

                {/* Floating Badges around image */}
                {floatingBadges.map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={mounted ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: badge.delay,
                      type: "spring",
                      stiffness: 180,
                    }}
                    className={`absolute ${badge.position} hidden md:block`}
                  >
                    <motion.div
                      animate={{
                        y: [0, -8, 0],
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="glass-badge flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-4 py-2.5 shadow-lg backdrop-blur-xl">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${badge.color}`}
                        >
                          <badge.icon size={13} className="text-white" />
                        </div>
                        <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-charcoal">
                          {badge.label}
                        </span>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Decorative floating shapes */}
              <motion.div
                style={{ y: y2 }}
                className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full border-2 border-dashed border-rose-gold/15 md:-bottom-8 md:-left-8 md:h-48 md:w-48"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 40,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -right-4 bottom-1/4 h-12 w-12 rounded-full border border-rose-gold/10 md:-right-8 md:h-16 md:w-16"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={mounted ? { opacity: 1 } : {}}
        transition={{ delay: 2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
            Scroll to Explore
          </span>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-charcoal/15 p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-2 w-1 rounded-full bg-rose-gold/60"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
