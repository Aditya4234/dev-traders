"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { getCollections } from "@/lib/api";
import { collections as fallbackCollections } from "@/data/mock-data";

export default function FeaturedCollections() {
  const [collections, setCollections] = useState(fallbackCollections);

  useEffect(() => {
    getCollections("featured")
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
    <section className="bg-soft-pink py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title="Innerwear Collections" subtitle="Riya Touch Exclusive" />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={collection.href}
                className="group relative block overflow-hidden rounded-2xl shadow-md"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain bg-soft-pink p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-white/70 sm:text-xs">
                      {collection.subtitle}
                    </p>
                    <div className="flex items-end justify-between">
                      <h3 className="font-serif text-xl font-light text-white sm:text-2xl md:text-3xl">
                        {collection.title}
                      </h3>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors group-hover:bg-rose-gold sm:h-10 sm:w-10">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
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
