'use client';

import React, { useState, useRef, useEffect } from 'react';
import ImagePlaceholder from './ImagePlaceholder';
import { useTranslations } from '../hooks/useTranslations';

interface LazyImageProps {
  src?: string;
  alt: string;
  className?: string;
  gradient?: string;
  icon?: string;
  text?: string;
  fallbackText?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  gradient = 'from-gray-300 to-gray-400',
  icon = '🖼️',
  text,
  fallbackText,
  loading = 'lazy',
  priority = false
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslations();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, loading]);

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // If no src provided or image error, show placeholder
  if (!src || imageError) {
    return (
      <div ref={containerRef} className={className}>
        <ImagePlaceholder
          gradient={gradient}
          icon={icon}
          text={imageError ? (fallbackText ?? t('common.imageUnavailable')) : (text ?? t('common.loading'))}
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 z-10">
          <ImagePlaceholder
            gradient={gradient}
            icon={icon}
            text={text ?? t('common.loading')}
            className="w-full h-full"
          />
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
        />
      )}
    </div>
  );
}