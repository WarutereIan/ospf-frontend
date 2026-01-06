# OFSP Frontend Project Overview

## 📋 Current Setup Status

### ✅ Completed Setup

**Tech Stack:**
- **React 19.2.0** with TypeScript
- **Vite 7.2.4** as build tool
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **shadcn/ui** components (base-maia style)
- **Inter font** (via `@fontsource-variable/inter`) ✅ Matches design system!
- **Tabler Icons** for iconography
- **Path aliases** configured (`@/` for `src/`)

**UI Components Available:**
- Alert Dialog
- Badge
- Button
- Card
- Combobox
- Dropdown Menu
- Field (form fields)
- Input
- Input Group
- Label
- Select
- Separator
- Textarea

**Configuration:**
- TypeScript strict mode enabled
- ESLint configured
- Path aliases: `@/components`, `@/lib`, `@/ui`, `@/hooks`
- CSS variables for theming (OKLCH color space)
- Dark mode support structure

### 🎨 Design System Alignment

**Font System:**
- ✅ Inter font already imported and configured
- ✅ Font family set in CSS: `'Inter Variable', sans-serif`
- Matches design system recommendations perfectly!

**Color System:**
- Currently using OKLCH color space (modern approach)
- Need to align with OFSP color palette:
  - Primary Orange: `#FF6B35`
  - Secondary Green: `#16A34A`
  - Status colors (success, warning, error, info)
  - Quality grades (A/B/C)

---

## 🏗️ Architecture Overview

### Backend Architecture (From Documentation)

```
Frontend (React/Vite) 
    ↓
API Gateway (REST + GraphQL)
    ↓
Microservices:
  - User Service (Farmers, Buyers, Officers)
  - Marketplace Service (Orders, Listings)
  - Aggregation Service (Stock In/Out)
  - Peer Monitoring Service (Leaderboards)
  - Notification Service (SMS, Email)
  - Dashboard Service (Analytics)
    ↓
Data Layer:
  - PostgreSQL (Transactional)
  - Redis (Cache, Sessions)
  - S3/Cloudinary (Images)
```

### User Roles & Access Levels

| Role | Count | Key Functions | UI Complexity |
|------|-------|---------------|---------------|
| **OFSP Farmers** | 500-1000 | Post produce, manage orders, view peers | Simple, large text |
| **Buyers** | 50-100 | Browse, place orders, track deliveries | Standard |
| **County Officers** | 10-20 | Monitor, generate reports | Data-dense |
| **Concern Staff** | 5-10 | Full admin, user management | Data-dense |
| **Aggregation Managers** | 4-8 | Stock in/out, quality checks | Quick actions |

---

## 📱 Features to Implement

### 1. Authentication & Onboarding
- [ ] Login/Registration
- [ ] Role-based routing
- [ ] Profile setup
- [ ] Phone verification (for farmers)

### 2. Marketplace Module
- [ ] Product listings (OFSP varieties)
- [ ] Search & filters
- [ ] Product details
- [ ] Order placement
- [ ] Order management
- [ ] Live order tracking (8-stage journey)
- [ ] Escrow payment integration

### 3. Aggregation Center Management
- [ ] Stock in/out tracking
- [ ] Quality grading (A/B/C)
- [ ] Inventory management
- [ ] Photo uploads
- [ ] Real-time inventory display

### 4. Peer Monitoring
- [ ] Leaderboards (sales, revenue, ratings)
- [ ] Performance metrics
- [ ] Sub-county rankings
- [ ] Knowledge sharing features

### 5. Dashboards

**Farmer Dashboard:**
- [ ] My listings
- [ ] Active orders
- [ ] Sales summary
- [ ] Peer rankings
- [ ] Market prices

**Buyer Dashboard:**
- [ ] Browse products
- [ ] My orders
- [ ] Order tracking
- [ ] Saved searches

**Officer Dashboard:**
- [ ] Real-time KPIs
- [ ] Farmer analytics
- [ ] Transaction reports
- [ ] Maps & visualizations
- [ ] Data export

**Aggregation Manager Dashboard:**
- [ ] Stock levels
- [ ] Quality checks
- [ ] Incoming/outgoing stock
- [ ] Inventory alerts

### 6. Multi-Channel Support
- [ ] PWA setup (offline mode)
- [ ] Mobile-responsive design
- [ ] USSD integration (backend)
- [ ] SMS notifications

---

## 🗂️ Recommended Folder Structure

```
src/
├── components/
│   ├── ui/              # shadcn components (existing)
│   ├── layout/          # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── marketplace/     # Marketplace components
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── OrderCard.tsx
│   │   ├── OrderTracking.tsx
│   │   └── QualityBadge.tsx
│   ├── aggregation/     # Aggregation center components
│   │   ├── StockInForm.tsx
│   │   ├── StockOutForm.tsx
│   │   ├── InventoryCard.tsx
│   │   └── QualityGrading.tsx
│   ├── dashboard/       # Dashboard components
│   │   ├── StatsCard.tsx
│   │   ├── Chart.tsx
│   │   ├── Leaderboard.tsx
│   │   └── DataTable.tsx
│   └── common/          # Shared components
│       ├── Loading.tsx
│       ├── ErrorBoundary.tsx
│       └── EmptyState.tsx
├── pages/               # Page components
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── marketplace/
│   │   ├── Browse.tsx
│   │   ├── ProductDetail.tsx
│   │   └── Orders.tsx
│   ├── aggregation/
│   │   ├── StockManagement.tsx
│   │   └── Inventory.tsx
│   ├── dashboard/
│   │   ├── FarmerDashboard.tsx
│   │   ├── BuyerDashboard.tsx
│   │   ├── OfficerDashboard.tsx
│   │   └── ManagerDashboard.tsx
│   └── peer/
│       └── Leaderboard.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── useInventory.ts
│   └── useDashboard.ts
├── lib/
│   ├── utils.ts         # Existing
│   ├── api.ts           # API client
│   ├── auth.ts          # Auth utilities
│   └── constants.ts     # App constants
├── types/               # TypeScript types
│   ├── user.ts
│   ├── order.ts
│   ├── product.ts
│   └── inventory.ts
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
└── App.tsx
```

---

## 🎯 Implementation Priority

### Phase 1: Foundation (Week 1)
1. **Color System Update**
   - Update CSS variables to OFSP colors
   - Create color tokens file
   - Test contrast ratios

2. **Layout Components**
   - Header with navigation
   - Sidebar (role-based)
   - Footer
   - Responsive layout wrapper

3. **Authentication**
   - Login page
   - Registration (role-based)
   - Auth context & routing
   - Protected routes

### Phase 2: Core Features (Week 2-3)
1. **Marketplace**
   - Product listing page
   - Product detail page
   - Order placement flow
   - Order tracking component

2. **Farmer Features**
   - Post produce form
   - My listings page
   - Order management

3. **Buyer Features**
   - Browse & search
   - Cart functionality
   - Order history

### Phase 3: Advanced Features (Week 4)
1. **Aggregation Center**
   - Stock in/out forms
   - Quality grading interface
   - Inventory dashboard

2. **Dashboards**
   - Farmer dashboard
   - Officer dashboard
   - Manager dashboard

3. **Peer Monitoring**
   - Leaderboard component
   - Performance metrics

### Phase 4: Polish (Week 5)
1. **PWA Setup**
   - Service worker
   - Offline mode
   - Install prompt

2. **Optimization**
   - Image optimization
   - Code splitting
   - Performance tuning

3. **Testing & Refinement**
   - User testing
   - Bug fixes
   - Accessibility audit

---

## 🔧 Next Steps

1. **Update Color System**
   - Align CSS variables with OFSP palette
   - Create color utility functions

2. **Set Up Routing**
   - Install React Router (if not already)
   - Create route structure
   - Set up protected routes

3. **Create Layout Components**
   - Header/Navigation
   - Sidebar
   - Main layout wrapper

4. **Build Authentication Flow**
   - Login/Register pages
   - Auth context
   - Token management

5. **Start with Marketplace**
   - Product listing page
   - Product card component
   - Search & filter

---

## 📚 Key Design Decisions

### Typography
- **Font:** Inter (already set up ✅)
- **Base size:** 14px mobile, 16px for farmers
- **Hierarchy:** Clear 4-level heading system

### Colors
- **Primary:** Orange (#FF6B35) - OFSP + warmth
- **Secondary:** Green (#16A34A) - Agriculture
- **Status:** Semantic colors (success, warning, error)

### Responsive Design
- **Mobile-first** approach
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch targets:** Minimum 44x44px

### Accessibility
- **WCAG AA** compliance
- **Keyboard navigation** support
- **Screen reader** friendly
- **High contrast** mode support

---

## 🚀 Getting Started

1. **Review this document** - Understand the scope
2. **Update color system** - Align with OFSP palette
3. **Set up routing** - Install React Router
4. **Create layout** - Header, sidebar, footer
5. **Build auth flow** - Login/register
6. **Start marketplace** - Product listings

---

**Last Updated:** November 2025  
**Status:** Ready for Implementation  
**Next Review:** After Phase 1 completion
