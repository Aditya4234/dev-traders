"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className={cn(
        "mb-8 md:mb-12",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      {subtitle && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-rose-gold md:text-sm">
          {subtitle}
        </p>
      )}
      <h2 className="font-serif text-3xl font-light tracking-wide text-charcoal md:text-4xl lg:text-5xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 h-px w-16 bg-gradient-to-r from-rose-gold to-rose-gold-light",
          align === "center" ? "mx-auto" : ""
        )}
      />
    </motion.div>
  );
}
