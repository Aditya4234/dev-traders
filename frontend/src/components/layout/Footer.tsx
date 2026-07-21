"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Shield,
  BadgeCheck,
  Send,
} from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/919205778531";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Wholesale Inquiry", href: "/wholesale" },
    { label: "Become a Partner", href: "/partner" },
  ],
  policies: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Return Policy", href: "/returns" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Shipping Policy", href: "/shipping" },
  ],
  shop: [
    { label: "Bras", href: "/l/lingerie?category=bras" },
    { label: "Panties", href: "/l/lingerie?category=panties" },
    { label: "Lingerie Sets", href: "/l/lingerie" },
    { label: "Sports Bras", href: "/l/lingerie?category=sports-bra" },
    { label: "Night Wear", href: "/l/lingerie?category=night-wear" },
    { label: "Shapewear", href: "/l/lingerie?category=shapewear" },
  ],
};

const socialLinks = [
  {
    label: "WhatsApp",
    href: WHATSAPP_LINK,
    icon: MessageCircle,
    color: "hover:bg-[#25D366]",
    external: true,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-dark-text">
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 pb-10">
        {/* Top Section - Brand + Newsletter */}
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Brand Column */}
          <div>
            <Link href="/" className="group inline-block">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-semibold tracking-[0.04em] text-white sm:text-3xl">
                RIYA{" "}
                <span className="text-primary-light">TOUCH</span>
              </span>
            </Link>
            <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.25em] text-primary-light/60 font-[family-name:var(--font-poppins)]">
              Premium Innerwear
            </span>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/50">
              Premium women&apos;s innerwear — luxury bras, panties, lingerie sets &amp; shapewear. Designed for modern women who deserve the best comfort.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="tel:+919205778531"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Phone size={15} className="text-primary-light/70" />
                +91 9205778531
              </a>
              <a
                href="mailto:hello@riyatouch.co"
                className="flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Mail size={15} className="text-primary-light/70" />
                hello@riyatouch.co
              </a>
              <div className="flex items-start gap-3 text-sm text-white/60">
                <MapPin size={15} className="mt-0.5 shrink-0 text-primary-light/70" />
                Guriganj, Amethi, Uttar Pradesh — India
              </div>
            </div>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition-all duration-300 ${social.color} hover:border-transparent hover:text-white`}
                  aria-label={social.label}
                >
                  <social.icon size={16} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:pt-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 font-[family-name:var(--font-poppins)]">
              Stay Updated
            </h4>
            <p className="mt-2 text-sm text-white/50">
              New arrivals, exclusive offers & wholesale deals.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-5 flex gap-2"
            >
              <div className="relative flex-1">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-primary-light/40 focus:bg-white/[0.07] focus:ring-1 focus:ring-primary-light/20"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 font-[family-name:var(--font-poppins)]"
              >
                <Send size={13} />
                <span className="hidden sm:inline">Subscribe</span>
              </button>
            </form>

            {/* WhatsApp CTA */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center gap-3 rounded-2xl border border-[#25D366]/20 bg-[#25D366]/10 p-4 transition-all duration-300 hover:border-[#25D366]/40 hover:bg-[#25D366]/15"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20">
                <MessageCircle size={18} className="text-[#25D366]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white font-[family-name:var(--font-poppins)]">
                  WhatsApp Order
                </p>
                <p className="text-[11px] text-white/40">
                  Bulk orders ke liye seedha message karein
                </p>
              </div>
              <ArrowUpRight
                size={16}
                className="ml-auto text-[#25D366]/60"
              />
            </a>
          </div>
        </div>

        {/* Middle Section - Links Grid */}
        <div className="grid grid-cols-2 gap-8 border-t border-white/[0.06] pt-12 sm:gap-10 md:grid-cols-3 lg:gap-16">
          {/* Company */}
          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-poppins)]">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-poppins)]">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 font-[family-name:var(--font-poppins)]">
              Policies
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.policies.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm text-white/50 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 border-t border-white/[0.06] pt-8 sm:gap-6 md:justify-start">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <BadgeCheck size={14} className="text-primary-light/70" />
            <span className="text-[11px] font-medium text-white/50">
              GSTIN: 09ABCDE1234F1Z5
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <Shield size={14} className="text-primary-light/70" />
            <span className="text-[11px] font-medium text-white/50">
              Verified Wholesale Dealer
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06] bg-black/20">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 md:flex-row md:px-8 lg:px-12">
          <p className="text-[11px] text-white/30">
            &copy; {currentYear} Riya Touch. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-white/30">
            <span>Made with</span>
            <span className="text-primary-light">♥</span>
            <span>for premium innerwear</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
