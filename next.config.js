// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['data:'], // <--- AÑADE ESTA LÍNEA
    formats: ['image/avif', 'image/webp'], // Puedes mantener esto o ajustarlo
  },
};

module.exports = withPWA(nextConfig);