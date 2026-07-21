"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useShop } from "@/context/ShopContext";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
          My <span className="text-primary">Wishlist</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] bg-white py-20 text-center shadow-sm border border-border/50">
          <Heart size={48} className="text-muted/30" />
          <h3 className="mt-4 text-lg font-semibold text-dark-text">
            Your wishlist is empty
          </h3>
          <p className="mt-1 text-sm text-muted">
            Save items you love for later.
          </p>
          <a
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
          >
            Browse Products <ArrowRight size={14} />
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="luxury-card group overflow-hidden"
            >
              <div className="relative aspect-square overflow-hidden bg-accent">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white font-[family-name:var(--font-poppins)]">
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-4">
                <Link
                  href={`/product/${product.id}`}
                  className="text-sm font-semibold text-dark-text line-clamp-1 font-[family-name:var(--font-poppins)] hover:text-primary transition-colors"
                >
                  {product.name}
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-bold text-primary font-[family-name:var(--font-poppins)]">
                    ₹{product.discountPrice}
                  </span>
                  <span className="text-xs text-muted line-through">
                    ₹{product.price}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
                >
                  <ShoppingBag size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
