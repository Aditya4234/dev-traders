"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, Check, Loader2, Lock } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { updateProfile, changePassword } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser } = useShop();
  const [name, setName] = useState(user?.name || "");
  const email = user?.email || "";
  const [phone, setPhone] = useState(user?.phone || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validateFields = (): string | null => {
    if (!name.trim()) return "Name is required.";
    if (name.trim().length < 2) return "Name must be at least 2 characters.";
    if (phone && !/^[+]?[\d\s-]{7,15}$/.test(phone)) return "Please enter a valid phone number.";
    return null;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const validationError = validateFields();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() });
      setSaved(true);
      refreshUser?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSaved(false);

    if (!currentPassword || !newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-full overflow-hidden"
    >
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1
          className="text-2xl font-light text-dark-text sm:text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          My <span className="text-primary">Profile</span>
        </h1>
        <p
          className="mt-1.5 text-sm text-muted sm:mt-2"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          Manage your personal information
        </p>
      </div>

      {/* ═══════════════════ Profile Card ═══════════════════ */}
      <div className="rounded-[20px] border border-border/50 bg-white p-5 shadow-sm sm:rounded-[24px] sm:p-8">
        {/* Avatar + User Info */}
        <div className="mb-6 flex items-center gap-4 sm:mb-8 sm:gap-5">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-20 sm:w-20">
            <User size={28} className="text-primary sm:h-8 sm:w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="truncate text-lg font-semibold text-dark-text sm:text-xl"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {user?.name || "User"}
            </h2>
            <p
              className="mt-0.5 truncate text-sm text-muted"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {email || "user@example.com"}
            </p>
            {user?.role && (
              <span
                className="mt-1.5 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {user.role === "dealer"
                  ? "Wholesale Dealer"
                  : user.role === "admin"
                    ? "Admin"
                    : "Customer"}
              </span>
            )}
          </div>
        </div>

        {/* ═══════════════════ Form Fields ═══════════════════ */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6">
          {/* ── Full Name ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Full Name
            </label>
            <div className="relative flex items-center">
              <User
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="input-luxury pl-[52px]"
              />
            </div>
          </div>

          {/* ── Email Address ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="email"
                value={email}
                className="input-luxury pl-[52px]"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* ── Phone Number ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="input-luxury pl-[52px]"
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════ Error + Save Button ═══════════════════ */}
        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
          {error && (
            <p
              className="text-xs text-red-500"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {error}
            </p>
          )}
          <div className="sm:ml-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary-dark disabled:opacity-60 sm:w-auto"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saved ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                <>
                  <Save size={14} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════ Change Password Card ═══════════════════ */}
      <div className="mt-5 rounded-[20px] border border-border/50 bg-white p-5 shadow-sm sm:mt-6 sm:rounded-[24px] sm:p-8">
        {/* Card Header */}
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Lock size={18} className="text-amber-600" />
          </div>
          <div>
            <h2
              className="text-base font-semibold text-dark-text sm:text-lg"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Change Password
            </h2>
            <p
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Update your account password
            </p>
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-6">
          {/* ── Current Password ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Current Password
            </label>
            <div className="relative flex items-center">
              <Lock
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="input-luxury pl-[52px]"
              />
            </div>
          </div>

          {/* ── New Password ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              New Password
            </label>
            <div className="relative flex items-center">
              <Lock
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-luxury pl-[52px]"
              />
            </div>
          </div>

          {/* ── Confirm Password ── */}
          <div className="space-y-2">
            <label
              className="block text-[11px] font-semibold uppercase tracking-wider text-dark-text/80"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock
                className="pointer-events-none absolute text-muted"
                style={{ left: "16px", top: "50%", transform: "translateY(-50%)" }}
                size={18}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="input-luxury pl-[52px]"
              />
            </div>
          </div>
        </div>

        {/* Error + Change Password Button */}
        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center">
          {passwordError && (
            <p
              className="text-xs text-red-500"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {passwordError}
            </p>
          )}
          {passwordSaved && (
            <p
              className="text-xs text-emerald-600"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Password changed successfully!
            </p>
          )}
          <div className="sm:ml-auto">
            <button
              onClick={handlePasswordChange}
              disabled={passwordSaving}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-dark-text transition-all hover:bg-accent disabled:opacity-60 sm:w-auto"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {passwordSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <>
                  <Lock size={14} /> Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
