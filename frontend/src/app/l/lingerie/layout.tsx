import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Lingerie Shop | Premium Bras & Panties | Riya Touch",
  description:
    "Explore Riya Touch's exclusive Lingerie Shop. Discover our collection of premium fit bras, comfortable everyday panties, matching lace sets, bridal wear, and maternity essentials.",
  keywords: [
    "Riya Touch Lingerie",
    "women's bras",
    "premium knickers",
    "panties",
    "bra fit calculator",
    "shapewear",
    "bridal innerwear",
  ],
};

export default function LingerieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
