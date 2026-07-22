"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LingerieHero from "@/components/lingerie/LingerieHero";
import LingerieCategories from "@/components/lingerie/LingerieCategories";
import LingerieCatalog from "@/components/lingerie/LingerieCatalog";
import BraFitCalculator from "@/components/lingerie/BraFitCalculator";
import LingerieHighlights from "@/components/lingerie/LingerieHighlights";

function LingeriePageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      // Map URL friendly strings back to display category names
      const mapping: Record<string, string> = {
        "bras": "Bras",
        "panties": "Panties",
        "bra-panty-sets": "Lingerie Sets",
        "sports-bras": "Bras", // fall back or map to Bras
        "lingerie-sets": "Lingerie Sets",
        "shapewear": "Shapewear",
        "bridal-lingerie": "Bridal Lingerie",
        "maternity-bras": "Maternity Bras"
      };
      
      const categoryName = mapping[catParam.toLowerCase()] || catParam;
      setSelectedCategory(categoryName);
      
      const timer = setTimeout(() => {
        const catalogElement = document.getElementById("catalog");
        if (catalogElement) {
          catalogElement.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    // Scroll smoothly to the catalog section
    const catalogElement = document.getElementById("catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <LingerieHero />

      {/* 2. Highlights / Features Spotlight */}
      <LingerieHighlights />

      {/* 3. Shop by Styles / Categories */}
      <LingerieCategories
        onSelectCategory={handleSelectCategory}
        activeCategory={selectedCategory}
      />

      {/* 4. Interactive Bra Fit Guide / Calculator */}
      <BraFitCalculator />

      {/* 5. Filterable Catalog grid */}
      <LingerieCatalog categoryFilter={selectedCategory} />
    </div>
  );
}

export default function LingeriePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-soft-pink-dark border-t-rose-gold" />
      </div>
    }>
      <LingeriePageContent />
    </Suspense>
  );
}

