"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Copy, Check, Loader2 } from "lucide-react";
import { getOffers } from "@/lib/api";
import type { Offer } from "@/types";

interface Coupon {
  code: string;
  discount: string;
  description: string;
  expires: string;
  minOrder: number;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getOffers();
        const offers = (res.offers || []).map((offer: Offer) => ({
          code: offer.code || offer.title?.substring(0, 8).toUpperCase().replace(/\s/g, '') || '',
          discount: offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`,
          description: offer.description || offer.title || '',
          expires: offer.validUntil
            ? new Date(offer.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            : 'No expiry',
          minOrder: offer.minOrderAmount || 0,
        }));
        setCoupons(offers);
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : coupons.length === 0 ? (
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
              {coupon.minOrder > 0 && (
                <p className="mt-1 text-[10px] text-muted">Min. order: ₹{coupon.minOrder.toLocaleString('en-IN')}</p>
              )}
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
