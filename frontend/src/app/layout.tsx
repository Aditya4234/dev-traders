import type { Metadata } from "next";
import { Playfair_Display, Inter, Poppins } from "next/font/google";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShopProvider } from "@/context/ShopContext";
import CartDrawer from "@/components/layout/CartDrawer";
import WishlistDrawer from "@/components/layout/WishlistDrawer";
import LoginModal from "@/components/layout/LoginModal";
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
  title: "Riya Touch | Premium Women's Innerwear & Lingerie",
  description:
    "Shop Riya Touch — premium women's bras, panties, lingerie sets, shapewear & nightwear. Feel Beautiful. Feel Comfortable. Feel Confident.",
  keywords: [
    "Riya Touch",
    "women bras",
    "women panties",
    "innerwear",
    "lingerie",
    "bra panty set",
    "sports bra",
    "shapewear",
    "nightwear",
  ],
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
      <head>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ShopProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
          <LoginModal />
        </ShopProvider>
      </body>
    </html>
  );
}
