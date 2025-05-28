// next.config.ts
import withPWA from "next-pwa"; // Sintaxis de importación de ES Modules (ESM)

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({ // Sintaxis de exportación de ES Modules (ESM)
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
})(nextConfig);