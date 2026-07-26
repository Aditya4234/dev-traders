"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, X, Package, Search } from "lucide-react";
import * as api from "@/lib/api";
import type { Product } from "@/types";

interface ProductForm {
  name: string;
  brand: string;
  price: string;
  discountPrice: string;
  category: string;
  image: string;
  badge: "new" | "sale" | "bestseller" | "trending" | "";
  sizes: string;
}

const emptyForm: ProductForm = {
  name: "",
  brand: "",
  price: "",
  discountPrice: "",
  category: "",
  image: "",
  badge: "",
  sizes: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getProducts({ limit: 100 });
      if (res?.success) {
        setProducts(res.products);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      discountPrice: String(product.discountPrice),
      category: product.category,
      image: product.image,
      badge: product.badge || "",
      sizes: product.sizes?.join(", ") || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleChange = (field: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const payload: Partial<Product> = {
        name: form.name,
        brand: form.brand,
        price: Number(form.price) || 0,
        discountPrice: Number(form.discountPrice) || 0,
        category: form.category,
        image: form.image,
        badge: form.badge ? (form.badge as Product["badge"]) : undefined,
        sizes: form.sizes
          ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        const res = await api.updateProduct(id, payload);
        if (res?.success) {
          setProducts((prev) =>
            prev.map((p) =>
              (p._id || p.id) === id ? { ...p, ...payload } : p
            )
          );
        }
      } else {
        const res = await api.createProduct(payload);
        if (res?.success && res.product) {
          setProducts((prev) => [res.product, ...prev]);
        }
      }
      closeModal();
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      setDeleteConfirm(null);
    } catch {
      // handle error
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            className="text-3xl font-light text-[var(--dark-text)]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Product <span className="text-[var(--primary)]">Catalog</span>
          </h1>
          <p
            className="mt-2 text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            {products.length} product{products.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-[20px] bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          style={{ fontFamily: "var(--font-poppins)" }}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          type="text"
          placeholder="Search by name, brand, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          style={{ fontFamily: "var(--font-poppins)" }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] bg-white py-20 shadow-sm border border-[var(--border)]/50">
          <Package size={48} className="text-[var(--muted)]/30" />
          <p
            className="mt-4 text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            No products found
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[20px] bg-white shadow-sm border border-[var(--border)]/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]/50 bg-[var(--accent)]/30">
                  {["Product", "Brand", "MRP", "Wholesale", "Category", "Stock", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                {filtered.map((product) => {
                  const pid = product._id || product.id;
                  return (
                    <tr
                      key={pid}
                      className="hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[var(--accent)]">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-full w-full object-contain p-1"
                            />
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold text-[var(--dark-text)]"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {product.name}
                            </p>
                            {product.badge && (
                              <span
                                className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                                  product.badge === "new"
                                    ? "bg-blue-50 text-blue-600"
                                    : product.badge === "sale"
                                    ? "bg-red-50 text-red-500"
                                    : product.badge === "bestseller"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-purple-50 text-purple-600"
                                }`}
                                style={{ fontFamily: "var(--font-poppins)" }}
                              >
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-5 py-3 text-xs text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {product.brand}
                      </td>
                      <td
                        className="px-5 py-3 text-sm text-[var(--muted)] line-through"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td
                        className="px-5 py-3 text-sm font-semibold text-green-600"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        ₹{product.discountPrice.toLocaleString()}
                      </td>
                      <td
                        className="px-5 py-3 text-xs text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {product.category}
                      </td>
                      <td
                        className="px-5 py-3 text-xs text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {product.sizes?.length ? product.sizes.join(", ") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(pid)}
                            className="rounded-lg p-2 text-[var(--muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg rounded-[20px] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-xl font-semibold text-[var(--dark-text)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {editingProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--accent)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {([
                { label: "Name", field: "name" as const, placeholder: "e.g. Cotton Kurti Set" },
                { label: "Brand", field: "brand" as const, placeholder: "e.g. FashionHub" },
                { label: "Category", field: "category" as const, placeholder: "e.g. Ethnic Wear" },
                { label: "Image Path", field: "image" as const, placeholder: "/products/name.png" },
              ]).map((f) => (
                <div key={f.field}>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={form[f.field]}
                    onChange={(e) => handleChange(f.field, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Wholesale (₹)
                  </label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => handleChange("discountPrice", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Badge
                </label>
                <select
                  value={form.badge}
                  onChange={(e) => handleChange("badge", e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="bestseller">Bestseller</option>
                  <option value="trending">Trending</option>
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Sizes (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.sizes}
                  onChange={(e) => handleChange("sizes", e.target.value)}
                  placeholder="S, M, L, XL, XXL"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                />
              </div>

              {form.image && (
                <div>
                  <p
                    className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Preview
                  </p>
                  <div className="h-24 w-24 overflow-hidden rounded-xl bg-[var(--accent)]">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !form.name}
                className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {saving ? "Saving..." : editingProduct ? "Update" : "Create"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm rounded-[20px] bg-white p-6 shadow-xl text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3
              className="text-lg font-semibold text-[var(--dark-text)]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Delete Product
            </h3>
            <p
              className="mt-2 text-sm text-[var(--muted)]"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              This action cannot be undone. Are you sure you want to delete this product?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--accent)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-red-600"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
