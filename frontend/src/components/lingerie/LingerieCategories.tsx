"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CategoryCard {
  title: string;
  count: string;
  image: string;
  filterValue: string;
  bgClass: string;
}

const subCategories: CategoryCard[] = [
  {
    title: "Bras",
    count: "6 Styles",
    image: "/products/image1.png",
    filterValue: "Bras",
    bgClass: "bg-rose-50/50",
  },
  {
    title: "Knickers & Panties",
    count: "4 Styles",
    image: "/products/image2.png",
    filterValue: "Panties",
    bgClass: "bg-pink-50/50",
  },
  {
    title: "Lingerie Sets",
    count: "2 Styles",
    image: "/products/image3.png",
    filterValue: "Lingerie Sets",
    bgClass: "bg-purple-50/50",
  },
  {
    title: "Shapewear",
    count: "1 Style",
    image: "/products/image5.png",
    filterValue: "Shapewear",
    bgClass: "bg-stone-100/50",
  },
  {
    title: "Bridal Lingerie",
    count: "1 Style",
    image: "/products/bhavna.png",
    filterValue: "Bridal Lingerie",
    bgClass: "bg-amber-50/40",
  },
  {
    title: "Maternity",
    count: "1 Style",
    image: "/products/zoom.png",
    filterValue: "Maternity Bras",
    bgClass: "bg-sky-50/50",
  },
];

interface LingerieCategoriesProps {
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

export default function LingerieCategories({
  onSelectCategory,
  activeCategory,
}: LingerieCategoriesProps) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-gold">
            Shop by Category
          </span>
          <h2 className="mt-2 font-serif text-3xl font-light text-charcoal sm:text-4xl">
            Explore Our Styles
          </h2>
          <div className="mx-auto mt-3 h-0.5 w-12 bg-rose-gold-light" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {subCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.filterValue;
            return (
              <motion.button
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                onClick={() => onSelectCategory(cat.filterValue)}
                className={`group flex flex-col items-center rounded-2xl p-6 transition-all duration-300 text-center ${cat.bgClass} ${
                  isActive
                    ? "ring-2 ring-rose-gold shadow-md bg-soft-pink"
                    : "hover:shadow-md hover:bg-white hover:ring-1 hover:ring-soft-pink-dark"
                }`}
              >
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <h3 className="font-serif text-base font-medium text-charcoal group-hover:text-rose-gold">
                  {cat.title}
                </h3>
                <p className="mt-1 text-xs text-muted font-sans">{cat.count}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
