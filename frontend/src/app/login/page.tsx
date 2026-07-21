"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
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

export default function LoginPage() {
  const router = useRouter();
  const { loginWithApi, registerWithApi, googleLoginWithApi, user } = useShop();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
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
          router.push("/dashboard");
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
        await registerWithApi(name, email, password);
      } else {
        await loginWithApi(email, password);
      }
      setEmail("");
      setPassword("");
      setName("");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ═══════════ LEFT SIDE — Image & Branding ═══════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Floating circles */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="floating-circle absolute left-10 top-20 h-[250px] w-[250px]"
          />
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="floating-circle absolute bottom-20 right-10 h-[200px] w-[200px]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Image placeholder — lingerie flat lay feel */}
            <div className="relative mx-auto mb-10 h-[400px] w-[320px] overflow-hidden rounded-[2rem] glass-strong shadow-2xl">
              <Image
                src="/products/hero.png"
                alt="Premium Lingerie Collection"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
            </div>

            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
              Comfort is <span className="text-primary">Beautiful.</span>
            </h2>
            <p className="mt-3 font-[family-name:var(--font-playfair)] text-xl text-muted">
              Confidence is <span className="text-primary font-medium">You.</span>
            </p>

            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-primary/20" />
                  ))}
                </div>
                <span className="ml-2 text-xs text-muted">10K+ Happy Customers</span>
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
          {/* Logo */}
          <Link href="/" className="mb-10 block text-center">
            <span className="font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-[0.04em] text-dark-text sm:text-3xl">
              RIYA{" "}
              <span className="text-primary">TOUCH</span>
            </span>
          </Link>

          {/* Glass Card */}
          <div className="glass-card p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
                Riya Touch Account
              </span>
              <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-light text-dark-text">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {isSignUp
                  ? "Join Riya Touch for exclusive innerwear access"
                  : "Sign in to access your orders & wishlist"}
              </p>
            </div>

            {/* Form */}
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
                    <a
                      href="#"
                      className="text-[11px] text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                    >
                      Forgot Password?
                    </a>
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

              {/* Remember Me */}
              {!isSignUp && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="remember"
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
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Google Login */}
            <div className="w-full flex justify-center">
              <div ref={googleBtnRef} className="w-full [&>div]:w-full" />
            </div>

            {/* Toggle Mode */}
            <div className="mt-6 text-center text-xs text-muted">
              {isSignUp ? (
                <p>
                  Already have an account?{" "}
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
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError("");
                    }}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]"
                  >
                    Register Now
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Back to Home */}
          <p className="mt-8 text-center text-xs text-muted">
            <Link href="/" className="text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)]">
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
