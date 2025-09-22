"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent) => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function ResponsiveButton({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button'
}: ResponsiveButtonProps) {
  const { isRTL, language } = useLanguage();

  // Base classes for all buttons
  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-full
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    text-center whitespace-nowrap
    ${fullWidth ? 'w-full' : 'min-w-fit'}
    ${isRTL ? 'rtl-button' : 'ltr-button'}
  `.trim();

  // Variant-specific styles
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white hover:shadow-lg focus:ring-purple-500',
    secondary: 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 focus:ring-purple-500',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-600 focus:ring-white',
    ghost: 'bg-transparent text-purple-600 hover:bg-purple-100 focus:ring-purple-500'
  };

  // Size-specific styles with flexible padding
  const sizeClasses = {
    sm: `text-sm px-4 py-2 ${isRTL ? 'gap-2' : 'gap-2'}`,
    md: `text-base px-6 py-3 ${isRTL ? 'gap-3' : 'gap-3'}`,
    lg: `text-lg px-8 py-4 ${isRTL ? 'gap-4' : 'gap-4'}`,
    xl: `text-xl px-10 py-5 ${isRTL ? 'gap-4' : 'gap-4'}`
  };

  // RTL-specific adjustments
  const rtlClasses = isRTL ? `
    direction-rtl
    tracking-normal
    [&>*:first-child]:order-2 
    [&>*:last-child]:order-1
  ` : '';

  const allClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${rtlClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className={`animate-spin ${size === 'sm' ? 'h-4 w-4' : size === 'lg' || size === 'xl' ? 'h-6 w-6' : 'h-5 w-5'}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Content with optional loading state
  const buttonContent = (
    <>
      {loading && <LoadingSpinner />}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </>
  );

  // If href is provided, render as Link
  if (href && !disabled && !loading) {
    // Add locale to href if it doesn't already have it
    const localeHref = href.startsWith('/') && !href.startsWith(`/${language}/`) 
      ? `/${language}${href}` 
      : href;
      
    return (
      <Link 
        href={localeHref}
        className={allClasses}
        onClick={onClick}
      >
        {buttonContent}
      </Link>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {buttonContent}
    </button>
  );
}

// Additional CSS for RTL support (to be added to globals.css)
export const responsiveButtonStyles = `
.rtl-button {
  direction: inherit;
}

.ltr-button {
  direction: ltr;
}

/* RTL-specific button adjustments */
[dir="rtl"] .rtl-button {
  direction: rtl;
}

/* Ensure text doesn't overflow in buttons */
.rtl-button, .ltr-button {
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Icon positioning in RTL */
[dir="rtl"] .rtl-button svg {
  transform: scaleX(-1);
}

/* Ensure proper spacing in Arabic/Kurdish text */
[dir="rtl"] .rtl-button {
  font-weight: 600; /* Slightly bolder for Arabic readability */
  letter-spacing: normal; /* Avoid breaking Arabic script shaping */
  font-feature-settings: "liga" 1, "rlig" 1, "calt" 1, "ccmp" 1;
}
`;
