# 🚀 Quick Start Guide - Iraq Discovery

## ⚡ Get Started in 3 Steps

### Step 1: Navigate to Project
```bash
cd "C:\Users\HB LAPTOP STORE\4phasteprompt-eventra\eventra-saas"
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Visit: **http://localhost:3000/discovery**

---

## 🎯 What You'll See

### Iraq Discovery Homepage
- **Hero Section** with animated image carousel
  - 4 stunning images of Iraq
  - Ken Burns effect (zoom animation)
  - Gradient overlays
  - Floating blob animations
  
- **Stats Ticker**
  - Total Venues
  - Live Events
  - Iraqi Cities
  - Featured Places

- **Filter Bar**
  - **Category Tabs**: All Venues, Events, Hotels, Restaurants, Activities, Services
  - **Month Filter**: 12 months with event counts
  - **Governorate Filter**: 19 Iraqi provinces

- **Venue Cards Grid**
  - Premium card design
  - Hover animations
  - Share functionality
  - Live event indicators

- **Venue Details Modal**
  - Image carousel
  - Full venue information
  - Contact actions (WhatsApp, Website, Booking)

---

## 🛠️ Optional: Database Setup

### If you want live data (optional):

1. **Setup PostgreSQL database**
2. **Configure `.env` file:**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/eventra"
   ```

3. **Run migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

**Note:** If database is not configured, the app will use fallback mock data automatically!

---

## 📱 Test Features

### Language Switching
- Click language selector in navigation
- Test English, Arabic (RTL), Kurdish (RTL)

### Filter Testing
1. Click different **Category Tabs**
2. Select different **Months**
3. Choose **Governorates**
4. See results update in real-time

### Venue Interaction
1. Hover over venue cards (see animations)
2. Click a venue card
3. View modal with image carousel
4. Test navigation arrows
5. Try share button

### Responsive Testing
- Resize browser window
- Test mobile view (< 640px)
- Test tablet view (640-1024px)
- Test desktop view (> 1024px)

---

## 🎨 Customization

### Change Hero Images
Edit `src/app/discovery/HeroSection.tsx`:
```typescript
const HERO_IMAGES = [
  { url: 'YOUR_IMAGE_URL', title: '...', subtitle: '...' }
];
```

### Modify Colors
Update Tailwind classes in components:
- Change `from-amber-500 to-orange-500` to your preferred gradient
- Update `bg-gray-900` for backgrounds

### Add More Governorates
Edit `src/app/discovery/page.tsx`:
```typescript
const GOVERNORATES = [
  'Baghdad', 'Basra', ..., 'YourCity'
];
```

### Adjust Animations
Edit `src/app/globals.css`:
- Modify animation timing
- Change easing functions
- Add new keyframes

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Use different port
npm run dev -- -p 3001
```

### Module Not Found
```bash
npm install
```

### Styles Not Applying
```bash
# Clear cache
Remove-Item -Recurse -Force .next
npm run dev
```

### TypeScript Errors
```bash
npm run type-check
```

---

## 📚 Documentation

- **Full Implementation Details:** `IRAQ_DISCOVERY_IMPLEMENTATION.md`
- **Component API:** See JSDoc comments in each component file
- **API Routes:** Check `src/app/api/` directories

---

## 🎉 Success!

If you see the Iraq Discovery page with:
- ✅ Animated hero section
- ✅ Filter bars
- ✅ Venue cards grid
- ✅ Working interactions

**Congratulations! Your implementation is working perfectly!** 🎊

---

## 🆘 Need Help?

1. Check `IRAQ_DISCOVERY_IMPLEMENTATION.md` for detailed info
2. Review console for errors (F12 in browser)
3. Check terminal output for server errors

---

## 🌟 Next Steps

### Production Deployment
1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Deploy to:**
   - Vercel (recommended for Next.js)
   - Netlify
   - Your own server

### Add Content
1. Add real venue data via API
2. Upload custom images
3. Configure database
4. Add more translations

### Optimize
1. Enable image optimization
2. Configure CDN
3. Setup caching
4. Add analytics

---

**Built with ❤️ for Iraq & Kurdistan**

Enjoy your beautiful Iraq Discovery platform! 🇮🇶✨
