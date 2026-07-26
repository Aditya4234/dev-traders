"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { forgotPassword, resetPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"email" | "reset">("email");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      setStep("reset");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill out all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link href="/login" className="mb-8 block text-center">
          <span className="font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-[0.04em] text-dark-text sm:text-3xl">
            RIYA <span className="text-primary">TOUCH</span>
          </span>
        </Link>

        <div className="glass-card p-8 sm:p-10">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
              Password Recovery
            </span>
            <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text">
              {step === "email" ? "Forgot Password?" : "Reset Password"}
            </h1>
              <p className="mt-2 text-sm text-muted">
              {step === "email"
                ? "Enter your email and we'll send you a reset token"
                : "Check your email for the reset token, then enter it below"}
            </p>
          </div>

          {success && step === "reset" ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-lg font-semibold text-dark-text">Password Reset Successfully!</h2>
              <p className="mt-2 text-sm text-muted">Your password has been updated.</p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 btn-primary rounded-xl px-6 py-3 text-sm font-semibold text-white"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          ) : step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-4 text-xs text-red-500 border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-luxury pl-12"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send Reset Token
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-4 text-xs text-red-500 border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  Reset Token
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste your reset token"
                  className="input-luxury"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="input-luxury"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="input-luxury"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Reset Password
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          <Link href="/login" className="text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
            ← Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
