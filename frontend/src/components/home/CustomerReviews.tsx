"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { getReviews } from "@/lib/api";
import { reviews as fallbackReviews } from "@/data/mock-data";
import { cn } from "@/lib/utils";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState(fallbackReviews);

  useEffect(() => {
    getReviews()
      .then((data) => {
        if (data.success && data.reviews.length > 0) {
          setReviews(
            data.reviews.map((r: any) => ({
              id: r._id || r.id,
              name: r.name,
              rating: r.rating,
              comment: r.comment,
              date: r.date,
              avatar: r.avatar,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title="Customer Reviews" subtitle="Love Letters" />

        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-4"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex h-full flex-col rounded-2xl bg-soft-pink p-6 md:p-8"
              >
                <Quote size={24} className="mb-4 text-rose-gold-light" />
                <p className="mb-6 flex-1 text-sm leading-relaxed text-charcoal md:text-base">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={cn(
                        i < review.rating
                          ? "fill-rose-gold text-rose-gold"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal">
                      {review.name}
                    </p>
                    <p className="text-xs text-muted">{review.date}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
