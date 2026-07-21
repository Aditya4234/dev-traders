"use client";

import { motion } from "framer-motion";
import { Ticket, Copy, Check } from "lucide-react";
import { useState } from "react";

const coupons = [
  {
    code: "RIYA20",
    discount: "20% OFF",
    description: "On your next order above ₹999",
    expires: "Dec 31, 2026",
  },
  {
    code: "WELCOME10",
    discount: "10% OFF",
    description: "First order discount",
    expires: "Dec 31, 2026",
  },
];

export default function CouponsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          My <span className="text-primary">Coupons</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Available discount codes</p>
      </div>

      {coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-border/50">
          <Ticket size={48} className="text-muted/30" />
          <h3 className="mt-4 text-lg font-semibold text-dark-text">No coupons available</h3>
          <p className="mt-1 text-sm text-muted">Check back later for exclusive offers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="luxury-card p-6 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary font-[family-name:var(--font-poppins)]">
                {coupon.discount}
              </span>
              <p className="mt-3 text-sm text-dark-text/70">{coupon.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full border border-dashed border-primary/40 bg-primary/5 px-4 py-2">
                  <span className="text-sm font-bold tracking-wider text-primary font-[family-name:var(--font-poppins)]">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => handleCopy(coupon.code)}
                    className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-colors"
                  >
                    {copiedCode === coupon.code ? (
                      <Check size={12} />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-muted font-[family-name:var(--font-poppins)]">
                  Expires: {coupon.expires}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
