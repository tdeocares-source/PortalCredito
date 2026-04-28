import type { NextConfig } from "next";

// Headers de seguridad aplicados a toda la app. Defense-in-depth contra
// clickjacking, MIME sniffing, content leak via referer, downgrade de HTTPS y
// permisos de browser que no usamos.
//
// CSP (Content-Security-Policy) queda fuera por ahora — requiere whitelistear
// PostHog + Supabase + fonts y testear cada página. Se agrega en un commit
// dedicado cuando esté validado.
const securityHeaders = [
  // Bloquea que la app sea cargada en un iframe (anti-clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // El browser respeta el Content-Type del response, no adivina (anti MIME sniffing).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // El header Referer se manda solo cuando el destino es del mismo origin
  // (o https→https mismo dominio). Evita leakear URLs internas a terceros.
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // En producción (HTTPS), el browser fuerza HTTPS por 1 año aunque el user
  // tipee http://... Sin efecto en localhost.
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  // Bloquea APIs del browser que no usamos. Si en el futuro necesitamos
  // alguna (e.g. clipboard para copiar el link del informe), se afloja.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // No leak del framework en el header X-Powered-By.
  poweredByHeader: false,
  // @react-pdf/renderer requiere tratarse como external en server components
  // para evitar problemas con su loader de fonts en build de Netlify.
  serverExternalPackages: ["@react-pdf/renderer"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
