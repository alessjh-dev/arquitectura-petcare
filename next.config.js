// next.config.js
// Cambiamos require a import
import withPWAInit from "next-pwa";

// Inicializamos withPWA correctamente para usar con import
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['data:'],
    formats: ['image/avif', 'image/webp'],
  },
};

// Cambiamos module.exports a export default
export default withPWA(nextConfig);