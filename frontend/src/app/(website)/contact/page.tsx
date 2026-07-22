"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  ArrowRight,
} from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    detail: "+91 92057 78531",
    href: "tel:+919205778531",
    desc: "Call us for orders & queries",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    detail: "+91 92057 78531",
    href: "https://wa.me/919205778531",
    desc: "Quick responses on WhatsApp",
  },
  {
    icon: Mail,
    title: "Email",
    detail: "info@riyatouch.com",
    href: "mailto:info@riyatouch.com",
    desc: "For business inquiries",
  },
  {
    icon: Clock,
    title: "Business Hours",
    detail: "Mon - Sat: 10AM - 7PM",
    href: null,
    desc: "Sunday closed",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-primary py-24 md:py-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-circle absolute -left-20 -top-20 h-[400px] w-[400px] opacity-20" />
          <div className="floating-circle absolute -bottom-32 -right-32 h-[500px] w-[500px] opacity-20" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-[family-name:var(--font-poppins)]">
              Get In Touch
            </span>
            <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-light text-white sm:text-5xl md:text-6xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
              Have questions about our products or wholesale partnerships?
              We&apos;re here to help. Reach out to us anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="luxury-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <info.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  {info.title}
                </h3>
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-1 block text-sm font-medium text-primary transition-colors hover:text-primary-dark"
                  >
                    {info.detail}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-primary">
                    {info.detail}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">{info.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-20 gradient-soft">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary font-[family-name:var(--font-poppins)]">
                Send a Message
              </span>
              <h2 className="mt-3 mb-8 font-[family-name:var(--font-playfair)] text-3xl font-light text-dark-text md:text-4xl">
                We&apos;d Love to Hear from You
              </h2>

              {submitted && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-[family-name:var(--font-poppins)]">
                  Thank you! Your message has been sent. We&apos;ll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-text font-[family-name:var(--font-poppins)]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-text font-[family-name:var(--font-poppins)]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="you@example.com"
                      className="input-luxury w-full"
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-text font-[family-name:var(--font-poppins)]">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 XXXXX XXXXX"
                      className="input-luxury w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-text font-[family-name:var(--font-poppins)]">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="input-luxury w-full"
                    >
                      <option value="">Select a subject</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="returns">Returns & Exchanges</option>
                      <option value="product">Product Question</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dark-text font-[family-name:var(--font-poppins)]">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us how we can help you..."
                    className="input-luxury w-full resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary group inline-flex items-center gap-2"
                >
                  Send Message
                  <Send
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            </motion.div>

            {/* WhatsApp CTA + Address */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* WhatsApp CTA */}
              <div className="luxury-card overflow-hidden p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <MessageCircle size={28} className="text-emerald-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Chat on WhatsApp
                </h3>
                <p className="mb-6 text-sm text-muted">
                  For quick responses, wholesale orders, or product inquiries —
                  chat with us directly on WhatsApp.
                </p>
                <a
                  href="https://wa.me/919205778531"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg font-[family-name:var(--font-poppins)]"
                >
                  <MessageCircle size={18} />
                  Start WhatsApp Chat
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>
              </div>

              {/* Address */}
              <div className="luxury-card p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <MapPin size={28} className="text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-dark-text font-[family-name:var(--font-poppins)]">
                  Visit Us
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  Riya Touch Head Office
                  <br />
                  India
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
