"use client";

import { useShop } from "@/context/ShopContext";
import { formatPrice } from "@/lib/utils";
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistDrawer() {
  const {
    wishlist,
    wishlistOpen,
    setWishlistOpen,
    toggleWishlist,
    addToCart,
  } = useShop();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    // Optionally close wishlist drawer
    setWishlistOpen(false);
  };

  return (
    <AnimatePresence>
      {wishlistOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setWishlistOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-soft-pink-dark px-6 py-5">
              <div className="flex items-center gap-2">
                <Heart className="text-rose-gold fill-rose-gold" size={20} />
                <h2 className="font-serif text-xl font-light text-charcoal">
                  Your Wishlist
                </h2>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-soft-pink text-[10px] font-bold text-rose-gold">
                  {wishlist.length}
                </span>
              </div>
              <button
                onClick={() => setWishlistOpen(false)}
                className="rounded-full p-1.5 text-muted hover:bg-soft-pink hover:text-charcoal transition-colors"
                aria-label="Close wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {wishlist.length === 0 ? (
              /* Empty State */
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-soft-pink text-rose-gold-light">
                  <Heart size={36} />
                </div>
                <h3 className="font-serif text-2xl font-light text-charcoal mb-2">
                  Your wishlist is empty
                </h3>
                <p className="mb-8 text-sm text-muted max-w-xs">
                  Save your favorite fits here to compare styles or shop them later.
                </p>
                <Link
                  href="/l/lingerie"
                  onClick={() => setWishlistOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-white transition-all hover:bg-rose-gold hover:shadow-lg hover:shadow-rose-gold/25"
                >
                  Explore Collection
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              /* Wishlist Items List */
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {wishlist.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-4 rounded-xl border border-soft-pink-dark bg-white p-3"
                  >
                    {/* Image */}
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-soft-pink">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-gold">
                        {product.brand}
                      </p>
                      <h4 className="line-clamp-1 font-serif text-sm font-medium text-charcoal">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted mb-2">
                        {product.category}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-mono text-sm font-semibold text-charcoal">
                          {formatPrice(product.discountPrice)}
                        </span>
                        {product.price > product.discountPrice && (
                          <span className="font-mono text-xs text-muted line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-1.5 rounded-full bg-charcoal px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-rose-gold transition-colors"
                        >
                          <ShoppingBag size={10} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="flex items-center gap-1.5 rounded-full border border-soft-pink-dark px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={10} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
