import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product";
import Category from "./models/Category";
import Collection from "./models/Collection";
import HeroSlide from "./models/HeroSlide";
import Review from "./models/Review";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/riya_touch";

const BRAND_NAME = "Riya Touch";

const categoriesData = [
  { name: "Bras", slug: "bras", image: "/products/bra.svg", sortOrder: 1 },
  { name: "Panties", slug: "panties", image: "/products/panty.svg", sortOrder: 2 },
  { name: "Sets", slug: "bra-panty-sets", image: "/products/set.svg", sortOrder: 3 },
  { name: "Sports Bras", slug: "sports-bras", image: "/products/sports-bra.svg", sortOrder: 4 },
  { name: "Shapewear", slug: "shapewear", image: "/products/shapewear.svg", sortOrder: 5 },
  { name: "Lingerie", slug: "lingerie-sets", image: "/products/lingerie.svg", sortOrder: 6 },
  { name: "Bridal", slug: "bridal-lingerie", image: "/products/bridal.svg", sortOrder: 7 },
  { name: "Maternity", slug: "maternity-bras", image: "/products/maternity.svg", sortOrder: 8 },
];

const productsData = [
  { name: "Silk Lace Push-Up Bra", brand: "Riya Touch", price: 2499, discountPrice: 1499, rating: 4.8, reviewCount: 124, image: "/products/bra.svg", category: "Push-Up Bras", badge: "bestseller", sizes: ["32A", "32B", "32C", "34A", "34B", "34C", "36B", "36C"] },
  { name: "Seamless T-Shirt Bra", brand: "Lace & Love", price: 1899, discountPrice: 1299, rating: 4.6, reviewCount: 89, image: "/products/bra.svg", category: "T-Shirt Bras", badge: "new", sizes: ["32B", "32C", "34A", "34B", "34C", "36B", "36C", "38B"] },
  { name: "Cotton Comfort Hipster Panty", brand: "Bloom Intimates", price: 799, discountPrice: 499, rating: 4.9, reviewCount: 256, image: "/products/panty.svg", category: "Hipsters", badge: "bestseller", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { name: "Wireless Everyday Bra", brand: "Riya Touch", price: 1699, discountPrice: 999, rating: 4.7, reviewCount: 167, image: "/products/bra.svg", category: "Wireless Bras", badge: "trending", sizes: ["32A", "32B", "34A", "34B", "34C", "36B", "36C", "38B", "38C"] },
  { name: "Lace Bra & Panty Set", brand: "Lace & Love", price: 3299, discountPrice: 1999, rating: 4.8, reviewCount: 93, image: "/products/set.svg", category: "Bra & Panty Sets", badge: "sale", sizes: ["S", "M", "L", "XL"] },
  { name: "High-Impact Sports Bra", brand: "Riya Touch", price: 2199, discountPrice: 1599, rating: 4.5, reviewCount: 78, image: "/products/sports-bra.svg", category: "Sports Bras", badge: "new", sizes: ["32B", "32C", "34B", "34C", "36B", "36C", "38B"] },
  { name: "Non-Padded Cotton Bra", brand: "Bloom Intimates", price: 1299, discountPrice: 899, rating: 4.6, reviewCount: 142, image: "/products/bra.svg", category: "Non-Padded Bras", sizes: ["32A", "34A", "34B", "36A", "36B", "38B", "40B"] },
  { name: "Seamless Bikini Panty", brand: "Velvet Dreams", price: 699, discountPrice: 449, rating: 4.8, reviewCount: 201, image: "/products/panty.svg", category: "Bikini Panties", badge: "trending", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Padded Full Coverage Bra", brand: "Riya Touch", price: 1999, discountPrice: 1199, rating: 4.7, reviewCount: 115, image: "/products/bra.svg", category: "Padded Bras", badge: "bestseller", sizes: ["32B", "32C", "34A", "34B", "34C", "36B", "36C", "38B", "38C", "40B"] },
  { name: "Boyshort Cotton Panty", brand: "Bloom Intimates", price: 649, discountPrice: 399, rating: 4.5, reviewCount: 88, image: "/products/panty.svg", category: "Boyshorts", sizes: ["S", "M", "L", "XL", "XXL"] },
  { name: "Bridal Lace Lingerie Set", brand: "Lace & Love", price: 4999, discountPrice: 3499, rating: 4.9, reviewCount: 56, image: "/products/bridal.svg", category: "Bridal Lingerie", badge: "new", sizes: ["S", "M", "L", "XL"] },
  { name: "Maternity Nursing Bra", brand: "Riya Touch", price: 1799, discountPrice: 1299, rating: 4.8, reviewCount: 134, image: "/products/maternity.svg", category: "Maternity Bras", badge: "trending", sizes: ["34B", "34C", "36B", "36C", "38B", "38C", "40B", "40C"] },
  { name: "Damini", brand: "Velvet Dreams", price: 1999, discountPrice: 1499, rating: 4.7, reviewCount: 0, image: "/products/damini.png", category: "Bra & Panty Sets", badge: "new", sizes: ["S", "M", "L", "XL"] },
  { name: "Monika", brand: "Lace & Love", price: 1499, discountPrice: 999, rating: 4.7, reviewCount: 0, image: "/products/monika.png", category: "Bra & Panty Sets", badge: "new", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Payal", brand: "Bloom Intimates", price: 999, discountPrice: 699, rating: 4.7, reviewCount: 0, image: "/products/payal.png", category: "Bra & Panty Sets", badge: "new", sizes: ["S", "M", "L", "XL"] },
];

const heroSlidesData = [
  { title: "New Innerwear Collection", subtitle: "Exclusive Riya Touch bras & panties — crafted for everyday comfort", cta: "Shop Innerwear", image: "/products/hero-1.svg", accent: "Riya Touch", sortOrder: 1 },
  { title: "Flat 50% OFF", subtitle: "Limited offer on Riya Touch bras, panties & lingerie sets only", cta: "Shop Now", image: "/products/hero-2.svg", accent: "Flash Sale", sortOrder: 2 },
  { title: "Bridal Lingerie", subtitle: "Riya Touch bridal bras & innerwear for your special day", cta: "Explore Bridal", image: "/products/hero-3.svg", accent: "Premium", sortOrder: 3 },
];

const featuredCollectionsData = [
  { title: "Everyday Bras & Panties", subtitle: "Riya Touch daily essentials", image: "/products/bra.svg", href: "/collections/everyday", type: "featured" as const, sortOrder: 1 },
  { title: "Lace Bra Sets", subtitle: "Matching bra & panty combos", image: "/products/set.svg", href: "/collections/lace", type: "featured" as const, sortOrder: 2 },
  { title: "Sports Bras", subtitle: "Active innerwear by Riya Touch", image: "/products/sports-bra.svg", href: "/collections/sports-bras", type: "featured" as const, sortOrder: 3 },
];

const premiumCollectionsData = [
  { title: "Premium Bra Collection", subtitle: "Luxury bras by Riya Touch", image: "/products/bra.svg", href: "/collections/premium-bras", type: "premium" as const, sortOrder: 1 },
  { title: "Bridal Innerwear", subtitle: "Bridal bras & lingerie sets", image: "/products/bridal.svg", href: "/collections/bridal", type: "premium" as const, sortOrder: 2 },
];

const reviewsData = [
  { name: "Priya Sharma", rating: 5, comment: "Riya Touch bras are so soft and fit perfectly. I've replaced all my old innerwear with their panties and bras.", date: "2 weeks ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { name: "Ananya Reddy", rating: 5, comment: "Only Riya Touch for me now! Their lace bra & panty set is beautiful and super comfortable.", date: "1 month ago", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { name: "Meera Patel", rating: 4, comment: "Ordered Riya Touch sports bra and cotton panties. Great quality innerwear, fast delivery!", date: "3 weeks ago", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { name: "Kavya Nair", rating: 5, comment: "Riya Touch seamless panties and wireless bras are the best. No other brand compares for innerwear.", date: "1 week ago", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Collection.deleteMany({}),
      HeroSlide.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log("Cleared existing data");

    await Category.insertMany(categoriesData);
    console.log(`Seeded ${categoriesData.length} categories`);

    await Product.insertMany(productsData);
    console.log(`Seeded ${productsData.length} products`);

    await HeroSlide.insertMany(heroSlidesData);
    console.log(`Seeded ${heroSlidesData.length} hero slides`);

    await Collection.insertMany([...featuredCollectionsData, ...premiumCollectionsData]);
    console.log(`Seeded ${featuredCollectionsData.length + premiumCollectionsData.length} collections`);

    await Review.insertMany(reviewsData);
    console.log(`Seeded ${reviewsData.length} reviews`);

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
