"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, MessageSquare } from "lucide-react";

interface ReturnRequestFormProps {
  orderId: string;
  items: { name: string; quantity: number; price: number; image: string }[];
  onClose: () => void;
}

export default function ReturnRequestForm({ orderId, items, onClose }: ReturnRequestFormProps) {
  const [type, setType] = useState<"return" | "exchange">("return");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (idx: number) => {
    setSelectedItems((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = () => {
    const whatsappMsg = encodeURIComponent(
      `*Return/Exchange Request*\nOrder: #${orderId.slice(-8).toUpperCase()}\nType: ${type === "return" ? "Return" : "Exchange"}\nItems: ${selectedItems.map((i) => items[i]?.name).join(", ")}\nReason: ${reason}\nDetails: ${details}`
    );
    window.open(`https://wa.me/919205778531?text=${whatsappMsg}`, "_blank");
    setSubmitted(true);
  };

  const reasons = [
    "Wrong size",
    "Damaged product",
    "Quality issue",
    "Not as described",
    "Changed my mind",
    "Other",
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-charcoal" style={{ fontFamily: "var(--font-poppins)" }}>
              {type === "return" ? "Return Request" : "Exchange Request"}
            </h3>
            <button onClick={onClose} className="text-muted hover:text-charcoal">
              <X size={20} />
            </button>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <MessageSquare size={28} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-charcoal" style={{ fontFamily: "var(--font-poppins)" }}>
                Request Sent via WhatsApp!
              </p>
              <p className="mt-1 text-xs text-muted">
                Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-charcoal px-6 py-2.5 text-xs font-semibold text-white hover:bg-rose-gold transition-colors"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Type Toggle */}
              <div className="flex gap-2">
                {(["return", "exchange"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2.5 text-xs font-semibold capitalize transition-colors ${
                      type === t
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 text-muted hover:border-gray-300"
                    }`}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    <RefreshCw size={14} />
                    {t}
                  </button>
                ))}
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted" style={{ fontFamily: "var(--font-poppins)" }}>
                  Select Items
                </p>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        selectedItems.includes(idx)
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(idx)}
                        onChange={() => toggleItem(idx)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-charcoal" style={{ fontFamily: "var(--font-poppins)" }}>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="ml-auto text-xs font-semibold text-muted">
                        ₹{item.price?.toLocaleString("en-IN")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted" style={{ fontFamily: "var(--font-poppins)" }}>
                  Reason
                </p>
                <div className="flex flex-wrap gap-2">
                  {reasons.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReason(r)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        reason === r
                          ? "border-primary bg-primary text-white"
                          : "border-gray-200 text-muted hover:border-gray-300"
                      }`}
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted" style={{ fontFamily: "var(--font-poppins)" }}>
                  Additional Details (optional)
                </p>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe the issue..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  style={{ fontFamily: "var(--font-poppins)" }}
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={selectedItems.length === 0 || !reason}
                className="w-full rounded-full bg-charcoal py-3 text-sm font-semibold text-white transition-all hover:bg-rose-gold disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Submit Request via WhatsApp
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
