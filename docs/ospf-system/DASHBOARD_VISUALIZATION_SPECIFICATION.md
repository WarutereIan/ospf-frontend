# OFSP Digital Marketplace Platform
## Dashboard & Screen Visualization Specification

**Document Version:** 1.0  
**Date:** January 13, 2026  
**Status:** Design Specification

---

## Table of Contents

1. [Overview](#1-overview)
2. [Recommended Visualization Libraries](#2-recommended-visualization-libraries)
3. [Farmer Dashboard & Screens](#3-farmer-dashboard--screens)
4. [Buyer Dashboard & Screens](#4-buyer-dashboard--screens)
5. [Aggregation Manager Dashboard & Screens](#5-aggregation-manager-dashboard--screens)
6. [County Officer Dashboard & Screens](#6-county-officer-dashboard--screens)
7. [Project Staff Dashboard & Screens](#7-project-staff-dashboard--screens)
8. [Input Provider Dashboard & Screens](#8-input-provider-dashboard--screens)
9. [Transport Provider Dashboard & Screens](#9-transport-provider-dashboard--screens)
10. [Shared Components & Patterns](#10-shared-components--patterns)
11. [Implementation Guidelines](#11-implementation-guidelines)

---

## 1. Overview

This document specifies the visualizations for every dashboard screen and tab across all user types in the OFSP Digital Marketplace Platform. It complements the Reporting and Visualization Guide by focusing on real-time dashboard displays rather than generated reports.

### Design Principles

1. **Glanceable**: Key metrics visible without scrolling
2. **Actionable**: Visualizations linked to actions
3. **Contextual**: Show comparisons and trends, not just numbers
4. **Responsive**: Work on mobile, tablet, and desktop
5. **Consistent**: Same metric = same visualization across screens

---

## 2. Recommended Visualization Libraries

### 2.1 Primary Recommendation: **Recharts**

**Why Recharts:**
- Built specifically for React
- Declarative API matches React paradigm
- Excellent TypeScript support
- Responsive by default
- Good performance with reasonable data sizes
- Active maintenance and community
- MIT License

```
npm install recharts
```

**Best For:**
- Line charts, area charts, bar charts
- Pie/donut charts
- Composed charts (multi-type)
- Standard dashboard visualizations

---

### 2.2 Alternative Libraries by Use Case

| Use Case | Library | Why |
|----------|---------|-----|
| **Standard Charts** | Recharts | React-native, simple API, responsive |
| **Complex/Advanced** | ECharts (echarts-for-react) | Full-featured, maps, 3D, large datasets |
| **Statistical** | Visx (by Airbnb) | Low-level, highly customizable |
| **Simple Metrics** | Custom with Tailwind CSS | Lightweight, no dependencies |
| **Maps** | React-Leaflet or Mapbox GL | Geographic visualizations |
| **Data Tables** | TanStack Table (React Table) | Sorting, filtering, pagination |
| **Progress/Gauges** | Custom or react-circular-progressbar | Specific UI needs |
| **Animations** | Framer Motion | Smooth transitions |

---

### 2.3 Recommended Stack

```
PRIMARY VISUALIZATION STACK
├── Recharts (v2.x)              — Core charting
├── react-circular-progressbar   — Gauges and circular progress
├── React-Leaflet               — Maps (if needed)
├── TanStack Table              — Data tables
├── Framer Motion               — Animations
└── Tailwind CSS                — Custom visualizations, styling
```

**Installation:**
```bash
npm install recharts react-circular-progressbar @tanstack/react-table framer-motion
npm install react-leaflet leaflet  # If maps needed
```

---

### 2.4 Library Comparison Matrix

| Feature | Recharts | Chart.js | ECharts | Visx |
|---------|----------|----------|---------|------|
| React Integration | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★★ |
| Learning Curve | Easy | Easy | Medium | Hard |
| Customization | Good | Good | Excellent | Excellent |
| Performance | Good | Good | Excellent | Excellent |
| Bundle Size | ~150KB | ~60KB | ~400KB | Varies |
| TypeScript | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| Maps | ✗ | ✗ | ✓ | ✗ |
| 3D Charts | ✗ | ✗ | ✓ | ✗ |
| Documentation | Good | Excellent | Good | Good |

**Recommendation**: Start with Recharts for 90% of needs. Add ECharts only if you need maps or advanced features.

---

## 3. Farmer Dashboard & Screens

### 3.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  FARMER DASHBOARD                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  EARNINGS   │ │  QUANTITY   │ │  QUALITY    │ │  RANKING  │ │
│  │  This Month │ │  Delivered  │ │  Score      │ │           │ │
│  │             │ │             │ │             │ │           │ │
│  │  KES 45,000 │ │   850 kg    │ │   92/100    │ │  Top 15%  │ │
│  │  ▲ +12%     │ │  ▲ +8%      │ │  Grade A    │ │  ████░░   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  ┌────────────────────────────────┐ ┌────────────────────────┐ │
│  │  EARNINGS TREND (6 months)     │ │  QUALITY HISTORY       │ │
│  │  ████                          │ │  ●●●●○  This month     │ │
│  │  ███████                       │ │  ●●●●●  Last month     │ │
│  │  █████████                     │ │  ●●●○○  2 months ago   │ │
│  │  ████████████                  │ │                        │ │
│  │  Simple Bar Chart              │ │  Dot Rating Display    │ │
│  └────────────────────────────────┘ └────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  RECENT DELIVERIES                                         │ │
│  │  ┌──────┬──────────┬────────┬──────────┬─────────────────┐ │ │
│  │  │ Date │ Variety  │ Qty    │ Grade    │ Amount          │ │ │
│  │  ├──────┼──────────┼────────┼──────────┼─────────────────┤ │ │
│  │  │ Today│ Kenya    │ 150 kg │ ✓ A      │ KES 22,500      │ │ │
│  │  │ -2d  │ SPK004   │ 100 kg │ ✓ A      │ KES 12,000      │ │ │
│  │  └──────┴──────────┴────────┴──────────┴─────────────────┘ │ │
│  │  Simple Table with Icons                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Visualization Components

| Element | Visualization | Library | Rationale |
|---------|--------------|---------|-----------|
| Earnings This Month | **Stat Card** with trend arrow | Custom + Tailwind | Simple, glanceable |
| Quantity Delivered | **Stat Card** with trend | Custom + Tailwind | Consistent with earnings |
| Quality Score | **Circular Progress** with grade badge | react-circular-progressbar | Visual score representation |
| Ranking | **Progress Bar** with label | Custom + Tailwind | Position in distribution |
| Earnings Trend | **Simple Bar Chart** (6 bars) | Recharts `<BarChart>` | Monthly comparison |
| Quality History | **Dot Rating** (5 dots per row) | Custom SVG | Simple grade visualization |
| Recent Deliveries | **Simple Table** with icons | TanStack Table or Custom | Scannable list |

#### Code Examples (Recharts)

```tsx
// Earnings Trend - Simple Bar Chart
<BarChart width={400} height={200} data={monthlyEarnings}>
  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
  <YAxis hide />
  <Bar dataKey="amount" fill="#22C55E" radius={[4, 4, 0, 0]} />
  <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
</BarChart>

// Quality Score - Circular Progress
<CircularProgressbar
  value={92}
  text="92"
  styles={buildStyles({
    textSize: '24px',
    pathColor: '#22C55E',
    textColor: '#1F2937',
  })}
/>
```

---

### 3.2 My Produce Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  MY PRODUCE                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────┐ ┌────────────────────────┐ │
│  │  VARIETY BREAKDOWN             │ │  LISTING STATUS        │ │
│  │                                │ │                        │ │
│  │      ████  Kenya (60%)         │ │  ● 3 Active            │ │
│  │      ███   SPK004 (30%)        │ │  ○ 1 Pending           │ │
│  │      █     Kabode (10%)        │ │  ◐ 2 Sold              │ │
│  │                                │ │                        │ │
│  │  Horizontal Stacked Bar        │ │  Status Indicators     │ │
│  └────────────────────────────────┘ └────────────────────────┘ │
│                                                                 │
│  ACTIVE LISTINGS                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ┌────────┐  Kenya, Grade A                               │  │
│  │ │  📦    │  250 kg @ KES 150/kg                          │  │
│  │ │ Image  │  ████████░░ 80% remaining                     │  │
│  │ └────────┘  Listed 3 days ago                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Variety Breakdown | **Horizontal Stacked Bar** | Recharts `<BarChart layout="vertical">` |
| Listing Status | **Colored Dot Indicators** | Custom |
| Stock Remaining | **Linear Progress Bar** | Custom + Tailwind |

---

### 3.3 Orders Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  MY ORDERS                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ Pending │ │ Active  │ │ Complete│ │ Total   │               │
│  │    3    │ │    5    │ │   47    │ │ KES 234K│               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│  Status Count Cards                                             │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ORDER PIPELINE                                            │ │
│  │                                                            │ │
│  │  [Pending] ──▶ [Accepted] ──▶ [In Transit] ──▶ [Delivered] │ │
│  │     3            2              3                0         │ │
│  │                                                            │ │
│  │  Pipeline/Funnel Visualization                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ORDER LIST (Filterable Table)                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Filter: [All ▼] [This Week ▼]                              │ │
│  │                                                            │ │
│  │ #ORD-001 | Kenya 150kg | KES 22,500 | ● In Transit         │ │
│  │ #ORD-002 | SPK004 80kg | KES 9,600  | ○ Pending            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Status Count Cards | **Stat Cards** with colored borders | Custom |
| Order Pipeline | **Horizontal Step/Funnel** | Custom or Recharts Funnel |
| Order List | **Filterable Table** | TanStack Table |

---

### 3.4 Leaderboard Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  PEER LEADERBOARD                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  YOUR POSITION                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  ░░░░░░░░░░░░░░░████░░░░  You are here (Top 15%)          │ │
│  │                  ▲                                         │ │
│  │  Distribution Bar with Position Marker                     │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  TOP PERFORMERS                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🥇 Farmer A ████████████████████ 2,500 kg                 │ │
│  │  🥈 Farmer B ██████████████████   2,200 kg                 │ │
│  │  🥉 Farmer C ████████████████     2,000 kg                 │ │
│  │  4. Farmer D █████████████        1,800 kg                 │ │
│  │  ...                                                       │ │
│  │  15. You    ████████              1,200 kg                 │ │
│  │                                                            │ │
│  │  Horizontal Bar Chart (Ranked)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  CATEGORY RANKINGS                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Volume     │ │   Quality    │ │ Consistency  │            │
│  │   Top 15%    │ │   Top 20%    │ │   Top 10%    │            │
│  │   ████░░░    │ │   ███░░░░    │ │   █████░░    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  Mini Progress Bars                                             │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Position Marker | **Distribution Bar** with marker | Custom SVG |
| Top Performers | **Horizontal Bar Chart** (ranked) | Recharts `<BarChart layout="vertical">` |
| Category Rankings | **Mini Progress Bars** | Custom |

---

### 3.5 Market Info Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  MARKET INFORMATION                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CURRENT PRICES                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Kenya      KES 150/kg  ▲ +5%    ████████████░░░░ (High)   │ │
│  │  SPK004     KES 120/kg  ▼ -2%    █████████░░░░░░░ (Medium) │ │
│  │  Kabode     KES 100/kg  ─ 0%     ███████░░░░░░░░░ (Low)    │ │
│  │                                                            │ │
│  │  Price Cards with Trend Arrows and Range Bars              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  PRICE TREND (Last 30 Days)                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  150 ─ ─ ─ ─ ─ ─ ─ ─╱─────  Kenya                         │ │
│  │  120 ─ ─ ─ ─ ─ ─ ─╱─────────  SPK004                      │ │
│  │  100 ───────────────────────  Kabode                       │ │
│  │                                                            │ │
│  │  Multi-Line Chart                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  DEMAND INDICATOR                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔥 HIGH DEMAND: Kenya variety this week                   │ │
│  │     Best centres: Kangundo, Tala                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Current Prices | **Price Cards** with trend + range bar | Custom |
| Price Trend | **Multi-Line Chart** | Recharts `<LineChart>` |
| Demand Indicator | **Alert/Callout Card** | Custom |

---

## 4. Buyer Dashboard & Screens

### 4.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  BUYER DASHBOARD                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │  SPEND      │ │  ORDERS     │ │  QUANTITY   │ │ SUPPLIERS │ │
│  │  This Month │ │  Active     │ │  Received   │ │           │ │
│  │             │ │             │ │             │ │           │ │
│  │  KES 450K   │ │     12      │ │  3,500 kg   │ │    15     │ │
│  │  ▲ +18%     │ │  3 pending  │ │  ▲ +25%     │ │  +2 new   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  ┌────────────────────────────────┐ ┌────────────────────────┐ │
│  │  SPEND BY VARIETY              │ │  ORDER STATUS          │ │
│  │                                │ │                        │ │
│  │       ┌───┐                    │ │  ████████  Completed   │ │
│  │     ┌─┤   ├─┐  Kenya (55%)     │ │  ████      In Transit  │ │
│  │    ┌┤ │   │ ├┐ SPK004 (30%)    │ │  ██        Processing  │ │
│  │    │└─┴───┴─┘│ Kabode (15%)    │ │  █         Pending     │ │
│  │    └─────────┘                 │ │                        │ │
│  │  Donut Chart                   │ │  Horizontal Bar        │ │
│  └────────────────────────────────┘ └────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SPENDING TREND (12 months)                                │ │
│  │                                        ╱╲                  │ │
│  │                               ╱╲      ╱  ╲                 │ │
│  │                         ╱────╱  ╲────╱    ╲                │ │
│  │              ╱─────────╱                                   │ │
│  │  ───────────╱                                              │ │
│  │  Area Chart with Gradient                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  RECENT ORDERS                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  #ORD-045 | James Mutua | 500kg Kenya A | ● Delivered      │ │
│  │  #ORD-044 | Mary W.     | 200kg SPK004  | ◐ In Transit     │ │
│  │  Table with Status Badges                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Stat Cards | **Stat Cards** with trend | Custom |
| Spend by Variety | **Donut Chart** with legend | Recharts `<PieChart>` |
| Order Status | **Horizontal Bar** | Recharts `<BarChart>` |
| Spending Trend | **Area Chart** with gradient | Recharts `<AreaChart>` |
| Recent Orders | **Table** with badges | TanStack Table |

---

### 4.2 Marketplace Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  MARKETPLACE                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FILTERS (Horizontal)                                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Variety [All ▼] Grade [All ▼] Location [All ▼] Sort [▼]    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PRICE RANGE (Current Market)                              │ │
│  │  ░░░░░░░░████████████░░░░░░  KES 100 - 180/kg              │ │
│  │          ▲ Most listings                                   │ │
│  │  Price Distribution Bar                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  LISTINGS                                                       │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│  │ 📦            │ │ 📦            │ │ 📦            │         │
│  │ Kenya Grade A │ │ SPK004 Gr. A  │ │ Kenya Grade B │         │
│  │ 250 kg        │ │ 180 kg        │ │ 400 kg        │         │
│  │ KES 150/kg    │ │ KES 120/kg    │ │ KES 130/kg    │         │
│  │ ★★★★☆ (4.5)   │ │ ★★★★★ (4.8)   │ │ ★★★★☆ (4.2)   │         │
│  │ 📍 Kangundo   │ │ 📍 Tala       │ │ 📍 Kathiani   │         │
│  │ [Order Now]   │ │ [Order Now]   │ │ [Order Now]   │         │
│  └───────────────┘ └───────────────┘ └───────────────┘         │
│  Product Cards with Star Ratings                                │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Filters | **Select Dropdowns** (horizontal) | Shadcn Select |
| Price Distribution | **Range Bar** with marker | Custom |
| Star Ratings | **Star Display** | Custom SVG or lucide-react |
| Product Cards | **Card Grid** | Custom |

---

### 4.3 My Orders Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  MY ORDERS                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ORDER FUNNEL                                              │ │
│  │                                                            │ │
│  │  ┌──────────────────────────────────────────┐ Placed: 50   │ │
│  │  │██████████████████████████████████████████│              │ │
│  │  └──────────────────────────────────────────┘              │ │
│  │      ┌────────────────────────────────┐ Accepted: 45       │ │
│  │      │████████████████████████████████│                    │ │
│  │      └────────────────────────────────┘                    │ │
│  │          ┌────────────────────────┐ Delivered: 40          │ │
│  │          │████████████████████████│                        │ │
│  │          └────────────────────────┘                        │ │
│  │              ┌────────────────┐ Completed: 38              │ │
│  │              │████████████████│                            │ │
│  │              └────────────────┘                            │ │
│  │  Funnel Chart                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ORDERS BY MONTH                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ████ ████ ████ ████ ████ ████                             │ │
│  │  Jan  Feb  Mar  Apr  May  Jun                              │ │
│  │  Simple Bar Chart                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Order Funnel | **Funnel Chart** | Recharts `<FunnelChart>` or Custom |
| Orders by Month | **Bar Chart** | Recharts `<BarChart>` |

---

### 4.4 Rate Farmers Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  RATE FARMERS                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PENDING RATINGS                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Order #ORD-045 from James Mutua                           │ │
│  │  Kenya 500kg Grade A - Delivered Jan 10                    │ │
│  │                                                            │ │
│  │  Overall:        ☆ ☆ ☆ ☆ ☆                                 │ │
│  │  Quality:        ☆ ☆ ☆ ☆ ☆                                 │ │
│  │  Delivery:       ☆ ☆ ☆ ☆ ☆                                 │ │
│  │  Communication:  ☆ ☆ ☆ ☆ ☆                                 │ │
│  │                                                            │ │
│  │  Interactive Star Ratings                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  MY SUPPLIER RATINGS                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  James Mutua    ★★★★★ (4.9)  12 orders                     │ │
│  │  Mary Wanjiku   ★★★★☆ (4.5)   8 orders                     │ │
│  │  Peter Kamau    ★★★★☆ (4.2)   5 orders                     │ │
│  │                                                            │ │
│  │  Supplier List with Ratings                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Star Input | **Interactive Star Rating** | Custom or react-rating |
| Rating Display | **Star Display** | Custom SVG |

---

## 5. Aggregation Manager Dashboard & Screens

### 5.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  AGGREGATION CENTRE DASHBOARD                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │  CURRENT STOCK  │ │  TODAY'S IN     │ │  TODAY'S OUT    │   │
│  │                 │ │                 │ │                 │   │
│  │   3,500 kg      │ │    450 kg       │ │    280 kg       │   │
│  │   ████████░░    │ │  ▲ From 8       │ │  To 3 orders    │   │
│  │   70% Capacity  │ │    farmers      │ │                 │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────┐ ┌────────────────────────┐ │
│  │  CAPACITY GAUGE                │ │  STOCK BY VARIETY      │ │
│  │                                │ │                        │ │
│  │        ╭───────────╮           │ │  Kenya   ██████████    │ │
│  │      ╱             ╲           │ │  SPK004  █████████     │ │
│  │     ╱      70%      ╲          │ │  Kabode  ████          │ │
│  │    │                 │         │ │                        │ │
│  │    ╰─────────────────╯         │ │  Stacked Horizontal    │ │
│  │  Semi-Circle Gauge             │ │                        │ │
│  └────────────────────────────────┘ └────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STOCK MOVEMENT (7 Days)                                   │ │
│  │           ╱╲    ╱╲                                         │ │
│  │  ────────╱──╲──╱──╲────  Stock In                          │ │
│  │        ──────────────── Stock Out                          │ │
│  │  Mon Tue Wed Thu Fri Sat Sun                               │ │
│  │                                                            │ │
│  │  Dual Line Chart                                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────┐ ┌────────────────────────┐  │
│  │  STOCK AGING                  │ │  QUALITY TODAY         │  │
│  │                               │ │                        │  │
│  │  Fresh (0-3d)  ████████ 60%   │ │      ┌───┐             │  │
│  │  Aging (4-6d)  ████     25%   │ │     ╱ A  ╲ 75%         │  │
│  │  Critical (7+) ██       15%   │ │    │ ███  │            │  │
│  │                               │ │    │ B 20%│            │  │
│  │  Color-coded Bars             │ │    ╲ C 5% ╱            │  │
│  │                               │ │  Pie Chart             │  │
│  └───────────────────────────────┘ └────────────────────────┘  │
│                                                                 │
│  ⚠️ ALERTS                                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🔴 150 kg critical stock (>7 days) - prioritize dispatch  │ │
│  │  🟡 Capacity at 70% - prepare for incoming deliveries      │ │
│  │  Alert Cards                                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Current Stock | **Stat Card** with progress bar | Custom |
| Capacity Gauge | **Semi-Circle Gauge** | react-circular-progressbar or Custom |
| Stock by Variety | **Horizontal Stacked Bar** | Recharts |
| Stock Movement | **Dual Line Chart** | Recharts `<LineChart>` |
| Stock Aging | **Color-coded Horizontal Bars** | Custom with color coding |
| Quality Today | **Pie Chart** | Recharts `<PieChart>` |
| Alerts | **Alert Cards** with icons | Custom |

---

### 5.2 Stock In Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  STOCK IN                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ Today's In   │ │ Farmers      │ │ Avg Quality  │            │
│  │   450 kg     │ │     8        │ │    A (92%)   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                 │
│  TODAY'S DELIVERIES                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Time     Farmer        Variety   Qty    Grade   Status    │ │
│  │  ─────────────────────────────────────────────────────────  │ │
│  │  08:30    James Mutua   Kenya     150kg  ✓ A     ✓ Done    │ │
│  │  09:15    Mary W.       SPK004    80kg   ✓ A     ✓ Done    │ │
│  │  10:00    Peter K.      Kenya     120kg  ⏳ QC   ○ Pending │ │
│  │                                                            │ │
│  │  Table with Status Icons                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  QUALITY CHECK FORM (When Processing)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Grade Selection:  [A ●] [B ○] [C ○]                       │ │
│  │  Visual Grade Selector                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Summary Stats | **Stat Cards** | Custom |
| Deliveries Table | **Table** with status icons | TanStack Table |
| Grade Selection | **Radio Button Group** (styled) | Custom |

---

### 5.3 Inventory Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  INVENTORY MANAGEMENT                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STOCK BY VARIETY & GRADE (Treemap)                        │ │
│  │  ┌─────────────────────────┬───────────────┬─────────────┐ │ │
│  │  │                         │               │             │ │ │
│  │  │    Kenya Grade A        │  Kenya B      │  SPK004 A   │ │ │
│  │  │       1,200 kg          │   400 kg      │   800 kg    │ │ │
│  │  │                         │               │             │ │ │
│  │  ├─────────────────────────┼───────────────┼─────────────┤ │ │
│  │  │  SPK004 B   │ Kabode A  │   Kabode B    │             │ │ │
│  │  │   350 kg    │  200 kg   │    150 kg     │             │ │ │
│  │  └─────────────┴───────────┴───────────────┴─────────────┘ │ │
│  │  Treemap (size = quantity, color = variety)                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  AGING HEATMAP                                             │ │
│  │                                                            │ │
│  │  Batch    Day1  Day2  Day3  Day4  Day5  Day6  Day7+       │ │
│  │  INV-001  🟢    🟢    🟢    🟡    🟡    🔴    🔴           │ │
│  │  INV-002  🟢    🟢    🟡    🟡    🔴    🔴    🔴           │ │
│  │  INV-003  🟢    🟢    🟢    🟢    🟡    🟡    🔴           │ │
│  │                                                            │ │
│  │  Calendar Heatmap (simplified)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  INVENTORY TABLE                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ID       Variety  Grade  Qty    Age   Status  Farmer      │ │
│  │  INV-001  Kenya    A      250kg  3d    🟢      James M.    │ │
│  │  INV-002  SPK004   A      180kg  5d    🟡      Mary W.     │ │
│  │  INV-003  Kenya    B      150kg  8d    🔴      Peter K.    │ │
│  │                                                            │ │
│  │  Sortable Table with Color Status                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Stock Treemap | **Treemap** | Recharts `<Treemap>` |
| Aging Heatmap | **Grid Heatmap** | Custom with colors |
| Inventory Table | **Sortable Table** | TanStack Table |

---

### 5.4 Quality Checks Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  QUALITY CHECKS                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  GRADE DISTRIBUTION (This Month)                           │ │
│  │                                                            │ │
│  │           75%        20%       5%                          │ │
│  │  ┌────────────────┬────────┬────┐                          │ │
│  │  │    Grade A     │ Grade B│ C  │                          │ │
│  │  │    (Green)     │(Yellow)│Red │                          │ │
│  │  └────────────────┴────────┴────┘                          │ │
│  │                                                            │ │
│  │  100% Stacked Bar                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  QUALITY TREND (12 Weeks)                                  │ │
│  │                                                            │ │
│  │  100% ─────────────────────────────                        │ │
│  │   75% ██████████████████████████████  Grade A              │ │
│  │   50% ████████████████████████████                         │ │
│  │   25%                                                      │ │
│  │                                                            │ │
│  │  Stacked Area Chart                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  COMMON DEFECTS                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Pest damage      ████████████  35%                        │ │
│  │  Size variation   ████████      25%                        │ │
│  │  Bruising         ██████        20%                        │ │
│  │  Color issues     ████          15%                        │ │
│  │  Other            ██             5%                        │ │
│  │                                                            │ │
│  │  Horizontal Bar Chart (Sorted)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Grade Distribution | **100% Stacked Bar** | Recharts |
| Quality Trend | **Stacked Area Chart** | Recharts `<AreaChart>` |
| Common Defects | **Horizontal Bar** (sorted) | Recharts |

---

## 6. County Officer Dashboard & Screens

### 6.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  COUNTY OFFICER DASHBOARD                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Farmers │ │ Volume  │ │ Centres │ │ Quality │ │ Value   │   │
│  │  1,245  │ │ 45 tons │ │    8    │ │   82%   │ │ KES 6.7M│   │
│  │ +12 new │ │ ▲ +15%  │ │ active  │ │ Grade A │ │ ▲ +22%  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PRODUCTION BY SUBCOUNTY (Map)                             │ │
│  │                                                            │ │
│  │      ┌─────────┐                                           │ │
│  │      │ Kangundo│ 🟢 15 tons                                │ │
│  │  ┌───┴─────────┴───┐                                       │ │
│  │  │    Kathiani     │ 🟡 8 tons                             │ │
│  │  └───┬─────────┬───┘                                       │ │
│  │      │ Matungulu│ 🟢 12 tons                               │ │
│  │      └─────────┘                                           │ │
│  │                                                            │ │
│  │  Choropleth Map (color = volume)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────┐ ┌────────────────────────────┐ │
│  │  PRODUCTION TREND (12mo)   │ │  FARMER GROWTH             │ │
│  │         ╱╲                 │ │                            │ │
│  │      ╱╱  ╲╲                │ │  1,245 ─────────────●      │ │
│  │   ╱╱╱      ╲╲              │ │  1,100 ────────●           │ │
│  │  ╱            ╲            │ │    950 ────●               │ │
│  │                            │ │    800 ●                   │ │
│  │  Area Chart                │ │                            │ │
│  │                            │ │  Cumulative Line           │ │
│  └────────────────────────────┘ └────────────────────────────┘ │
│                                                                 │
│  TOP PERFORMING CENTRES                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Kangundo Main   ████████████████  95%  utilization        │ │
│  │  Tala Satellite  ██████████████    88%                     │ │
│  │  Kathiani Main   ████████████      75%                     │ │
│  │                                                            │ │
│  │  Benchmark Bars                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Summary Stats | **Stat Cards** | Custom |
| Production Map | **Choropleth Map** | React-Leaflet or ECharts |
| Production Trend | **Area Chart** | Recharts |
| Farmer Growth | **Cumulative Line** | Recharts |
| Centre Performance | **Benchmark Bar Chart** | Custom or Recharts |

---

### 6.2 Farmers Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  FARMERS                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FARMER DEMOGRAPHICS                                       │ │
│  │                                                            │ │
│  │     ▼ Under 35   │████████ 35%                             │ │
│  │     ● 35-50      │██████████████ 45%                       │ │
│  │     ▲ Over 50    │████████ 20%                             │ │
│  │                                                            │ │
│  │     ♀ Women      │████████████ 40%                         │ │
│  │     ♂ Men        │██████████████████ 60%                   │ │
│  │                                                            │ │
│  │  Grouped Horizontal Bars                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FARMER DISTRIBUTION BY WARD                               │ │
│  │                                                            │ │
│  │  Tala         ████████████████████  250 farmers            │ │
│  │  Kangundo     ████████████████      200 farmers            │ │
│  │  Kathiani     ██████████████        175 farmers            │ │
│  │  Mitaboni     ████████████          150 farmers            │ │
│  │  ...                                                       │ │
│  │                                                            │ │
│  │  Horizontal Bar Chart (Sorted)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  FARMER TABLE (Searchable)                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Search: [________________]  Filter: [Ward ▼] [Status ▼]   │ │
│  │                                                            │ │
│  │  Name          Ward      Volume   Quality  Status          │ │
│  │  James Mutua   Tala      2.5t     ★★★★★   Active           │ │
│  │  Mary Wanjiku  Kangundo  2.1t     ★★★★☆   Active           │ │
│  │                                                            │ │
│  │  Searchable/Filterable Table                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Demographics | **Grouped Horizontal Bars** | Recharts |
| Distribution by Ward | **Sorted Horizontal Bar** | Recharts |
| Farmer Table | **Searchable Table** | TanStack Table |

---

### 6.3 Centres Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  AGGREGATION CENTRES                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CENTRE MAP                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    🏢 Main Centre                          │ │
│  │                    🏪 Satellite Centre                     │ │
│  │                                                            │ │
│  │        🏢 Kangundo                                         │ │
│  │       /    \                                               │ │
│  │     🏪      🏪                                              │ │
│  │    Tala   Matungulu                                        │ │
│  │                                                            │ │
│  │  Map with Centre Markers                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  CAPACITY OVERVIEW                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Kangundo Main  [████████░░] 80% │ 4,000/5,000 kg          │ │
│  │  Kathiani Main  [██████░░░░] 60% │ 3,000/5,000 kg          │ │
│  │  Tala Satellite [█████████░] 90% │   900/1,000 kg          │ │
│  │                                                            │ │
│  │  Progress Bars with Labels                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  CENTRE COMPARISON (Radar Chart)                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Throughput                                │ │
│  │                     ╱╲                                     │ │
│  │                   ╱    ╲                                   │ │
│  │   Utilization  ╱        ╲  Quality                         │ │
│  │               ╲          ╱                                 │ │
│  │                 ╲      ╱                                   │ │
│  │                   ╲  ╱                                     │ │
│  │                  Farmers                                   │ │
│  │                                                            │ │
│  │  Radar Chart comparing centres                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Centre Map | **Map with Markers** | React-Leaflet |
| Capacity Overview | **Progress Bars** | Custom |
| Centre Comparison | **Radar Chart** | Recharts `<RadarChart>` |

---

### 6.4 Reports Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  REPORTS                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  QUICK METRICS                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │ Production  │ │   Revenue   │ │  Quality    │          │ │
│  │  │  vs Target  │ │  vs Target  │ │  vs Target  │          │ │
│  │  │  [====|==]  │ │  [=====|=]  │ │  [======|]  │          │ │
│  │  │   85%       │ │    92%      │ │    78%      │          │ │
│  │  │             │ │             │ │             │          │ │
│  │  │ Bullet Chart│ │ Bullet Chart│ │ Bullet Chart│          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  AVAILABLE REPORTS                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📊 Monthly Production Report    [Generate] [Schedule]     │ │
│  │  📈 Farmer Performance Report    [Generate] [Schedule]     │ │
│  │  📋 Quality Compliance Report    [Generate] [Schedule]     │ │
│  │  🗺️ Geographic Distribution      [Generate] [Schedule]     │ │
│  │                                                            │ │
│  │  Report List with Actions                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| KPI vs Target | **Bullet Charts** | Custom or Recharts |
| Report List | **Action List** | Custom |

---

## 7. Project Staff Dashboard & Screens

### 7.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  PROJECT STAFF DASHBOARD (M&E)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  PROGRAM INDICATORS                                         ││
│  │                                                             ││
│  │  Beneficiaries    [████████████░░░░░░] 75% of 2,000 target  ││
│  │  Volume (tonnes)  [██████████████░░░░] 85% of 100t target   ││
│  │  Quality (Gr A)   [████████████████░░] 92% of 80% target    ││
│  │  Income increase  [██████████░░░░░░░░] 60% of 50% target    ││
│  │                                                             ││
│  │  Target Progress Bars                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────────┐ ┌────────────────────────────┐│
│  │  BENEFICIARY GROWTH          │ │  GEOGRAPHIC REACH          ││
│  │                              │ │                            ││
│  │         ●───────────────●    │ │   [Map with coverage]      ││
│  │       ●                      │ │   ■ Active (65%)           ││
│  │     ●                        │ │   □ Target (35%)           ││
│  │   ●                          │ │                            ││
│  │  Cumulative Line             │ │  Coverage Map              ││
│  └──────────────────────────────┘ └────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  INDICATOR SPARKLINES (All KPIs at a glance)               ││
│  │                                                             ││
│  │  Farmers    ╱╱╱───  1,500  │  Volume   ╱╱╱╱──  45t         ││
│  │  Quality    ───────  82%   │  Income   ╱╱─────  +25%       ││
│  │  Centres    ────╱──  8     │  Trans.   ╱╱╱╱╱╱  2,340       ││
│  │                                                             ││
│  │  Sparkline Grid                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────────┐ ┌────────────────────────────┐│
│  │  OUTCOME COMPARISON          │ │  VALUE CHAIN FLOW          ││
│  │                              │ │                            ││
│  │   Before ●───────● After     │ │  Farmers ──▶ Centres ──▶   ││
│  │          +45%                │ │     ↓           ↓          ││
│  │   ●─────────────● +32%       │ │  1,500       45 tons       ││
│  │                              │ │                    ↓       ││
│  │  Slope Chart                 │ │              Buyers: 25    ││
│  │                              │ │  Sankey/Flow Diagram       ││
│  └──────────────────────────────┘ └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Target Progress | **Progress Bars** with targets | Custom |
| Beneficiary Growth | **Cumulative Line** | Recharts |
| Geographic Reach | **Choropleth Map** | React-Leaflet / ECharts |
| Indicator Sparklines | **Sparkline Grid** | Recharts `<LineChart>` (mini) |
| Outcome Comparison | **Slope Chart** | Custom SVG or Recharts |
| Value Chain Flow | **Sankey Diagram** | Recharts `<Sankey>` or ECharts |

---

## 8. Input Provider Dashboard & Screens

### 8.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT PROVIDER DASHBOARD                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │   REVENUE   │ │   ORDERS    │ │  PRODUCTS   │ │ CUSTOMERS │ │
│  │  This Month │ │   Active    │ │   Listed    │ │           │ │
│  │             │ │             │ │             │ │           │ │
│  │  KES 245K   │ │     12      │ │     24      │ │    156    │ │
│  │  ▲ +18%     │ │  3 pending  │ │  5 low stock│ │  +8 new   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
│                                                                 │
│  ┌────────────────────────────────┐ ┌────────────────────────┐ │
│  │  SALES BY CATEGORY             │ │  INVENTORY STATUS      │ │
│  │                                │ │                        │ │
│  │  Planting    ████████████ 45%  │ │  In Stock  🟢 19       │ │
│  │  Fertilizer  ████████    30%   │ │  Low Stock 🟡  4       │ │
│  │  Tools       ████        15%   │ │  Out       🔴  1       │ │
│  │  Other       ██          10%   │ │                        │ │
│  │                                │ │  Status Counts         │ │
│  │  Horizontal Bar                │ │                        │ │
│  └────────────────────────────────┘ └────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SALES TREND (6 Months)                                    │ │
│  │                              ████                          │ │
│  │                         ████████                           │ │
│  │                    █████████████                           │ │
│  │               █████████████████                            │ │
│  │          █████████████████████                             │ │
│  │     █████████████████████████                              │ │
│  │                                                            │ │
│  │  Bar Chart                                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  LOW STOCK ALERTS                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  🟡 NPK Fertilizer: 50kg remaining (min: 100kg) [Restock]  │ │
│  │  🟡 OFSP Vines Kenya: 150 left (min: 200)       [Restock]  │ │
│  │  🔴 Training Manuals: OUT OF STOCK              [Restock]  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Stat Cards | **Cards** with trend | Custom |
| Sales by Category | **Horizontal Bar** | Recharts |
| Inventory Status | **Status Counts** with colors | Custom |
| Sales Trend | **Bar Chart** | Recharts |
| Low Stock Alerts | **Alert List** | Custom |

---

### 8.2 My Inputs Screen (Product Management)

```
┌─────────────────────────────────────────────────────────────────┐
│  MY INPUTS                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PRODUCT PERFORMANCE                                       │ │
│  │                                                            │ │
│  │         Revenue  │  Units   │  Rating                      │ │
│  │  OFSP Vines  ████████  1,200   ★★★★★                       │ │
│  │  Fertilizer  ██████      800   ★★★★☆                       │ │
│  │  Tools       ███         300   ★★★★☆                       │ │
│  │                                                            │ │
│  │  Multi-metric Table/Bar                                    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  PRODUCTS TABLE                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Product       Category    Price   Stock   Status   Action │ │
│  │  OFSP Vines    Planting    30/cut  500     🟢       [Edit] │ │
│  │  NPK Fertilizer Fertilizer 150/kg  50      🟡       [Edit] │ │
│  │                                                            │ │
│  │  Editable Table                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Product Performance | **Multi-metric Bar** | Custom |
| Products Table | **Editable Table** | TanStack Table |

---

## 9. Transport Provider Dashboard & Screens

### 9.1 My Dashboard (Main Screen)

```
┌─────────────────────────────────────────────────────────────────┐
│  TRANSPORT PROVIDER DASHBOARD                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐ ┌─────────────────────────────────┐  │
│  │     TODAY'S          │ │                                 │  │
│  │     EARNINGS         │ │   ACTIVE DELIVERIES             │  │
│  │                      │ │                                 │  │
│  │   KES 4,850          │ │         5                       │  │
│  │   ████████████       │ │   ● 2 In Transit                │  │
│  │   from 8 trips       │ │   ◐ 3 Pickup                    │  │
│  │                      │ │                                 │  │
│  │   Large Number Card  │ │   Counter with Status           │  │
│  └──────────────────────┘ └─────────────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  EARNINGS THIS WEEK                                        │ │
│  │                                                            │ │
│  │  Mon  ███████████  4,200                                   │ │
│  │  Tue  █████████    3,800                                   │ │
│  │  Wed  ████████████ 4,500                                   │ │
│  │  Thu  ██████████   4,100                                   │ │
│  │  Fri  █████████████ 4,850  ← Today                         │ │
│  │                                                            │ │
│  │  Simple Horizontal Bar (Daily)                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MY RATING                                                 │ │
│  │                                                            │ │
│  │        ★ ★ ★ ★ ★                                           │ │
│  │          4.8                                               │ │
│  │     Based on 156 reviews                                   │ │
│  │                                                            │ │
│  │  Star Rating Display                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  PENDING REQUESTS (Quick View)                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  📦 Produce: Farm → Kangundo  5km  KES 500   [Accept]      │ │
│  │  🌱 Input: Warehouse → Farm   8km  KES 600   [Accept]      │ │
│  │                                                            │ │
│  │  Request Cards                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Today's Earnings | **Large Number Card** | Custom |
| Active Deliveries | **Counter with Status** | Custom |
| Weekly Earnings | **Horizontal Bar** (simple) | Recharts or Custom |
| Rating Display | **Star Rating** | Custom |
| Request Cards | **Action Cards** | Custom |

---

### 9.2 Active Deliveries Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  ACTIVE DELIVERIES                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DELIVERY #1 - In Transit                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  From: John Kamau Farm                                     │ │
│  │  To: Kangundo Main Centre                                  │ │
│  │                                                            │ │
│  │  [●]────────────────────────[  ]────────────────────────[○]│ │
│  │  Pickup                    Current                    Delivery│
│  │                            Location                        │ │
│  │                                                            │ │
│  │  Progress: [████████████████░░░░░░░░░░] 65%                │ │
│  │  ETA: 15 minutes                                           │ │
│  │                                                            │ │
│  │  Route Progress Bar with Markers                           │ │
│  │                                                            │ │
│  │  [Upload Photo]  [Mark Delivered]                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  DELIVERY #2 - At Pickup                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  From: AgriInputs Warehouse                                │ │
│  │  To: Mary Wanjiku Farm                                     │ │
│  │                                                            │ │
│  │  [●]────────────────────────────────────────────────────[○]│ │
│  │  At pickup                                          Delivery│ │
│  │                                                            │ │
│  │  [Confirm Pickup]                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Element | Visualization | Library |
|---------|--------------|---------|
| Route Progress | **Linear Progress with Markers** | Custom |
| ETA | **Countdown/Time Display** | Custom |

---

## 10. Shared Components & Patterns

### 10.1 Common Visualization Components

| Component | Usage | Implementation |
|-----------|-------|----------------|
| **Stat Card** | KPIs across all dashboards | Custom with Tailwind |
| **Trend Arrow** | Show direction (▲▼─) | Custom SVG or icons |
| **Progress Bar** | Capacity, targets, completion | Custom or Shadcn Progress |
| **Badge** | Status indicators | Shadcn Badge |
| **Star Rating** | Quality, ratings | Custom SVG |
| **Alert Card** | Warnings, notifications | Custom with icons |
| **Data Table** | Lists with sorting/filtering | TanStack Table |
| **Simple Bar Chart** | Basic comparisons | Recharts |
| **Line Chart** | Trends over time | Recharts |
| **Pie/Donut Chart** | Part-to-whole | Recharts |

### 10.2 Color System

```css
/* Semantic Colors for Visualizations */
:root {
  /* Status Colors */
  --color-success: #22C55E;    /* Green - Good, Complete, Grade A */
  --color-warning: #F59E0B;    /* Amber - Caution, Pending, Grade B */
  --color-danger: #EF4444;     /* Red - Critical, Error, Grade C */
  --color-info: #3B82F6;       /* Blue - Information, In Progress */
  --color-neutral: #6B7280;    /* Gray - Inactive, Disabled */
  
  /* Chart Palette (Categorical) */
  --chart-1: #3B82F6;   /* Blue */
  --chart-2: #22C55E;   /* Green */
  --chart-3: #F59E0B;   /* Amber */
  --chart-4: #8B5CF6;   /* Purple */
  --chart-5: #EC4899;   /* Pink */
  --chart-6: #06B6D4;   /* Cyan */
  
  /* Variety Colors (Specific) */
  --kenya-color: #F97316;      /* Orange */
  --spk004-color: #8B5CF6;     /* Purple */
  --kabode-color: #14B8A6;     /* Teal */
  
  /* Grade Colors */
  --grade-a: #22C55E;   /* Green */
  --grade-b: #F59E0B;   /* Amber */
  --grade-c: #EF4444;   /* Red */
}
```

### 10.3 Responsive Breakpoints

| Breakpoint | Width | Visualization Adjustments |
|------------|-------|---------------------------|
| Mobile | < 640px | Stack charts, simplify, larger touch targets |
| Tablet | 640-1024px | 2-column layouts, medium charts |
| Desktop | > 1024px | Full dashboards, detailed charts |

### 10.4 Loading States

```
Skeleton patterns for each visualization type:
├── Stat Card: Pulsing rectangle
├── Chart: Pulsing chart shape
├── Table: Pulsing rows
└── Map: Pulsing map container
```

---

## 11. Implementation Guidelines

### 11.1 File Structure

```
src/
├── components/
│   ├── visualizations/
│   │   ├── StatCard.tsx
│   │   ├── TrendArrow.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StarRating.tsx
│   │   ├── AlertCard.tsx
│   │   ├── charts/
│   │   │   ├── SimpleBarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── AreaChart.tsx
│   │   │   ├── FunnelChart.tsx
│   │   │   ├── RadarChart.tsx
│   │   │   └── Sparkline.tsx
│   │   ├── gauges/
│   │   │   ├── CircularProgress.tsx
│   │   │   └── SemiCircleGauge.tsx
│   │   └── maps/
│   │       └── ChoroplethMap.tsx
│   └── ui/
│       └── (shadcn components)
├── hooks/
│   ├── useChartData.ts
│   └── useResponsiveChart.ts
└── utils/
    ├── chartColors.ts
    ├── formatters.ts
    └── chartConfig.ts
```

### 11.2 Performance Tips

1. **Lazy load charts** - Only render when visible
2. **Limit data points** - Max 50-100 points for line charts
3. **Use memo** - Memoize chart components
4. **Debounce resize** - Don't recalculate on every pixel
5. **Server-side aggregation** - Send pre-computed data

### 11.3 Accessibility Checklist

- [ ] All charts have descriptive titles
- [ ] Color is not the only differentiator (use patterns/labels)
- [ ] Data tables provided as alternative to charts
- [ ] Sufficient color contrast (4.5:1 minimum)
- [ ] Keyboard navigable interactive elements
- [ ] Screen reader descriptions for charts

---

## Appendix: Quick Reference Card

### Which Chart for What Data?

| Question | Chart Type |
|----------|------------|
| How much? (one value) | Stat Card, Large Number |
| How does it compare? | Bar Chart, Bullet Chart |
| How has it changed? | Line Chart, Area Chart |
| What's the breakdown? | Pie Chart, Donut, Treemap |
| Where is it? | Map, Geographic Heat Map |
| What's the status? | Progress Bar, Gauge |
| What's the distribution? | Histogram, Box Plot |
| What's the flow? | Sankey, Funnel |
| How do items rank? | Horizontal Bar (sorted) |
| What's my position? | Distribution bar with marker |

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 13, 2026 | System Architect | Initial specification |

---

**End of Document**
