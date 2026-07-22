"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Tag,
  ArrowRight,
  ShoppingBag,
  Heart,
  Star,
  Zap,
  Percent,
} from "lucide-react";
import { products as fallbackProducts } from "@/data/mock-data";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const offers = [
  {
    icon: Percent,
    title: "Flat 30% OFF",
    desc: "On select lingerie sets",
    code: "RIYA30",
  },
  {
    icon: Zap,
    title: "Buy 3 Get 1 Free",
    desc: "On all panties",
    code: "B3G1",
  },
  {
    icon: Tag,
    title: "Wholesale Special",
    desc: "Extra 15% on bulk orders",
    code: "BULK15",
  },
];

export default function SalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then((data) => {
        if (data.success && data.products.length > 0) {
          setSaleProducts(
            data.products
              .map((p: any) => ({
                id: p._id || p.id,
                name: p.name,
                brand: p.brand,
                price: p.price,
                discountPrice: p.discountPrice,
                rating: p.rating,
                reviewCount: p.reviewCount,
                image: p.image,
                category: p.category,
                badge: p.badge,
              }))
              .filter((p: Product) => p.discountPrice < p.price)
          );
        } else {
          setSaleProducts(
            fallbackProducts.filter((p) => p.discountPrice < p.price)
          );
        }
      })
      .catch(() => {
        setSaleProducts(
          fallbackProducts.filter((p) => p.discountPrice < p.price)
        );
      });
  }, []);

  const discountedProducts = saleProducts.length > 0
    ? saleProducts
    : fallbackProducts.filter((p) => p.discountPrice < p.price);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-rose-900 py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
          <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 backdrop-blur-sm">
              <Percent size={16} className="text-white" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white font-[family-name:var(--font-poppins)]">
                Limited Time Offers
              </span>
            </div>
            <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl md:text-6xl">
              Sale & Offers
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Grab the best deals on premium innerwear. Limited period offers
              on bras, panties, lingerie sets and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Offer Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card group relative overflow-hidden p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                  <offer.icon
                    size={24}
                    className="text-primary transition-colors duration-300 group-hover:text-white"
                  />
                </div>
                <h3 className="text-base font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  {offer.title}
                </h3>
                <p className="mt-1 text-xs text-muted">{offer.desc}</p>
                <div className="mt-3 inline-block rounded-full border border-dashed border-primary/40 bg-primary/5 px-4 py-1.5">
                  <span className="text-xs font-bold tracking-wider text-primary font-[family-name:var(--font-poppins)]">
                    Use: {offer.code}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Products */}
      <section className="py-20 gradient-soft">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Don&apos;t Miss Out
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
              Products on Sale
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 sm:gap-6"
          >
            {discountedProducts.map((product, i) => (
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
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">
                      {Math.round(
                        ((product.price - product.discountPrice) /
                          product.price) *
                          100
                      )}
                      % OFF
                    </span>
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
                      <Star
                        size={12}
                        className="fill-amber-400 text-amber-400"
                      />
                      <span className="text-xs text-muted">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-bold text-primary font-[family-name:var(--font-poppins)]">
                        ₹{product.discountPrice}
                      </span>
                      <span className="text-xs text-muted line-through">
                        ₹{product.price}
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
              Browse All Products
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
