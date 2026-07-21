"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import { subscribeNewsletter } from "@/lib/api";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      await subscribeNewsletter(email);
      setSubmitted(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-gold/10 via-soft-pink to-rose-gold-light/10" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
            <Mail size={24} className="text-rose-gold" />
          </div>
          <h2 className="mb-3 font-serif text-3xl font-light text-charcoal md:text-4xl">
            Join the Riya Touch Family
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted md:text-base">
            Subscribe for Riya Touch innerwear offers — new bras, panties & lingerie alerts only.
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-white px-6 py-4 text-sm font-medium text-rose-gold shadow-sm"
            >
              Thank you for subscribing! Check your inbox for a welcome gift.
            </motion.p>
          ) : (
            <>
              {error && (
                <p className="mb-4 text-xs text-red-500">{error}</p>
              )}
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-full border border-soft-pink-dark bg-white px-6 py-3.5 text-sm outline-none transition-colors focus:border-rose-gold focus:ring-1 focus:ring-rose-gold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-rose-gold disabled:opacity-50"
                >
                  <Send size={16} />
                  {loading ? "..." : "Subscribe"}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
