"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import LingerieHero from "@/components/lingerie/LingerieHero";
import LingerieHighlights from "@/components/lingerie/LingerieHighlights";
import LingerieCategories from "@/components/lingerie/LingerieCategories";
import BraFitCalculator from "@/components/lingerie/BraFitCalculator";
import LingerieCatalog from "@/components/lingerie/LingerieCatalog";

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const badgeParam = searchParams.get("badge");
  const sortParam = searchParams.get("sort");

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    const catalogElement = document.getElementById("catalog");
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LingerieHero />
      <LingerieHighlights />
      <LingerieCategories
        onSelectCategory={handleSelectCategory}
        activeCategory={selectedCategory}
      />
      <BraFitCalculator />
      <LingerieCatalog
        categoryFilter={selectedCategory}
        initialBadge={badgeParam}
        initialSort={sortParam}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-soft-pink-dark border-t-rose-gold" />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
