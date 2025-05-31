// next.config.ts
import type { NextConfig } from 'next'; // Importamos el tipo NextConfig para tipar la configuración

const nextConfig: NextConfig = { // Tipamos la constante nextConfig
  reactStrictMode: true,
  images: {
    domains: ['data:'], // Correcto para imágenes Base64
    // No necesitamos un 'as ImageFormat[]' aquí si los valores son literales y correctos,
    // ya que TypeScript puede inferir el tipo o Next.js lo valida directamente.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig; // Usamos export default para exportar la configuración