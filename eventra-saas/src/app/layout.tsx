import React from 'react'
import './globals.css'
import { LanguageProvider } from './components/LanguageProvider'
import MainNavigation from './components/MainNavigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Eventra - Iraq Events & Venues Platform</title>
      </head>
      {/* Suppress hydration warnings caused by browser extensions (e.g., Grammarly) or client-only attrs */}
      <body suppressHydrationWarning={true}>
        <LanguageProvider>
          <MainNavigation />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
