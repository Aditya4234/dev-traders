"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: 1,
    name: "Sports Bras",
    slug: "sports-bra",
    image: "/products/image6.png",
    gradient: "from-rose-gold/20 via-rose-gold-light/15 to-soft-pink",
    accent: "bg-rose-gold",
    count: "45+ Styles",
  },
  {
    id: 2,
    name: "Cotton Bras",
    slug: "bras",
    image: "/products/image1.png",
    gradient: "from-[#f0e4d7]/30 via-[#f5ece3]/20 to-soft-pink",
    accent: "bg-amber-600",
    count: "80+ Styles",
  },
  {
    id: 3,
    name: "Lingerie Sets",
    slug: "lingerie-sets",
    image: "/products/image3.png",
    gradient: "from-[#e8d5e0]/30 via-[#f0e0ea]/20 to-soft-pink",
    accent: "bg-[#9a5a64]",
    count: "60+ Styles",
  },
  {
    id: 4,
    name: "Panties",
    slug: "panties",
    image: "/products/image2.png",
    gradient: "from-[#d5c4b8]/25 via-[#e8ddd5]/15 to-soft-pink",
    accent: "bg-[#8b7355]",
    count: "120+ Styles",
  },
  {
    id: 5,
    name: "Night Wear",
    slug: "night-wear",
    image: "/products/image4.png",
    gradient: "from-[#c5b8d4]/20 via-[#ddd0e8]/15 to-soft-pink",
    accent: "bg-[#7b6b8a]",
    count: "35+ Styles",
  },
  {
    id: 6,
    name: "Shapewear",
    slug: "shapewear",
    image: "/products/image5.png",
    gradient: "from-[#b8c5c0]/20 via-[#d0ddd8]/15 to-soft-pink",
    accent: "bg-[#5a7a6a]",
    count: "25+ Styles",
  },
];

export default function ShopByCategory() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-soft-pink/30 to-white py-20 sm:py-28 md:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-rose-gold/5 blur-3xl" />
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
            Explore Our Collection
          </p>
          <h2 className="font-serif text-3xl font-light tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Shop by Category
          </h2>
          <div className="mx-auto mt-5 h-px w-12 bg-gradient-to-r from-transparent via-rose-gold to-transparent" />
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={`/l/lingerie?category=${category.slug}`}
                className="group relative block"
              >
                {/* Card */}
                <div
                  className={cn(
                    "relative overflow-hidden rounded-3xl transition-all duration-500",
                    "bg-gradient-to-br",
                    category.gradient,
                    "shadow-[0_2px_20px_-4px_rgba(183,110,121,0.08)]",
                    "hover:shadow-[0_8px_40px_-8px_rgba(183,110,121,0.18)]",
                    "group-hover:-translate-y-1"
                  )}
                >
                  {/* Inner border glow on hover */}
                  <div className="absolute inset-0 rounded-3xl border border-white/60 transition-all duration-500 group-hover:border-white/80" />

                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[3/4]">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-top transition-all duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    {/* Content - Bottom */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:text-[10px]">
                            {category.count}
                          </span>
                          <h3 className="font-serif text-lg font-medium text-white sm:text-xl md:text-2xl">
                            {category.name}
                          </h3>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white group-hover:text-charcoal sm:h-11 sm:w-11">
                          <ArrowUpRight
                            size={18}
                            className="transition-transform duration-300 group-hover:rotate-45"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center md:mt-14"
        >
          <Link
            href="/l/lingerie"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-charcoal/10 bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-charcoal shadow-sm transition-all duration-300 hover:border-rose-gold hover:bg-rose-gold hover:text-white hover:shadow-lg hover:shadow-rose-gold/20 sm:px-10 sm:py-4 sm:text-sm"
          >
            View All Categories
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
