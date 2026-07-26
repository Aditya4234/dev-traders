"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, User } from "@/types";
import * as api from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  user: User | null;
  authLoading: boolean;
  justLoggedIn: boolean;
  setJustLoggedIn: (v: boolean) => void;
  cartOpen: boolean;
  wishlistOpen: boolean;
  loginOpen: boolean;
  orderPlacedAt: number;
  markOrderPlaced: () => void;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  login: (name: string, email: string) => void;
  loginWithApi: (email: string, password: string, remember?: boolean) => Promise<void>;
  getSavedCredentials: () => { email: string; password: string } | null;
  clearSavedCredentials: () => void;
  registerWithApi: (name: string, email: string, password: string, options?: { role?: "customer" | "dealer"; companyName?: string; dealerId?: string }) => Promise<void>;
  googleLoginWithApi: (credential: string) => Promise<void>;
  logout: () => void;
  clearCart: () => void;
  refreshUser: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadFromStorage<CartItem[]>("riya_touch_cart", []));
  const [wishlist, setWishlist] = useState<Product[]>(() => loadFromStorage<Product[]>("riya_touch_wishlist", []));
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [orderPlacedAt, setOrderPlacedAt] = useState(0);

  const markOrderPlaced = useCallback(() => {
    setOrderPlacedAt(Date.now());
  }, []);

  const setSessionCookie = useCallback((token: string) => {
    document.cookie = `riya_session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }, []);

  const clearSessionCookie = useCallback(() => {
    document.cookie = "riya_session=; path=/; max-age=0";
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem("riya_touch_token");
    if (!savedToken) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    setSessionCookie(savedToken);

    try {
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      } else {
        localStorage.removeItem("riya_touch_token");
        localStorage.removeItem("riya_touch_user");
        clearSessionCookie();
        setUser(null);
      }
    } catch {
      localStorage.removeItem("riya_touch_token");
      localStorage.removeItem("riya_touch_user");
      clearSessionCookie();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [setSessionCookie, clearSessionCookie]);

  useEffect(() => {
    void (async () => { await refreshUser(); })();
  }, [refreshUser]);

  useEffect(() => {
    localStorage.setItem("riya_touch_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("riya_touch_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((product: Product, quantity = 1, size?: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id && item.size === (size || undefined)
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id && item.size === (size || undefined)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((item) => item.id === productId);
  }, [wishlist]);

  const login = useCallback((name: string, email: string) => {
    const userData: User = {
      id: "",
      name,
      email,
      role: "customer",
      phone: null,
      profileImage: null,
      companyName: null,
      dealerId: null,
      permissions: [],
    };
    setUser(userData);
    localStorage.setItem("riya_touch_user", JSON.stringify(userData));
    setLoginOpen(false);
  }, []);

  const loginWithApi = useCallback(async (email: string, password: string, remember = false) => {
    const data = await api.login({ email, password });
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setSessionCookie(data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      if (remember) {
        localStorage.setItem("riya_touch_remembered_email", email);
      } else {
        localStorage.removeItem("riya_touch_remembered_email");
      }
      setLoginOpen(false);
      setJustLoggedIn(true);
    }
  }, [setSessionCookie]);

  const registerWithApi = useCallback(async (name: string, email: string, password: string, options?: { role?: "customer" | "dealer"; companyName?: string; dealerId?: string }) => {
    const data = await api.register({ name, email, password, ...options });
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setSessionCookie(data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      setLoginOpen(false);
      setJustLoggedIn(true);
    }
  }, [setSessionCookie]);

  const googleLoginWithApi = useCallback(async (credential: string) => {
    const data = await api.googleLogin(credential);
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setSessionCookie(data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      setLoginOpen(false);
      setJustLoggedIn(true);
    }
  }, [setSessionCookie]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("riya_touch_user");
    localStorage.removeItem("riya_touch_token");
    clearSessionCookie();
  }, [clearSessionCookie]);

  const getSavedCredentials = useCallback(() => {
    const email = localStorage.getItem("riya_touch_remembered_email");
    if (!email) return null;
    return { email, password: "" };
  }, []);

  const clearSavedCredentials = useCallback(() => {
    localStorage.removeItem("riya_touch_remembered_email");
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        user,
        authLoading,
        justLoggedIn,
        setJustLoggedIn,
        cartOpen,
        wishlistOpen,
        loginOpen,
        orderPlacedAt,
        markOrderPlaced,
        setCartOpen,
        setWishlistOpen,
        setLoginOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        login,
        loginWithApi,
        registerWithApi,
        googleLoginWithApi,
        logout,
        clearCart,
        refreshUser,
        getSavedCredentials,
        clearSavedCredentials,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
