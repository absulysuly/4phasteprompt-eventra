import React from 'react';
import LanguageProviderWrapper from './LanguageProviderWrapper';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProviderWrapper>
          {children}
        </LanguageProviderWrapper>
      </body>
    </html>
  );
}
