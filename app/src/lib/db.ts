import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const cached = (global as any).mongoose || { conn: null, promise: null };

export function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }
  try {
    cached.conn = await cached.promise;
    (global as any).mongoose = cached;
    return cached.conn;
  } catch (error: any) {
    cached.promise = null;
    (global as any).mongoose = { conn: null, promise: null };
    console.error("[DB] MongoDB connection error:", error?.message || error);
    throw new Error(`Database connection failed: ${error?.message || "Unknown error"}`);
  }
}

export default connectDB;
