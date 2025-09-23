'use client'
import React from 'react'
import * as ProviderModule from '../app/components/LanguageProvider' // adjust path if your provider lives elsewhere

// Support either named or default export from the real LanguageProvider file
const LanguageProvider = (ProviderModule as any).LanguageProvider ?? (ProviderModule as any).default

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  // If provider couldn't be resolved, fall back to passthrough to avoid breaking the app
  if (!LanguageProvider) {
    return <>{children}</>
  }
  return <LanguageProvider>{children}</LanguageProvider>
}
