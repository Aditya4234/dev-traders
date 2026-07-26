import type {
  Product,
  Category,
  Collection,
  HeroSlide,
  Review,
  User,
  Pagination,
  Offer,
  NotificationData,
  InvoiceData,
  OrderData,
  SearchResult,
} from "@/types";

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

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("riya_touch_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      throw new Error(data.message || `Request failed (${res.status})`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(`Server error (${res.status}): please try again later`);
      }
      throw e;
    }
  }

  const data = await res.json();
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
  return fetchAPI<{ success: boolean; products: Product[]; pagination: Pagination }>(
    `/products${qs ? `?${qs}` : ""}`
  );
}

export async function getProduct(id: string) {
  return fetchAPI<{ success: boolean; product: Product }>(`/products/${id}`);
}

// ─── Categories ───
export async function getCategories() {
  return fetchAPI<{ success: boolean; categories: Category[] }>("/categories");
}

// ─── Collections ───
export async function getCollections(type?: "featured" | "premium") {
  const qs = type ? `?type=${type}` : "";
  return fetchAPI<{ success: boolean; collections: Collection[] }>(`/collections${qs}`);
}

// ─── Hero Slides ───
export async function getHeroSlides() {
  return fetchAPI<{ success: boolean; slides: HeroSlide[] }>("/hero-slides");
}

// ─── Reviews ───
export async function getReviews(productId?: string) {
  const qs = productId ? `?productId=${productId}` : "";
  return fetchAPI<{ success: boolean; reviews: Review[] }>(`/reviews${qs}`);
}

// ─── Auth ───
export async function register(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "customer" | "dealer";
  companyName?: string;
  dealerId?: string;
}) {
  return fetchAPI<{ success: boolean; token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: { email: string; password: string }) {
  return fetchAPI<{ success: boolean; token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function googleLogin(credential: string) {
  return fetchAPI<{ success: boolean; token: string; user: User }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export async function getMe() {
  return fetchAPI<{ success: boolean; user: User }>("/auth/me");
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
  return fetchAPI<{ success: boolean; order: OrderData }>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyOrders() {
  return fetchAPI<{ success: boolean; orders: OrderData[] }>("/orders/my");
}

export async function getMyOrderStats() {
  return fetchAPI<{
    success: boolean;
    stats: {
      totalOrders: number;
      totalSpent: number;
      pendingOrders: number;
      processingOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      shippedOrders: number;
    };
  }>("/orders/stats");
}

// ─── Newsletter ───
export async function subscribeNewsletter(email: string) {
  return fetchAPI<{ success: boolean; message: string }>("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ─── Admin Users Search ───
export async function searchUsers(query: string) {
  return fetchAPI<{ success: boolean; users: SearchResult[] }>(`/admin/users/search?q=${encodeURIComponent(query)}`);
}

// ─── Invoices ───
export async function createInvoice(data: {
  customer: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
  };
  items: {
    productId: string;
    name: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    gstRate: number;
  }[];
  shippingCharges?: number;
  discount?: number;
  notes?: string;
  placeOfSupply: string;
  userId?: string;
}) {
  return fetchAPI<{ success: boolean; invoice: InvoiceData }>("/billing/invoice", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInvoices(params?: { status?: string; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
  }
  const qs = query.toString();
  return fetchAPI<{ success: boolean; invoices: InvoiceData[]; pagination: Pagination }>(
    `/billing/invoices${qs ? `?${qs}` : ""}`
  );
}

export async function getInvoice(id: string) {
  return fetchAPI<{ success: boolean; invoice: InvoiceData }>(`/billing/invoices/${id}`);
}

export async function getBillingStats() {
  return fetchAPI<{
    success: boolean;
    stats: {
      monthly: { totalInvoiced: number; totalCollected: number; totalGST: number; count: number };
      byStatus: { _id: string; count: number; total: number }[];
      overdueCount: number;
    };
  }>("/billing/stats");
}

// ─── Payments ───
export async function createPaymentOrder(data: {
  amount: number;
  orderId?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}) {
  return fetchAPI<{
    success: boolean;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    paymentId: string;
    keyId: string;
  }>("/payments/create-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  paymentId: string;
}) {
  return fetchAPI<{
    success: boolean;
    status: string;
    payment: Record<string, unknown>;
  }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Dashboard Stats ───
export async function getDashboardStats() {
  return fetchAPI<{
    success: boolean;
    stats: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      totalProducts: number;
      totalCustomers: number;
      repeatRate: number;
      thisMonthRevenue: number;
      thisMonthOrders: number;
      thisMonthAvg: number;
      revenueChange: number;
      orderChange: number;
      pendingOrders: number;
      deliveredOrders: number;
      cancelledOrders: number;
      recentOrders: OrderData[];
      topProducts: { _id: string; totalSold: number; revenue: number }[];
      monthlyChart: { month: string; sales: number; orders: number }[];
      categorySales: { _id: string; total: number }[];
    };
  }>("/admin/stats");
}

// ─── Brands ───
export async function getBrands() {
  return fetchAPI<{ success: boolean; brands: { _id: string; name: string; count: number }[] }>("/brands");
}

// ─── Offers / Coupons ───
export async function getOffers() {
  return fetchAPI<{ success: boolean; offers: Offer[] }>("/offers");
}

// ─── Notifications ───
export async function getNotifications(params?: { page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) query.set(key, String(value));
    });
  }
  const qs = query.toString();
  return fetchAPI<{
    success: boolean;
    notifications: NotificationData[];
    unreadCount: number;
    pagination: Pagination;
  }>(`/notifications${qs ? `?${qs}` : ""}`);
}

export async function markNotificationRead(id: string) {
  return fetchAPI<{ success: boolean; notification: NotificationData }>(`/notifications/${id}/read`, {
    method: "PUT",
  });
}

export async function markAllNotificationsRead() {
  return fetchAPI<{ success: boolean; message: string }>("/notifications/read-all", {
    method: "PUT",
  });
}

// ─── Forgot Password ───
export async function forgotPassword(email: string) {
  return fetchAPI<{ success: boolean; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return fetchAPI<{ success: boolean; token: string; user: User }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

// ─── Recommendations ───
export async function getRecommendations(limit?: number) {
  const qs = limit ? `?limit=${limit}` : "";
  return fetchAPI<{ success: boolean; recommendations: Product[] }>(`/recommendations${qs}`);
}

// ─── Products (top-selling for homepage) ───
export async function getTopSellingProducts(limit = 8) {
  return fetchAPI<{ success: boolean; products: Product[] }>(`/products?sort=-sales&limit=${limit}`);
}

// ─── Admin Overview ───
export async function getAdminOverview() {
  return fetchAPI<{
    success: boolean;
    overview: {
      users: {
        total: number;
        customers: number;
        dealers: number;
        admins: number;
        newThisMonth: number;
        newThisWeek: number;
        activeLast30Days: number;
        loggedInToday: number;
      };
      orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      };
      revenue: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        avgOrderValue: number;
      };
      payments: {
        cod: number;
        online: number;
        whatsapp: number;
      };
      products: {
        total: number;
        active: number;
        lowStock: { product: { name: string; image: string }; quantity: number; sku: string }[];
      };
      recentOrders: OrderData[];
      dailySales: { date: string; sales: number; orders: number }[];
    };
  }>("/admin/overview");
}

// ─── Admin Users ───
export async function getAdminUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
  }
  const qs = query.toString();
  return fetchAPI<{
    success: boolean;
    users: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      role: string;
      companyName?: string;
      dealerId?: string;
      lastLoginAt?: string;
      loginCount: number;
      createdAt: string;
      profileImage?: string;
    }[];
    pagination: Pagination;
  }>(`/admin/users${qs ? `?${qs}` : ""}`);
}

// ─── Wholeseller Dashboard ───
export async function getWholesellerDashboard() {
  return fetchAPI<{
    success: boolean;
    dashboard: {
      revenue: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        avgOrderValue: number;
        revenueChange: number;
      };
      orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        orderChange: number;
        pending: number;
        confirmed: number;
        shipped: number;
        delivered: number;
        cancelled: number;
      };
      payments: {
        cod: number;
        online: number;
        whatsapp: number;
      };
      recentOrders: OrderData[];
      topProducts: { _id: string; totalSold: number; revenue: number }[];
      dailySales: { date: string; sales: number; orders: number }[];
      monthlyChart: { month: string; sales: number; orders: number }[];
      categorySales: { _id: string; total: number }[];
    };
  }>("/wholeseller/dashboard");
}

// ─── Stock Management (Admin) ───
export async function getInventory(params?: { search?: string; lowStock?: boolean; page?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
  }
  const qs = query.toString();
  return fetchAPI<{
    success: boolean;
    products: { _id: string; name: string; image: string; sku: string; stock: number; category: string; price: number }[];
    pagination: Pagination;
  }>(`/products${qs ? `?${qs}` : ""}`);
}

export async function updateProductStock(id: string, stock: number) {
  return fetchAPI<{ success: boolean; product: Product }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify({ stock }),
  });
}

// ─── Product Catalog Management (Admin) ───
export async function createProduct(data: Partial<Product>) {
  return fetchAPI<{ success: boolean; product: Product }>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  return fetchAPI<{ success: boolean; product: Product }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return fetchAPI<{ success: boolean; message: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

// ─── Bulk Order (WhatsApp) ───
export async function sendBulkOrderWhatsApp(items: { name: string; quantity: number; size?: string }[]) {
  const itemList = items.map((item) => `• ${item.name} (Qty: ${item.quantity}${item.size ? `, Size: ${item.size}` : ""})`).join("%0A");
  const msg = encodeURIComponent(`*Bulk Order Request*%0A%0AItems:%0A${itemList}%0A%0APlease share the total price and availability.`);
  window.open(`https://wa.me/919205778531?text=${msg}`, "_blank");
}

// ─── Loyalty Points ───
export async function getLoyaltyPoints() {
  return fetchAPI<{ success: boolean; points: number; history: { type: string; points: number; description: string; createdAt: string }[] }>("/auth/loyalty");
}

// ─── Delivery Slots ───
export async function getDeliverySlots() {
  return fetchAPI<{
    success: boolean;
    slots: { id: string; date: string; label: string; available: boolean }[];
  }>("/orders/slots");
}

// ─── Customer Management (Admin) ───
export async function getCustomerDetails(id: string) {
  return fetchAPI<{ success: boolean; user: User; orders: OrderData[]; totalSpent: number }>(`/admin/users/${id}`);
}

// ─── Dispatch / Order Status ───
export async function updateOrderStatus(orderId: string, status: string) {
  return fetchAPI<{ success: boolean; order: OrderData }>(`/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getOrderStatus(orderId: string) {
  return fetchAPI<{ success: boolean; status: string; updatedAt: string }>(`/orders/${orderId}/status`);
}

// ─── Contact Form ───
export async function submitContactForm(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
  return fetchAPI<{ success: boolean; message: string }>(`/contact`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Loyalty ───
export async function getLoyaltyAccount() {
  return fetchAPI<{ success: boolean; account: any; transactions: any[] }>(`/loyalty`);
}

export async function earnLoyaltyPoints(data: { points: number; description?: string; orderId?: string }) {
  return fetchAPI<{ success: boolean; account: any }>(`/loyalty/earn`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function redeemLoyaltyPoints(data: { points: number; description?: string }) {
  return fetchAPI<{ success: boolean; account: any }>(`/loyalty/redeem`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Coupons ───
export async function getCoupons() {
  return fetchAPI<{ success: boolean; coupons: any[] }>(`/coupons`);
}

export async function validateCoupon(data: { code: string; orderAmount?: number }) {
  return fetchAPI<{ success: boolean; coupon: any; discount: number }>(`/coupons/validate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCoupon(data: any) {
  return fetchAPI<{ success: boolean; coupon: any }>(`/coupons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Credit Ledger ───
export async function getCreditAccount() {
  return fetchAPI<{ success: boolean; account: any; entries: any[] }>(`/credit`);
}

export async function addCredit(data: { userId: string; amount: number; description?: string; orderId?: string; invoiceId?: string }) {
  return fetchAPI<{ success: boolean; entry: any; account: any }>(`/credit/credit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function debitCredit(data: { userId: string; amount: number; description?: string; orderId?: string; invoiceId?: string }) {
  return fetchAPI<{ success: boolean; entry: any; account: any }>(`/credit/debit`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Outstanding ───
export async function getOutstanding() {
  return fetchAPI<{ success: boolean; outstanding: any; orders: any[] }>(`/outstanding`);
}

export async function getOutstandingAll() {
  return fetchAPI<{ success: boolean; dealers: any[] }>(`/outstanding/all`);
}

// ─── Wishlist ───
export async function getWishlist() {
  return fetchAPI<{ success: boolean; wishlist: { products: any[] } }>(`/wishlist`);
}

export async function toggleWishlistItem(productId: string) {
  return fetchAPI<{ success: boolean; action: string; wishlist: { products: any[] } }>(`/wishlist/toggle`, {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}
