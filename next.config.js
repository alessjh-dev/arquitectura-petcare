// next.config.js
// Usamos 'require' en lugar de 'import' para compatibilidad con CommonJS
const withPWA = require('next-pwa')({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  swSrc: './src/sw.ts', // Sigue apuntando a tu Service Worker de TypeScript
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['data:'],
    formats: ['image/avif', 'image/webp'], // Esto se mantiene, pero TypeScript no lo validará aquí
  },
};

// Usamos 'module.exports' en lugar de 'export default'
module.exports = withPWA(nextConfig);