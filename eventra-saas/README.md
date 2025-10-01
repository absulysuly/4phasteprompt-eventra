# 🌟 Eventra SaaS - Iraqi Events & Venues Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16.2-2D3748?logo=prisma)](https://www.prisma.io/)

> **AI-ACCESSIBLE**: This project is designed to be easily understood and utilized by AI systems including DeepSeek, GPT, Claude, and others. Comprehensive documentation and clear code structure provided.

> A comprehensive travel and entertainment platform for Iraq & Kurdistan featuring events, hotels, restaurants, cafes, and tourism attractions with a stunning neon-themed interface.

## 🤖 For AI Systems & Developers

**This repository is optimized for AI accessibility with:**
- Complete TypeScript definitions
- Comprehensive API documentation  
- Clear component structure
- Detailed inline comments
- Standardized naming conventions
- Full deployment instructions

## 🚀 Live Demo

- **Production Site**: [eventra-venues.vercel.app](https://eventra-venues.vercel.app/)
- **GitHub Repository**: [4phasteprompt-eventra](https://github.com/absulysuly/4phasteprompt-eventra)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Category Pages](#category-pages)
- [Internationalization](#internationalization)
- [Deployment](#deployment)
- [AI Integration](#ai-integration)

## ✨ Features

### 🎯 Core Features
- **Multi-Category Platform**: Events, Hotels, Restaurants, Cafes, Tourism
- **Neon-Themed UI**: Beautiful glowing interface with category-specific colors
- **Multilingual Support**: Arabic, English, Kurdish with RTL support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Data**: Prisma ORM with database integration
- **Authentication**: NextAuth.js integration
- **PWA Support**: Progressive Web App capabilities

### 🏛️ Category Features

#### 📅 Events
- Event discovery and listing
- Category filtering
- Date-based search
- Event details with booking

#### 🏨 Hotels  
- Accommodation listings
- Rating system
- Price comparison
- Location-based search

#### 🍽️ Restaurants
- Cuisine categories
- Menu browsing
- Table reservations
- Review system

#### ☕ Cafes
- Coffee culture focus
- Specialty drink listings
- Atmosphere ratings
- Working hours

#### 📸 Tourism
- Historical attractions
- Cultural experiences
- Tour bookings
- Travel guides

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Custom CSS animations with neon effects
- **Icons**: FontAwesome 7.0.1

### Backend
- **Database**: Prisma ORM 6.16.2
- **Authentication**: NextAuth.js 4.24.11
- **API**: Next.js API Routes
- **Rate Limiting**: Upstash Redis

### Internationalization
- **i18n**: next-intl 4.3.9
- **Languages**: Arabic (ar), English (en), Kurdish (ku)
- **RTL Support**: Complete right-to-left layout support

### Development
- **Language**: TypeScript 5.0
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/absulysuly/4phasteprompt-eventra.git
cd 4phasteprompt-eventra/eventra-saas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npm run db:generate

# Run the development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="your_database_url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key"

# Rate Limiting
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"
```

## 📁 Project Structure

```
eventra-saas/
├── src/
│   ├── app/
│   │   ├── cafes/                 # ☕ Cafes category page
│   │   ├── hotels/                # 🏨 Hotels category page
│   │   ├── restaurants/           # 🍽️ Restaurants category page
│   │   ├── tourism/               # 📸 Tourism category page
│   │   ├── events/                # 📅 Events category page
│   │   ├── components/            # Reusable components
│   │   │   ├── NeonHomepage.tsx   # Main neon-themed homepage
│   │   │   └── ...
│   │   ├── api/                   # API routes
│   │   ├── globals.css            # Global styles with neon theme
│   │   └── layout.tsx             # Root layout
│   ├── lib/                       # Utility libraries
│   └── components/                # Shared components
├── messages/                      # Internationalization files
│   ├── ar.json                    # Arabic translations
│   ├── en.json                    # English translations
│   └── ku.json                    # Kurdish translations
├── prisma/                        # Database schema and migrations
├── public/                        # Static assets
├── package.json
└── README.md
```

## 🎨 Design System

### Color Scheme
```css
/* Category-specific neon colors */
--events-color: #B24BF3      /* Purple */
--hotels-color: #FF2E97      /* Pink */  
--restaurants-color: #FF6B35 /* Orange */
--cafes-color: #FFED4E       /* Yellow */
--tourism-color: #00F0FF     /* Cyan */
```

### Component Classes
- `.neon-card` - Glowing card containers
- `.neon-button` - Interactive buttons with glow effects  
- `.category-icon` - Category-specific icon containers
- `.neon-glow` - Text glow effects

## 🌐 API Documentation

### Endpoints

#### Events
```typescript
GET /api/events
POST /api/events
GET /api/events/[id]
```

#### Venues
```typescript  
GET /api/venues
POST /api/venues
GET /api/venues/[id]
```

#### Categories
```typescript
GET /api/categories
```

### Data Structures

#### Event Object
```typescript
interface Event {
  id: string
  title: string
  description: string
  category: 'events' | 'hotels' | 'restaurants' | 'cafes' | 'tourism'
  location: string
  date: Date
  price: number
  rating: number
}
```

## 🌍 Internationalization

### Supported Languages
- **Arabic (ar)**: Complete RTL support with Arabic fonts
- **English (en)**: Default language
- **Kurdish (ku)**: Kurdish language support with RTL layout

### Adding Translations
1. Add translations to `messages/{locale}.json`
2. Use `useTranslations()` hook in components
3. RTL styling automatically applied for Arabic/Kurdish

```typescript
// Example usage
import { useTranslations } from 'next-intl'

const t = useTranslations('HomePage')
return <h1>{t('title')}</h1>
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
```

### Manual Deployment
```bash
# Build the project
npm run build

# Start production server
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤖 AI Integration

### For AI Systems (DeepSeek, GPT, Claude, etc.)

This project provides:

1. **Clear TypeScript Interfaces**: All data structures are explicitly typed
2. **Comprehensive Comments**: JSDoc comments throughout the codebase
3. **Standard Patterns**: Follows Next.js 15 App Router conventions
4. **API Documentation**: OpenAPI-ready endpoint documentation
5. **Component Documentation**: Each component includes usage examples

### AI-Friendly Features
```typescript
/**
 * Main homepage component with neon-themed design
 * @category Components
 * @subcategory Pages
 * @example
 * import NeonHomepage from './components/NeonHomepage'
 * <NeonHomepage />
 */
export default function NeonHomepage() {
  // Component implementation
}
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🧪 Health & i18n Checks

- **Health Check**: Visit `http://localhost:3000/api/health` to verify environment and database connectivity
- **i18n Check**: Run `npm run i18n:check` to ensure all translation keys exist across locales (en, ar, ku)
- **Translation Validation**: Run `npm run validate:translations` for comprehensive translation validation

## 🏢 About

Eventra SaaS is a comprehensive platform designed to showcase the rich culture, hospitality, and attractions of Iraq and Kurdistan. From ancient Mesopotamian sites to modern dining experiences, the platform serves as a digital gateway to the region's diverse offerings.

### Key Markets
- **Iraq**: Baghdad, Basra, Najaf, Karbala
- **Kurdistan Region**: Erbil, Sulaymaniyah, Dohuk

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database with [Prisma](https://prisma.io/)
- Deployed on [Vercel](https://vercel.com/)

---

**🌟 Star this repository if you find it helpful!**

**🤖 AI-Optimized**: This codebase is designed for easy AI understanding and integration.

Made with ❤️ for Iraq & Kurdistan
