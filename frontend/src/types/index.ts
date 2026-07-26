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
  _id?: string;
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
  _id?: string;
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
  _id?: string;
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Offer {
  _id: string;
  code?: string;
  title?: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  validUntil?: string;
}

export interface NotificationData {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    gstNumber?: string;
  };
  items: {
    name: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxableAmount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  shippingCharges: number;
  totalAmount: number;
  amountInWords: string;
  status: string;
  placeOfSupply: string;
  isInterState: boolean;
  paidAmount?: number;
  paymentMethod?: string;
  dueDate?: string;
  createdAt: string;
}

export interface OrderData {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  customer?: { name: string };
  paymentMethod?: string;
  whatsappSent?: boolean;
  items: {
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}

export interface SearchResult {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  companyName?: string;
  dealerId?: string;
}
