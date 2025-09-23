import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Providers from "./providers";
import Navigation from "./components/Navigation";
import { LanguageProvider } from "./components/LanguageProvider";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import OfflineNotification from "./components/OfflineNotification";
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
  title: "Eventra Full - Complete Experience Platform",
  description: "Your complete travel companion for Iraq! Book events, hotels, restaurants, flights and packages. All-in-one platform for unforgettable experiences.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eventra Full",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover" as const,
  themeColor: "#059669",
};

async function detectServerLanguage(): Promise<"en" | "ar" | "ku"> {
  try {
    const cookieStore = await cookies();
    const h = await headers();
    const cookieLang = cookieStore?.get?.("language")?.value as "en" | "ar" | "ku" | undefined;
    if (cookieLang && ["en", "ar", "ku"].includes(cookieLang)) return cookieLang;
    const accept: string = h?.get?.("accept-language") || "";
    if (accept.includes("ar")) return "ar";
    if (accept.includes("ku") || accept.includes("ckb")) return "ku";
    if (accept.includes("en")) return "en";
  } catch {}
  return "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverLang = await detectServerLanguage();
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
              <ServiceWorkerRegistration />
              <OfflineNotification />
            </DynamicHTML>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
