"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Banknote,
  FileCheck,
  RotateCcw,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    id: 1,
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on orders above ₹999",
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: 2,
    icon: Banknote,
    title: "COD Available",
    description: "Pay cash when you receive your order",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: 3,
    icon: FileCheck,
    title: "GST Invoice",
    description: "Official GST invoice for every order",
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: 4,
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day hassle-free return policy",
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: 5,
    icon: BadgeCheck,
    title: "100% Original",
    description: "Genuine products, guaranteed quality",
    gradient: "from-rose-gold to-rose-gold-dark",
    bg: "bg-soft-pink",
  },
  {
    id: 6,
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "Your payment info is always safe",
    gradient: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
  },
];

export default function WhyChooseUs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 md:py-28">
      {/* Subtle background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -right-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-soft-pink/40 blur-3xl" />
        <div className="absolute -left-32 top-1/3 h-[300px] w-[300px] rounded-full bg-rose-gold/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center md:mb-16"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-rose-gold sm:text-xs">
            Our Promise
          </p>
          <h2 className="font-serif text-3xl font-light tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Why Choose Riya Touch
          </h2>
          <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-rose-gold to-transparent" />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="group relative h-full">
                  {/* Card */}
                  <div className="relative h-full overflow-hidden rounded-3xl border border-soft-pink-dark/30 bg-white p-5 sm:p-6 md:p-8 transition-all duration-500 shadow-[0_2px_16px_-4px_rgba(183,110,121,0.06)] hover:shadow-[0_12px_48px_-12px_rgba(183,110,121,0.14)] hover:-translate-y-1">
                    {/* Top accent line */}
                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                    />

                    {/* Icon */}
                    <div
                      className={`mb-4 inline-flex items-center justify-center rounded-2xl ${feature.bg} p-3 transition-all duration-500 group-hover:scale-110 sm:mb-5 sm:p-3.5`}
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.5}
                        className="text-charcoal transition-colors duration-500 group-hover:text-rose-gold sm:h-6 sm:w-6"
                      />
                    </div>

                    {/* Content */}
                    <h3 className="mb-1.5 font-serif text-base font-medium text-charcoal transition-colors duration-300 group-hover:text-rose-gold-dark sm:text-lg md:text-xl">
                      {feature.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted sm:text-sm md:text-[13px]">
                      {feature.description}
                    </p>

                    {/* Decorative corner */}
                    <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-soft-pink/30 transition-all duration-500 group-hover:scale-150 group-hover:bg-rose-gold/5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
