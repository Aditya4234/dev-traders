"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, Check } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function ProfilePage() {
  const { user } = useShop();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          </div>
        </div>

        {/* Form */}
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
                onChange={(e) => setEmail(e.target.value)}
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
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
          >
            {saved ? (
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
    </motion.div>
  );
}
