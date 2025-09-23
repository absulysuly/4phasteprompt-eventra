// src/app/about/LanguageProviderWrapper.tsx
'use client';
import React from 'react';
// Adjust this import path if your LanguageProvider is located elsewhere.
import { LanguageProvider } from '../components/LanguageProvider';

export default function LanguageProviderWrapper({ children }: { children: React.ReactNode }) {
  return <LanguageProvider>{children}</LanguageProvider>;
}
