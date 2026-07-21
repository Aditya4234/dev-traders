"use client";

import { useState, useEffect } from "react";
import HeroBanner from "@/components/home/HeroBanner";
import ShopByCategory from "@/components/home/ShopByCategory";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import ProductSection from "@/components/home/ProductSection";
import PremiumCollections from "@/components/home/PremiumCollections";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CustomerReviews from "@/components/home/CustomerReviews";
import InstagramGallery from "@/components/home/InstagramGallery";
import Newsletter from "@/components/home/Newsletter";
import { getProducts } from "@/lib/api";
import { products as fallbackProducts } from "@/data/mock-data";

export default function Home() {
  const [allProducts, setAllProducts] = useState(fallbackProducts);

  useEffect(() => {
    getProducts({ limit: 50 })
      .then((data) => {
        if (data.success && data.products.length > 0) {
          setAllProducts(
            data.products.map((p: any) => ({
              id: p._id || p.id,
              name: p.name,
              brand: p.brand,
              price: p.price,
              discountPrice: p.discountPrice,
              rating: p.rating,
              reviewCount: p.reviewCount,
              image: p.image,
              category: p.category,
              badge: p.badge,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const newArrivals = allProducts.filter((p) => p.badge === "new");
  const bestSellers = allProducts.filter((p) => p.badge === "bestseller");
  const trending = allProducts.filter((p) => p.badge === "trending");

  return (
    <>
      <HeroBanner />
      <ShopByCategory />
      <FeaturedCollections />
      <ProductSection
        title="New Arrivals"
        subtitle="Just Landed"
        products={newArrivals.length > 0 ? newArrivals : allProducts.slice(0, 4)}
        viewAllHref="/shop?sort=new"
      />
      <ProductSection
        title="Best Sellers"
        subtitle="Most Loved"
        products={bestSellers.length > 0 ? bestSellers : allProducts.slice(2, 6)}
        viewAllHref="/shop?sort=bestseller"
        bgClass="bg-soft-pink"
      />
      <ProductSection
        title="Trending Now"
        subtitle="Hot Picks"
        products={trending.length > 0 ? trending : allProducts.slice(4, 8)}
        viewAllHref="/shop?sort=trending"
      />
      <PremiumCollections />
      <WhyChooseUs />
      <CustomerReviews />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
