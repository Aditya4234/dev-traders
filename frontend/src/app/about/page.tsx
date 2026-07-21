"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Shield,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

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

const values = [
  {
    icon: Heart,
    title: "Comfort First",
    desc: "Every product is designed with women's comfort as the top priority. Soft fabrics, perfect fits, all-day wearability.",
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    desc: "Rigorous quality testing at every stage. We never compromise on the materials or craftsmanship.",
  },
  {
    icon: Sparkles,
    title: "Modern Design",
    desc: "Trendy styles that blend fashion with function. From everyday basics to stunning lingerie sets.",
  },
  {
    icon: Users,
    title: "Women Empowered",
    desc: "Supporting women entrepreneurs and wholesale partners across India with fair pricing and dedicated support.",
  },
];

const milestones = [
  { year: "2019", event: "Riya Touch Founded" },
  { year: "2020", event: "100+ Wholesale Partners" },
  { year: "2021", event: "Expanded to 50+ Product Lines" },
  { year: "2022", event: "Launched Online Store" },
  { year: "2023", event: "500+ Happy Partners Nationwide" },
  { year: "2024", event: "Premium Collection Launch" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
          <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
              Our Story
            </span>
            <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl md:text-6xl">
              About Riya Touch
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Empowering women with premium innerwear that celebrates comfort,
              confidence, and beauty since 2019.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
                Who We Are
              </span>
              <h2 className="mt-3 mb-6 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
                Born from a Passion for <span className="text-primary">Quality</span>
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted md:text-base">
                <p>
                  Riya Touch was founded with a simple mission — to provide women
                  with innerwear that is both comfortable and beautiful. What started
                  as a small venture has grown into a trusted brand serving wholesale
                  partners across India.
                </p>
                <p>
                  We believe every woman deserves to feel confident from the inside
                  out. Our carefully curated collection of bras, panties, lingerie
                  sets, shapewear, and nightwear is designed to cater to modern
                  women who value both style and comfort.
                </p>
                <p>
                  With over 500 wholesale partners and counting, we are committed to
                  delivering premium quality products at competitive prices, backed by
                  exceptional customer support.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[2rem] glass-strong p-4 shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                  <Image
                    src="/products/hero.png"
                    alt="Riya Touch Premium Collection"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-primary px-6 py-4 shadow-xl">
                <p className="text-2xl font-bold text-white font-[family-name:var(--font-poppins)]">
                  500+
                </p>
                <p className="text-xs text-white/80 font-[family-name:var(--font-poppins)]">
                  Wholesale Partners
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 gradient-soft">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Our Values
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
              What Drives Us
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeUp}
                className="luxury-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <value.icon size={24} className="text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  {value.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Our Journey
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
              Milestones
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-px" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative mb-8 flex items-center gap-6 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"}`}>
                  <p className="text-xs font-bold text-primary font-[family-name:var(--font-poppins)]">
                    {m.year}
                  </p>
                  <p className="mt-1 text-sm font-medium text-dark-text font-[family-name:var(--font-poppins)]">
                    {m.event}
                  </p>
                </div>
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                </div>
                <div className="hidden flex-1 md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-3xl font-light text-white sm:text-4xl">
              Join the Riya Touch Family
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-base text-white/70">
              Become a wholesale partner and get access to premium innerwear at
              the best prices. Dedicated support for all our partners.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-sm font-semibold uppercase tracking-wider text-primary shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 font-[family-name:var(--font-poppins)]"
              >
                Explore Collection
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white/10 font-[family-name:var(--font-poppins)]"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
