import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local image folders that next/image is allowed to optimize.
    // /uploads is where photos uploaded by the admin are served from.
    localPatterns: [
      { pathname: "/products/**" },
      { pathname: "/collections/**" },
      { pathname: "/uploads/**" },
    ],
  },

  experimental: {
    serverActions: {
      // Admin photo uploads are sent through a Server Action. The default limit is 1 MB.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
