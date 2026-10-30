import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Local image folders that next/image is allowed to optimize.
    // /uploads is where photos uploaded by the admin are served from on your computer.
    localPatterns: [
      { pathname: "/products/**" },
      { pathname: "/collections/**" },
      { pathname: "/uploads/**" },
    ],

    // On Vercel, uploaded photos are stored in Vercel Blob and have addresses like
    // https://xxxx.public.blob.vercel-storage.com/products/abc.jpg
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },

  experimental: {
    serverActions: {
      // Admin photo uploads are sent through a Server Action. The default limit is 1 MB.
      // (Vercel itself limits a request to 4.5 MB, so uploads are capped at 3 MB in the code.)
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
