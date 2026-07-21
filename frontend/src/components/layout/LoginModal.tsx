"use client";

import { useShop } from "@/context/ShopContext";
import { X, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export default function LoginModal() {
  const { loginOpen, setLoginOpen, loginWithApi, registerWithApi, googleLoginWithApi } = useShop();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);

  const initGoogle = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google || !googleBtnRef.current || googleInitRef.current) return;

    googleInitRef.current = true;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        setError("");
        setLoading(true);
        try {
          await googleLoginWithApi(response.credential);
          setLoginOpen(false);
        } catch (err: any) {
          setError(err.message || "Google login failed. Please try again.");
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "continue_with",
      shape: "pill",
    });
  };

  useEffect(() => {
    if (loginOpen) {
      googleInitRef.current = false;
      setTimeout(initGoogle, 100);
    }
  }, [loginOpen]);

  useEffect(() => {
    if (loginOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loginOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await registerWithApi(name, email, password);
      } else {
        await loginWithApi(email, password);
      }
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLoginOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-md overflow-y-auto overflow-x-hidden rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:p-8 max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={() => setLoginOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1.5 text-muted hover:bg-soft-pink hover:text-charcoal transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-gold">
                Riya Touch Account
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-charcoal">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="mt-2 text-xs text-muted">
                {isSignUp
                  ? "Join Riya Touch for exclusive innerwear access"
                  : "Sign in to access your orders & wishlist"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-500">
                  {error}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/80">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-full border border-soft-pink-dark bg-soft-pink/30 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold"
                      required
                    />
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/80">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-full border border-soft-pink-dark bg-soft-pink/30 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/80">
                    Password
                  </label>
                  {!isSignUp && (
                    <a
                      href="#"
                      className="text-[10px] text-rose-gold hover:text-rose-gold-dark transition-colors"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-full border border-soft-pink-dark bg-soft-pink/30 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-charcoal py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-rose-gold transition-colors mt-6 shadow-md hover:shadow-rose-gold/15 disabled:opacity-50"
              >
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-soft-pink-dark" />
              <span className="text-[10px] uppercase tracking-wider text-muted">
                or continue with
              </span>
              <div className="h-px flex-1 bg-soft-pink-dark" />
            </div>

            {/* Google Login */}
            <div className="w-full flex justify-center">
              <div ref={googleBtnRef} className="w-full [&>div]:w-full" />
            </div>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-xs text-muted border-t border-soft-pink-dark pt-5">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError("");
                    }}
                    className="font-semibold text-rose-gold hover:underline"
                  >
                    Login here
                  </button>
                </p>
              ) : (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    className="font-semibold text-rose-gold hover:underline"
                  >
                    Register here
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
