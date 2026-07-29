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

interface FieldErrors {
  email?: string;
  password?: string;
  name?: string;
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleInitRef = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const customerRedirectMsg = user && user.role !== "admin" && user.role !== "dealer"
    ? "This account is registered as a customer. Please use the customer login page."
    : "";

  const displayError = customerRedirectMsg || error;

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "dealer")) {
      router.push("/dashboard/wholeseller");
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
          setFieldErrors({});
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

  function validateField(field: string, value: string): string | undefined {
    if (field === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    }
    if (field === "password") {
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
    }
    if (field === "name") {
      if (!value.trim()) return "Full name is required";
    }
    return undefined;
  }

  function validateAll(): FieldErrors {
    const errors: FieldErrors = {};
    const emailErr = validateField("email", email);
    const passwordErr = validateField("password", password);
    if (emailErr) errors.email = emailErr;
    if (passwordErr) errors.password = passwordErr;
    if (isSignUp) {
      const nameErr = validateField("name", name);
      if (nameErr) errors.name = nameErr;
    }
    return errors;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, field === "email" ? email : field === "password" ? password : name);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (err) {
        (next as Record<string, string>)[field] = err;
      } else {
        delete (next as Record<string, string>)[field];
      }
      return next;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = validateAll();
    setFieldErrors(errors);
    setTouched({ email: true, password: true, ...(isSignUp ? { name: true } : {}) });

    if (Object.keys(errors).length > 0) {
      errorRef.current?.focus();
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

  function toggleSignUp() {
    setIsSignUp((v) => !v);
    setError("");
    setFieldErrors({});
    setTouched({});
  }

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
          <Link href="/" className="mb-10 block text-center" aria-label="Back to home">
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Screen-reader error announcement */}
              <div aria-live="assertive" className="sr-only">
                {(displayError || Object.keys(fieldErrors).length > 0) && (
                  <span>{displayError || Object.values(fieldErrors).join(". ")}</span>
                )}
              </div>

              {displayError && (
                <motion.div
                  ref={errorRef}
                  role="alert"
                  tabIndex={-1}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-4 text-xs text-red-500 border border-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  {displayError}
                </motion.div>
              )}

              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="ws-name" className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-4 flex h-full items-center">
                        <User className="h-[18px] w-[18px] text-muted" />
                      </span>
                      <input
                        id="ws-name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (touched.name) {
                            const err = validateField("name", e.target.value);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              if (err) next.name = err;
                              else delete next.name;
                              return next;
                            });
                          }
                        }}
                        onBlur={() => handleBlur("name")}
                        placeholder="Enter your name"
                        aria-invalid={!!fieldErrors.name}
                        aria-describedby={fieldErrors.name ? "ws-name-error" : undefined}
                        className={`input-luxury pl-[44px] ${fieldErrors.name && touched.name ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                      />
                    </div>
                    {fieldErrors.name && touched.name && (
                      <p id="ws-name-error" className="text-[11px] text-red-500 mt-1" role="alert">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ws-company" className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Company Name
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-4 flex h-full items-center">
                        <Building2 className="h-[18px] w-[18px] text-muted" />
                      </span>
                      <input
                        id="ws-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Your shop / business name"
                        className="input-luxury pl-[44px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ws-dealer-id" className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                      Dealer ID (if any)
                    </label>
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-4 flex h-full items-center">
                        <Hash className="h-[18px] w-[18px] text-muted" />
                      </span>
                      <input
                        id="ws-dealer-id"
                        type="text"
                        value={dealerId}
                        onChange={(e) => setDealerId(e.target.value)}
                        placeholder="e.g. RT-1234"
                        className="input-luxury pl-[44px]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="ws-email" className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 flex h-full items-center">
                    <Mail className="h-[18px] w-[18px] text-muted" />
                  </span>
                  <input
                    id="ws-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) {
                        const err = validateField("email", e.target.value);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          if (err) next.email = err;
                          else delete next.email;
                          return next;
                        });
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? "ws-email-error" : undefined}
                    className={`input-luxury pl-[44px] ${fieldErrors.email && touched.email ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                  />
                </div>
                {fieldErrors.email && touched.email && (
                  <p id="ws-email-error" className="text-[11px] text-red-500 mt-1" role="alert">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="ws-password" className="text-[11px] font-semibold uppercase tracking-wider text-dark-text/80 font-[family-name:var(--font-poppins)]">
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
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-4 flex h-full items-center">
                    <Lock className="h-[18px] w-[18px] text-muted" />
                  </span>
                  <input
                    id="ws-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) {
                        const err = validateField("password", e.target.value);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          if (err) next.password = err;
                          else delete next.password;
                          return next;
                        });
                      }
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "ws-password-error" : undefined}
                    className={`input-luxury pl-[44px] pr-[44px] ${fieldErrors.password && touched.password ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 flex h-full w-[44px] items-center justify-center text-muted hover:text-dark-text transition-colors focus:outline-none focus:text-dark-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && touched.password && (
                  <p id="ws-password-error" className="text-[11px] text-red-500 mt-1" role="alert">{fieldErrors.password}</p>
                )}
              </div>

              {!isSignUp && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ws-remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="ws-remember" className="text-xs text-muted cursor-pointer select-none">
                    Remember Me
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-label={isSignUp ? "Register as dealer" : "Sign in"}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0f3460] py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-[#1a1a2e] hover:shadow-xl active:scale-[0.98] shadow-lg mt-2 disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-poppins)] focus:outline-none focus:ring-2 focus:ring-[#0f3460] focus:ring-offset-2"
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

            <div className="my-5 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-wider text-muted font-[family-name:var(--font-poppins)]">
                or continue with
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="w-full">
              <div ref={googleBtnRef} className="mx-auto w-full [&>div]:mx-auto [&>div]:w-full" />
            </div>

            <div className="mt-6 text-center text-xs text-muted">
              {isSignUp ? (
                <p>
                  Already a dealer?{" "}
                  <button
                    onClick={toggleSignUp}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)] focus:outline-none focus:underline"
                  >
                    Sign In
                  </button>
                </p>
              ) : (
                <p>
                  New wholeseller?{" "}
                  <button
                    onClick={toggleSignUp}
                    className="font-semibold text-primary hover:text-primary-dark transition-colors font-[family-name:var(--font-poppins)] focus:outline-none focus:underline"
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
