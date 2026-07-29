import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Shipping Policy
        </h1>
        <div className="space-y-4 text-[var(--muted)]">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Shipping Options</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>Free Shipping:</strong> Orders above ₹999</li>
            <li><strong>Standard Shipping:</strong> ₹49 for orders below ₹999</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Delivery Timeline</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Metro cities: 3-5 business days</li>
            <li>Other locations: 5-7 business days</li>
            <li>Remote areas: 7-10 business days</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Tracking</h2>
          <p>Once your order is shipped, you will receive a tracking link via WhatsApp/SMS.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Contact</h2>
          <p>For shipping inquiries, WhatsApp us at +91 9205778531</p>
        </div>
      </div>
    </div>
  );
}
