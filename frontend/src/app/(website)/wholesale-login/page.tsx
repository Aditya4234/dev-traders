"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Building2, Hash, Store } from "lucide-react";
import { useShop } from "@/context/ShopContext";

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

export default function WholesaleLoginPage() {
  const router = useRouter();
  const { loginWithApi, registerWithApi, googleLoginWithApi, user, getSavedCredentials } = useShop();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "dealer") {
        router.push("/dashboard/wholeseller");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setError("This account is registered as a customer. Please use the customer login page.");
      }
    }
  }, [user, router]);

  useEffect(() => {
    const saved = getSavedCredentials();
    if (saved) {
      requestAnimationFrame(() => {
        setEmail(saved.email);
        setRememberMe(true);
      });
    }
  }, [getSavedCredentials]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !googleBtnRef.current || googleInitRef.current) return;

    const initGoogle = () => {
      if (!window.google || !googleBtnRef.current || googleInitRef.current) return;

      googleInitRef.current = true;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          setError("");
          setLoading(true);
          try {
            await googleLoginWithApi(response.credential);
            const userData = JSON.parse(localStorage.getItem("riya_touch_user") || "{}");
            if (userData.role === "admin" || userData.role === "dealer") {
              router.push("/dashboard/wholeseller");
            } else {
              setError("This Google account is registered as a customer. Please use the customer login page.");
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Google login failed. Please try again.";
            setError(message);
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

    if (window.google) {
      initGoogle();
      return;
    }

    const interval = setInterval(() => {
      if (window.google) {
        clearInterval(interval);
        initGoogle();
      }
    }, 200);

    return () => clearInterval(interval);
  }, [googleLoginWithApi, router]);

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
        await registerWithApi(name, email, password, {
          role: "dealer",
          companyName: companyName || undefined,
          dealerId: dealerId || undefined,
        });
      } else {
        await loginWithApi(email, password, rememberMe);
        const userData = JSON.parse(localStorage.getItem("riya_touch_user") || "{}");
        if (userData.role !== "admin" && userData.role !== "dealer") {
          setError("This account is registered as a customer. Please use the customer login page.");
          return;
        }
      }
      setEmail("");
      setPassword("");
      setName("");
      setCompanyName("");
      setDealerId("");
      router.push("/dashboard/wholeseller");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ═══════════ LEFT SIDE — Image & Branding ═══════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />

        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-10 top-20 h-[250px] w-[250px] rounded-full bg-white/5"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-10 h-[200px] w-[200px] rounded-full bg-white/5"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="relative mx-auto mb-10 h-[400px] w-[320px] overflow-hidden rounded-[2rem] bg-white/10 shadow-2xl backdrop-blur-sm border border-white/10">
              <Image
                src="/products/hero.png"
                alt="Riya Touch Wholesale"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f3460]/40 via-transparent to-transparent" />
            </div>

            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-white md:text-4xl">
              Grow Your <span className="text-[#E8A0B0]">Business.</span>
            </h2>
            <p className="mt-3 font-[family-name:var(--font-playfair)] text-xl text-white/60">
              Partner with <span className="text-[#E8A0B0] font-medium">Riya Touch.</span>
            </p>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <Store size={16} className="text-[#E8A0B0]" />
                <span className="ml-1 text-xs text-white/60">500+ Active Dealers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════ RIGHT SIDE — Login Form ═══════════ */}
      <div className="flex w-full items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="mb-10 block text-center">
            <span className="font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-[0.04em] text-dark-text sm:text-3xl">
              RIYA{" "}
              <span className="text-primary">TOUCH</span>
            </span>
          </Link>

          <div className="glass-card p-8 sm:p-10">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f3460]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0f3460] font-[family-name:var(--font-poppins)]">
                <Store size={12} />
                Wholeseller Portal
              </span>
              <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text">
                {isSignUp ? "Become a Dealer" : "Wholeseller Login"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {isSignUp
                  ? "Register as a Riya Touch wholesale partner"
                  : "Sign in to manage your wholesale orders"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-4 text-xs text-red-500 border border-red-100"
                >
                  {error}
                </motion.div>
              )}

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="input-luxury pl-12"
                        required
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Company Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your shop / business name"
                        className="input-luxury pl-12"
                      />
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Dealer ID (if any)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dealerId}
                        onChange={(e) => setDealerId(e.target.value)}
                        placeholder="e.g. RT-1234"
                        className="input-luxury pl-12"
                      />
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="input-luxury pl-12"
                    required
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                    Password
                  </label>
                  {!isSignUp && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                    >
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-luxury pl-12 pr-12"
                    required
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-dark-text transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="remember" className="text-xs text-muted cursor-pointer">
                    Remember Me
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0f3460] py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#1a1a2e] shadow-lg mt-2 disabled:opacity-50 font-[family-name:var(--font-poppins)]"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {isSignUp ? "Register as Dealer" : "Sign In"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="w-full flex justify-center">
              <div ref={googleBtnRef} className="w-full [&>div]:w-full" />
            </div>

            <div className="mt-6 text-center text-xs text-muted">
              {isSignUp ? (
                <p>
                  Already a dealer?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError("");
                    }}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New wholeseller?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                  >
                    Register as Dealer
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted">
            <p>
              Are you a <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">customer</Link>?{" "}
              Login here instead.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/" className="text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
