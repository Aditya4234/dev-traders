"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Plus, Trash2, Send, Search, Package } from "lucide-react"
import * as api from "@/lib/api"
import type { Product } from "@/types"
import { useShop } from "@/context/ShopContext"

interface BulkOrderItem {
  product: Product
  size: string
  quantity: number
}

export default function BulkOrderPage() {
  const { user } = useShop()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bulkItems, setBulkItems] = useState<BulkOrderItem[]>([])
  const [sending, setSending] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .getProducts({ limit: 100 })
      .then((data) => {
        if (!cancelled && data.success) setProducts(data.products || [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  )

  const addItem = useCallback((product: Product) => {
    setBulkItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id && i.size === (product.sizes?.[0] || "")
      )
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.size === (product.sizes?.[0] || "")
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, size: product.sizes?.[0] || "", quantity: 1 }]
    })
    setSidebarOpen(true)
  }, [])

  const removeItem = useCallback((productId: string, size: string) => {
    setBulkItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)))
  }, [])

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size)
      return
    }
    setBulkItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      )
    )
  }, [removeItem])

  const updateSize = useCallback((productId: string, oldSize: string, newSize: string) => {
    setBulkItems((prev) => {
      const duplicate = prev.find(
        (i) => i.product.id === productId && i.size === newSize && i.size !== oldSize
      )
      if (duplicate) {
        return prev
          .map((i) =>
            i.product.id === productId && i.size === newSize
              ? { ...i, quantity: i.quantity + (prev.find((x) => x.product.id === productId && x.size === oldSize)?.quantity || 0) }
              : i
          )
          .filter((i) => !(i.product.id === productId && i.size === oldSize))
      }
      return prev.map((i) =>
        i.product.id === productId && i.size === oldSize ? { ...i, size: newSize } : i
      )
    })
  }, [])

  const totalItems = bulkItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = bulkItems.reduce((sum, i) => sum + (i.product.discountPrice || i.product.price) * i.quantity, 0)

  const handleSendWhatsApp = async () => {
    if (bulkItems.length === 0) return
    setSending(true)
    try {
      await api.sendBulkOrderWhatsApp(
        bulkItems.map((i) => ({ name: i.product.name, quantity: i.quantity, size: i.size }))
      )
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (bulkItems.length === 0 || !user) return
    setSending(true)
    try {
      await api.createOrder({
        items: bulkItems.map((i) => ({
          product: i.product.id,
          name: i.product.name,
          price: i.product.discountPrice || i.product.price,
          quantity: i.quantity,
          image: i.product.image,
        })),
        customer: {
          name: user.name,
          phone: user.phone || "",
          address: "",
          city: "",
          pincode: "",
          note: "Bulk order via dealer portal",
        },
        paymentMethod: "whatsapp",
        whatsappSent: true,
      })
      setBulkItems([])
      alert("Order placed successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order"
      alert(message)
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-3xl font-light text-[var(--dark-text)] md:text-4xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Bulk <span className="text-[var(--primary)]">Order</span>
          </h1>
          <p
            className="mt-2 text-sm text-[var(--muted)]"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Add multiple products and place a wholesale order
          </p>
        </div>
        {bulkItems.length > 0 && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:opacity-90 lg:hidden"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            <ShoppingBag size={16} />
            {bulkItems.length} items · ₹{totalAmount.toLocaleString("en-IN")}
          </button>
        )}
      </div>

      <div className="flex gap-6">
        {/* Product Grid Section */}
        <div className={`flex-1 ${sidebarOpen ? "hidden lg:block" : ""}`}>
          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-white/80 py-3 pl-11 pr-4 text-sm text-[var(--dark-text)] outline-none backdrop-blur-sm transition-colors focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[20px] bg-white py-20 text-center shadow-sm border border-[var(--border)]/50">
              <Package size={48} className="text-[var(--muted)]/30" />
              <h3
                className="mt-4 text-lg font-semibold text-[var(--dark-text)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                No products found
              </h3>
              <p
                className="mt-1 text-sm text-[var(--muted)]"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const inBulk = bulkItems.some((i) => i.product.id === product.id)
                const discount = product.price > product.discountPrice
                  ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                  : 0
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[20px] bg-white p-3 shadow-sm border border-[var(--border)]/50 transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[14px] bg-[var(--accent)]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      {discount > 0 && (
                        <span
                          className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          -{discount}%
                        </span>
                      )}
                      {inBulk && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                          <Plus size={12} className="rotate-45" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 px-1 pb-1">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {product.brand}
                      </p>
                      <h3
                        className="mt-0.5 text-sm font-semibold text-[var(--dark-text)] line-clamp-2 leading-tight"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className="text-base font-bold text-[var(--primary)]"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          ₹{product.discountPrice.toLocaleString("en-IN")}
                        </span>
                        {product.price > product.discountPrice && (
                          <span
                            className="text-xs text-[var(--muted)] line-through"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <p
                        className="mt-0.5 text-[10px] font-medium text-green-600"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        Wholesale Price
                      </p>
                      <button
                        onClick={() => addItem(product)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 py-2 text-xs font-semibold text-[var(--primary)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        <Plus size={14} />
                        Add to Bulk Order
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bulk Order Sidebar */}
        <div
          className={`${
            sidebarOpen ? "fixed inset-0 z-50 bg-black/40 lg:relative lg:bg-transparent" : "hidden lg:block"
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSidebarOpen(false)
          }}
        >
          <div
            className={`${
              sidebarOpen
                ? "fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl lg:relative lg:z-auto lg:w-96 lg:rounded-[20px]"
                : "w-96"
            } rounded-[20px] border border-[var(--border)]/50 bg-white p-6 shadow-sm`}
          >
            {/* Sidebar Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                  <ShoppingBag size={20} className="text-[var(--primary)]" />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold text-[var(--dark-text)]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Bulk Order
                  </h2>
                  <p
                    className="text-[11px] text-[var(--muted)]"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {bulkItems.length} product{bulkItems.length !== 1 ? "s" : ""} · {totalItems} items
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--accent)] lg:hidden"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Items */}
            {bulkItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]">
                  <ShoppingBag size={28} className="text-[var(--muted)]/40" />
                </div>
                <p
                  className="mt-4 text-sm font-semibold text-[var(--dark-text)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  No items yet
                </p>
                <p
                  className="mt-1 text-xs text-[var(--muted)]"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  Browse products and click &quot;Add to Bulk Order&quot;
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {bulkItems.map((item) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-xl border border-[var(--border)]/60 bg-[var(--accent)]/30 p-3"
                  >
                    <div className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm font-semibold text-[var(--dark-text)] truncate"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {item.product.name}
                        </h4>
                        <p
                          className="text-xs font-bold text-[var(--primary)]"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          ₹{(item.product.discountPrice || item.product.price).toLocaleString("en-IN")}
                          <span className="ml-1 text-[10px] font-normal text-[var(--muted)]">
                            / piece
                          </span>
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          {item.product.sizes && item.product.sizes.length > 0 && (
                            <select
                              value={item.size}
                              onChange={(e) =>
                                updateSize(item.product.id, item.size, e.target.value)
                              }
                              className="rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-[11px] font-semibold text-[var(--dark-text)] outline-none"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {item.product.sizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className="flex items-center overflow-hidden rounded-lg border border-[var(--border)]">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product.id,
                                  item.size,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="h-7 w-10 border-x border-[var(--border)] bg-white text-center text-xs font-semibold text-[var(--dark-text)] outline-none"
                            />
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center text-[var(--muted)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--dark-text)]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <span
                        className="text-xs font-bold text-[var(--dark-text)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        ₹
                        {(
                          (item.product.discountPrice || item.product.price) * item.quantity
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Summary */}
            {bulkItems.length > 0 && (
              <div className="mt-6 border-t border-[var(--border)]/50 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span
                      className="text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      Total Items
                    </span>
                    <span
                      className="font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span
                      className="text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      Products
                    </span>
                    <span
                      className="font-semibold text-[var(--dark-text)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {bulkItems.length}
                    </span>
                  </div>
                  <div className="border-t border-[var(--border)]/50 pt-2">
                    <div className="flex justify-between">
                      <span
                        className="text-base font-bold text-[var(--dark-text)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        Total Amount
                      </span>
                      <span
                        className="text-lg font-bold text-[var(--primary)]"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        ₹{totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-3">
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    <Send size={16} />
                    {sending ? "Sending..." : "Send Order via WhatsApp"}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={sending || !user}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    <ShoppingBag size={16} />
                    {sending ? "Placing..." : "Place Order"}
                  </button>
                  {!user && (
                    <p
                      className="text-center text-[11px] text-[var(--muted)]"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      Please log in to place an order
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
