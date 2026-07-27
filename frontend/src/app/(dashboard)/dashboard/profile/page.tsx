"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, Check, Loader2, Lock } from "lucide-react";
import { useShop } from "@/context/ShopContext";

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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("riya_touch_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
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
      const token = localStorage.getItem("riya_touch_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
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
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          My <span className="text-primary">Profile</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Manage your personal information</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-[24px] bg-white p-6 shadow-sm border border-border/50 sm:p-8">
        {/* Avatar */}
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <User size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
              {user?.name || "User"}
            </h2>
            <p className="text-sm text-muted">{user?.email || "user@example.com"}</p>
            {user?.role && (
              <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary font-[family-name:var(--font-poppins)]">
                {user.role === "dealer" ? "Wholesale Dealer" : user.role === "admin" ? "Admin" : "Customer"}
              </span>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-luxury pl-12"
              />
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                className="input-luxury pl-12"
                disabled
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="input-luxury pl-12"
              />
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary-dark font-[family-name:var(--font-poppins)] disabled:opacity-60"
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

      {/* Change Password Card */}
      <div className="mt-6 rounded-[24px] bg-white p-6 shadow-sm border border-border/50 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Lock size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
              Change Password
            </h2>
            <p className="text-xs text-muted">Update your account password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              Current Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="input-luxury pl-12"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-luxury pl-12"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="input-luxury pl-12"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
          {passwordSaved && (
            <p className="text-xs text-emerald-600">Password changed successfully!</p>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={passwordSaving}
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-semibold uppercase tracking-wider text-dark-text transition-all hover:bg-accent font-[family-name:var(--font-poppins)] disabled:opacity-60"
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
    </motion.div>
  );
}
