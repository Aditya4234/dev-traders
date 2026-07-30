import mongoose from "mongoose";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Collection from "@/lib/models/Collection";
import HeroSlide from "@/lib/models/HeroSlide";
import Review from "@/lib/models/Review";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://adityadeveloper10x_db_user:A6ZAA5VXuP7HIsNp@cluster0.y9pnvta.mongodb.net/riya_touch";

const categoriesData = [
  { name: "Bras", slug: "bras", image: "/products/image1.png", sortOrder: 1 },
  { name: "Panties", slug: "panties", image: "/products/image2.png", sortOrder: 2 },
  { name: "Sets", slug: "bra-panty-sets", image: "/products/image3.png", sortOrder: 3 },
  { name: "Sports Bras", slug: "sports-bras", image: "/products/image6.png", sortOrder: 4 },
  { name: "Shapewear", slug: "shapewear", image: "/products/image5.png", sortOrder: 5 },
  { name: "Lingerie", slug: "lingerie-sets", image: "/products/sofy.png", sortOrder: 6 },
  { name: "Bridal", slug: "bridal-lingerie", image: "/products/bhavna.png", sortOrder: 7 },
  { name: "Maternity", slug: "maternity-bras", image: "/products/sonam.png", sortOrder: 8 },
];

const productsData = [
  { name: "Silk Lace Push-Up Bra", brand: "Riya Touch", price: 399, discountPrice: 499, rating: 4.8, reviewCount: 124, image: "/products/image1.png", category: "Push-Up Bras", badge: "bestseller", sizes: ["32A", "32B", "32C", "34A", "34B", "34C", "36B", "36C"] },
  { name: "Seamless T-Shirt Bra", brand: "Lace & Love", price: 280, discountPrice: 380, rating: 4.6, reviewCount: 89, image: "/products/image2.png", category: "T-Shirt Bras", badge: "new", sizes: ["32B", "32C", "34A", "34B", "34C", "36B", "36C", "38B"] },
  { name: "Cotton Comfort Hipster Panty", brand: "Bloom Intimates", price: 799, discountPrice: 499, rating: 4.9, reviewCount: 256, image: "/products/image3.png", category: "Hipsters", badge: "bestseller", sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { name: "Wireless Everyday Bra", brand: "Riya Touch", price: 249, discountPrice: 299, rating: 4.7, reviewCount: 167, image: "/products/image4.png", category: "Wireless Bras", badge: "trending", sizes: ["32A", "32B", "34A", "34B", "34C", "36B", "36C", "38B", "38C"] },
  { name: "Lace Bra & Panty Set", brand: "Lace & Love", price: 390, discountPrice: 490, rating: 4.8, reviewCount: 93, image: "/products/image5.png", category: "Bra & Panty Sets", badge: "sale", sizes: ["S", "M", "L", "XL"] },
  { name: "High-Impact Sports Bra", brand: "Riya Touch", price: 299, discountPrice: 399, rating: 4.5, reviewCount: 78, image: "/products/image6.png", category: "Sports Bras", badge: "new", sizes: ["32B", "32C", "34B", "34C", "36B", "36C", "38B"] },
  { name: "Non-Padded Cotton Bra", brand: "Bloom Intimates", price: 170, discountPrice: 210, rating: 4.6, reviewCount: 142, image: "/products/image1.png", category: "Non-Padded Bras", sizes: ["32A", "34A", "34B", "36A", "36B", "38B", "40B"] },
  { name: "Seamless Bikini Panty", brand: "Velvet Dreams", price: 239, discountPrice: 299, rating: 4.8, reviewCount: 201, image: "/products/image2.png", category: "Bikini Panties", badge: "trending", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Padded Full Coverage Bra", brand: "Riya Touch", price: 349, discountPrice: 449, rating: 4.7, reviewCount: 115, image: "/products/image4.png", category: "Padded Bras", badge: "bestseller", sizes: ["32B", "32C", "34A", "34B", "34C", "36B", "36C", "38B", "38C", "40B"] },
  { name: "Boyshort Cotton Panty", brand: "Bloom Intimates", price: 649, discountPrice: 399, rating: 4.5, reviewCount: 88, image: "/products/image3.png", category: "Boyshorts", sizes: ["S", "M", "L", "XL", "XXL"] },
  { name: "Bridal Lace Lingerie Set", brand: "Lace & Love", price: 490, discountPrice: 590, rating: 4.9, reviewCount: 56, image: "/products/bhavna.png", category: "Bridal Lingerie", badge: "new", sizes: ["S", "M", "L", "XL"] },
  { name: "Maternity Nursing Bra", brand: "Riya Touch", price: 299, discountPrice: 399, rating: 4.8, reviewCount: 134, image: "/products/sonam.png", category: "Maternity Bras", badge: "trending", sizes: ["34B", "34C", "36B", "36C", "38B", "38C", "40B", "40C"] },
  { name: "Damini", brand: "Velvet Dreams", price: 290, discountPrice: 390, rating: 4.7, reviewCount: 0, image: "/products/damini.png", category: "Bra & Panty Sets", badge: "new", sizes: ["S", "M", "L", "XL"] },
  { name: "Monika", brand: "Lace & Love", price: 230, discountPrice: 290, rating: 4.7, reviewCount: 0, image: "/products/monika.png", category: "Bra & Panty Sets", badge: "new", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Payal", brand: "Bloom Intimates", price: 999, discountPrice: 699, rating: 4.7, reviewCount: 0, image: "/products/payal.png", category: "Bra & Panty Sets", badge: "new", sizes: ["S", "M", "L", "XL"] },
  { name: "Roohi Foam Bra", brand: "Riya Touch", price: 335, discountPrice: 335, rating: 4.7, reviewCount: 0, image: "/products/ROOHI.png", category: "Foam Bras", badge: "new", sizes: ["30/75"] },
  { name: "Dulhan Foam Set", brand: "Riya Touch", price: 300, discountPrice: 300, rating: 4.7, reviewCount: 0, image: "/products/dulhan.png", category: "Foam Bras", badge: "new", sizes: ["30/75"] },
  { name: "Icon B-Cup Bra", brand: "Riya Touch", price: 240, discountPrice: 240, rating: 4.7, reviewCount: 0, image: "/products/ICON.png", category: "Cup Bras", badge: "new", sizes: ["38/95"] },
  { name: "Kareena Mould Bra", brand: "Riya Touch", price: 220, discountPrice: 220, rating: 4.7, reviewCount: 0, image: "/products/KAREENA.png", category: "Mould Bras", badge: "new", sizes: ["40/100"] },
  { name: "Juliyana Bra", brand: "Riya Touch", price: 150, discountPrice: 150, rating: 4.7, reviewCount: 0, image: "/products/JULIYANA.png", category: "Non-Padded Bras", badge: "new", sizes: ["30/75"] },
  { name: "FitMe C-Cup Bra", brand: "Riya Touch", price: 184, discountPrice: 184, rating: 4.7, reviewCount: 0, image: "/products/FITME.png", category: "Cup Bras", badge: "new", sizes: ["32/80"] },
  { name: "Neetu C-Cup Bra", brand: "Riya Touch", price: 255, discountPrice: 255, rating: 4.7, reviewCount: 0, image: "/products/NEETU.png", category: "Cup Bras", badge: "new", sizes: ["36/90"] },
  { name: "Anita Gold Bra", brand: "Riya Touch", price: 176, discountPrice: 176, rating: 4.7, reviewCount: 0, image: "/products/ANGLER.png", category: "Non-Padded Bras", badge: "new", sizes: ["40/100"] },
  { name: "Back-Less Plane Bra", brand: "Riya Touch", price: 208, discountPrice: 208, rating: 4.7, reviewCount: 0, image: "/products/image.png", category: "Non-Padded Bras", badge: "new", sizes: ["30/75"] },
  { name: "Pulse Panty (3 PCS Pack)", brand: "Pulse", price: 145, discountPrice: 145, rating: 4.7, reviewCount: 0, image: "/products/PULSE.png", category: "Cotton Panties", badge: "new", sizes: ["XL"] },
  { name: "Juliyat Panty (3 PCS Pack)", brand: "Juliyat", price: 130, discountPrice: 130, rating: 4.7, reviewCount: 0, image: "/products/JULIYAT.png", category: "Cotton Panties", badge: "new", sizes: ["L"] },
  { name: "Riya Touch Nice Panty (3 PCS Pack)", brand: "Riya Touch", price: 154, discountPrice: 154, rating: 4.7, reviewCount: 0, image: "/products/NICE1.png", category: "Hipsters", badge: "new", sizes: ["XL"] },
  { name: "Riya Touch Pushpa Seamless Panty (3 PCS Pack)", brand: "Riya Touch", price: 106, discountPrice: 106, rating: 4.7, reviewCount: 0, image: "/products/PUSHPA.png", category: "Seamless Panties", badge: "new", sizes: ["XXL"] },
  { name: "Icon Bra (Non-Padded)", brand: "Riya Touch", price: 200, discountPrice: 200, rating: 4.7, reviewCount: 0, image: "/products/icon.png", category: "Non-Padded Bras", badge: "new", sizes: ["32/80"] },
  { name: "Juliyat Panty (6 PCS Pack)", brand: "Juliyat", price: 250, discountPrice: 250, rating: 4.7, reviewCount: 0, image: "/products/JULIYAT1.png", category: "Cotton Panties", badge: "new", sizes: ["L"] },
  { name: "Riya Touch Nice Panty (2 PCS Pack)", brand: "Riya Touch", price: 100, discountPrice: 100, rating: 4.7, reviewCount: 0, image: "/products/NICE.png", category: "Hipsters", badge: "new", sizes: ["XL"] },
  { name: "Pulse Panty (6 PCS Pack)", brand: "Pulse", price: 280, discountPrice: 280, rating: 4.7, reviewCount: 0, image: "/products/PULSE1.png", category: "Cotton Panties", badge: "new", sizes: ["XL"] },
  { name: "Pizza Printed Panty", brand: "Riya Touch", price: 99, discountPrice: 99, rating: 4.5, reviewCount: 0, image: "/products/pizza.png", category: "Hipsters", badge: "new", sizes: ["S", "M", "L", "XL"] },
];

const heroSlidesData = [
  { title: "New Innerwear Collection", subtitle: "Exclusive Riya Touch bras & panties — crafted for everyday comfort", cta: "Shop Innerwear", image: "/products/hero-1.svg", accent: "Riya Touch", sortOrder: 1 },
  { title: "Flat 50% OFF", subtitle: "Limited offer on Riya Touch bras, panties & lingerie sets only", cta: "Shop Now", image: "/products/hero-2.svg", accent: "Flash Sale", sortOrder: 2 },
  { title: "Bridal Lingerie", subtitle: "Riya Touch bridal bras & innerwear for your special day", cta: "Explore Bridal", image: "/products/hero1.png", accent: "Premium", sortOrder: 3 },
];

const featuredCollectionsData = [
  { title: "Everyday Bras & Panties", subtitle: "Riya Touch daily essentials", image: "/products/image1.png", href: "/collections/everyday", type: "featured" as const, sortOrder: 1 },
  { title: "Lace Bra Sets", subtitle: "Matching bra & panty combos", image: "/products/image5.png", href: "/collections/lace", type: "featured" as const, sortOrder: 2 },
  { title: "Sports Bras", subtitle: "Active innerwear by Riya Touch", image: "/products/image6.png", href: "/collections/sports-bras", type: "featured" as const, sortOrder: 3 },
];

const premiumCollectionsData = [
  { title: "Premium Bra Collection", subtitle: "Luxury bras by Riya Touch", image: "/products/image4.png", href: "/collections/premium-bras", type: "premium" as const, sortOrder: 1 },
  { title: "Bridal Innerwear", subtitle: "Bridal bras & lingerie sets", image: "/products/bhavna.png", href: "/collections/bridal", type: "premium" as const, sortOrder: 2 },
];

const reviewsData = [
  { name: "Priya Sharma", rating: 5, comment: "Riya Touch bras are so soft and fit perfectly.", date: "2 weeks ago", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { name: "Ananya Reddy", rating: 5, comment: "Only Riya Touch for me now! Their lace bra & panty set is beautiful.", date: "1 month ago", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { name: "Meera Patel", rating: 4, comment: "Ordered Riya Touch sports bra and cotton panties. Great quality!", date: "3 weeks ago", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  { name: "Kavya Nair", rating: 5, comment: "Riya Touch seamless panties and wireless bras are the best.", date: "1 week ago", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
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
