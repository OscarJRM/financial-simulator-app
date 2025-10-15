import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'mir-s3-cdn-cf.behance.net', // ✅ dominio externo permitido
    ],
  },
  // Configuraciones para mejorar compatibilidad con Vercel
  experimental: {
    // Configuraciones experimentales para Vercel
    esmExternals: true,
  },
  // Optimizaciones para build
  swcMinify: true,
  compiler: {
    // Remover console.logs en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
