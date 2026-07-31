import type { Metadata } from "next";
import { Playfair_Display, Inter, Poppins } from "next/font/google";
import { ShopProvider } from "@/context/ShopContext";
import CartDrawer from "@/components/layout/CartDrawer";
import WishlistDrawer from "@/components/layout/WishlistDrawer";
import LoginModal from "@/components/layout/LoginModal";
import WhatsAppWidget from "@/components/ui/WhatsAppWidget";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Riya Touch | Premium Women's Innerwear & Lingerie — Wholesale",
  description:
    "Shop Riya Touch — India's trusted wholesale women's innerwear brand. Premium bras, panties, lingerie sets, shapewear & nightwear at wholesale prices. 500+ active dealers across India.",
  keywords: [
    "Riya Touch",
    "women bras wholesale",
    "women panties wholesale",
    "innerwear wholesale",
    "lingerie wholesale India",
    "bra panty set wholesale",
    "sports bra wholesale",
    "shapewear wholesale",
    "nightwear wholesale",
    "wholesale innerwear distributor",
    "women innerwear manufacturer",
  ],
  openGraph: {
    title: "Riya Touch | Premium Women's Innerwear & Lingerie — Wholesale",
    description:
      "India's trusted wholesale women's innerwear brand. Premium bras, panties, lingerie sets at wholesale prices.",
    url: "https://riyatouch.com",
    siteName: "Riya Touch",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Riya Touch | Premium Women's Innerwear",
    description:
      "India's trusted wholesale women's innerwear brand. Premium quality, wholesale pricing.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Riya Touch",
  url: "https://riyatouch.com",
  logo: "https://riyatouch.com/products/logo.png",
  description:
    "India's trusted wholesale women's innerwear brand. Premium bras, panties, lingerie sets at wholesale prices.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9205778531",
    contactType: "customer service",
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Riya Touch",
  url: "https://riyatouch.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://riyatouch.com/l/lingerie?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <ShopProvider>
          <main className="flex-1">{children}</main>
          <CartDrawer />
          <WishlistDrawer />
          <LoginModal />
          <WhatsAppWidget />
        </ShopProvider>
      </body>
    </html>
  );
}
