"use client";

import { motion } from "framer-motion";
import { Sparkles, Wind, Heart, ShieldAlert } from "lucide-react";

const highlights = [
  {
    title: "Cool Comfort™ Fabric",
    description:
      "Crafted with advanced cotton-rich fibers designed to wick moisture away and keep you feeling dry and cool all day long.",
    icon: Wind,
  },
  {
    title: "Delicate Lace Trims",
    description:
      "Signature soft French lace trims that feel lightweight and lie completely flat under clothing for zero show-through.",
    icon: Sparkles,
  },
  {
    title: "360° Flex Support",
    description:
      "Flex-fit underbands and wireless frames that stretch dynamically with your body's movements without pinching.",
    icon: Heart,
  },
];

export default function LingerieHighlights() {
  return (
    <section className="bg-gradient-to-tr from-white to-soft-pink/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-12 text-center md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-gold">
            Fabric &amp; Design Philosophy
          </span>
          <h2 className="mt-2 font-serif text-3xl font-light text-charcoal sm:text-4xl">
            Why Riya Touch Lingerie?
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-12 bg-rose-gold-light" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative rounded-2xl border border-soft-pink-dark bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-soft-pink text-rose-gold">
                  <Icon size={24} />
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal mb-3">
                  {item.title}
                </h3>
                <p className="font-sans text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
