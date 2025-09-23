import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { LanguageProvider } from "./components/LanguageProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import DynamicHTML from "./components/DynamicHTML";
import { cookies, headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic/Kurdish-capable font for RTL scripts
const notoArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-rtl",
  weight: ["400","500","600","700"],
});

export const metadata: Metadata = {
  title: "Eventra Events - Discover Amazing Events",
  description: "Iraq's #1 event discovery platform. Find concerts, conferences, cultural events and more across Iraq and Kurdistan Region. Supports Arabic, Kurdish & English.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eventra Events",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#3B82F6",
};

function detectServerLanguage(): "ar" | "ku" {
  try {
    const cookieStore = cookies() as any;
    const h = headers() as any;
    const cookieLang = cookieStore?.get?.("language")?.value as "ar" | "ku" | undefined;
    if (cookieLang && ["ar","ku"].includes(cookieLang)) return cookieLang;
    const accept: string = h?.get?.("accept-language") || "";
    if (accept.includes("ar")) return "ar";
    if (accept.includes("ku") || accept.includes("ckb")) return "ku";
  } catch {}
  return "ar";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverLang = detectServerLanguage();
  const dir = serverLang === "ar" || serverLang === "ku" ? "rtl" : "ltr";
  return (
    <html lang={serverLang} dir={dir}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoArabic.variable} antialiased bg-gray-50`}
      >
        <Providers>
          <LanguageProvider initialLanguage={serverLang}>
            <DynamicHTML>
              <Navigation />
              <main>{children}</main>
              <PWAInstallPrompt />
            </DynamicHTML>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
