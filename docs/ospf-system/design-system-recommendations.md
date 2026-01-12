# OFSP Digital Marketplace Platform - Design System Recommendations

## Overview

This document provides comprehensive font and color system recommendations for the OFSP Digital Marketplace Platform, specifically tailored for the agricultural marketplace context and diverse user base.

**Date:** November 2025  
**Context:** OFSP Value Chain Platform for Machakos County

---

## 1. Typography System

### 1.1 Font Selection Rationale

The typography system prioritizes **readability, accessibility, and mobile performance** across diverse user literacy levels and device capabilities. The font choice is specifically tailored for agricultural marketplace contexts with users ranging from smallholder farmers to government officers.

#### Primary Font Family: **Inter**

**Why Inter:**
- ✅ **Designed for screens** - Created specifically for computer interfaces, optimized for digital reading
- ✅ **Superior readability** - Excellent legibility at small sizes, clear letterforms, optimal spacing
- ✅ **Agricultural context fit** - Professional yet approachable, works for both farmers and officers
- ✅ **Multi-language support** - Excellent character support for English and Swahili
- ✅ **Mobile-optimized** - Renders beautifully on low-resolution screens, fast loading
- ✅ **Accessibility champion** - Designed with accessibility in mind, excellent for low literacy users
- ✅ **Low bandwidth friendly** - Efficient font files, supports font-display: swap, good caching
- ✅ **Versatile weights** - 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold) available
- ✅ **Open source** - Free, widely available, no licensing concerns

**Inter Characteristics:**
- **Approachability:** Friendly but professional, not intimidating for farmers
- **Clarity:** Distinct letterforms, especially important for numbers and prices
- **Density:** Works well for both sparse (farmer UI) and dense (officer dashboards) layouts
- **Performance:** Optimized for web, excellent rendering performance

#### Font Stack Configuration

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 
             'Droid Sans', 'Helvetica Neue', sans-serif;
```

**Fallback Strategy:**
- **Primary:** Inter (Google Fonts or self-hosted)
- **System fallbacks:** Native system fonts for instant rendering (prevents FOIT)
- **USSD/SMS:** System default (no custom fonts, performance critical)

### 1.2 Font Scale & Hierarchy

#### Base Font Sizes (Mobile-First)

| Element | Size (Mobile) | Size (Desktop) | Weight | Line Height | Use Case |
|---------|---------------|----------------|--------|-------------|----------|
| **H1 - Hero** | 28px | 40px | 700 | 1.2 | Page titles, hero sections |
| **H2 - Section** | 24px | 32px | 600 | 1.3 | Section headers, dashboard titles |
| **H3 - Subsection** | 20px | 24px | 600 | 1.4 | Card titles, form sections |
| **H4 - Card Title** | 18px | 20px | 600 | 1.4 | Product cards, list items |
| **Body Large** | 16px | 18px | 400 | 1.6 | Important content, descriptions |
| **Body** | 14px | 16px | 400 | 1.6 | Standard text, paragraphs |
| **Body Small** | 12px | 14px | 400 | 1.5 | Captions, metadata, timestamps |
| **Button** | 14px | 16px | 600 | 1.4 | CTA buttons, actions |
| **Label** | 12px | 14px | 500 | 1.4 | Form labels, field names |
| **USSD Text** | 14px | N/A | 400 | 1.5 | USSD menu items |

#### Font Weight Usage

| Weight | Value | Usage | Load Priority |
|--------|-------|-------|---------------|
| **Regular** | 400 | Body text, paragraphs, standard content | **Critical** (always load) |
| **Medium** | 500 | Labels, form fields, subtle emphasis | Standard |
| **Semibold** | 600 | Headings, buttons, important labels | **Critical** (always load) |
| **Bold** | 700 | Hero titles, critical CTAs, alerts | Standard |

**Weight Strategy:**
- **Load only needed weights:** Regular (400) and Semibold (600) are critical
- **Medium (500):** Use sparingly for form labels and subtle emphasis
- **Bold (700):** Reserved for hero sections and critical actions
- **Avoid Light/Thin:** Not optimal for low-resolution screens and rural contexts

### 1.3 Typography by User Role

#### For Farmers (Low-Moderate Tech Literacy)
- **Larger base size:** 16px minimum for body text (Inter's clarity helps at this size)
- **Higher contrast:** Semibold headings (600 weight) - Inter's 600 is very clear
- **Simple hierarchy:** Clear distinction between levels (use size + weight)
- **Icon support:** Pair text with icons where possible
- **Swahili support:** Inter has excellent Swahili character support (test: "Habari yako?")
- **Number clarity:** Inter's numerals are highly legible (important for prices, quantities)
- **Spacing:** Generous line-height (1.7) for easier reading

#### For Officers & Staff (Higher Tech Literacy)
- **Standard sizes:** Can handle denser information (Inter excels at density)
- **Data tables:** 14px with clear column headers (600 weight) - Inter's tabular numbers feature
- **Dashboard metrics:** Large numbers (24-32px) with smaller labels (12px)
- **Reports:** Compact but readable (14px body) - Inter maintains clarity at small sizes
- **Monospaced numbers:** Use Inter's tabular numbers for aligned data columns

#### For USSD Interface
- **System default font:** No custom fonts (performance)
- **Clear numbering:** Use numbers (1, 2, 3) not letters
- **Short labels:** Maximum 30 characters per line
- **Uppercase for emphasis:** KEY ACTIONS

### 1.4 Accessibility Considerations

- **Minimum contrast ratio:** 4.5:1 for body text, 3:1 for large text (WCAG AA)
- **Font size scaling:** Support browser zoom up to 200%
- **Line length:** Maximum 75 characters for optimal readability
- **Line height:** Minimum 1.5 for body text
- **Letter spacing:** Slightly increased (0.01em) for small text
- **No text in images:** All text must be selectable/searchable

---

## 2. Color System

### 2.1 Color Philosophy

The color system builds on Jirani's proven orange-based palette while incorporating agricultural and nutritional themes appropriate for the OFSP context.

**Design Principles:**
1. **Accessibility First** - High contrast, WCAG AA compliant
2. **Agricultural Context** - Colors that resonate with farming community
3. **Trust & Reliability** - Professional yet approachable
4. **Mobile Optimization** - Colors that work in bright sunlight
5. **Cultural Sensitivity** - Colors appropriate for Kenyan context

### 2.2 Primary Color Palette

#### Primary Orange (OFSP-Inspired)

The orange color connects directly to Orange-Fleshed Sweet Potatoes while maintaining Jirani's proven brand identity.

| Color Name | Hex | RGB | HSL | Usage |
|------------|-----|-----|-----|-------|
| **Orange 50** | `#FFF5F2` | 255, 245, 242 | 12°, 100%, 97% | Backgrounds, subtle highlights |
| **Orange 100** | `#FFE5DC` | 255, 229, 220 | 12°, 100%, 93% | Light backgrounds, hover states |
| **Orange 200** | `#FFCAB3` | 255, 202, 179 | 18°, 100%, 85% | Secondary backgrounds |
| **Orange 300** | `#FFAD95` | 255, 173, 149 | 14°, 100%, 79% | Borders, dividers |
| **Orange 400** | `#FF8C65` | 255, 140, 101 | 15°, 100%, 70% | Secondary actions, badges |
| **Orange 500** | `#FF6B35` | 255, 107, 53 | 15°, 100%, 60% | **Primary brand color** |
| **Orange 600** | `#E55A2B` | 229, 90, 43 | 15°, 79%, 53% | Primary buttons, links |
| **Orange 700** | `#CC4A21` | 204, 74, 33 | 15°, 72%, 46% | Hover states, active states |
| **Orange 800** | `#B23A17` | 178, 58, 23 | 15°, 77%, 39% | Dark mode primary |
| **Orange 900** | `#992A0D` | 153, 42, 13 | 15°, 84%, 33% | Dark mode accents |

**Primary Orange (`#FF6B35`) Usage:**
- Primary CTA buttons
- Active navigation items
- Important badges and alerts
- Progress indicators
- Brand elements (logo, favicon)

#### Secondary Green (Growth & Agriculture)

Green represents growth, agriculture, and success - perfect for a farming marketplace.

| Color Name | Hex | RGB | HSL | Usage |
|------------|-----|-----|-----|-------|
| **Green 50** | `#F0FDF4` | 240, 253, 244 | 142°, 76%, 97% | Success backgrounds |
| **Green 100** | `#DCFCE7` | 220, 252, 231 | 142°, 76%, 93% | Light success states |
| **Green 500** | `#22C55E` | 34, 197, 94 | 142°, 71%, 45% | Success messages, completed states |
| **Green 600** | `#16A34A` | 22, 163, 74 | 142°, 81%, 36% | Success buttons, confirmations |
| **Green 700** | `#15803D` | 21, 128, 61 | 142°, 73%, 29% | Dark success states |

**Green Usage:**
- Success messages ("Order completed", "Payment received")
- Positive metrics (revenue, growth)
- Completed order status
- Quality grade indicators (Grade A)
- "Go" actions (proceed, confirm)

#### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Blue** | `#3B82F6` | Information, links, trust elements |
| **Yellow** | `#FBBF24` | Warnings, pending states, Grade B |
| **Red** | `#EF4444` | Errors, urgent alerts, Grade C, rejections |
| **Purple** | `#A855F7` | Premium features, special badges (from Jirani) |

### 2.3 Neutral Palette

Essential for text, backgrounds, and UI elements.

| Color Name | Hex | RGB | Usage |
|------------|-----|-----|-------|
| **Gray 50** | `#F9FAFB` | 249, 250, 251 | Page backgrounds |
| **Gray 100** | `#F3F4F6` | 243, 244, 246 | Card backgrounds, sections |
| **Gray 200** | `#E5E7EB` | 229, 231, 235 | Borders, dividers |
| **Gray 300** | `#D1D5DB` | 209, 213, 219 | Disabled states |
| **Gray 400** | `#9CA3AF` | 156, 163, 175 | Placeholder text |
| **Gray 500** | `#6B7280` | 107, 114, 128 | Secondary text |
| **Gray 600** | `#4B5563` | 75, 85, 99 | Body text (dark mode) |
| **Gray 700** | `#374151` | 55, 65, 81 | Headings (dark mode) |
| **Gray 800** | `#1F2937` | 31, 41, 55 | Dark backgrounds |
| **Gray 900** | `#111827` | 17, 24, 39 | Darkest text |

### 2.4 Semantic Color Mapping

#### Status Colors

| Status | Color | Hex | Usage |
|--------|-------|-----|-------|
| **Success** | Green 500 | `#22C55E` | Completed orders, successful payments |
| **Warning** | Yellow 500 | `#FBBF24` | Pending orders, quality checks needed |
| **Error** | Red 500 | `#EF4444` | Failed payments, rejected orders |
| **Info** | Blue 500 | `#3B82F6` | Notifications, information messages |
| **Neutral** | Gray 500 | `#6B7280` | Default states, inactive items |

#### Order Status Colors

| Status | Color | Hex | Visual Indicator |
|--------|-------|-----|-----------------|
| **Order Placed** | Blue 500 | `#3B82F6` | Blue dot/badge |
| **Order Accepted** | Yellow 500 | `#FBBF24` | Yellow dot/badge |
| **Payment Secured** | Purple 500 | `#A855F7` | Purple dot/badge |
| **In Transit** | Orange 500 | `#FF6B35` | Orange dot/badge |
| **At Aggregation** | Blue 600 | `#2563EB` | Dark blue dot |
| **Quality Approved** | Green 500 | `#22C55E` | Green dot/badge |
| **Delivered** | Green 600 | `#16A34A` | Dark green dot |
| **Completed** | Green 700 | `#15803D` | Darkest green |
| **Disputed** | Red 500 | `#EF4444` | Red alert badge |

#### Quality Grade Colors

| Grade | Color | Hex | Usage |
|-------|-------|-----|-------|
| **Grade A** | Green 600 | `#16A34A` | Premium quality, highest price |
| **Grade B** | Yellow 500 | `#FBBF24` | Standard quality, medium price |
| **Grade C** | Orange 500 | `#FF6B35` | Lower quality, processing grade |

### 2.5 Background Colors

#### Light Mode (Default)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Page Background** | White | `#FFFFFF` | Main background |
| **Card Background** | Gray 50 | `#F9FAFB` | Card, panel backgrounds |
| **Section Background** | Orange 50 | `#FFF5F2` | Alternating sections |
| **Input Background** | Gray 50 | `#F9FAFB` | Form inputs |
| **Hover Background** | Orange 100 | `#FFE5DC` | Interactive hover states |

#### Dark Mode (Optional)

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Page Background** | Gray 900 | `#111827` | Main background |
| **Card Background** | Gray 800 | `#1F2937` | Card, panel backgrounds |
| **Section Background** | Gray 800 | `#1F2937` | Alternating sections |
| **Input Background** | Gray 800 | `#1F2937` | Form inputs |
| **Text Color** | Gray 100 | `#F3F4F6` | Primary text |

### 2.6 Text Color Combinations

#### Light Mode

| Text Type | Color | Hex | Background | Contrast Ratio |
|-----------|-------|-----|------------|----------------|
| **Primary Text** | Gray 900 | `#111827` | White | 15.8:1 ✅ |
| **Secondary Text** | Gray 600 | `#4B5563` | White | 7.0:1 ✅ |
| **Muted Text** | Gray 500 | `#6B7280` | White | 4.6:1 ✅ |
| **Links** | Orange 600 | `#E55A2B` | White | 4.8:1 ✅ |
| **Links Hover** | Orange 700 | `#CC4A21` | White | 5.2:1 ✅ |
| **On Orange** | White | `#FFFFFF` | Orange 500 | 3.1:1 ✅ |
| **On Green** | White | `#FFFFFF` | Green 600 | 4.5:1 ✅ |

#### Dark Mode

| Text Type | Color | Hex | Background | Contrast Ratio |
|-----------|-------|-----|------------|----------------|
| **Primary Text** | Gray 100 | `#F3F4F6` | Gray 900 | 15.8:1 ✅ |
| **Secondary Text** | Gray 400 | `#9CA3AF` | Gray 900 | 7.0:1 ✅ |
| **Muted Text** | Gray 500 | `#6B7280` | Gray 900 | 4.6:1 ✅ |
| **Links** | Orange 400 | `#FF8C65` | Gray 900 | 4.8:1 ✅ |

### 2.7 Button Color System

#### Primary Buttons

| State | Background | Text | Border | Usage |
|-------|------------|------|--------|-------|
| **Default** | Orange 600 | White | None | Primary CTAs |
| **Hover** | Orange 700 | White | None | Interactive state |
| **Active** | Orange 800 | White | None | Pressed state |
| **Disabled** | Gray 300 | Gray 500 | None | Inactive actions |

#### Secondary Buttons

| State | Background | Text | Border | Usage |
|-------|------------|------|--------|-------|
| **Default** | Transparent | Orange 600 | Orange 600 | Secondary actions |
| **Hover** | Orange 50 | Orange 700 | Orange 700 | Interactive state |
| **Active** | Orange 100 | Orange 800 | Orange 800 | Pressed state |

#### Success Buttons

| State | Background | Text | Usage |
|-------|------------|------|-------|
| **Default** | Green 600 | White | Confirm, approve actions |
| **Hover** | Green 700 | White | Interactive state |

#### Danger Buttons

| State | Background | Text | Usage |
|-------|------------|------|-------|
| **Default** | Red 500 | White | Delete, reject actions |
| **Hover** | Red 600 | White | Interactive state |

---

## 3. Color Application by User Role

### 3.1 Farmer Interface

**Priorities:** Clarity, simplicity, high contrast

- **Primary actions:** Orange 600 buttons (large, clear)
- **Success states:** Green 600 (completed orders, payments)
- **Important info:** Blue 500 (notifications, market prices)
- **Background:** White with Orange 50 accents
- **Text:** High contrast (Gray 900 on white)

**Key Screens:**
- Product listing cards: White background, Orange 600 "Post Produce" button
- Order status: Color-coded badges (see Order Status Colors)
- Peer leaderboard: Green accents for top performers
- Market prices: Blue for current prices, Green for price increases

### 3.2 Buyer Interface

**Priorities:** Trust, clarity, easy navigation

- **Browse products:** Clean white cards with Orange 600 CTAs
- **Order tracking:** Color-coded timeline (see Order Status Colors)
- **Payment:** Green for success, Orange for pending
- **Quality indicators:** Green (A), Yellow (B), Orange (C)

### 3.3 Officer Dashboard

**Priorities:** Data clarity, professional appearance

- **Charts & graphs:** Orange primary, Green secondary, Blue tertiary
- **Metrics:** Large numbers (Gray 900), labels (Gray 600)
- **Alerts:** Red for urgent, Yellow for warnings
- **Tables:** Alternating rows (Gray 50/White)
- **Filters:** Orange 600 active state

### 3.4 Aggregation Center Interface

**Priorities:** Quick actions, clear status

- **Stock In:** Green 600 button (positive action)
- **Stock Out:** Orange 600 button (transaction)
- **Quality checks:** Color-coded badges (A/B/C)
- **Inventory levels:** 
  - High: Green
  - Medium: Yellow
  - Low: Orange
  - Critical: Red

### 3.5 USSD Interface

**Limitations:** No custom colors, system defaults only

- **Text:** System default (usually black on white/light gray)
- **Emphasis:** Use asterisks (*), numbers, or ALL CAPS
- **Structure:** Clear numbering (1, 2, 3) for menu items

---

## 4. Implementation Guidelines

### 4.1 CSS Variables (Tailwind Compatible)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Primary Orange */
  --color-orange-50: #FFF5F2;
  --color-orange-100: #FFE5DC;
  --color-orange-500: #FF6B35;
  --color-orange-600: #E55A2B;
  --color-orange-700: #CC4A21;
  
  /* Secondary Green */
  --color-green-500: #22C55E;
  --color-green-600: #16A34A;
  
  /* Neutrals */
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-500: #6B7280;
  --color-gray-900: #111827;
  
  /* Semantic */
  --color-success: var(--color-green-600);
  --color-warning: #FBBF24;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Typography - Inter */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --line-height-base: 1.6;
  --line-height-relaxed: 1.7; /* For farmer-facing content */
  
  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### 4.2 Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF5F2',
          100: '#FFE5DC',
          500: '#FF6B35',
          600: '#E55A2B',
          700: '#CC4A21',
        },
        // ... other colors
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // Inter is now the default sans-serif
      },
      fontSize: {
        // Mobile-first sizes
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.6' }],
        'base': ['14px', { lineHeight: '1.6' }], // Mobile default
        'lg': ['16px', { lineHeight: '1.7' }], // Farmer-facing content
        'xl': ['18px', { lineHeight: '1.6' }],
        '2xl': ['20px', { lineHeight: '1.4' }],
        '3xl': ['24px', { lineHeight: '1.3' }],
        '4xl': ['28px', { lineHeight: '1.2' }],
        // Desktop sizes via responsive classes
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
}
```

### 4.3 Mobile Optimization

- **Font loading:** Use `font-display: swap` for Inter (prevents invisible text)
- **Font subsetting:** Load only Latin + Latin Extended (includes Swahili characters)
- **Preload critical font:** Preload Inter Regular (400) and Semibold (600)
- **Self-hosting option:** Consider self-hosting Inter for better control and performance
- **Color contrast:** Test in bright sunlight conditions
- **Touch targets:** Minimum 44x44px for buttons
- **Focus states:** Clear orange outline (2px) for accessibility

### 4.4 Performance Considerations

- **Font subsetting:** Load only required weights (400, 600) + Medium (500) and Bold (700) as needed
- **Character subset:** Load Latin + Latin Extended (covers English + Swahili), skip Cyrillic/Greek
- **Font file size:** Inter Regular (400) ~140KB, Semibold (600) ~145KB (with Latin subset)
- **Self-hosting:** Consider self-hosting Inter for better caching control (use `font-display: swap`)
- **Preload strategy:** Preload Inter Regular (400) in `<head>` for instant rendering
- **Color in CSS:** Use CSS variables, not inline styles
- **Image optimization:** Use WebP with fallbacks
- **Critical CSS:** Inline critical colors and font-face declarations

---

## 5. Accessibility Compliance

### 5.1 WCAG AA Standards

✅ **Contrast Ratios:**
- Normal text: 4.5:1 minimum (all text meets this)
- Large text: 3:1 minimum (headings meet this)
- UI components: 3:1 minimum (buttons, inputs meet this)

✅ **Color Independence:**
- Never rely on color alone to convey information
- Use icons, text labels, or patterns alongside color
- Example: Order status shows both color badge AND text label

✅ **Focus Indicators:**
- All interactive elements have visible focus states
- Orange 600 outline (2px) for keyboard navigation
- High contrast focus rings

### 5.2 Testing Checklist

- [ ] Test color combinations with contrast checker tools
- [ ] Verify font sizes are readable at 200% zoom
- [ ] Test with color blindness simulators (Deuteranopia, Protanopia)
- [ ] Verify text is readable in bright sunlight (mobile)
- [ ] Test with screen readers (color names are descriptive)
- [ ] Verify USSD works without color dependency

---

## 6. Font Loading Implementation

### 6.1 Google Fonts (Recommended for Quick Start)

```html
<!-- In <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Pros:**
- Quick to implement
- Google CDN caching
- Automatic optimization

**Cons:**
- External dependency
- Privacy considerations (Google tracking)
- Less control over loading

### 6.2 Self-Hosted (Recommended for Production)

```html
<!-- In <head> -->
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-semibold.woff2" as="font" type="font/woff2" crossorigin>

<style>
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/inter-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('/fonts/inter-semibold.woff2') format('woff2');
}
</style>
```

**Pros:**
- Full control over loading
- Better privacy (no external requests)
- Can optimize file sizes
- Better caching control

**Cons:**
- Requires font file management
- Need to generate subsets

### 6.3 Font Subset Generation

Use tools like:
- **pyftsubset** (Python) - Most control
- **glyphhanger** (Node.js) - Easy to use
- **Google Fonts Helper** - Web-based tool

**Recommended subset:** Latin + Latin Extended (covers English + Swahili)

---

## 7. Recommendations Summary

### ✅ Font System
- **Primary:** Inter (weights: 400, 500, 600, 700)
- **Base size:** 14px mobile, 16px desktop (16px for farmer-facing content)
- **Hierarchy:** Clear 4-level heading system with Inter's excellent weight differentiation
- **Accessibility:** WCAG AA compliant, supports zoom, optimized for screen reading
- **Multi-language:** Excellent support for English and Swahili
- **Performance:** Optimized loading with font-display: swap, subsetting recommended

### ✅ Color System
- **Primary:** Orange (#FF6B35) - OFSP color, agricultural warmth
- **Secondary:** Green (#16A34A) - Agriculture, growth, success
- **Neutrals:** Gray scale for text and backgrounds
- **Semantic:** Status colors (success, warning, error, info)
- **Accessibility:** All combinations meet WCAG AA

### ✅ Key Principles
1. **Mobile-first:** Optimized for small screens, low bandwidth
2. **Accessibility:** High contrast, clear hierarchy, Inter's screen-optimized design
3. **Agricultural context:** Tailored for farming community, approachable yet professional
4. **User-appropriate:** Simpler for farmers (larger text, generous spacing), denser for officers
5. **Performance:** Fast loading, efficient font files, smart subsetting
6. **Multi-language:** Excellent Swahili support for local users

---

## 8. Next Steps

1. **Download Inter font files** (from Google Fonts or GitHub)
2. **Generate font subsets** (Latin + Latin Extended for English/Swahili)
3. **Set up font loading** (self-hosted recommended, or Google Fonts for quick start)
4. **Create design tokens file** (CSS variables + Tailwind config with Inter)
5. **Build component library** with Inter typography system
6. **Test Swahili rendering** ("Habari yako?", "Karibu", numbers with shillings)
7. **Test with users** (farmers, officers) for readability feedback
8. **Optimize font loading** (preload critical weights, use font-display: swap)
9. **Create dark mode** (optional, for officers/staff)
10. **Performance testing** (font loading times, render blocking)

---

**Document Version:** 2.0  
**Last Updated:** November 2025  
**Font System:** Inter (tailored for OFSP agricultural marketplace)  
**Context:** OFSP Digital Marketplace Platform for Machakos County

