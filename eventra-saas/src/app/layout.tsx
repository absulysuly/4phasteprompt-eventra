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
  title: "IraqEvents - Discover Amazing Events in Iraq",
  description: "The premier event platform for Iraq. Discover concerts, conferences, festivals, and community events across Baghdad, Erbil, Basra, and all Iraqi cities.",
  manifest: "/manifest.json",
  themeColor: "#6a11cb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IraqEvents",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

async function detectServerLanguage(): Promise<"ar" | "ku"> {
  try {
    const cookieStore = await cookies();
    const h = await headers();
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
            </DynamicHTML>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
