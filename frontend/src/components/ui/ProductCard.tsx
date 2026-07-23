"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Eye,
  ShoppingBag,
  Star,
  X,
  ArrowRight,
  Check,
  Sparkles,
  Minus,
  Plus,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercent, cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const badgeConfig: Record<
  string,
  { label: string; gradient: string; icon?: React.ReactNode }
> = {
  new: {
    label: "New In",
    gradient: "from-charcoal to-charcoal/90",
  },
  sale: {
    label: "Sale",
    gradient: "from-rose-gold to-rose-gold-dark",
  },
  bestseller: {
    label: "Best Seller",
    gradient: "from-amber-600 to-amber-700",
  },
  trending: {
    label: "Trending",
    gradient: "from-violet-600 to-violet-700",
  },
};

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const isWishlisted = isInWishlist(product.id);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || "");
  const discount = getDiscountPercent(product.price, product.discountPrice);
  const badge = product.badge ? badgeConfig[product.badge] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("group relative", className)}
      >
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-[0_2px_16px_-4px_rgba(183,110,121,0.06)] transition-all duration-500 hover:shadow-[0_12px_48px_-12px_rgba(183,110,121,0.16)]">
          {/* Image Section */}
          <div
            onClick={() => setShowQuickView(true)}
            className="relative aspect-[4/5] cursor-pointer overflow-hidden bg-gradient-to-br from-soft-pink/50 via-soft-pink to-soft-pink-dark/30"
          >
            {/* Product Image */}
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-110"
            />

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Top Badges */}
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
              {/* Badge (New/Sale/etc) */}
              {badge && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg sm:text-[11px]",
                    `bg-gradient-to-r ${badge.gradient}`
                  )}
                >
                  <Sparkles size={10} />
                  {badge.label}
                </motion.span>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-rose-gold shadow-md backdrop-blur-md sm:text-[11px]"
                >
                  -{discount}%
                </motion.span>
              )}
            </div>

            {/* Action Buttons - Desktop (hover reveal) */}
            <div className="absolute inset-x-0 bottom-0 hidden translate-y-full p-3 transition-transform duration-500 ease-out group-hover:translate-y-0 sm:block sm:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100">
              <div className="flex items-center gap-2">
                {/* Quick View */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuickView(true);
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/80 text-charcoal shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-xl"
                  aria-label="Quick view"
                >
                  <Eye size={16} strokeWidth={1.8} />
                </button>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 sm:text-xs",
                    isAdded
                      ? "bg-emerald-500 shadow-emerald-500/25"
                      : "bg-charcoal shadow-charcoal/20 hover:bg-rose-gold hover:shadow-rose-gold/25"
                  )}
                  aria-label="Add to cart"
                >
                  {isAdded ? (
                    <>
                      <Check size={14} strokeWidth={2.5} />
                      Added
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={13} strokeWidth={2} />
                      Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product);
                  }}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition-all duration-300",
                    isWishlisted
                      ? "border-rose-gold/40 bg-rose-gold text-white shadow-rose-gold/25"
                      : "border-white/40 bg-white/80 text-charcoal hover:bg-white hover:shadow-xl"
                  )}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={16}
                    strokeWidth={1.8}
                    fill={isWishlisted ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>

            {/* Mobile Wishlist Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className={cn(
                "absolute right-3 top-14 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all duration-300 sm:hidden",
                isWishlisted
                  ? "bg-rose-gold text-white"
                  : "border border-white/40 bg-white/80 text-charcoal"
              )}
              aria-label="Add to wishlist"
            >
              <Heart
                size={13}
                strokeWidth={2}
                fill={isWishlisted ? "currentColor" : "none"}
              />
            </button>

            {/* Mobile Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={cn(
                "absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-xl transition-all duration-300 sm:hidden active:scale-[0.97]",
                isAdded
                  ? "bg-emerald-500"
                  : "bg-charcoal/90 backdrop-blur-sm hover:bg-rose-gold"
              )}
              aria-label="Add to cart"
            >
              {isAdded ? (
                <>
                  <Check size={13} strokeWidth={2.5} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={12} strokeWidth={2} />
                  Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Info Section */}
          <div className="p-3.5 sm:p-4">
            {/* Brand & Category */}
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-rose-gold sm:text-[11px]">
                {product.brand}
              </span>
              <span className="h-3 w-px bg-charcoal/10" />
              <span className="text-[10px] uppercase tracking-wider text-muted sm:text-[11px]">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h3 className="mb-2 line-clamp-2 font-serif text-sm font-medium leading-snug text-charcoal transition-colors duration-300 group-hover:text-rose-gold-dark sm:text-[15px] md:text-base">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mb-2.5 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={cn(
                      "sm:w-3 sm:h-3",
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium text-muted sm:text-[11px]">
                {product.rating}
              </span>
              <span className="text-[10px] text-muted/60 sm:text-[11px]">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-semibold text-charcoal sm:text-xl">
                {formatPrice(product.discountPrice)}
              </span>
              {product.price > product.discountPrice && (
                <span className="text-xs text-muted line-through sm:text-sm">
                  {formatPrice(product.price)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
                  Save {discount}%
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.article>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/80 text-muted shadow-lg backdrop-blur-md transition-colors hover:bg-white hover:text-charcoal"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Image */}
              <div className="relative aspect-square w-full bg-gradient-to-br from-soft-pink/50 via-soft-pink to-soft-pink-dark/30 md:w-1/2">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain p-8"
                />
                {discount > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-rose-gold shadow-md backdrop-blur-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                {/* Brand */}
                <div className="mb-2 flex items-center gap-2">
                  {badge && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white",
                        `bg-gradient-to-r ${badge.gradient}`
                      )}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>

                <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-rose-gold">
                  {product.brand}
                </p>
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  {product.category}
                </p>

                <h3 className="mb-3 font-serif text-2xl font-light text-charcoal sm:text-3xl">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={cn(
                          i < Math.floor(product.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-charcoal">
                    {product.rating}
                  </span>
                  <span className="text-sm text-muted">
                    ({product.reviewCount} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-semibold text-charcoal">
                    {formatPrice(product.discountPrice)}
                  </span>
                  {product.price > product.discountPrice && (
                    <span className="text-lg text-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-charcoal">
                      Select Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "min-w-[44px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200",
                            selectedSize === size
                              ? "border-rose-gold bg-rose-gold text-white shadow-md shadow-rose-gold/25"
                              : "border-soft-pink-dark bg-white text-charcoal hover:border-rose-gold hover:text-rose-gold"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                  <div className="flex items-center rounded-full border border-soft-pink-dark bg-soft-pink/20 p-1">
                    <button
                      onClick={() =>
                        setQuickViewQty(Math.max(1, quickViewQty - 1))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-white"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-charcoal">
                      {quickViewQty}
                    </span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      for (let i = 0; i < quickViewQty; i++) {
                        addToCart(product);
                      }
                      setShowQuickView(false);
                    }}
                    className="group/btn flex flex-1 items-center justify-center gap-2.5 rounded-full bg-charcoal py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-300 hover:bg-rose-gold hover:shadow-rose-gold/25"
                  >
                    <ShoppingBag size={15} strokeWidth={2} />
                    Add to Cart
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-5 flex items-center gap-4 border-t border-soft-pink-dark/50 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                      <Check size={10} className="text-emerald-600" />
                    </div>
                    Free Shipping
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                      <Check size={10} className="text-emerald-600" />
                    </div>
                    Premium Quality
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
