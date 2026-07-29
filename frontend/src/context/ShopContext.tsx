"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from "react";
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

function normalizeProduct(p: Product): Product {
  return { ...p, id: p.id || p._id || "" };
}

let _cart: CartItem[] = [];
let _wishlist: Product[] = [];
let _listeners: Array<() => void> = [];

const EMPTY_CART: CartItem[] = [];
const EMPTY_WISHLIST: Product[] = [];

function notifyListeners() {
  for (const l of _listeners) l();
}

function subscribe(cb: () => void) {
  _listeners = [..._listeners, cb];
  return () => { _listeners = _listeners.filter(l => l !== cb); };
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const cart = useSyncExternalStore(subscribe, () => _cart, () => EMPTY_CART);
  const wishlist = useSyncExternalStore(subscribe, () => _wishlist, () => EMPTY_WISHLIST);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [orderPlacedAt, setOrderPlacedAt] = useState(0);

  useEffect(() => {
    _cart = loadFromStorage<CartItem[]>("riya_touch_cart", []);
    _wishlist = loadFromStorage<Product[]>("riya_touch_wishlist", []);
    notifyListeners();
  }, []);

  const markOrderPlaced = useCallback(() => {
    setOrderPlacedAt(Date.now());
  }, []);

  const setSessionCookie = useCallback((token: string, role?: string) => {
    document.cookie = `riya_session=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    if (role) {
      document.cookie = `riya_role=${role}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
  }, []);

  const clearSessionCookie = useCallback(() => {
    document.cookie = "riya_session=; path=/; max-age=0";
    document.cookie = "riya_role=; path=/; max-age=0";
  }, []);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem("riya_touch_token");
    if (!savedToken) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    const savedUser = localStorage.getItem("riya_touch_user");
    let savedRole: string | undefined;
    if (savedUser) {
      try { savedRole = JSON.parse(savedUser).role } catch {}
    }
    setSessionCookie(savedToken, savedRole);

    try {
      const data = await api.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setSessionCookie(savedToken, data.user.role);
        localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
        try {
          const wishData = await api.getWishlist();
          if (wishData.success && wishData.wishlist?.products) {
            const apiProducts = wishData.wishlist.products.map(normalizeProduct);
            const apiIds = new Set(apiProducts.map((p) => p.id));
            const merged = [...apiProducts];
            for (const p of _wishlist) {
              if (!apiIds.has(p.id)) merged.push(p);
            }
            _wishlist = merged;
            localStorage.setItem("riya_touch_wishlist", JSON.stringify(_wishlist));
            notifyListeners();
          }
        } catch {
          // keep localStorage wishlist on failure
        }
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

  const addToCart = useCallback((product: Product, quantity = 1, size?: string) => {
    const existingItem = _cart.find(
      (item) => item.product.id === product.id && item.size === (size || undefined)
    );
    if (existingItem) {
      _cart = _cart.map((item) =>
        item.product.id === product.id && item.size === (size || undefined)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      _cart = [..._cart, { product, quantity }];
    }
    localStorage.setItem("riya_touch_cart", JSON.stringify(_cart));
    notifyListeners();
    setCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    _cart = _cart.filter((item) => item.product.id !== productId);
    localStorage.setItem("riya_touch_cart", JSON.stringify(_cart));
    notifyListeners();
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    _cart = _cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    localStorage.setItem("riya_touch_cart", JSON.stringify(_cart));
    notifyListeners();
  }, [removeFromCart]);

  const toggleWishlist = useCallback(async (product: Product) => {
    if (user) {
      try {
        const data = await api.toggleWishlistItem(product.id || product._id || "");
        if (data.success && data.wishlist?.products) {
          _wishlist = data.wishlist.products.map(normalizeProduct);
          localStorage.setItem("riya_touch_wishlist", JSON.stringify(_wishlist));
          notifyListeners();
        }
        return;
      } catch {
        // fall through to localStorage fallback
      }
    }
    const exists = _wishlist.some((item) => item.id === product.id);
    _wishlist = exists
      ? _wishlist.filter((item) => item.id !== product.id)
      : [..._wishlist, product];
    localStorage.setItem("riya_touch_wishlist", JSON.stringify(_wishlist));
    notifyListeners();
  }, [user]);

  const isInWishlist = useCallback((productId: string) => {
    return _wishlist.some((item) => item.id === productId);
  }, []);

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
    if (!data.success) {
      throw new Error(data.message || "Invalid email or password");
    }
    localStorage.setItem("riya_touch_token", data.token);
    setSessionCookie(data.token, data.user?.role);
    setUser(data.user);
    localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
    if (remember) {
      localStorage.setItem("riya_touch_remembered_email", email);
    } else {
      localStorage.removeItem("riya_touch_remembered_email");
    }
    setLoginOpen(false);
    setJustLoggedIn(true);
  }, [setSessionCookie]);

  const registerWithApi = useCallback(async (name: string, email: string, password: string, options?: { role?: "customer" | "dealer"; companyName?: string; dealerId?: string }) => {
    const data = await api.register({ name, email, password, ...options });
    if (!data.success) {
      throw new Error(data.message || "Registration failed");
    }
    localStorage.setItem("riya_touch_token", data.token);
    setSessionCookie(data.token, data.user?.role);
    setUser(data.user);
    localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
    setLoginOpen(false);
    setJustLoggedIn(true);
  }, [setSessionCookie]);

  const googleLoginWithApi = useCallback(async (credential: string) => {
    const data = await api.googleLogin(credential);
    if (!data.success) {
      throw new Error(data.message || "Google login failed");
    }
    localStorage.setItem("riya_touch_token", data.token);
    setSessionCookie(data.token, data.user?.role);
    setUser(data.user);
    localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
    setLoginOpen(false);
    setJustLoggedIn(true);
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
    _cart = [];
    localStorage.setItem("riya_touch_cart", JSON.stringify(_cart));
    notifyListeners();
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
