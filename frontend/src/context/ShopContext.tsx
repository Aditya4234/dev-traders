"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import * as api from "@/lib/api";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  user: { name: string; email: string; id?: string } | null;
  cartOpen: boolean;
  wishlistOpen: boolean;
  loginOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  login: (name: string, email: string) => void;
  loginWithApi: (email: string, password: string) => Promise<void>;
  registerWithApi: (name: string, email: string, password: string) => Promise<void>;
  googleLoginWithApi: (credential: string) => Promise<void>;
  logout: () => void;
  clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [user, setUser] = useState<{ name: string; email: string; id?: string } | null>(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("riya_touch_cart");
    const savedWishlist = localStorage.getItem("riya_touch_wishlist");
    const savedUser = localStorage.getItem("riya_touch_user");
    const savedToken = localStorage.getItem("riya_touch_token");

    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error("Error parsing cart", e); }
    }
    if (savedWishlist) {
      try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error("Error parsing wishlist", e); }
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { console.error("Error parsing user", e); }
    }

    // Verify token with backend if exists
    if (savedToken) {
      api.getMe().then((data) => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
        }
      }).catch(() => {
        // Token expired or invalid, clear
        localStorage.removeItem("riya_touch_token");
        localStorage.removeItem("riya_touch_user");
        setUser(null);
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("riya_touch_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("riya_touch_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id
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
    const userData = { name, email };
    setUser(userData);
    localStorage.setItem("riya_touch_user", JSON.stringify(userData));
    setLoginOpen(false);
  }, []);

  const loginWithApi = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      setLoginOpen(false);
    }
  }, []);

  const registerWithApi = useCallback(async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      setLoginOpen(false);
    }
  }, []);

  const googleLoginWithApi = useCallback(async (credential: string) => {
    const data = await api.googleLogin(credential);
    if (data.success) {
      localStorage.setItem("riya_touch_token", data.token);
      setUser(data.user);
      localStorage.setItem("riya_touch_user", JSON.stringify(data.user));
      setLoginOpen(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("riya_touch_user");
    localStorage.removeItem("riya_touch_token");
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
        cartOpen,
        wishlistOpen,
        loginOpen,
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
