import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventra - Event Platform",
  description: "Event management platform for Iraq",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="font-bold text-xl text-gray-900">Eventra</div>
            <div className="flex gap-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/events" className="text-gray-600 hover:text-gray-900">Events</a>
              <a href="/login" className="text-gray-600 hover:text-gray-900">Login</a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}