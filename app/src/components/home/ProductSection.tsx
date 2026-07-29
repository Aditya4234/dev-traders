"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  bgClass?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref = "/shop",
  bgClass = "bg-white",
}: ProductSectionProps) {
  return (
    <section className={`${bgClass} py-16 md:py-24`}>
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between md:mb-12">
          <SectionHeader
            title={title}
            subtitle={subtitle}
            align="left"
            className="mb-0"
          />
          <Link
            href={viewAllHref}
            className="hidden shrink-0 text-sm font-medium uppercase tracking-wider text-rose-gold transition-colors hover:text-rose-gold-dark md:block"
          >
            View All →
          </Link>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={12}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="product-swiper !pb-2"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="mt-6 text-center md:hidden">
          <Link
            href={viewAllHref}
            className="text-sm font-medium uppercase tracking-wider text-rose-gold"
          >
            View All →
          </Link>
        </div>
      </div>
    </section>
  );
}
