import Link from "next/link";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/919205778531";

export default function WholesalePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Wholesale Inquiry
        </h1>
        <p className="mb-6 text-lg text-[var(--muted)]">
          We offer competitive wholesale pricing for bulk orders. Whether you&apos;re a retailer, distributor, or business owner, we&apos;d love to work with you.
        </p>
        <div className="space-y-4 text-[var(--dark-text)]">
          <h2 className="text-2xl font-semibold">Why Partner With Us?</h2>
          <ul className="list-inside list-disc space-y-2 text-[var(--muted)]">
            <li>Competitive wholesale pricing</li>
            <li>Minimum order quantity as low as 50 pieces</li>
            <li>Wide range of premium innerwear</li>
            <li>Custom branding available</li>
            <li>Reliable delivery across India</li>
          </ul>
          <div className="mt-8 flex gap-4">
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
              <MessageCircle size={18} /> WhatsApp Us
            </a>
            <a href="tel:+919205778531" className="inline-flex items-center gap-2 rounded-xl border border-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/5">
              <Phone size={18} /> Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
