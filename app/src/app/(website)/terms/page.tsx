import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Terms &amp; Conditions
        </h1>
        <div className="space-y-4 text-[var(--muted)]">
          <p><strong>Last updated:</strong> January 2026</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">General</h2>
          <p>By accessing and using the Riya Touch website, you agree to be bound by these Terms &amp; Conditions.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Products &amp; Pricing</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>All prices are in INR and include applicable taxes</li>
            <li>We reserve the right to change prices without prior notice</li>
            <li>Product images are for illustration purposes</li>
          </ul>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Orders</h2>
          <p>An order confirmation does not constitute acceptance. We reserve the right to cancel orders due to pricing errors or stock limitations.</p>
          <h2 className="text-lg font-semibold text-[var(--dark-text)]">Contact</h2>
          <p>For questions about these terms, contact us at guptadharmendra280@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
