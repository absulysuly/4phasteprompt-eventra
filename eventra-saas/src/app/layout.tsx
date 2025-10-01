import React from 'react'
import './globals.css'
import { LanguageProvider } from './components/LanguageProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>EventRas - Iraq Events & Venues</title>
      </head>
      {/* Suppress hydration warnings caused by browser extensions (e.g., Grammarly) or client-only attrs */}
      <body suppressHydrationWarning={true}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
