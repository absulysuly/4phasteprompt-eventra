"use client";

import { useLanguage } from './LanguageProvider';
import { useEffect } from 'react';

interface DynamicHTMLProps {
  children: React.ReactNode;
  className?: string;
}

export default function DynamicHTML({ children, className }: DynamicHTMLProps) {
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    // Update document direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <div className={className}>
      {children}
    </div>
  );
}