'use client'
import React from 'react'
import * as ProviderModule from '../app/components/LanguageProvider' // adjust path if your provider lives elsewhere

const LanguageProvider = (ProviderModule as any).LanguageProvider ?? (ProviderModule as any).default

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  if (!LanguageProvider) {
    return <>{children}</>
  }
  return <LanguageProvider>{children}</LanguageProvider>
}
