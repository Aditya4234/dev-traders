import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Registry, collectDefaultMetrics, Histogram, Counter, Gauge } from "prom-client";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import collectionRoutes from "./routes/collections";
import reviewRoutes from "./routes/reviews";
import heroSlideRoutes from "./routes/heroSlides";
import orderRoutes from "./routes/orders";
import newsletterRoutes from "./routes/newsletter";
import brandRoutes from "./routes/brands";
import offerRoutes from "./routes/offers";
import cartRoutes from "./routes/cart";
import adminRoutes from "./routes/admin";
import dealerRoutes from "./routes/dealer";
import inventoryRoutes from "./routes/inventory";
import billingRoutes from "./routes/billing";
import paymentRoutes from "./routes/payment";
import recommendationRoutes from "./routes/recommendations";
import { initRedis } from "./services/redis";
import { apiLimiter, authLimiter, searchLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/riya_touch";

// --- Prometheus Metrics ---
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const activeConnections = new Gauge({
  name: "active_connections",
  help: "Number of active connections",
  registers: [register],
});

const mongodbConnections = new Gauge({
  name: "mongodb_connection_state",
  help: "MongoDB connection state (1=connected, 0=disconnected)",
  registers: [register],
});

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dev-traders.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

// Metrics middleware
app.use((req, res, next) => {
  activeConnections.inc();
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route?.path || req.path;
    end({ method: req.method, route, status_code: res.statusCode });
    httpRequestTotal.inc({ method: req.method, route, status_code: res.statusCode });
    activeConnections.dec();
  });
  next();
});

// Rate limiting
app.use("/api/auth", authLimiter);
app.use("/api/recommendations/search", searchLimiter);
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/hero-slides", heroSlideRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dealers", dealerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recommendations", recommendationRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Prometheus metrics endpoint
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end();
  }
});

// Connect to MongoDB, init Redis, and start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    mongodbConnections.set(1);
    console.log("Connected to MongoDB");

    initRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    mongodbConnections.set(0);
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

mongoose.connection.on("disconnected", () => mongodbConnections.set(0));
mongoose.connection.on("connected", () => mongodbConnections.set(1));

export default app;
