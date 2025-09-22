# Eventra - Event Management Platform 🎪

A modern, full-stack SaaS application for creating, managing, and sharing events. Built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## 🌟 Features

- **User Authentication**: Secure registration and login with NextAuth.js
- **Event Management**: Full CRUD operations for events
- **Public Event Pages**: Each event gets a beautiful, shareable URL
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern UI**: Built with Tailwind CSS and modern design principles

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), easily upgradeable to PostgreSQL
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS v4
- **Build Tool**: Turbopack for ultra-fast builds

## 📱 Usage

1. **Sign Up**: Create an account on the registration page
2. **Create Events**: Use the dashboard to create new events with details
3. **Manage Events**: Edit or delete existing events
4. **Share Events**: Each event gets a public URL you can share with anyone

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab
2. Import your project on Vercel
3. Add environment variables:
   - `DATABASE_URL`: Your database connection string
   - `NEXTAUTH_SECRET`: A random secret string
   - `NEXTAUTH_URL`: Your production domain

## 🔒 Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

## 🧪 Health & i18n Checks

- Health: visit http://localhost:3000/api/health to verify environment and database connectivity
- i18n: run `npm run i18n:check` to ensure all translation keys exist across locales (en, ar, ku)

## 🗃️ Database Scripts

- Generate Prisma client: `npm run db:generate`
- Local dev migration (iterative): `npm run db:migrate`
- Production-style deploy: `npm run db:deploy`
- Seed data: `npm run db:seed`
- One-command setup (deploy + seed): `npm run db:setup`

## 📈 Production Ready

- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Production build optimized
- ✅ Database migrations
- ✅ Error handling
- ✅ Responsive design

**Eventra** - Making event management simple and beautiful. 🎉
