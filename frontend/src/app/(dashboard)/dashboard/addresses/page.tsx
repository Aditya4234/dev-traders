"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Edit3, Trash2, Check, Loader2 } from "lucide-react";
import * as api from "@/lib/api";
import type { AddressData } from "@/types";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    try {
      setLoading(true);
      const res = await api.getAddresses();
      if (res.success) setAddresses(res.addresses || []);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) return;
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.updateAddress(editingId, form);
        if (res.success) {
          setAddresses((prev) => prev.map((a) => (a._id === editingId ? res.address : a)));
        }
      } else {
        const res = await api.createAddress({
          ...form,
          isDefault: addresses.length === 0,
        });
        if (res.success) {
          setAddresses((prev) => [...prev, res.address]);
        }
      }
      setForm({ label: "", name: "", phone: "", address: "", city: "", pincode: "" });
      setShowForm(false);
      setEditingId(null);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteAddress(id);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a._id !== id));
      }
    } catch {
      // error
    }
  };

  const handleEdit = (addr: AddressData) => {
    setForm({
      label: addr.label,
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      pincode: addr.pincode,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await api.setDefaultAddress(id);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a._id === id }))
        );
      }
    } catch {
      // error
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
            My <span className="text-primary">Addresses</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => {
            setForm({ label: "", name: "", phone: "", address: "", city: "", pincode: "" });
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
        >
          <Plus size={14} /> Add New
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-8 overflow-hidden rounded-[24px] bg-white p-6 shadow-sm border border-border/50"
        >
          <h3 className="mb-4 text-lg font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                Label (Home/Office)
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Home"
                className="input-luxury"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="input-luxury"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
                className="input-luxury"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                Pincode
              </label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="Pincode"
                className="input-luxury"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                Full Address
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="House no, street, area..."
                rows={2}
                className="input-luxury resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
                className="input-luxury"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark disabled:opacity-50 font-[family-name:var(--font-poppins)]"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Address
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="rounded-full border border-border px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-dark-text/60 transition-colors hover:border-primary hover:text-primary font-[family-name:var(--font-poppins)]"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-border/50">
          <MapPin size={48} className="text-muted/30" />
          <h3 className="mt-4 text-lg font-semibold text-dark-text">No addresses saved</h3>
          <p className="mt-1 text-sm text-muted">Add a delivery address to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`luxury-card p-5 relative ${
                addr.isDefault ? "ring-2 ring-primary/30" : ""
              }`}
            >
              {addr.isDefault && (
                <span className="absolute right-4 top-4 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold text-primary font-[family-name:var(--font-poppins)]">
                  DEFAULT
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary font-[family-name:var(--font-poppins)]">
                  {addr.label || "Address"}
                </span>
              </div>
              <p className="text-sm font-medium text-dark-text">{addr.name}</p>
              <p className="text-xs text-muted mt-1">{addr.phone}</p>
              <p className="text-sm text-dark-text/70 mt-2">
                {addr.address}, {addr.city} - {addr.pincode}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleEdit(addr)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-accent hover:text-dark-text transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
