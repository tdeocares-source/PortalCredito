import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer requiere tratarse como external en server components
  // para evitar problemas con su loader de fonts en build de Netlify.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
