'use client'
import React from 'react'
import { LanguageProvider } from '../app/components/LanguageProvider'

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>
}
