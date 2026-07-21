"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ArrowUpDown, X, Search, Grid3X3 } from "lucide-react";
import { getProducts } from "@/lib/api";
import { products as fallbackProducts } from "@/data/mock-data";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types";

interface LingerieCatalogProps {
  categoryFilter: string;
  initialBadge?: string | null;
  initialSort?: string | null;
}

export default function LingerieCatalog({ categoryFilter, initialBadge, initialSort }: LingerieCatalogProps) {
  const [allProducts, setAllProducts] = useState<Product[]>(fallbackProducts);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>(
    initialSort === "new" ? "newest" : "popularity"
  );
  const [badgeFilter, setBadgeFilter] = useState<string | null>(initialBadge || null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileFilters]);

  useEffect(() => {
    getProducts({ limit: 100 })
      .then((data) => {
        if (data.success && data.products.length > 0) {
          setAllProducts(
            data.products.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              discountPrice: p.discountPrice,
              rating: p.rating,
              reviewCount: p.reviewCount,
              image: p.image,
              category: p.category,
              badge: p.badge,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (categoryFilter) {
      setSelectedGroup(categoryFilter);
    }
  }, [categoryFilter]);

  const categoriesGroups = ["All", "Bras", "Panties", "Lingerie Sets", "Shapewear", "Bridal Lingerie", "Maternity Bras"];

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        if (selectedGroup !== "All") {
          if (selectedGroup === "Bras") {
            return product.category.toLowerCase().includes("bra") && 
                  !product.category.toLowerCase().includes("maternity") &&
                  !product.category.toLowerCase().includes("sports") &&
                  !product.category.toLowerCase().includes("set");
          }
          if (selectedGroup === "Panties") {
            return product.category.toLowerCase().includes("panty") || 
                  product.category.toLowerCase().includes("hipster") || 
                  product.category.toLowerCase().includes("boyshort") ||
                  product.category.toLowerCase().includes("bikini");
          }
          if (selectedGroup === "Lingerie Sets") {
            return product.category.toLowerCase().includes("set");
          }
          if (selectedGroup === "Bridal Lingerie") {
            return product.category.toLowerCase().includes("bridal");
          }
          if (selectedGroup === "Maternity Bras") {
            return product.category.toLowerCase().includes("maternity");
          }
          if (selectedGroup === "Shapewear") {
            return product.category.toLowerCase().includes("shapewear");
          }
          return product.category === selectedGroup;
        }
        return true;
      })
      .filter((product) => {
        if (!badgeFilter) return true;
        return product.badge?.toLowerCase() === badgeFilter.toLowerCase();
      })
      .filter((product) => product.discountPrice <= maxPrice)
      .filter((product) => product.rating >= minRating)
      .filter((product) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.discountPrice - b.discountPrice;
        if (sortBy === "price-desc") return b.discountPrice - a.discountPrice;
        if (sortBy === "rating") return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
  }, [allProducts, selectedGroup, badgeFilter, maxPrice, minRating, sortBy, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedGroup !== "All") count++;
    if (maxPrice < 5000) count++;
    if (minRating > 0) count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [selectedGroup, maxPrice, minRating, searchQuery]);

  const resetFilters = () => {
    setSelectedGroup("All");
    setMaxPrice(5000);
    setMinRating(0);
    setSearchQuery("");
  };

  return (
    <section id="catalog" className="bg-white py-16 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-10 flex flex-col justify-between gap-4 border-b border-soft-pink-dark pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl font-light text-charcoal">
              Browse The Collection
            </h2>
            <p className="mt-1 text-sm text-muted">
              Showing {filteredProducts.length} of {allProducts.length} products
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search styles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-soft-pink-dark bg-soft-pink/20 py-2.5 pl-4 pr-10 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold"
              />
              <Search className="absolute right-3.5 top-3 h-4 w-4 text-muted" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2 rounded-full border border-soft-pink-dark bg-white px-4 py-2.5 text-sm text-charcoal">
              <ArrowUpDown size={14} className="text-rose-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none cursor-pointer text-xs uppercase tracking-wider font-semibold"
              >
                <option value="popularity">Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-full bg-soft-pink-dark px-4 py-2.5 text-sm font-semibold text-charcoal md:hidden"
            >
              <Filter size={14} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-gold text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:col-span-3 md:block space-y-8">
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-charcoal font-bold">Categories</h3>
              <div className="flex flex-col gap-1">
                {categoriesGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={`text-left text-sm py-2 px-3 rounded-lg transition-colors font-medium ${
                      selectedGroup === group
                        ? "bg-soft-pink text-rose-gold-dark font-semibold"
                        : "text-muted hover:bg-soft-pink/30 hover:text-charcoal"
                    }`}
                  >
                    {group === "All" ? "All Lingerie" : group}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-soft-pink-dark pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-widest text-charcoal font-bold">Max Price</h3>
                <span className="text-sm font-medium text-rose-gold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full accent-rose-gold"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>₹300</span>
                <span>₹2,500</span>
                <span>₹5,000</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-soft-pink-dark pt-6">
              <h3 className="text-xs uppercase tracking-widest text-charcoal font-bold">Minimum Rating</h3>
              <div className="flex flex-col gap-2">
                {[0, 4.5, 4.7, 4.8].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`text-left text-xs py-1.5 px-3 rounded-lg border transition-colors ${
                      minRating === rating
                        ? "border-rose-gold bg-soft-pink/30 text-rose-gold-dark font-semibold"
                        : "border-gray-200 text-muted hover:border-charcoal hover:text-charcoal"
                    }`}
                  >
                    {rating === 0 ? "Show All Ratings" : `${rating}★ & Above`}
                  </button>
                ))}
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-red-200 py-2.5 text-xs font-semibold uppercase text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={14} />
                Clear Filters ({activeFiltersCount})
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <main className="md:col-span-9">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={product.id}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-20 rounded-3xl border border-dashed border-soft-pink-dark bg-soft-pink/10">
                <h3 className="font-serif text-2xl font-light text-charcoal mb-2">No Matching Styles Found</h3>
                <p className="text-sm text-muted mb-6">Try adjusting your filters or search query to find your perfect fit.</p>
                <button
                  onClick={resetFilters}
                  className="rounded-full bg-charcoal px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-rose-gold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-[85%] max-w-sm bg-white p-6 shadow-2xl overflow-y-auto md:hidden"
            >
              <div className="flex items-center justify-between border-b border-soft-pink-dark pb-4">
                <h3 className="font-serif text-xl tracking-wider text-charcoal">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X size={22} />
                </button>
              </div>

              <div className="py-6 space-y-8">
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest text-charcoal font-bold">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categoriesGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowMobileFilters(false);
                        }}
                        className={`text-left text-xs py-2 px-3 rounded-lg border transition-colors ${
                          selectedGroup === group
                            ? "border-rose-gold bg-soft-pink text-rose-gold-dark font-semibold"
                            : "border-gray-200 text-muted"
                        }`}
                      >
                        {group === "All" ? "All" : group}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-t border-soft-pink-dark pt-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase tracking-widest text-charcoal font-bold">Max Price</h4>
                    <span className="text-sm font-medium text-rose-gold">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-rose-gold"
                  />
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>₹300</span>
                    <span>₹5,000</span>
                  </div>
                </div>

                <div className="space-y-3 border-t border-soft-pink-dark pt-6">
                  <h4 className="text-xs uppercase tracking-widest text-charcoal font-bold">Minimum Rating</h4>
                  <div className="flex flex-col gap-2">
                    {[0, 4.5, 4.7, 4.8].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => {
                          setMinRating(rating);
                          setShowMobileFilters(false);
                        }}
                        className={`text-left text-xs py-2 px-3 rounded-lg border transition-colors ${
                          minRating === rating
                            ? "border-rose-gold bg-soft-pink text-rose-gold-dark font-semibold"
                            : "border-gray-200 text-muted"
                        }`}
                      >
                        {rating === 0 ? "Show All" : `${rating}★ & Above`}
                      </button>
                    ))}
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={() => {
                      resetFilters();
                      setShowMobileFilters(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-xs font-semibold uppercase text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Clear All Filters ({activeFiltersCount})
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
