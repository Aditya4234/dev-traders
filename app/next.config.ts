import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  reactCompiler: true,
  serverExternalPackages: [
    "mongoose",
    "bcryptjs",
    "jsonwebtoken",
    "ioredis",
    "@elastic/elasticsearch",
    "razorpay",
    "nodemailer",
    "express-validator",
  ],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
