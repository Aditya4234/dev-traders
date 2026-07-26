"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Gift, Trophy, Clock, ArrowRight } from "lucide-react";
import * as api from "@/lib/api";
import { useShop } from "@/context/ShopContext";

interface PointsTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: "earned" | "redeemed" | "bonus";
}

interface EarnOption {
  icon: React.ReactNode;
  title: string;
  points: number;
}

interface RedeemOption {
  discount: string;
  points: number;
}

const tiers = [
  { name: "Bronze", min: 0, max: 999, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Silver", min: 1000, max: 4999, color: "text-gray-500", bg: "bg-gray-50" },
  { name: "Gold", min: 5000, max: Infinity, color: "text-yellow-500", bg: "bg-yellow-50" },
];

const mockTransactions: PointsTransaction[] = [
  { id: "1", date: "2026-07-20", description: "Order #ORD-8A3F placed", points: 120, type: "earned" },
  { id: "2", date: "2026-07-18", description: "Referral bonus – Priya S.", points: 100, type: "bonus" },
  { id: "3", date: "2026-07-15", description: "Order #ORD-7B2E placed", points: 85, type: "earned" },
  { id: "4", date: "2026-07-12", description: "Redeemed ₹500 off coupon", points: -900, type: "redeemed" },
  { id: "5", date: "2026-07-10", description: "Order #ORD-6C1D placed", points: 200, type: "earned" },
  { id: "6", date: "2026-07-08", description: "Profile completion bonus", points: 50, type: "bonus" },
  { id: "7", date: "2026-07-05", description: "Review posted – Satin Bra Set", points: 25, type: "bonus" },
];

const earnOptions: EarnOption[] = [
  { icon: <Gift size={18} />, title: "Place an order", points: 10 },
  { icon: <Star size={18} />, title: "Refer a friend", points: 100 },
  { icon: <Trophy size={18} />, title: "Write a review", points: 25 },
  { icon: <Clock size={18} />, title: "Complete profile", points: 50 },
];

const redeemOptions: RedeemOption[] = [
  { discount: "₹100 off", points: 200 },
  { discount: "₹500 off", points: 900 },
  { discount: "₹1000 off", points: 1700 },
];

export default function LoyaltyPage() {
  const { user } = useShop();
  const [totalPoints] = useState(2450);
  const [loading, setLoading] = useState(true);
  const [transactions] = useState<PointsTransaction[]>(mockTransactions);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const pointsValue = totalPoints * 0.5;

  const currentTier =
    totalPoints >= 5000
      ? tiers[2]
      : totalPoints >= 1000
        ? tiers[1]
        : tiers[0];

  const nextTier =
    currentTier.name === "Gold"
      ? null
      : currentTier.name === "Silver"
        ? tiers[2]
        : tiers[1];

  const tierProgress = nextTier
    ? ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-light text-[var(--dark-text)] md:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Loyalty <span className="text-[var(--primary)]">Rewards</span>
        </h1>
        <p
          className="mt-2 text-sm text-[var(--muted)]"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Earn and redeem points on every purchase
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Points Card */}
          <div className="rounded-[20px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-white/70"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Available Points
                </p>
                <p
                  className="mt-1 text-4xl font-bold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {totalPoints.toLocaleString()}
                </p>
                <p
                  className="mt-1 text-sm text-white/80"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Worth ₹{pointsValue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Star size={32} className="text-white" />
              </div>
            </div>

            {/* Tier Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/80" style={{ fontFamily: "var(--font-poppins)" }}>
                <span>Current Tier: {currentTier.name}</span>
                {nextTier && <span>{nextTier.min - totalPoints} pts to {nextTier.name}</span>}
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{ width: `${Math.min(tierProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tier Badges */}
          <div className="grid grid-cols-3 gap-3">
            {tiers.map((tier) => {
              const isActive = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`rounded-[16px] border p-4 text-center transition-colors ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--border)] bg-white"
                  }`}
                >
                  <Trophy
                    size={20}
                    className={`mx-auto ${isActive ? "text-[var(--primary)]" : "text-[var(--muted)]/40"}`}
                  />
                  <p
                    className={`mt-2 text-sm font-semibold ${isActive ? "text-[var(--primary)]" : "text-[var(--dark-text)]/60"}`}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {tier.name}
                  </p>
                  <p
                    className="mt-0.5 text-[10px] text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {tier.max === Infinity ? `${tier.min.toLocaleString()}+ pts` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()} pts`}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Ways to Earn */}
          <div className="rounded-[20px] border border-[var(--border)]/50 bg-white p-6 shadow-sm">
            <h2
              className="text-lg font-semibold text-[var(--dark-text)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ways to Earn
            </h2>
            <div className="mt-4 space-y-3">
              {earnOptions.map((option) => (
                <div
                  key={option.title}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)]/50 bg-[var(--accent)]/30 p-4 transition-colors hover:bg-[var(--accent)]/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {option.title}
                    </p>
                  </div>
                  <span
                    className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-bold text-[var(--primary)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    +{option.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Section */}
          <div className="rounded-[20px] border border-[var(--border)]/50 bg-white p-6 shadow-sm">
            <h2
              className="text-lg font-semibold text-[var(--dark-text)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Redeem Points
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {redeemOptions.map((option) => {
                const canRedeem = totalPoints >= option.points;
                return (
                  <div
                    key={option.discount}
                    className={`flex flex-col items-center rounded-[16px] border p-5 text-center transition-colors ${
                      canRedeem
                        ? "border-[var(--primary)]/30 bg-[var(--primary)]/5 hover:border-[var(--primary)]"
                        : "border-[var(--border)] bg-gray-50/50 opacity-60"
                    }`}
                  >
                    <p
                      className="text-xl font-bold text-[var(--primary)]"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {option.discount}
                    </p>
                    <p
                      className="mt-1 text-xs text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {option.points.toLocaleString()} points
                    </p>
                    <button
                      disabled={!canRedeem}
                      className={`mt-4 flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                        canRedeem
                          ? "bg-[var(--primary)] text-white hover:opacity-90"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      Redeem <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Points History */}
          <div className="rounded-[20px] border border-[var(--border)]/50 bg-white p-6 shadow-sm">
            <h2
              className="text-lg font-semibold text-[var(--dark-text)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Points History
            </h2>
            <div className="mt-4 space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 rounded-xl border border-[var(--border)]/30 p-4 transition-colors hover:bg-[var(--accent)]/50"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      tx.type === "earned"
                        ? "bg-green-50 text-green-600"
                        : tx.type === "bonus"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-500"
                    }`}
                  >
                    {tx.type === "earned" ? (
                      <Gift size={16} />
                    ) : tx.type === "bonus" ? (
                      <Star size={16} />
                    ) : (
                      <Trophy size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {tx.description}
                    </p>
                    <p
                      className="text-xs text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {new Date(tx.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.points > 0 ? "text-green-600" : "text-red-500"
                    }`}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {tx.points > 0 ? "+" : ""}
                    {tx.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
