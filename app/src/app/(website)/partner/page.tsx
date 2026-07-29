import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--primary)]">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[var(--dark-text)]">
          Become a Partner
        </h1>
        <p className="mb-6 text-lg text-[var(--muted)]">
          Join the Riya Touch family as a wholesale dealer. Get access to exclusive pricing, priority support, and grow your business with India&apos;s premium innerwear brand.
        </p>
        <div className="space-y-4 text-[var(--dark-text)]">
          <h2 className="text-2xl font-semibold">Dealer Benefits</h2>
          <ul className="list-inside list-disc space-y-2 text-[var(--muted)]">
            <li>Exclusive dealer pricing</li>
            <li>Credit facility for qualified dealers</li>
            <li>Marketing support &amp; materials</li>
            <li>Priority stock allocation</li>
            <li>Dedicated account manager</li>
          </ul>
          <a href="https://wa.me/919205778531" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90">
            <MessageCircle size={18} /> Apply on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
