"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Package, Search, AlertTriangle, ArrowRight } from "lucide-react";
import * as api from "@/lib/api";

interface InventoryItem {
  _id: string;
  name: string;
  image: string;
  sku: string;
  stock: number;
  category: string;
  price: number;
}

export default function StockManagementPage() {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getInventory({ search, lowStock: lowStockFilter || undefined, limit: 100 });
      if (res?.success) {
        setProducts(
          res.products.map((p) => ({
            _id: p._id,
            name: p.name,
            image: p.image,
            sku: p.sku || "",
            stock: p.stock || 0,
            category: p.category,
            price: p.price,
          }))
        );
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [search, lowStockFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      await api.updateProductStock(id, newStock);
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p)));
      setEditingId(null);
    } catch {
      // handle error
    }
  };

  const lowStockCount = products.filter((p) => p.stock < 10 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[var(--dark-text)]" style={{ fontFamily: "var(--font-playfair)" }}>
          Stock <span className="text-[var(--primary)]">Management</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>
          Track and manage inventory levels
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-white p-4 shadow-sm border border-[var(--border)]/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Total Products</p>
          <p className="mt-1 text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "var(--font-poppins)" }}>{products.length}</p>
        </div>
        <div className="rounded-[16px] bg-white p-4 shadow-sm border border-[var(--border)]/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Low Stock</p>
          <p className="mt-1 text-xl font-bold text-amber-600" style={{ fontFamily: "var(--font-poppins)" }}>{lowStockCount}</p>
        </div>
        <div className="rounded-[16px] bg-white p-4 shadow-sm border border-[var(--border)]/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Out of Stock</p>
          <p className="mt-1 text-xl font-bold text-red-500" style={{ fontFamily: "var(--font-poppins)" }}>{outOfStockCount}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          />
        </div>
        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
            lowStockFilter
              ? "border-amber-400 bg-amber-50 text-amber-600"
              : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-amber-400"
          }`}
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          <AlertTriangle size={14} />
          Low Stock Only
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 shadow-sm border border-[var(--border)]/50">
          <Package size={48} className="text-[var(--muted)]/30" />
          <p className="mt-4 text-sm text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>No products found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-sm border border-[var(--border)]/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]/50 bg-[var(--accent)]/30">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Product</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Category</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Price</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Stock</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-[var(--accent)]/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--accent)]">
                          <img src={product.image} alt={product.name} className="h-full w-full object-contain p-1" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>{product.name}</p>
                          {product.sku && <p className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>SKU: {product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--muted)]" style={{ fontFamily: "var(--font-poppins)" }}>{product.category}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-[var(--dark-text)]" style={{ fontFamily: "var(--font-poppins)" }}>₹{product.price}</td>
                    <td className="px-5 py-3">
                      {editingId === product._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(Number(e.target.value))}
                            className="w-20 rounded-lg border border-[var(--primary)] px-2 py-1 text-sm outline-none"
                            style={{ fontFamily: "var(--font-poppins)" }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateStock(product._id, editValue)}
                            className="text-xs font-semibold text-[var(--primary)] hover:underline"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-[var(--muted)] hover:underline"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingId(product._id); setEditValue(product.stock); }}
                          className={`text-sm font-semibold hover:underline ${
                            product.stock === 0 ? "text-red-500" : product.stock < 10 ? "text-amber-500" : "text-emerald-600"
                          }`}
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {product.stock}
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                        product.stock === 0
                          ? "bg-red-50 text-red-500"
                          : product.stock < 10
                          ? "bg-amber-50 text-amber-500"
                          : "bg-emerald-50 text-emerald-600"
                      }`} style={{ fontFamily: "var(--font-poppins)" }}>
                        {product.stock === 0 ? "Out of Stock" : product.stock < 10 ? "Low Stock" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
