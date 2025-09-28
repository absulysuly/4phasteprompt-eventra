import React from 'react';
import LanguageProviderWrapper from '../../components/LanguageProviderWrapper';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProviderWrapper>
      {children}
    </LanguageProviderWrapper>
  );
}
