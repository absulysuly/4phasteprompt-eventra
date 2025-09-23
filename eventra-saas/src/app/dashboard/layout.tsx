import React from 'react';
import LanguageProviderWrapper from './LanguageProviderWrapper';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Keep this a server component; only the wrapper is client-side.
  return (
    <LanguageProviderWrapper>
      {children}
    </LanguageProviderWrapper>
  );
}
