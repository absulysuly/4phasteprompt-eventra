'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from '../hooks/useTranslations';

interface EventImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  category?: string;
  priority?: boolean;
  fallbackType?: 'tech' | 'music' | 'business' | 'art' | 'food' | 'sports' | 'health' | 'community' | 'general';
}

// High-quality placeholder images using Unsplash
const getPlaceholderImage = (type: string = 'general', width: number = 800, height: number = 600) => {
  const placeholders = {
    tech: `https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    music: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    business: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    art: `https://images.unsplash.com/photo-1549490349-8643362247b5?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    food: `https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    sports: `https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    health: `https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    community: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`,
    general: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80`
  };
  
  return placeholders[type as keyof typeof placeholders] || placeholders.general;
};

export default function EventImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  category = 'general',
  priority = false,
  fallbackType = 'general'
}: EventImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use provided src or generate placeholder based on category/fallbackType
  const baseSrc = src || getPlaceholderImage(category || fallbackType, width, height);
  const imageSrc = imageError ? getPlaceholderImage(fallbackType || category, width, height) : baseSrc;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const { t } = useTranslations();
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading shimmer */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
      )}
      
      {/* Image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Error state with icon */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">📷</div>
            <div className="text-sm font-medium">{t('common.imageUnavailable')}</div>
          </div>
        </div>
      )}
    </div>
  );
}