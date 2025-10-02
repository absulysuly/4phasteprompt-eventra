# 🎨 Visual Design Guide: Iraq Discovery PWA
## Complete UI/UX Specifications for Eventra Platform

---

> **Purpose**: This document provides pixel-perfect visual specifications for all UI components, design patterns, and UX flows for the Iraq Discovery PWA. Use this as your visual reference when implementing or reviewing designs.

---

## 📋 Table of Contents

1. [Mobile-First Layout Structure](#mobile-first-layout-structure)
2. [Component Specifications](#component-specifications)
3. [Design System](#design-system)
4. [Responsive Breakpoints](#responsive-breakpoints)
5. [Animation & Micro-interactions](#animation--micro-interactions)
6. [Visual Hierarchy](#visual-hierarchy)
7. [Accessibility Visual Guidelines](#accessibility-visual-guidelines)
8. [RTL Design Considerations](#rtl-design-considerations)

---

## 1. Mobile-First Layout Structure

### 📱 Complete Page Layout (Mobile 375px)

```
┌─────────────────────────────────┐ ← Screen width: 375px
│  TOP BAR (48px)                 │
│  Logo | Search | Profile        │
├─────────────────────────────────┤
│  LANGUAGE SELECTOR (36px)       │
│  [AR] [KU] [EN]                 │ ← Pill-style toggles
├─────────────────────────────────┤
│  HERO SECTION (200px mobile)    │
│  • Background Image (parallax)  │
│  • Overlay gradient             │
│  • "Discover Iraq" headline     │
│  • "Explore Now" CTA            │
├─────────────────────────────────┤
│  PRICING/RESULTS STRIP (48px)   │
│  Live: 234 Events | 1.2k Places │ ← Auto-scroll ticker
├─────────────────────────────────┤
│  GOVERNORATE FILTER (56px)      │
│  [All] [Baghdad] [Basra] [...]  │ ← Horizontal scroll
│  Snap scroll with momentum      │
├─────────────────────────────────┤
│  CATEGORY TABS (64px)           │
│  [🎉 Events] [🏨 Hotels] [...]  │ ← Icons + labels
│  Icon: 24px, Label: 14px        │
├─────────────────────────────────┤
│  CONTENT GRID                   │
│  ┌──────────────────┐           │
│  │ Event Card       │           │ ← Full width - 32px margin
│  │ • Square Image   │           │ ← 1:1 ratio
│  │ • Title (2 lines)│           │ ← 16px font
│  │ • Location       │           │ ← 14px font + icon
│  │ • Date/Time      │           │ ← 14px font + icon
│  │ [Share] [View]   │           │ ← Action buttons
│  └──────────────────┘           │
│  ┌──────────────────┐           │
│  │ Event Card       │           │
│  └──────────────────┘           │
│                                 │
│  [Load More]                    │ ← Infinite scroll trigger
│                                 │
└─────────────────────────────────┘
```

### 💻 Desktop Layout (1440px)

```
┌───────────────────────────────────────────────────────────┐
│  TOP BAR (64px)                                           │
│  Logo (40px) | Search (expandable) | Lang | Profile      │
├───────────────────────────────────────────────────────────┤
│  HERO SECTION (280px desktop)                            │
│  • Larger background image                               │
│  • Centered content (max-width: 900px)                   │
│  • "Discover Iraq" (48px font)                           │
│  • Two-column CTAs                                       │
├───────────────────────────────────────────────────────────┤
│  PRICING/RESULTS STRIP (48px)                            │
│  Static centered: 🎉 234 Events  🏨 1.2k Hotels  etc.    │
├───────────────────────────────────────────────────────────┤
│  GOVERNORATE FILTER (56px)                               │
│  All visible (no scroll) - centered grid layout          │
├───────────────────────────────────────────────────────────┤
│  CATEGORY TABS (64px)                                    │
│  Fixed row of 6 - evenly spaced - no scroll             │
├───────────────────────────────────────────────────────────┤
│  CONTENT GRID (max-width: 1400px, centered)              │
│  ┌────────┬────────┬────────┬────────┐                  │
│  │ Event  │ Event  │ Event  │ Event  │ ← 4 columns      │
│  │ Card   │ Card   │ Card   │ Card   │ ← 20px gap       │
│  ├────────┼────────┼────────┼────────┤                  │
│  │ Event  │ Event  │ Event  │ Event  │                  │
│  │ Card   │ Card   │ Card   │ Card   │                  │
│  └────────┴────────┴────────┴────────┘                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Component Specifications

### 2.1 Top Bar (Navigation Header)

**Mobile (48px height)**
```
┌─────────────────────────────────┐
│ [Logo] ──────── [🔍] [👤]      │
│  32px           24px  24px      │
└─────────────────────────────────┘
```

**Desktop (64px height)**
```
┌───────────────────────────────────────────────┐
│ [Logo]  [Search────────]  [AR KU EN]  [👤]   │
│  40px   expandable 300px   pills     32px     │
└───────────────────────────────────────────────┘
```

**Specifications**:
- Background: `bg-white` with `backdrop-blur-lg`
- Border: `border-b border-slate-200`
- Position: `sticky top-0 z-50`
- Shadow: `shadow-sm`
- Padding: `px-4` (mobile), `px-8` (desktop)

**Logo**:
- Size: 32×32px (mobile), 40×40px (desktop)
- Format: SVG preferred, PNG with transparent background
- Alt text: "Eventra - Iraq Discovery"

**Search Icon** (Mobile):
- Icon: Magnifying glass (Heroicons outline)
- Size: 24×24px
- Color: `text-slate-600`
- Tap target: 44×44px (includes padding)
- Action: Opens full-screen search overlay

**Profile Icon**:
- Icon: User circle (Heroicons outline)
- Size: 24×24px (mobile), 32×32px (desktop)
- Color: `text-slate-600`
- Tap target: 44×44px

---

### 2.2 Language Selector

**Pill-Style Toggle Buttons**

```
┌─────────────────────────────────┐
│  [العربية] [کوردی] [English]  │ ← Mobile: centered
└─────────────────────────────────┘

Each pill:
┌──────────┐
│ العربية  │ ← Active: gradient fill + white text
└──────────┘
Height: 36px
Padding: px-4 py-2
Border radius: rounded-full (9999px)
Font: 14px medium weight
Gap: 8px between pills
```

**States**:

**Active**:
- Background: `bg-gradient-to-r from-blue-600 to-indigo-600`
- Text: `text-white`
- Font weight: `font-semibold`
- Shadow: `shadow-md`

**Inactive**:
- Background: `bg-white`
- Border: `border-2 border-slate-300`
- Text: `text-slate-700`
- Font weight: `font-medium`
- Hover: `border-slate-400` + `bg-slate-50`

**Transition**: `transition-all duration-150 ease-in-out`

**Position**:
- Mobile: Directly below top bar, centered
- Desktop: Integrated into top bar (right side, before profile)

---

### 2.3 Hero Section (Condensed)

**Mobile (200px height)**
```
┌─────────────────────────────────┐
│  ╔════════════════════════════╗ │
│  ║ Background Image (WebP)    ║ │
│  ║ Overlay: gradient          ║ │
│  ║                            ║ │
│  ║  "Discover Iraq"           ║ │ ← 28px font, white, bold
│  ║  Events, Hotels & More     ║ │ ← 16px font, white, medium
│  ║                            ║ │
│  ║  [Explore Now →]           ║ │ ← Button, 16px font
│  ╚════════════════════════════╝ │
└─────────────────────────────────┘
```

**Desktop (280px height)**
```
┌───────────────────────────────────────────────┐
│  ╔══════════════════════════════════════════╗ │
│  ║ Background Image (WebP, parallax)        ║ │
│  ║ Overlay: from-slate-900/80 to transparent║ │
│  ║                                          ║ │
│  ║          "Discover Iraq"                 ║ │ ← 48px font
│  ║     Events, Hotels & Restaurants         ║ │ ← 20px font
│  ║                                          ║ │
│  ║   [Explore Now →]  [View All →]         ║ │ ← Two CTAs
│  ╚══════════════════════════════════════════╝ │
└───────────────────────────────────────────────┘
```

**Specifications**:

**Background Images**:
- Format: WebP with PNG fallback
- Size: 1920×1080px (desktop), 750×1334px (mobile)
- Compression: 85% quality
- Examples: Baghdad skyline, Erbil Citadel, Basra canals, Najaf shrine
- Auto-rotate: Every 5 seconds with 1s fade transition

**Overlay Gradient**:
- Direction: `bg-gradient-to-t` (bottom to top)
- Colors: `from-slate-900/80 via-slate-900/50 to-transparent`

**Headline**:
- Font size: `clamp(28px, 5vw, 48px)`
- Font weight: `font-bold`
- Color: `text-white`
- Text shadow: `shadow-2xl` or custom `text-shadow: 0 2px 4px rgba(0,0,0,0.3)`
- Letter spacing: `tracking-tight`

**Subheadline**:
- Font size: `clamp(16px, 3vw, 20px)`
- Font weight: `font-medium`
- Color: `text-white opacity-90`
- Margin top: `mt-2`

**CTA Button**:
- Background: `bg-gradient-to-r from-blue-600 to-indigo-600`
- Padding: `px-8 py-4`
- Border radius: `rounded-xl`
- Font: `text-lg font-semibold`
- Shadow: `shadow-lg`
- Hover: `hover:from-blue-700 hover:to-indigo-700` + `hover:shadow-xl`
- Transition: `transition-all duration-150`

---

### 2.4 Pricing/Results Strip (Live Stats Ticker)

**Mobile (Auto-scrolling marquee)**
```
┌─────────────────────────────────┐
│ 🎉 234 Events • 🏨 1.2k Hotels • │ ← Continuous scroll
│ 🍽️ 3.5k Restaurants • 🎯 890... │
└─────────────────────────────────┘
```

**Desktop (Static centered)**
```
┌───────────────────────────────────────────────┐
│  🎉 234 Live Events  |  🏨 1.2k Hotels  |     │
│  🍽️ 3.5k Restaurants  |  🎯 890 Activities    │
└───────────────────────────────────────────────┘
```

**Specifications**:
- Height: 48px
- Background: `bg-white`
- Border: `border-b border-slate-200`
- Shadow: `shadow-sm`
- Font size: `text-sm` (14px)
- Font weight: `font-medium`
- Color: `text-slate-700`
- Emoji size: 16×16px (inline)
- Divider: `|` with `text-slate-300`
- Padding: `px-4 py-3`

**Animation (Mobile)**:
- Use CSS `@keyframes marquee`
- Speed: 30 seconds for full loop
- Direction: Right to left (RTL: left to right)
- Continuous: No pause

**Update Frequency**:
- Fetch new stats every 30 seconds
- Smooth fade transition (300ms) when numbers change

---

### 2.5 Governorate Filter Bar

**Mobile Layout**
```
┌─────────────────────────────────┐
│ → [All] [Baghdad] [Basra] [Erb→│ ← Horizontal scroll
└─────────────────────────────────┘
```

**Desktop Layout**
```
┌───────────────────────────────────────────────┐
│ [All] [Baghdad] [Basra] [Erbil] [Kirkuk]     │
│ [Najaf] [Karbala] [Sulaymaniyah] [Duhok]     │
│ [Anbar] [Diyala] [Wasit] [Saladin] [Babil]   │
│ [Dhi Qar] [Maysan] [Qadisiyyah] [Muthanna]   │
└───────────────────────────────────────────────┘
```

**Chip Specifications**:

**Inactive Chip**:
```
┌──────────┐
│ Baghdad  │
└──────────┘
Background: bg-white
Border: border-2 border-slate-300
Text: text-slate-700
Padding: px-4 py-2
Border radius: rounded-full
Font: text-sm font-medium (14px)
Height: 40px
Min-width: fit-content
```

**Active Chip**:
```
┌──────────┐
│ Baghdad  │ ← Gradient background
└──────────┘
Background: bg-gradient-to-r from-blue-600 to-indigo-600
Border: none
Text: text-white
Padding: px-4 py-2
Border radius: rounded-full
Font: text-sm font-semibold (14px)
Shadow: shadow-md
Height: 40px
```

**Hover State** (Inactive):
- Background: `bg-slate-50`
- Border: `border-slate-400`
- Cursor: `cursor-pointer`
- Transform: `scale-105`

**Layout**:
- Height: 56px (container)
- Padding: `px-4 py-2`
- Gap: 8px between chips
- Mobile: `overflow-x-auto snap-x snap-mandatory`
- Desktop: `flex flex-wrap justify-center`

**Scroll Behavior (Mobile)**:
- Snap to: Each chip
- Momentum: Enabled
- Scroll padding: 16px on each side
- Hide scrollbar: `scrollbar-hide` (custom utility)

**Position**:
- Sticky: `sticky top-64px` (below top bar)
- Z-index: `z-40`
- Background: `bg-white`
- Border: `border-b border-slate-200`

---

### 2.6 Category Tabs (Sessions List)

**Mobile Layout**
```
┌─────────────────────────────────┐
│ → [🎉 Events] [🏨 Hotels] [🍽️→ │ ← Horizontal scroll
│      (234)        (456)          │
└─────────────────────────────────┘
```

**Desktop Layout**
```
┌───────────────────────────────────────────────┐
│ [🎉 Events] [🏨 Hotels] [🍽️ Rest.] [☕ Cafés]│
│    (234)       (456)       (345)      (189)   │
│ [🏛️ Tourism] [🏢 Companies]                   │
│     (123)         (67)                         │
└───────────────────────────────────────────────┘
```

**Tab Specifications**:

**Structure**:
```
┌─────────────┐
│  🎉  Events │ ← Icon (24×24px) + Label
│     (234)   │ ← Count badge
└─────────────┘
```

**Inactive Tab**:
- Background: `bg-transparent`
- Border: `border-b-4 border-transparent`
- Text: `text-slate-600`
- Font: `text-sm font-medium` (14px)
- Padding: `px-4 py-3`
- Height: 64px
- Icon color: `text-slate-500`
- Badge: `text-slate-500 text-xs`

**Active Tab**:
- Background: `bg-gradient-to-r from-pink-500 to-pink-600` (varies by category)
- Border: None
- Text: `text-white`
- Font: `text-sm font-semibold` (14px)
- Padding: `px-6 py-3`
- Border radius: `rounded-xl`
- Shadow: `shadow-lg`
- Icon color: `text-white`
- Badge: `text-white text-xs font-bold`

**Hover State** (Inactive):
- Background: `bg-slate-100`
- Border: `border-b-4 border-slate-300`
- Text: `text-slate-800`

**Category Colors** (Active state):
- Events: `from-pink-500 to-pink-600`
- Hotels: `from-blue-500 to-blue-600`
- Restaurants: `from-orange-500 to-orange-600`
- Cafés: `from-amber-500 to-amber-600`
- Tourism: `from-purple-500 to-purple-600`
- Companies: `from-green-500 to-green-600`

**Icons**:
- Size: 24×24px
- Style: Outline (Heroicons or emoji)
- Position: Above label (mobile) or left of label (desktop)

**Count Badge**:
- Font: `text-xs` (12px)
- Padding: `px-2 py-1`
- Border radius: `rounded-full`
- Position: Below label or inline
- Active: White text on transparent
- Inactive: Gray text

**Layout**:
- Height: 64px (container)
- Gap: 12px between tabs (mobile), 16px (desktop)
- Mobile: Horizontal scroll with snap
- Desktop: Fixed row, evenly spaced

**Position**:
- Sticky: `sticky top-120px` (below filter bar)
- Z-index: `z-30`
- Background: `bg-white`
- Border: `border-b border-slate-200`

---

### 2.7 Event Card (Content Cards)

**Mobile Card (Full width)**
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │ [25 JAN]            │ │ ← Date badge overlay
│ │                     │ │
│ │   SQUARE IMAGE      │ │ ← 1:1 ratio, 343×343px
│ │   (optimized)       │ │
│ │                     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🎉 Music Festival   │ │ ← Category + title
│ │ Two line title max  │ │ ← 16px font, 2 lines
│ │                     │ │
│ │ 📍 Baghdad Central  │ │ ← Location, 14px
│ │ 🕐 7:00 PM - 11 PM  │ │ ← Time, 14px
│ │                     │ │
│ │ [Share] [Details →] │ │ ← Action buttons
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Desktop Card (Grid layout)**
```
┌──────────────┐
│ ┌──────────┐ │
│ │ [25 JAN] │ │
│ │          │ │
│ │  IMAGE   │ │ ← 320×320px
│ │          │ │
│ └──────────┘ │
│ 🎉 Festival  │
│ Title 2lines │
│ 📍 Baghdad   │
│ 🕐 7:00 PM   │
│ [Share][→]   │
└──────────────┘
```

**Specifications**:

**Container**:
- Background: `bg-white`
- Border radius: `rounded-2xl`
- Shadow: `shadow-lg`
- Border: `border border-slate-200`
- Padding: None (image full width)
- Hover: `hover:shadow-xl hover:-translate-y-1`
- Transition: `transition-all duration-150`

**Image Section**:
- Aspect ratio: `1:1` (square)
- Size: 343×343px (mobile), 320×320px (desktop)
- Object fit: `object-cover`
- Border radius: `rounded-t-2xl`
- Lazy loading: `loading="lazy"`
- Format: WebP with JPG fallback
- Optimization: 80% quality

**Date Badge** (Overlay):
- Position: `absolute top-4 left-4`
- Background: `bg-pink-600`
- Text: `text-white`
- Padding: `px-3 py-2`
- Border radius: `rounded-lg`
- Font: `text-sm font-bold` (14px)
- Shadow: `shadow-md`
- Format: "25 JAN" or "25 كانون" (localized)

**Content Section**:
- Padding: `p-4` (16px all sides)
- Gap: `gap-2` (8px between elements)

**Category + Title**:
- Category: Emoji or icon (20×20px) + text
- Title: `text-lg font-semibold` (18px)
- Color: `text-slate-900`
- Line clamp: 2 lines max
- Line height: `leading-tight` (1.25)

**Location**:
- Icon: 📍 or map pin (16×16px)
- Font: `text-sm` (14px)
- Color: `text-slate-600`
- Format: "{City Name}"

**Time**:
- Icon: 🕐 or clock (16×16px)
- Font: `text-sm` (14px)
- Color: `text-slate-600`
- Format: "7:00 PM - 11:00 PM" (localized)

**Action Buttons**:
- Layout: `flex justify-between`
- Gap: 8px

**Share Button**:
- Background: `bg-slate-100`
- Text: `text-slate-700`
- Padding: `px-4 py-2`
- Border radius: `rounded-lg`
- Font: `text-sm font-medium` (14px)
- Icon: Share icon (16×16px)
- Hover: `bg-slate-200`

**Details Button**:
- Background: `bg-gradient-to-r from-pink-500 to-pink-600`
- Text: `text-white`
- Padding: `px-4 py-2`
- Border radius: `rounded-lg`
- Font: `text-sm font-semibold` (14px)
- Icon: Arrow right (16×16px)
- Hover: `from-pink-600 to-pink-700`

**Grid Layout**:
- Mobile: `grid-cols-1` (1 column, full width)
- Tablet: `grid-cols-2` (2 columns)
- Desktop: `grid-cols-4` (4 columns)
- Gap: `gap-4` (mobile 16px), `gap-5` (desktop 20px)
- Max width: `max-w-[1400px] mx-auto`
- Padding: `px-4` (mobile), `px-8` (desktop)

---

## 3. Design System

### 3.1 Color Palette

**Primary Gradients**:
```css
/* Main Brand */
--primary: linear-gradient(to right, #2563EB, #4F46E5);
/* from-blue-600 to-indigo-600 */

/* Category Colors */
--events: linear-gradient(to right, #EC4899, #DB2777);
/* from-pink-500 to-pink-600 */

--hotels: linear-gradient(to right, #3B82F6, #2563EB);
/* from-blue-500 to-blue-600 */

--restaurants: linear-gradient(to right, #F97316, #EA580C);
/* from-orange-500 to-orange-600 */

--cafes: linear-gradient(to right, #F59E0B, #D97706);
/* from-amber-500 to-amber-600 */

--tourism: linear-gradient(to right, #A855F7, #9333EA);
/* from-purple-500 to-purple-600 */

--companies: linear-gradient(to right, #10B981, #059669);
/* from-green-500 to-green-600 */
```

**Color Swatches** (Visual Reference):
```
Primary Blue:
████████  #2563EB (blue-600)
████████  #4F46E5 (indigo-600)

Events Pink:
████████  #EC4899 (pink-500)
████████  #DB2777 (pink-600)

Hotels Blue:
████████  #3B82F6 (blue-500)
████████  #2563EB (blue-600)

Restaurants Orange:
████████  #F97316 (orange-500)
████████  #EA580C (orange-600)

Cafés Amber:
████████  #F59E0B (amber-500)
████████  #D97706 (amber-600)

Tourism Purple:
████████  #A855F7 (purple-500)
████████  #9333EA (purple-600)

Companies Green:
████████  #10B981 (green-500)
████████  #059669 (green-600)
```

**Neutral Colors**:
```
Background:
████████  #FFFFFF (white) - Main background
████████  #F9FAFB (slate-50) - Secondary background
████████  #F1F5F9 (slate-100) - Tertiary background

Text:
████████  #111827 (slate-900) - Primary text
████████  #374151 (slate-700) - Secondary text
████████  #6B7280 (slate-500) - Tertiary text

Borders:
████████  #E5E7EB (slate-200) - Light border
████████  #D1D5DB (slate-300) - Medium border
████████  #9CA3AF (slate-400) - Dark border
```

**Semantic Colors**:
```
Success:
████████  #10B981 (green-500)

Error:
████████  #EF4444 (red-500)

Warning:
████████  #F59E0B (amber-500)

Info:
████████  #3B82F6 (blue-500)
```

### 3.2 Typography

**Font Families**:
```css
/* English */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Arabic */
font-family: 'Noto Sans Arabic', 'Tahoma', 'Arial', sans-serif;

/* Kurdish */
font-family: 'Noto Kufi Arabic', 'Tahoma', 'Arial', sans-serif;
```

**Font Scale** (With Visual Size Reference):
```
Display 1:  clamp(36px, 6vw, 64px)  ██████████████ Main hero
Display 2:  clamp(28px, 5vw, 48px)  ████████████ Section hero
H1:         clamp(24px, 4vw, 36px)  ██████████ Page title
H2:         clamp(20px, 3vw, 28px)  ████████ Section title
H3:         clamp(18px, 2.5vw, 24px)██████ Subsection
Body Large: 18px                     █████ Lead paragraph
Body:       16px                     ████ Default text
Body Small: 14px                     ███ Secondary text
Caption:    12px                     ██ Labels, badges
Tiny:       10px                     █ Fine print
```

**Font Weights**:
```
Light (300):   ─────────
Normal (400):  ──────────
Medium (500):  ████──────
Semibold (600):████████──
Bold (700):    ██████████
```

**Line Heights**:
```css
--leading-none:     1       /* Headlines */
--leading-tight:    1.25    /* Titles */
--leading-snug:     1.375   /* Short text */
--leading-normal:   1.5     /* Body text */
--leading-relaxed:  1.625   /* Long-form */
--leading-loose:    2       /* Spaced text */
```

**Letter Spacing**:
```css
--tracking-tighter: -0.05em  /* Large headlines */
--tracking-tight:   -0.025em /* Headlines */
--tracking-normal:   0em     /* Body text */
--tracking-wide:     0.025em /* Uppercase */
--tracking-wider:    0.05em  /* Wide caps */
```

### 3.3 Spacing System

**Visual Spacing Scale**:
```
Space 1:  ▌ 4px      Tight spacing
Space 2:  ▌▌ 8px     Between inline elements
Space 3:  ▌▌▌ 12px   Small gap
Space 4:  ▌▌▌▌ 16px  Default mobile gap ⭐
Space 5:  ▌▌▌▌▌ 20px Default desktop gap ⭐
Space 6:  ▌▌▌▌▌▌ 24px Medium gap
Space 8:  ▌▌▌▌▌▌▌▌ 32px Large gap
Space 10: ▌▌▌▌▌▌▌▌▌▌ 40px Extra large gap
Space 12: ▌▌▌▌▌▌▌▌▌▌▌▌ 48px Section spacing
Space 16: ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌ 64px Major section
```

**Common Spacing Patterns**:
```
Card Padding:
Mobile:  p-4 (16px all sides)
Desktop: p-6 (24px all sides)

Section Margins:
Mobile:  my-8 (32px top/bottom)
Desktop: my-12 (48px top/bottom)

Grid Gaps:
Mobile:  gap-4 (16px)
Desktop: gap-5 (20px)

Container Padding:
Mobile:  px-4 (16px left/right)
Desktop: px-8 (32px left/right)
```

### 3.4 Border Radius

**Visual Radius Scale**:
```
None:     □ 0px
SM:       ▢ 4px       Buttons, inputs
Default:  ▢ 8px       Cards, small
MD:       ▢ 12px      Medium cards
LG:       ▢ 16px      Large cards
XL:       ▢ 20px      Hero sections
2XL:      ▢ 24px      Main containers ⭐
Full:     ● 9999px    Pills, badges
```

### 3.5 Shadows

**Visual Shadow Scale**:
```
SM:       ▓░░░░ Subtle depth
Default:  ▓▓░░░ Light shadow
MD:       ▓▓▓░░ Medium shadow ⭐
LG:       ▓▓▓▓░ Strong shadow
XL:       ▓▓▓▓▓ Very strong shadow
2XL:      ▓▓▓▓▓▓ Maximum depth
```

**Shadow Specifications**:
```css
--shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
--shadow:     0 1px 3px rgba(0,0,0,0.1);
--shadow-md:  0 4px 6px rgba(0,0,0,0.1);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.1);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.1);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.25);
```

---

## 4. Responsive Breakpoints

### 📱 Breakpoint System

```
Mobile (Default):  320px - 639px   ▌ Base styles
SM (Small tablet): 640px - 767px   ▌▌ sm: prefix
MD (Tablet):       768px - 1023px  ▌▌▌ md: prefix
LG (Desktop):      1024px - 1279px ▌▌▌▌ lg: prefix
XL (Large):        1280px - 1535px ▌▌▌▌▌ xl: prefix
2XL (X-Large):     1536px+         ▌▌▌▌▌▌ 2xl: prefix
```

### 📐 Layout Changes Per Breakpoint

**Grid Columns**:
```
Mobile:       1 column   [████████████]
Tablet (md):  2 columns  [██████][██████]
Desktop (lg): 4 columns  [███][███][███][███]
```

**Container Max Width**:
```
Mobile:    100% (no max)
SM:        640px
MD:        768px
LG:        1024px
XL:        1280px
2XL:       1400px ⭐ (content container)
```

**Font Size Scaling**:
```
                Mobile    Tablet    Desktop
Display:        36px      48px      64px
H1:             24px      28px      36px
H2:             20px      24px      28px
Body:           16px      16px      16px
```

**Spacing Scaling**:
```
                Mobile    Desktop
Card Gap:       16px      20px
Section Margin: 32px      48px
Container Pad:  16px      32px
```

---

## 5. Animation & Micro-interactions

### ⚡ Timing Functions

**Visual Timing Reference**:
```
Fast (150ms):    ━━━━━━━━━━ Instant feedback
Normal (300ms):  ━━━━━━━━━━━━━━━━━━━━ Standard
Slow (500ms):    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Smooth
```

**Easing Functions**:
```css
--ease-linear:     linear                    /* Constant speed */
--ease-in:         cubic-bezier(0.4,0,1,1)   /* Slow start */
--ease-out:        cubic-bezier(0,0,0.2,1)   /* Slow end */
--ease-in-out:     cubic-bezier(0.4,0,0.2,1) /* Slow both */
--ease-bounce:     cubic-bezier(0.68,-0.55,0.265,1.55) /* Bounce */
```

### 🎬 Common Animations

**Hover Effects**:
```css
/* Button Hover */
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  transition: all 150ms ease-out;
}

/* Card Hover */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 30px rgba(0,0,0,0.1);
  transition: all 150ms ease-out;
}

/* Link Hover */
.link:hover {
  color: #2563EB;
  transition: color 150ms ease-out;
}
```

**Focus States**:
```css
/* Focus Ring */
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
  transition: outline 150ms ease-out;
}

/* Button Focus */
.button:focus-visible {
  ring: 4px;
  ring-color: rgba(59, 130, 246, 0.5);
  ring-offset: 2px;
}
```

**Loading States**:
```css
/* Skeleton Loading */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  background: linear-gradient(90deg, 
    #F1F5F9 25%, 
    #E2E8F0 50%, 
    #F1F5F9 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Fade Transitions**:
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 300ms ease-out;
}

/* Fade Out */
@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}
```

**Slide Transitions**:
```css
/* Slide Up (Modal) */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal {
  animation: slideUp 300ms ease-out;
}

/* Slide In (Drawer) */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

### 🔄 Scroll Animations

**Infinite Scroll Trigger**:
```css
/* Intersection Observer Target */
.scroll-trigger {
  height: 100px;
  visibility: hidden;
}

/* When in view */
.scroll-trigger.visible {
  visibility: visible;
}
```

**Parallax Effect**:
```css
/* Hero Background Parallax */
.hero-bg {
  transform: translateY(calc(var(--scroll) * 0.5));
  transition: transform 0ms linear;
}
```

---

## 6. Visual Hierarchy

### 📊 Z-Index Scale

**Visual Layer Stack**:
```
Layer 5 (z-50):  ████████████ Top Bar (sticky)
Layer 4 (z-40):  ██████████ Filter Bar (sticky)
Layer 3 (z-30):  ████████ Category Tabs (sticky)
Layer 2 (z-20):  ██████ Modals, Overlays
Layer 1 (z-10):  ████ Dropdowns, Tooltips
Base (z-0):      ██ Default content
Below (z--1):    ░ Background elements
```

**Specific Z-Index Values**:
```css
--z-below:    -1    /* Background decorations */
--z-base:      0    /* Content */
--z-dropdown:  10   /* Dropdowns, tooltips */
--z-modal:     20   /* Modals, drawers */
--z-tabs:      30   /* Category tabs */
--z-filter:    40   /* Filter bar */
--z-header:    50   /* Top navigation */
--z-toast:     60   /* Notifications */
```

### 🎨 Visual Weight

**Element Hierarchy** (from highest to lowest attention):
```
1. Primary CTA Buttons        ████████████ Most prominent
2. Hero Headlines              ██████████ Very prominent
3. Active Navigation           ████████ Prominent
4. Card Images                 ██████ Notable
5. Body Headings               ████ Clear
6. Body Text                   ██ Standard
7. Secondary Text              ░ Subtle
8. Disabled Elements           ░░ Minimal
```

**Visual Strategies**:
- **Size**: Larger = More important
- **Weight**: Bolder = More important
- **Color**: Saturated = More important
- **Position**: Top/Center = More important
- **Contrast**: Higher = More important

---

## 7. Accessibility Visual Guidelines

### ♿ WCAG 2.1 AA Compliance

**Color Contrast Ratios**:
```
Large Text (≥18px regular, ≥14px bold):
Minimum:    3:1   ███░░░░
AAA:        4.5:1 ██████░

Normal Text (<18px):
Minimum:    4.5:1 ██████░
AAA:        7:1   ████████

Non-text (icons, buttons):
Minimum:    3:1   ███░░░░
```

**Passing Color Combinations**:
```
✅ White (#FFFFFF) on Blue (#2563EB)     = 5.12:1
✅ Slate 900 (#111827) on White          = 17.87:1
✅ Slate 700 (#374151) on White          = 10.46:1
✅ White on Pink (#DB2777)               = 4.72:1
✅ White on Orange (#EA580C)             = 5.31:1
```

**Failing Combinations**:
```
❌ Slate 400 (#9CA3AF) on White          = 2.85:1 (too low)
❌ Yellow (#F59E0B) on White             = 1.93:1 (too low)
```

### 👁️ Visual Focus Indicators

**Focus Ring Specifications**:
```
┌──────────────────┐
│                  │
│  [Focused Item]  │ ← 2px solid ring
│                  │ ← 2px offset
└──────────────────┘
   ▔▔▔▔▔▔▔▔▔▔▔▔  ← Focus ring

Color: #3B82F6 (blue-500)
Width: 2px
Offset: 2px
Border radius: Same as element
```

**Keyboard Navigation Path**:
```
Sequential focus order (left to right, top to bottom):
1. Logo
2. Search
3. Language Selector
4. Profile Menu
5. Filter Chips (left to right)
6. Category Tabs (left to right)
7. Content Cards (left to right, row by row)
8. Action Buttons (Share, Details)
```

### 🔤 Text Readability

**Line Length**:
- Optimal: 50-75 characters per line
- Maximum: 90 characters per line

**Paragraph Spacing**:
- Between paragraphs: 1.5em (24px for 16px text)
- Between sections: 2em (32px for 16px text)

**Link Styles** (not just color):
```
Default:    Underline + Blue color
Hover:      Bolder + Darker blue
Active:     Bold + Darkest blue
Visited:    Purple color (optional)
```

---

## 8. RTL Design Considerations

### 🔄 Right-to-Left Layout

**Arabic/Kurdish Interface**:
```
LTR (English):              RTL (Arabic):
┌────────────────┐          ┌────────────────┐
│ ☰ Logo      👤│          │👤      Logo ☰ │
├────────────────┤          ├────────────────┤
│ Text aligns ← │          │ → Text aligns  │
│ left          │          │          right │
└────────────────┘          └────────────────┘
```

**Mirrored Elements**:
- Navigation: Right to left
- Icons: Arrows flip direction
- Gradients: Right to left
- Shadows: Flip direction
- Scroll: Start from right

**Non-Mirrored Elements**:
- Images: Don't flip
- Videos: Don't flip
- Numbers: Keep LTR (123 not 321)
- Logos: Don't flip
- Maps: Don't flip

**CSS Implementation**:
```css
/* LTR (English) */
[dir="ltr"] {
  text-align: left;
  direction: ltr;
}

[dir="ltr"] .card {
  margin-left: 16px;
  padding-left: 24px;
}

/* RTL (Arabic/Kurdish) */
[dir="rtl"] {
  text-align: right;
  direction: rtl;
}

[dir="rtl"] .card {
  margin-right: 16px; /* Was margin-left */
  padding-right: 24px; /* Was padding-left */
}

/* Logical Properties (Recommended) */
.card {
  margin-inline-start: 16px; /* Auto-flips in RTL */
  padding-inline-start: 24px; /* Auto-flips in RTL */
}
```

**Icon Direction**:
```
LTR: →  ▶  ⏩  ⏭
RTL: ←  ◀  ⏪  ⏮

Use CSS transform:
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1); /* Horizontal flip */
}
```

---

## 📏 Component Size Reference Chart

### Mobile (375px width)
```
Component                Height    Width         Notes
─────────────────────────────────────────────────────────
Top Bar                  48px      100%          Sticky
Language Selector        36px      Auto          Centered
Hero Section            200px      100%          Full width
Stats Strip              48px      100%          Scrolling
Governorate Filter       56px      100% + scroll Snap scroll
Category Tabs            64px      100% + scroll Sticky
Event Card              ~450px     343px         Full-width
  - Image               343px      343px         1:1 ratio
  - Content             ~110px     343px         Padding included
```

### Desktop (1440px width)
```
Component                Height    Width         Notes
─────────────────────────────────────────────────────────
Top Bar                  64px      100%          Sticky
Language Selector        36px      Auto          In header
Hero Section            280px      100%          Full width
Stats Strip              48px      100%          Static
Governorate Filter       56px      1400px        Max width
Category Tabs            64px      1400px        Fixed row
Event Card              ~400px     320px         4-col grid
  - Image               320px      320px         1:1 ratio
  - Content             ~80px      320px         Padding included
Content Container       Auto       1400px        Max width
```

---

## 🎯 Quick Reference: Component Checklist

When implementing any component, ensure:

- [ ] **Responsive**: Mobile (375px), Tablet (768px), Desktop (1440px)
- [ ] **RTL Support**: Flips correctly for Arabic/Kurdish
- [ ] **Color Contrast**: Meets WCAG AA (4.5:1 for text)
- [ ] **Focus States**: Visible 2px blue ring with 2px offset
- [ ] **Hover States**: Subtle transform + shadow change
- [ ] **Loading States**: Skeleton or spinner
- [ ] **Error States**: Red color + error message
- [ ] **Empty States**: Helpful message + illustration
- [ ] **Touch Targets**: Minimum 44×44px
- [ ] **Font Sizes**: 16px minimum for body text
- [ ] **Spacing**: Uses 4px grid (4, 8, 12, 16, etc.)
- [ ] **Border Radius**: Consistent (rounded-2xl for cards)
- [ ] **Shadows**: Appropriate depth (shadow-lg for cards)
- [ ] **Transitions**: 150ms for hover, 300ms for state changes
- [ ] **Images**: WebP format, 1:1 ratio for social sharing

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-02  
**Status**: Complete Visual Specification  
**Use With**: AI_STUDIO_MASTER_GUIDE.md + AI_STUDIO_PROMPTS.md

---

**Next Steps**: 
1. Use this guide as visual reference during implementation
2. Share with designers for mockup creation
3. Reference during code reviews for design consistency
4. Update when design system evolves
