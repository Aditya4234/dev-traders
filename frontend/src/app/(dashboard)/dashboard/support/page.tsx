"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Headphones,
  Plus,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Send,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";
import {
  createTicket,
  getMyTickets,
  getTicketStats,
  type Ticket,
} from "@/lib/api";

const CATEGORIES = [
  "Order Issue",
  "Payment Problem",
  "Product Quality",
  "Delivery",
  "Account",
  "Return / Refund",
  "Other",
];

const PRIORITIES = ["low", "medium", "high"] as const;

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  open: { bg: "bg-red-50", text: "text-red-500", icon: AlertCircle, label: "Open" },
  "in-progress": { bg: "bg-amber-50", text: "text-amber-600", icon: Clock, label: "In Progress" },
  resolved: { bg: "bg-green-50", text: "text-green-600", icon: CheckCircle, label: "Resolved" },
  closed: { bg: "bg-gray-50", text: "text-gray-500", icon: XCircle, label: "Closed" },
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const refetch = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        getMyTickets(filter !== "all" ? { status: filter } : undefined),
        getTicketStats(),
      ]);
      if (ticketsRes?.success) setTickets(ticketsRes.tickets);
      if (statsRes?.success) setStats(statsRes.stats);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [ticketsRes, statsRes] = await Promise.all([
          getMyTickets(filter !== "all" ? { status: filter } : undefined),
          getTicketStats(),
        ]);
        if (active && ticketsRes?.success) setTickets(ticketsRes.tickets);
        if (active && statsRes?.success) setStats(statsRes.stats);
      } catch {
        // silent
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [filter]);

  const resetForm = () => {
    setSubject("");
    setMessage("");
    setCategory("");
    setPriority("medium");
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!message.trim()) {
      setError("Please describe your issue.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTicket({
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
      });
      if (res?.success) {
        setShowModal(false);
        resetForm();
        refetch();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create ticket";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statCards = [
    { label: "Open", value: stats.open, color: "text-red-500", bg: "bg-red-500/10", icon: AlertCircle },
    { label: "In Progress", value: stats.inProgress, color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock },
    { label: "Resolved", value: stats.resolved, color: "text-green-600", bg: "bg-green-500/10", icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--dark-text)]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Support
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            Get help and manage support tickets
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon size={18} className={s.color} />
              </span>
              <p
                className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {s.label}
              </p>
            </div>
            <p className={`mt-2 text-2xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-poppins)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl bg-[var(--accent)] p-1">
        {["all", "open", "in-progress", "resolved", "closed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all"
            style={{
              fontFamily: "var(--font-poppins)",
              background: filter === f ? "white" : "transparent",
              color: filter === f ? "var(--dark-text)" : "var(--muted)",
              boxShadow: filter === f ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {f === "all" ? "All" : f === "in-progress" ? "In Progress" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]">
            <Headphones size={24} className="text-[var(--muted)]/40" />
          </div>
          <p className="mt-4 text-sm font-medium text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>
            No tickets yet
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
            Click &quot;New Ticket&quot; to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const sc = statusConfig[t.status] || statusConfig.open;
            const StatusIcon = sc.icon;
            return (
              <div
                key={t._id}
                className="flex items-center gap-4 rounded-2xl border bg-white/80 p-4 transition-colors hover:bg-[var(--accent)]/50"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <MessageCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold text-[var(--dark-text)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {t.subject}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                    {t.ticketId} &middot; {t.category} &middot;{" "}
                    {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${sc.bg} ${sc.text}`}
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  <StatusIcon size={12} />
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ New Ticket Modal ═══════════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]">
                    <Tag size={18} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2
                      className="text-lg font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      New Ticket
                    </h2>
                    <p className="text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
                      Describe your issue
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Subject */}
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--dark-text)]/80"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your issue"
                    className="input-luxury"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--dark-text)]/80"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-luxury"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--dark-text)]/80"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className="flex-1 rounded-xl border py-2.5 text-xs font-semibold capitalize transition-all"
                        style={{
                          fontFamily: "var(--font-poppins)",
                          borderColor: priority === p ? "var(--primary)" : "var(--border)",
                          background: priority === p ? "var(--accent)" : "white",
                          color: priority === p ? "var(--primary)" : "var(--muted)",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label
                    className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--dark-text)]/80"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Description *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="input-luxury resize-none"
                    style={{ height: "auto", minHeight: "100px" }}
                  />
                </div>

                {error && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500" style={{ fontFamily: "var(--font-poppins)" }}>
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-xs font-semibold text-[var(--dark-text)] transition-colors hover:bg-[var(--accent)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={14} /> Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
