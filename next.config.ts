import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
      },
      // Naver 책 이미지 CDN
      {
        protocol: "https",
        hostname: "shopping-phinf.pstatic.net",
      },
      {
        protocol: "https",
        hostname: "bookthumb-phinf.pstatic.net",
      },
      // Supabase Storage
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
