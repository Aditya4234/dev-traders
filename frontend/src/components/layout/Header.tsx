"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  LogOut,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useShop } from "@/context/ShopContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/l/lingerie" },
  { label: "New Arrivals", href: "/shop?sort=new" },
  { label: "Best Sellers", href: "/shop?badge=bestseller" },
  { label: "Offers", href: "/sale", highlight: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const {
    cart,
    wishlist,
    user,
    setCartOpen,
    setWishlistOpen,
    setLoginOpen,
    logout,
  } = useShop();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(
        `/l/lingerie?search=${encodeURIComponent(headerSearchQuery.trim())}`
      );
      setSearchOpen(false);
      setHeaderSearchQuery("");
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          isScrolled
            ? "glass-strong shadow-sm border-b border-border/30"
            : "bg-white/80 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:h-[72px] md:px-6 lg:px-10">
          {/* Left: Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-accent md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} className="text-dark-text" />
            </button>

            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/products/riya touch.png"
                alt="Riya Touch"
                width={120}
                height={40}
                className="h-8 w-auto object-contain sm:h-9 md:h-10"
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-300 font-[family-name:var(--font-poppins)]",
                  link.highlight
                    ? "text-primary hover:text-primary-dark"
                    : "text-dark-text/60 hover:text-dark-text"
                )}
              >
                <span className="relative z-10">{link.label}</span>
                {link.highlight && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white">
                    %
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                searchOpen
                  ? "bg-primary text-white"
                  : "text-dark-text hover:bg-accent"
              )}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-text transition-colors hover:bg-accent"
              aria-label="Wishlist"
            >
              <Heart size={18} strokeWidth={1.8} />
              {wishlist.length > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account */}
            {user ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-dark-text transition-colors hover:bg-accent"
                  aria-label="Account"
                >
                  <User size={18} strokeWidth={1.8} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border/50 bg-white shadow-xl"
                    >
                      <div className="border-b border-border/50 px-5 py-3">
                        <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">{user.name}</p>
                        <p className="text-[11px] text-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-dark-text/70 transition-colors hover:bg-accent/50 hover:text-dark-text font-[family-name:var(--font-poppins)]"
                        >
                          <Package size={16} />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            logout();
                            router.push("/");
                          }}
                          className="flex w-full items-center gap-3 px-5 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 font-[family-name:var(--font-poppins)]"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 sm:flex font-[family-name:var(--font-poppins)]"
              >
                <User size={14} />
                Login
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-text transition-colors hover:bg-accent"
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-border/30 bg-white/90 backdrop-blur-xl"
            >
              <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    value={headerSearchQuery}
                    onChange={(e) => setHeaderSearchQuery(e.target.value)}
                    placeholder="Search for bras, panties, lingerie..."
                    className="input-luxury pl-12 pr-24"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
                  >
                    Search
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">
                    Popular:
                  </span>
                  {["T-Shirt Bra", "Lace Panty", "Bridal Set", "Sports Bra"].map(
                    (term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setHeaderSearchQuery(term);
                          router.push(
                            `/l/lingerie?search=${encodeURIComponent(term)}`
                          );
                          setSearchOpen(false);
                        }}
                        className="rounded-full border border-border bg-white px-3 py-1 text-[10px] font-medium text-dark-text transition-colors hover:border-primary hover:text-primary font-[family-name:var(--font-poppins)]"
                      >
                        {term}
                      </button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-[60] w-[82%] max-w-sm bg-white shadow-2xl md:hidden"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-5">
                <Image
                  src="/products/riya touch.png"
                  alt="Riya Touch"
                  width={100}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-dark-text transition-colors hover:bg-primary/10"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <nav className="flex-1 overflow-y-auto px-5 py-4">
                <div className="space-y-0.5">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl py-3 text-sm font-medium uppercase tracking-[0.08em] transition-colors font-[family-name:var(--font-poppins)]",
                          link.highlight
                            ? "text-primary"
                            : "text-dark-text/60 hover:bg-accent/50 hover:text-dark-text"
                        )}
                      >
                        <span>{link.label}</span>
                        {link.highlight && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                            SALE
                          </span>
                        )}
                        {!link.highlight && (
                          <ArrowRight
                            size={14}
                            className="text-dark-text/20"
                          />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Menu Actions */}
                <div className="mt-6 space-y-0.5 border-t border-border/50 pt-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setWishlistOpen(true);
                    }}
                    className="flex w-full items-center justify-between rounded-xl py-3 text-sm font-medium uppercase tracking-[0.08em] text-dark-text/60 transition-colors hover:bg-accent/50 hover:text-dark-text font-[family-name:var(--font-poppins)]"
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={16} />
                      Wishlist
                    </span>
                    {wishlist.length > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium uppercase tracking-[0.08em] text-dark-text/60 transition-colors hover:bg-accent/50 hover:text-dark-text font-[family-name:var(--font-poppins)]"
                      >
                        <Package size={16} />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium uppercase tracking-[0.08em] text-dark-text/60 transition-colors hover:bg-accent/50 hover:text-dark-text font-[family-name:var(--font-poppins)]"
                      >
                        <LogOut size={16} />
                        Sign Out ({user.name})
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl py-3 text-sm font-medium uppercase tracking-[0.08em] text-dark-text/60 transition-colors hover:bg-accent/50 hover:text-dark-text font-[family-name:var(--font-poppins)]"
                    >
                      <User size={16} />
                      Login / Register
                    </Link>
                  )}
                </div>

                {/* Mobile Menu Footer */}
                <div className="mt-6 rounded-2xl gradient-soft p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary font-[family-name:var(--font-poppins)]">
                    Wholesale Orders
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-dark-text/60">
                    Bulk orders ke liye WhatsApp karein
                  </p>
                  <a
                    href="https://wa.me/919205778531"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-primary-dark font-[family-name:var(--font-poppins)]"
                  >
                    WhatsApp Order
                    <ArrowRight size={12} />
                  </a>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
