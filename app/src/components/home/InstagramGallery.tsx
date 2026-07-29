"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { instagramPosts } from "@/data/mock-data";

export default function InstagramGallery() {
  return (
    <section className="bg-soft-pink py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SectionHeader title="@riyatouch" subtitle="Innerwear Gallery" />

        <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
          {instagramPosts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-xl"
              >
                <Image
                  src={post}
                  alt={`Riya Touch innerwear ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-contain bg-soft-pink p-2 transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <Camera
                    size={24}
                    className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-rose-gold transition-colors hover:text-rose-gold-dark"
          >
            <Camera size={18} />
            Follow @riyatouch
          </Link>
        </div>
      </div>
    </section>
  );
}
