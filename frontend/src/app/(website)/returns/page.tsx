import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Return Policy
        </h1>
        <div className="space-y-4 text-[var(--muted)]">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Return Window</h2>
          <p>You may return items within 7 days of delivery for a full refund or exchange.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Conditions</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Items must be unworn, unwashed, and in original packaging</li>
            <li>Tags must be intact</li>
            <li>Intimate wear (panties) is non-returnable for hygiene reasons</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">How to Initiate a Return</h2>
          <p>Contact us via WhatsApp at +91 9205778531 with your order ID and reason for return.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Refund Processing</h2>
          <p>Refunds are processed within 5-7 business days to the original payment method.</p>
        </div>
      </div>
    </div>
  );
}
