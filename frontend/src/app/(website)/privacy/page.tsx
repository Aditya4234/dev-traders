import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Privacy Policy
        </h1>
        <div className="prose prose-sm max-w-none space-y-4 text-[var(--muted)]">
          <p><strong>Last updated:</strong> January 2026</p>
          <p>Riya Touch (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Information We Collect</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Name, email, phone number, and shipping address</li>
            <li>Payment information (processed securely via Razorpay)</li>
            <li>Browsing and purchase history</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">How We Use Your Information</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>To process and fulfill your orders</li>
            <li>To communicate order updates and promotions</li>
            <li>To improve our products and services</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Contact Us</h2>
          <p>For privacy-related inquiries, email us at guptadharmendra280@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
