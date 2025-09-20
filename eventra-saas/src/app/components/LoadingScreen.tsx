'use client';

import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete?: () => void;
  minDisplayTime?: number; // minimum time to show loading screen
}

export default function LoadingScreen({ 
  isLoading, 
  onComplete, 
  minDisplayTime = 2000 
}: LoadingScreenProps) {
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shouldShow, setShouldShow] = useState(isLoading);

  // Welcome messages in three languages
  const welcomeMessages = [
    {
      language: "English",
      message: "Welcome to Iraq",
      subtitle: "Discover Amazing Events",
      flag: "🇮🇶",
      direction: "ltr"
    },
    {
      language: "العربية", 
      message: "أهلاً وسهلاً بكم في العراق",
      subtitle: "اكتشف فعاليات مذهلة",
      flag: "🇮🇶",
      direction: "rtl"
    },
    {
      language: "کوردی",
      message: "بەخێربێن بۆ عێراق",
      subtitle: "ڕووداوی نایاب بدۆزەرەوە",
      flag: "🇮🇶", 
      direction: "rtl"
    }
  ];

  // Rotate languages every 1.5 seconds
  useEffect(() => {
    if (!isLoading) return;
    
    const languageTimer = setInterval(() => {
      setCurrentLanguage(prev => (prev + 1) % welcomeMessages.length);
    }, 1500);

    return () => clearInterval(languageTimer);
  }, [isLoading, welcomeMessages.length]);

  // Progress animation
  useEffect(() => {
    if (!isLoading) return;

    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDisplayTime) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(progressTimer);
      }
    }, 50);

    return () => clearInterval(progressTimer);
  }, [isLoading, minDisplayTime]);

  // Handle completion
  useEffect(() => {
    if (!isLoading) {
      // Wait a short time for smooth transition, then hide
      const timer = setTimeout(() => {
        setShouldShow(false);
        onComplete?.();
      }, 800); // Short delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [isLoading, onComplete]);

  if (!shouldShow) return null;

  const currentMessage = welcomeMessages[currentLanguage];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes representing Iraqi culture */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rotate-45 opacity-20 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg opacity-20 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        {/* Palm tree silhouettes */}
        <div className="absolute bottom-0 left-10 opacity-10">
          <div className="text-6xl text-green-400">🌴</div>
        </div>
        <div className="absolute bottom-0 right-16 opacity-10">
          <div className="text-5xl text-green-400">🌴</div>
        </div>
        
        {/* Architectural elements inspired by Iraqi heritage */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 border-4 border-yellow-400/30 rounded-full animate-spin-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-20 h-20 border-4 border-cyan-400/30 rotate-45 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Flag and Country */}
        <div className="mb-8 animate-fadeInScale">
          <div className="text-8xl mb-4 animate-bounce">
            {currentMessage.flag}
          </div>
          <div className="text-white/60 text-lg font-medium tracking-wide">
            REPUBLIC OF IRAQ • جمهورية العراق • كۆماری عێراق
          </div>
        </div>

        {/* Welcome Message */}
        <div 
          className={`mb-8 transition-all duration-500 ${currentMessage.direction === 'rtl' ? 'text-right' : 'text-left'}`}
          key={currentLanguage}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-fadeInScale">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {currentMessage.message}
            </span>
          </h1>
          <p className="text-2xl text-white/90 font-light animate-fadeInUp">
            {currentMessage.subtitle}
          </p>
          <div className="mt-4 text-sm text-white/60 font-medium">
            {currentMessage.language}
          </div>
        </div>

        {/* IraqEvents Branding */}
        <div className="mb-8 animate-fadeInUp">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-bold text-xl">IraqEvents</span>
            <div className="text-white/60">•</div>
            <span className="text-white/80 text-sm">Event Platform</span>
          </div>
        </div>

        {/* Cultural Icons */}
        <div className="mb-8 flex justify-center gap-6 text-4xl animate-fadeInUp">
          <div className="animate-bounce" style={{animationDelay: '0s'}}>🎭</div>
          <div className="animate-bounce" style={{animationDelay: '0.2s'}}>🎪</div>
          <div className="animate-bounce" style={{animationDelay: '0.4s'}}>🎨</div>
          <div className="animate-bounce" style={{animationDelay: '0.6s'}}>🎵</div>
          <div className="animate-bounce" style={{animationDelay: '0.8s'}}>🏛️</div>
        </div>

        {/* Loading Progress */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>Loading Events Platform...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="h-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>

        {/* Heritage Quote */}
        <div className="mt-8 animate-fadeInUp">
          <div className="text-white/50 text-sm italic max-w-lg mx-auto">
&quot;From the cradle of civilization to the digital age - connecting communities through events&quot;
          </div>
        </div>
      </div>

      {/* Bottom decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/40 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
          <span>Powered by Iraqi Innovation</span>
          <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}