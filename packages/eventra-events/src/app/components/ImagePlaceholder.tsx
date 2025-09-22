'use client';

import { useState } from 'react';

interface ImagePlaceholderProps {
  className?: string;
  gradient?: string;
  icon?: string;
  text?: string;
  onClick?: () => void;
}

export default function ImagePlaceholder({ 
  className = 'w-full h-48', 
  gradient = 'from-blue-500 to-purple-600', 
  icon = '🎪', 
  text,
  onClick 
}: ImagePlaceholderProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`bg-gradient-to-br ${gradient} ${className} flex items-center justify-center relative overflow-hidden cursor-pointer group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute top-8 right-6 w-4 h-4 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-4 left-8 w-6 h-6 bg-white/25 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-8 right-4 w-3 h-3 bg-white/35 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>
      
      {/* Hover Overlay */}
      <div 
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Content */}
      <div className="text-center z-10 transform group-hover:scale-110 transition-transform duration-300">
        <div className="text-6xl mb-2 animate-bounce">{icon}</div>
        {text && (
          <div className="text-white font-semibold text-sm px-3 py-1 bg-black/30 rounded-full backdrop-blur-sm">
            {text}
          </div>
        )}
      </div>
      
      {/* Loading Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  );
}