const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add auth token if exists
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("riya_touch_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Products ───
export async function getProducts(params?: {
  search?: string;
  category?: string;
  badge?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
  }
  const qs = query.toString();
  return fetchAPI<{ success: boolean; products: any[]; pagination: any }>(
    `/products${qs ? `?${qs}` : ""}`
  );
}

export async function getProduct(id: string) {
  return fetchAPI<{ success: boolean; product: any }>(`/products/${id}`);
}

// ─── Categories ───
export async function getCategories() {
  return fetchAPI<{ success: boolean; categories: any[] }>("/categories");
}

// ─── Collections ───
export async function getCollections(type?: "featured" | "premium") {
  const qs = type ? `?type=${type}` : "";
  return fetchAPI<{ success: boolean; collections: any[] }>(`/collections${qs}`);
}

// ─── Hero Slides ───
export async function getHeroSlides() {
  return fetchAPI<{ success: boolean; slides: any[] }>("/hero-slides");
}

// ─── Reviews ───
export async function getReviews(productId?: string) {
  const qs = productId ? `?productId=${productId}` : "";
  return fetchAPI<{ success: boolean; reviews: any[] }>(`/reviews${qs}`);
}

// ─── Auth ───
export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return fetchAPI<{ success: boolean; token: string; user: any }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }) {
  return fetchAPI<{ success: boolean; token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function googleLogin(credential: string) {
  return fetchAPI<{ success: boolean; token: string; user: any }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function getMe() {
  return fetchAPI<{ success: boolean; user: any }>("/auth/me");
}

// ─── Orders ───
export async function createOrder(data: {
  items: { product: string; name: string; price: number; quantity: number; image: string }[];
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    note?: string;
  };
  paymentMethod?: string;
  whatsappSent?: boolean;
}) {
  return fetchAPI<{ success: boolean; order: any }>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyOrders() {
  return fetchAPI<{ success: boolean; orders: any[] }>("/orders/my");
}

// ─── Newsletter ───
export async function subscribeNewsletter(email: string) {
  return fetchAPI<{ success: boolean; message: string }>("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
