"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Shield,
  Trash2,
  LogOut,
  ChevronRight,
  Moon,
  Globe,
  Loader2,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { updateProfile } from "@/lib/api";

export default function SettingsPage() {
  const { user, logout, refreshUser } = useShop();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  if (!prefsLoaded && user?.preferences) {
    setNotifications(user.preferences.notifications);
    setEmailUpdates(user.preferences.emailUpdates);
    setPrefsLoaded(true);
  }

  const handleToggleNotifications = async (value: boolean) => {
    setNotifications(value);
    setSaving(true);
    try {
      await updateProfile({ name: user?.name || "", preferences: { notifications: value, emailUpdates } });
      await refreshUser();
    } catch {
      setNotifications(!value);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEmailUpdates = async (value: boolean) => {
    setEmailUpdates(value);
    setSaving(true);
    try {
      await updateProfile({ name: user?.name || "", preferences: { notifications, emailUpdates: value } });
      await refreshUser();
    } catch {
      setEmailUpdates(!value);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          <span className="text-primary">Settings</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Manage your account preferences</p>
      </div>

      <div className="space-y-4">
        {/* Notifications */}
        <div className="luxury-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Notifications
                </p>
                <p className="text-xs text-muted">Order updates and promotions</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleNotifications(!notifications)}
              disabled={saving}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                notifications ? "bg-primary" : "bg-border"
              }`}
            >
              {saving && <Loader2 size={12} className="absolute -right-4 animate-spin text-muted" />}
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifications ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Email Updates */}
        <div className="luxury-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Email Updates
                </p>
                <p className="text-xs text-muted">Receive order confirmations via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleEmailUpdates(!emailUpdates)}
              disabled={saving}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                emailUpdates ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  emailUpdates ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="luxury-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Moon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Dark Mode
                </p>
                <p className="text-xs text-muted">Coming soon</p>
              </div>
            </div>
            <span className="text-xs text-muted bg-gray-100 px-3 py-1 rounded-full font-[family-name:var(--font-poppins)]">Soon</span>
          </div>
        </div>

        {/* Language */}
        <div className="luxury-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Globe size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Language
                </p>
                <p className="text-xs text-muted">English</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        {/* Privacy */}
        <div className="luxury-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Privacy & Security
                </p>
                <p className="text-xs text-muted">Password, 2FA, login activity</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50/50 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-red-600 font-[family-name:var(--font-poppins)]">
            Danger Zone
          </h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 border border-red-100 font-[family-name:var(--font-poppins)]"
            >
              <LogOut size={16} />
              Sign Out
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 border border-red-100 font-[family-name:var(--font-poppins)]">
              <Trash2 size={16} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
