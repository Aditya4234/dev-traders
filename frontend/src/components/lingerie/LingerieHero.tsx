"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function LingerieHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-soft-pink via-white to-soft-pink py-16 md:py-24">
      {/* Decorative background shapes */}
      <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-soft-pink-dark/40 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-rose-gold-light/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text Content */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-gold-light/30 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-gold" />
                <span className="text-xs font-semibold uppercase tracking-widest text-rose-gold-dark">
                  Exclusive Innerwear Collection
                </span>
              </div>

              <h1 className="font-serif text-4xl font-light leading-tight tracking-wide text-charcoal sm:text-5xl md:text-6xl lg:leading-[1.1]">
                The <span className="font-normal italic text-rose-gold">Lingerie</span> Shop
              </h1>

              <p className="max-w-xl font-sans text-base leading-relaxed text-muted md:text-lg">
                Discover the perfect blend of confidence, sophistication, and pure comfort. 
                Riya Touch lingerie is meticulously crafted with ultra-soft fabrics, delicate 
                lace trims, and precision support to flatter every curve.
              </p>

              {/* Quick statistics/highlights */}
              <div className="grid grid-cols-3 gap-6 border-y border-soft-pink-dark py-6 sm:max-w-lg">
                <div>
                  <p className="font-serif text-2xl font-light text-rose-gold">100%</p>
                  <p className="text-xs uppercase tracking-wider text-muted">Premium Cotton</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-light text-rose-gold">Flex-Fit</p>
                  <p className="text-xs uppercase tracking-wider text-muted">360° Support</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-light text-rose-gold">Seamless</p>
                  <p className="text-xs uppercase tracking-wider text-muted">Invisible Finish</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="#catalog"
                  className="rounded-full bg-charcoal px-8 py-4 text-xs font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-rose-gold hover:shadow-lg hover:shadow-rose-gold/20"
                >
                  Explore Collection
                </a>
                <a
                  href="#fit-guide"
                  className="rounded-full border border-charcoal/20 bg-white/40 px-8 py-4 text-xs font-medium uppercase tracking-widest text-charcoal backdrop-blur-sm transition-all duration-300 hover:bg-white hover:border-rose-gold hover:text-rose-gold"
                >
                  Bra Fit Finder
                </a>
              </div>
            </motion.div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative mx-auto max-w-sm lg:max-w-none"
            >
              {/* Main Graphic Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-rose-gold-light/20 to-soft-pink-dark/50 p-4 shadow-xl sm:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src="/products/hero.png"
                      alt="Premium Lingerie Collection"
                      fill
                      className="object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src="/products/hero1.png"
                      alt="Lingerie Collection"
                      fill
                      className="object-cover object-top transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
                
                {/* Floating tags */}
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur-md">
                  <p className="text-xs font-medium uppercase tracking-wider text-rose-gold">
                    Best Seller
                  </p>
                  <p className="font-serif text-lg font-light text-charcoal">
                    Lace Comfort Lingerie Set
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal">₹1,999</span>
                    <span className="text-xs text-rose-gold-dark underline font-medium">Shop Now</span>
                  </div>
                </div>
              </div>

              {/* Behind Decoration Card */}
              <div className="absolute -right-4 -top-4 -z-10 h-full w-full rounded-3xl border border-rose-gold/20 bg-white/20" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
