import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    domains: [
      'mir-s3-cdn-cf.behance.net', // ✅ dominio externo permitido
    ],
  },
};

export default nextConfig;
