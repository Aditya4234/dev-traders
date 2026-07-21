"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { getCollections } from "@/lib/api";
import { premiumCollections as fallbackCollections } from "@/data/mock-data";

export default function PremiumCollections() {
  const [collections, setCollections] = useState(fallbackCollections);

  useEffect(() => {
    getCollections("premium")
      .then((data) => {
        if (data.success && data.collections.length > 0) {
          setCollections(
            data.collections.map((c: any) => ({
              id: c._id || c.id,
              title: c.title,
              subtitle: c.subtitle,
              image: c.image,
              href: c.href,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title="Premium Innerwear" subtitle="Riya Touch Luxury" />

        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Link
                href={collection.href}
                className="group relative block overflow-hidden rounded-2xl shadow-lg"
              >
                <div className="relative aspect-[16/10] md:aspect-[16/9]">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain bg-soft-pink p-6 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-rose-gold-light">
                      {collection.subtitle}
                    </p>
                    <h3 className="font-serif text-3xl font-light text-white md:text-4xl">
                      {collection.title}
                    </h3>
                    <span className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Discover →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
