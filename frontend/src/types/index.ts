export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | "dealer";
  phone: string | null;
  profileImage: string | null;
  companyName: string | null;
  dealerId: string | null;
  permissions: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  badge?: "new" | "sale" | "bestseller" | "trending";
  sizes?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
  accent?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
