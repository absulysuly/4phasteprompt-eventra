'use client';
import React from 'react';
// Adjusted import path to match project structure (src/app/components/LanguageProvider.tsx)
import { LanguageProvider } from '../components/LanguageProvider';

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
