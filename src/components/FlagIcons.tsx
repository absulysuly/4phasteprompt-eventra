import React from 'react'

interface FlagIconProps {
  className?: string
  width?: number
  height?: number
}

// Arabic Flag (Iraq flag - commonly used for Arabic in Iraqi context)
export const ArabicFlag: React.FC<FlagIconProps> = ({ 
  className = '', 
  width = 24, 
  height = 16 
}) => (
  <svg 
    viewBox="0 0 3 2" 
    width={width} 
    height={height} 
    className={`inline-block ${className}`}
    aria-label="Arabic"
  >
    <rect width="3" height="0.67" fill="#CE1126"/>
    <rect y="0.67" width="3" height="0.66" fill="#FFFFFF"/>
    <rect y="1.33" width="3" height="0.67" fill="#000000"/>
    <text 
      x="1.5" 
      y="1.2" 
      fontSize="0.7" 
      textAnchor="middle" 
      fill="#009639" 
      fontWeight="bold"
    >
      الله أكبر
    </text>
  </svg>
)

// Kurdish Flag
export const KurdishFlag: React.FC<FlagIconProps> = ({ 
  className = '', 
  width = 24, 
  height = 16 
}) => (
  <svg 
    viewBox="0 0 3 2" 
    width={width} 
    height={height} 
    className={`inline-block ${className}`}
    aria-label="Kurdish"
  >
    {/* Kurdish flag colors: red, white, green with sun symbol */}
    <rect width="3" height="0.67" fill="#ED1C24"/>
    <rect y="0.67" width="3" height="0.66" fill="#FFFFFF"/>
    <rect y="1.33" width="3" height="0.67" fill="#00A651"/>
    
    {/* Sun symbol */}
    <circle cx="1.5" cy="1" r="0.3" fill="#FFCD00" stroke="#FF6B00" strokeWidth="0.05"/>
    <g stroke="#FF6B00" strokeWidth="0.03">
      {/* Sun rays */}
      <line x1="1.2" y1="1" x2="1.35" y2="1"/>
      <line x1="1.65" y1="1" x2="1.8" y2="1"/>
      <line x1="1.5" y1="0.7" x2="1.5" y2="0.85"/>
      <line x1="1.5" y1="1.15" x2="1.5" y2="1.3"/>
      <line x1="1.29" y1="0.79" x2="1.39" y2="0.89"/>
      <line x1="1.61" y1="1.11" x2="1.71" y2="1.21"/>
      <line x1="1.71" y1="0.79" x2="1.61" y2="0.89"/>
      <line x1="1.39" y1="1.11" x2="1.29" y2="1.21"/>
    </g>
  </svg>
)

// English Flag (Union Jack)
export const EnglishFlag: React.FC<FlagIconProps> = ({ 
  className = '', 
  width = 24, 
  height = 16 
}) => (
  <svg 
    viewBox="0 0 60 30" 
    width={width} 
    height={height} 
    className={`inline-block ${className}`}
    aria-label="English"
  >
    {/* Blue background */}
    <rect width="60" height="30" fill="#012169"/>
    
    {/* White diagonals */}
    <g stroke="#FFFFFF" strokeWidth="6">
      <path d="M0,0 L60,30 M60,0 L0,30" />
    </g>
    
    {/* Red diagonals */}
    <g stroke="#C8102E" strokeWidth="2">
      <path d="M0,0 L60,30 M60,0 L0,30" />
    </g>
    
    {/* White cross */}
    <g stroke="#FFFFFF" strokeWidth="10">
      <path d="M30,0 L30,30 M0,15 L60,15" />
    </g>
    
    {/* Red cross */}
    <g stroke="#C8102E" strokeWidth="6">
      <path d="M30,0 L30,30 M0,15 L60,15" />
    </g>
  </svg>
)

// Language Flag Component - selects appropriate flag based on language code
interface LanguageFlagProps extends FlagIconProps {
  language: 'ar' | 'ku' | 'en'
}

export const LanguageFlag: React.FC<LanguageFlagProps> = ({ 
  language, 
  ...props 
}) => {
  switch (language) {
    case 'ar':
      return <ArabicFlag {...props} />
    case 'ku':
      return <KurdishFlag {...props} />
    case 'en':
      return <EnglishFlag {...props} />
    default:
      return null
  }
}

// Simplified flag emojis for fallback
export const FlagEmojis = {
  ar: '🇮🇶', // Iraq flag for Arabic
  ku: '🏴', // Generic flag for Kurdish (as Kurdish flag emoji is not widely supported)
  en: '🇬🇧'  // UK flag for English
} as const

// Text-based language indicators with cultural context
export const LanguageIndicators = {
  ar: {
    native: 'عَرَبِيّ',
    code: 'AR',
    flag: '🇮🇶',
    direction: 'rtl' as const
  },
  ku: {
    native: 'کوردی',
    code: 'KU', 
    flag: '☀️', // Sun symbol representing Kurdish flag
    direction: 'rtl' as const
  },
  en: {
    native: 'English',
    code: 'EN',
    flag: '🇬🇧',
    direction: 'ltr' as const
  }
} as const

export default LanguageFlag