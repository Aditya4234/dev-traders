"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  Bell,
  User,
  Menu,
  X,
  LayoutDashboard,
  Store,
  ClipboardList,
  MapPin,
  Ticket,
  Settings,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { useShop } from "@/context/ShopContext";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Store, label: "Shop", href: "/shop" },
  { icon: ClipboardList, label: "Orders", href: "/dashboard/orders" },
  { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist" },
  { icon: MapPin, label: "Addresses", href: "/dashboard/addresses" },
  { icon: Ticket, label: "Coupons", href: "/dashboard/coupons" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, cart, wishlist, setCartOpen, setWishlistOpen } = useShop();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userName = user?.name || "User";
  const cartCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 glass-strong border-b border-border/50">
        <div className="flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-accent lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-dark-text" />
            </button>
            <Link href="/" className="group flex items-center gap-2">
              <Image
                src="/products/logo.png"
                alt="Riya Touch"
                width={120}
                height={40}
                className="h-8 w-auto object-contain sm:h-9 md:h-10"
                priority
              />
            </Link>
          </div>
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="w-full rounded-full border border-border bg-white/60 py-2.5 pl-11 pr-4 text-sm text-dark-text outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-text transition-colors hover:bg-accent">
              <Heart size={18} />
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-dark-text transition-colors hover:bg-accent">
              <Bell size={18} />
            </button>
            <div className="ml-2 flex items-center gap-3 rounded-full border border-border bg-white/60 py-1.5 pl-1.5 pr-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <User size={16} className="text-primary" />
              </div>
              <span className="hidden text-sm font-medium text-dark-text sm:block font-[family-name:var(--font-poppins)]">
                {userName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto">
        {/* SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border/50 pt-20 transition-transform duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:self-start lg:translate-x-0 lg:z-0 lg:shrink-0 lg:overflow-y-auto lg:rounded-2xl lg:my-4 lg:ml-4 lg:border lg:border-border/50 lg:shadow-sm ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
          <div className="flex h-full flex-col p-4">
            <div className="mb-6 rounded-2xl bg-accent/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                    {userName}
                  </p>
                  <p className="text-xs text-muted">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-1">
              {sidebarLinks.map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <link.icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="sidebar-link text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
