import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageview } from "@/components/PostHogPageview";
import { PostHogIdentify } from "@/components/PostHogIdentify";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal Crédito",
  description:
    "Conoce tu capacidad de crédito hipotecario en minutos. Análisis financiero personalizado y orientación clara para tu próxima inversión inmobiliaria.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lee el usuario actual para que PostHog pueda hacer identify si hay
  // sesión. Si no hay user, los eventos quedan asociados al anonymous_id
  // de PostHog hasta que el cliente clickee el magic link.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          <PostHogPageview />
          <PostHogIdentify
            userId={user?.id ?? null}
            email={user?.email ?? null}
          />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
