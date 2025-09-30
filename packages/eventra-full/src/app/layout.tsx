import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import Navigation from "./components/Navigation";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Iraq Guide - Event Platform",
  description: "Discover events and activities across Iraq and Kurdistan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-gray-50">
        <Providers>
          <LanguageProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
