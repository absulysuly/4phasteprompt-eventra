import React from 'react'
import LanguageProviderWrapper from '../components/LanguageProviderWrapper'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProviderWrapper>{children}</LanguageProviderWrapper>
      </body>
    </html>
  )
}
