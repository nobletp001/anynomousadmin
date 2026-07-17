import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (process.env.NODE_ENV === "production" && !apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is required for production builds. Set it to the Railway API URL including /api."
  );
}

const apiOrigin = apiUrl ? new URL(apiUrl).origin : "http://localhost:4000";
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `connect-src 'self' ${apiOrigin} https://cloudflareinsights.com`,
  "img-src 'self' data: blob: https: cloudinary.com *.cloudinary.com",
  "media-src 'self' data: blob: https:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
];

const privateHeaders = [...securityHeaders, { key: "Cache-Control", value: "no-store, max-age=0" }];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/",
        headers: privateHeaders,
      },
      {
        source: "/login",
        headers: privateHeaders,
      },
      {
        source: "/dashboard/:path*",
        headers: privateHeaders,
      },
    ];
  },
  turbopack: {},
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
