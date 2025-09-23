import React, { useState, useRef, useEffect } from 'react'
import { useI18n } from '../src/contexts/I18nContext'
import { LanguageFlag, LanguageIndicators } from '../src/components/FlagIcons'
import { ChevronDownIcon } from './icons'
import { type Locale } from '../i18n/locales'

interface LanguageSwitcherProps {
  // Backward compatibility props (optional)
  currentLang?: Locale
  onLangChange?: (lang: Locale) => void
  // Style options
  variant?: 'dropdown' | 'buttons'
  showFlags?: boolean
  showNative?: boolean
  className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  currentLang: propCurrentLang,
  onLangChange: propOnLangChange,
  variant = 'dropdown',
  showFlags = true,
  showNative = false,
  className = ''
}) => {
  const { locale, switchLanguage, t, isRTL } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Use context locale or prop locale
  const currentLang = propCurrentLang || locale
  const handleLangChange = propOnLangChange || switchLanguage

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [wrapperRef])

  // Handle language selection with smooth transition
  const handleSelect = async (lang: Locale) => {
    if (lang === currentLang) {
      setIsOpen(false)
      return
    }

    setIsTransitioning(true)
    setIsOpen(false)
    
    // Small delay for smooth UX
    setTimeout(() => {
      handleLangChange(lang)
      setIsTransitioning(false)
    }, 150)
  }

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, lang?: Locale) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (lang) {
        handleSelect(lang)
      } else {
        setIsOpen(!isOpen)
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Button group variant
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center space-x-1 ${isRTL ? 'space-x-reverse' : ''} ${className}`}>
        {Object.entries(LanguageIndicators).map(([code, info]) => {
          const isActive = code === currentLang
          return (
            <button
              key={code}
              data-testid={`lang-${code}`}
              onClick={() => handleSelect(code as Locale)}
              disabled={isTransitioning}
              className={`
                relative flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              onKeyDown={(e) => handleKeyDown(e, code as Locale)}
              aria-label={`Switch to ${info.native}`}
            >
              {showFlags && (
                <span className={`${showNative ? 'mr-2' : ''} ${isRTL ? 'ml-2 mr-0' : ''}`}>
                  <LanguageFlag language={code as Locale} width={20} height={14} />
                </span>
              )}
              {showNative ? info.native : info.code}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant (default)
  const currentLangInfo = LanguageIndicators[currentLang]
  
  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        data-testid={`lang-switcher`}
        onClick={() => !isTransitioning && setIsOpen(!isOpen)}
        onKeyDown={(e) => handleKeyDown(e)}
        disabled={isTransitioning}
        className={`
          flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium 
          bg-white shadow-sm transition-all duration-200
          ${isTransitioning 
            ? 'opacity-50 cursor-not-allowed' 
            : 'text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isOpen ? 'border-blue-400 shadow-md' : ''}
        `}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Current language: ${currentLangInfo.native}. Click to change language`}
      >
        {showFlags && (
          <span className={`flex-shrink-0 ${showNative ? 'mr-3' : 'mr-2'} ${isRTL ? 'ml-3 mr-0' : ''}`}>
            <LanguageFlag 
              language={currentLang} 
              width={24} 
              height={16} 
              className="rounded shadow-sm"
            />
          </span>
        )}
        
        <span className="flex-1 text-left">
          {showNative ? currentLangInfo.native : currentLangInfo.code}
        </span>
        
        <ChevronDownIcon 
          className={`w-4 h-4 ml-2 transition-transform duration-200 ${isRTL ? 'mr-2 ml-0' : ''} ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
        
        {isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && !isTransitioning && (
        <div 
          className={`
            absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 rounded-lg shadow-lg bg-white 
            ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200
          `}
        >
          <div className="py-2" role="menu" aria-orientation="vertical">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              {t('language')}
            </div>
            
            {Object.entries(LanguageIndicators).map(([code, info]) => {
              const isActive = code === currentLang
              return (
                <button
                  key={code}
                  data-testid={`lang-${code}`}
                  onClick={() => handleSelect(code as Locale)}
                  onKeyDown={(e) => handleKeyDown(e, code as Locale)}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm transition-colors duration-150
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    focus:outline-none focus:bg-gray-50
                  `}
                  role="menuitem"
                  aria-label={`Switch to ${info.native}`}
                >
                  {showFlags && (
                    <span className={`flex-shrink-0 mr-3 ${isRTL ? 'ml-3 mr-0' : ''}`}>
                      <LanguageFlag 
                        language={code as Locale} 
                        width={24} 
                        height={16} 
                        className="rounded shadow-sm"
                      />
                    </span>
                  )}
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium">{info.native}</div>
                    <div className="text-xs text-gray-500">{info.code}</div>
                  </div>
                  
                  <div className={`flex items-center ml-3 ${isRTL ? 'mr-3 ml-0' : ''}`}>
                    <span className="text-xs text-gray-400 mr-2">
                      {info.direction.toUpperCase()}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
