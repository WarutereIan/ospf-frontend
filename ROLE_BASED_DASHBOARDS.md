# Role-Based Dashboards & Sidebars - OFSP System

## Overview

Complete role-based dashboard and sidebar system for the OFSP Digital Marketplace Platform, with optimized views for each user type based on their access level and key functions.

**Date:** November 2025  
**Status:** ✅ Complete

---

## User Roles & Dashboards

### 1. OFSP Farmers (`farmer`)
**Dashboard:** `FarmerDashboard`  
**Route:** `/dashboard/farmer`

**Features:**
- Register and post produce
- View and manage orders
- Track sales and revenue
- View peer activity and leaderboards
- Receive market information

**Sidebar Menu:**
- Home
- Marketplace
- Dashboard
- My Produce
- Orders
- Leaderboard
- Market Info

---

### 2. Buyers (`buyer`)
**Dashboard:** `BuyerDashboard`  
**Route:** `/dashboard/buyer`

**Features:**
- Browse produce listings
- Place orders
- Track purchases
- Rate farmers
- View order history

**Sidebar Menu:**
- Home
- Marketplace
- Dashboard
- My Orders
- Rate Farmers

**Key Stats:**
- Total Purchases
- Active Orders
- Total Spent
- Rated Farmers

---

### 3. County Agricultural Officers (`officer`)
**Dashboard:** `OfficerDashboard`  
**Route:** `/dashboard/officer`

**Features:**
- View all farmers and monitor activities
- Generate reports
- Provide advisory services
- Manage aggregation centers
- View analytics and KPIs

**Sidebar Menu:**
- Home
- Dashboard
- Farmers
- Reports
- Centers
- Advisory

**Key Stats:**
- Total Farmers
- Total Orders
- Total Revenue
- Aggregation Centers

**Quick Actions:**
- Export Reports
- Send Advisory
- View All Farmers
- Manage Centers

---

### 4. Concern Project Staff (`staff`)
**Dashboard:** `StaffDashboard`  
**Route:** `/dashboard/staff`

**Features:**
- Full platform access
- User management
- Analytics and reporting
- System configuration
- Data export

**Sidebar Menu:**
- Home
- Dashboard
- Users
- Analytics
- Reports
- Settings

**Key Stats:**
- Total Users
- Total Orders
- Platform Revenue
- System Health

**Admin Functions:**
- User Management
- Analytics & Reports
- System Settings
- Data Export

---

### 5. Aggregation Center Managers (`aggregation_manager`)
**Dashboard:** `AggregationManagerDashboard`  
**Route:** `/dashboard/aggregation`

**Features:**
- Stock in/out tracking
- Quality checks
- Farmer coordination
- Inventory reports
- Capacity management

**Sidebar Menu:**
- Home
- Dashboard
- Stock In
- Stock Out
- Quality Checks
- Inventory
- Farmers

**Key Stats:**
- Current Stock
- Stock In Today
- Stock Out Today
- Quality Checks

**Quick Actions:**
- Stock In
- Stock Out
- Quality Checks
- Inventory Report
- Farmer Coordination

---

## Implementation Details

### User Role Context
**File:** `src/contexts/UserRoleContext.tsx`

- Provides role management across the application
- Defaults to `farmer` for development
- TODO: Replace with actual authentication/role fetching

### Role-Based Sidebar
**File:** `src/components/layout/RoleBasedSidebar.tsx`

- Dynamically shows menu items based on user role
- Uses `useUserRole()` hook to get current role
- Each role has its own menu configuration

### Dashboard Routing
**File:** `src/pages/dashboard/DashboardPage.tsx`

- Acts as a router that redirects to role-specific dashboard
- Uses `useUserRole()` to determine redirect destination
- Defaults to farmer dashboard if role not set

### Layout Integration
**File:** `src/components/layout/Layout.tsx`

- Updated to use `RoleBasedSidebar` instead of static sidebar
- Wrapped in `ProSidebarProvider` for sidebar state management
- Maintains responsive margin based on sidebar collapsed state

---

## Component Structure

```
src/
├── contexts/
│   └── UserRoleContext.tsx          # Role management context
├── components/
│   └── layout/
│       ├── Layout.tsx                # Main layout with role-based sidebar
│       ├── RoleBasedSidebar.tsx      # Dynamic sidebar based on role
│       └── Header.tsx                # Header component
└── pages/
    └── dashboard/
        ├── DashboardPage.tsx          # Router that redirects by role
        ├── FarmerDashboard.tsx        # Farmer dashboard (existing)
        ├── BuyerDashboard.tsx         # Buyer dashboard (new)
        ├── OfficerDashboard.tsx      # Officer dashboard (new)
        ├── StaffDashboard.tsx         # Staff dashboard (new)
        └── AggregationManagerDashboard.tsx  # Manager dashboard (new)
```

---

## Role-Based Features Matrix

| Feature | Farmer | Buyer | Officer | Staff | Manager |
|---------|--------|-------|---------|-------|---------|
| Post Produce | ✅ | ❌ | ❌ | ✅ | ❌ |
| Browse Marketplace | ✅ | ✅ | ✅ | ✅ | ✅ |
| Place Orders | ❌ | ✅ | ❌ | ✅ | ❌ |
| View Orders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Track Sales | ✅ | ❌ | ✅ | ✅ | ❌ |
| Peer Leaderboard | ✅ | ❌ | ✅ | ✅ | ❌ |
| Market Info | ✅ | ❌ | ✅ | ✅ | ❌ |
| Rate Farmers | ❌ | ✅ | ❌ | ✅ | ❌ |
| Monitor Farmers | ❌ | ❌ | ✅ | ✅ | ❌ |
| Generate Reports | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage Centers | ❌ | ❌ | ✅ | ✅ | ❌ |
| Send Advisory | ❌ | ❌ | ✅ | ✅ | ❌ |
| User Management | ❌ | ❌ | ❌ | ✅ | ❌ |
| System Settings | ❌ | ❌ | ❌ | ✅ | ❌ |
| Stock In/Out | ❌ | ❌ | ❌ | ❌ | ✅ |
| Quality Checks | ❌ | ❌ | ❌ | ❌ | ✅ |
| Inventory Reports | ❌ | ❌ | ✅ | ✅ | ✅ |

---

## Next Steps

1. **Authentication Integration:**
   - Connect to authentication system
   - Fetch user role from API/auth token
   - Update `UserRoleContext` to use real data

2. **Role-Based Route Protection:**
   - Add route guards to prevent unauthorized access
   - Redirect users trying to access restricted routes

3. **Additional Role-Specific Pages:**
   - Buyer: Order tracking, rating interface
   - Officer: Detailed farmer views, report generation
   - Staff: User management interface, system settings
   - Manager: Stock in/out forms, quality check interface

4. **API Integration:**
   - Connect all dashboards to backend APIs
   - Replace sample data with real API calls
   - Add loading states and error handling

5. **Testing:**
   - Test role switching
   - Verify sidebar menu changes
   - Test dashboard redirects
   - Verify route protection

---

**Implementation Status:** ✅ Complete  
**Ready for:** Authentication Integration & API Connection
