# Analytics Architecture

## Overview

The analytics system follows a clean architecture pattern where:
1. **Service Layer** (`analyticsService.ts`) - Handles all API calls to the backend
2. **Context Layer** (`AnalyticsContext.tsx`) - Manages state and provides data to components
3. **Component Layer** - Consumes data from context via `useAnalytics()` hook

## Architecture Flow

```
Backend API
    ↓
analyticsService.ts (Service Layer)
    ↓
AnalyticsContext.tsx (Context Layer)
    ↓
Components (via useAnalytics hook)
```

## Service Layer (`src/services/analyticsService.ts`)

The service layer is responsible for:
- Making authenticated API calls to the backend
- Transforming backend responses to frontend types
- Handling query parameter building
- Error handling at the API level

### Available Functions

#### Core Analytics
- `getDashboardStats(filters?)` - Dashboard statistics
- `getTrends(filters?)` - Trend data for charts
- `getPerformanceMetrics(filters?)` - Performance metrics
- `getLeaderboard(metric, period, filters?)` - Leaderboards
- `getMarketInfo(filters?)` - Market information

#### Role-Specific Analytics
- `getFarmerAnalytics(filters?)` - Farmer-specific analytics
- `getBuyerAnalytics(filters?)` - Buyer-specific analytics
- `getStaffAnalytics(filters?)` - Staff/M&E analytics
- `getCountyOfficerAnalytics(filters?)` - County officer analytics
- `getInputProviderAnalytics(filters?)` - Input provider analytics
- `getTransportProviderAnalytics(filters?)` - Transport provider analytics
- `getAggregationManagerAnalytics(filters?)` - Aggregation manager analytics

#### Management
- `refreshAnalyticsViews()` - Refresh materialized views (admin/staff only)

## Context Layer (`src/contexts/AnalyticsContext.tsx`)

The context layer:
- Consumes all service functions
- Manages global state for analytics data
- Provides loading and error states
- Exposes fetch functions to components

### State Management

The context manages the following state:
- `dashboardStats` - Dashboard statistics
- `trends` - Trend data array
- `performanceMetrics` - Performance metrics array
- `leaderboards` - Leaderboard array
- `farmerAnalytics` - Farmer-specific analytics
- `buyerAnalytics` - Buyer-specific analytics
- `staffAnalytics` - Staff analytics
- `countyOfficerAnalytics` - County officer analytics
- `inputProviderAnalytics` - Input provider analytics
- `transportProviderAnalytics` - Transport provider analytics
- `aggregationManagerAnalytics` - Aggregation manager analytics
- `marketInfo` - Market information
- `isLoading` - Loading state
- `error` - Error message

### Usage in Components

Components should use the `useAnalytics()` hook to access analytics data:

```typescript
import { useAnalytics } from "@/contexts/AnalyticsContext";

function MyComponent() {
  const {
    dashboardStats,
    trends,
    farmerAnalytics,
    fetchFarmerAnalytics,
    isLoading,
    error
  } = useAnalytics();

  useEffect(() => {
    fetchFarmerAnalytics({ timeRange: "month" });
  }, [fetchFarmerAnalytics]);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return <div>{/* Use analytics data */}</div>;
}
```

## Component Integration

### Example: Farmer Dashboard

```typescript
// src/pages/dashboard/FarmerDashboard.tsx
import { useAnalytics } from "@/contexts/AnalyticsContext";

export function FarmerDashboard() {
  const {
    farmerAnalytics,
    fetchFarmerAnalytics,
    leaderboards,
    fetchLeaderboard,
    trends,
    fetchTrends,
    isLoading
  } = useAnalytics();

  useEffect(() => {
    fetchFarmerAnalytics({ timeRange: "month" });
    fetchLeaderboard("revenue", "month");
    fetchTrends({ timeRange: "month" });
  }, [fetchFarmerAnalytics, fetchLeaderboard, fetchTrends]);

  // Use farmerAnalytics, leaderboards, trends in component
}
```

### Example: Market Info

```typescript
// src/pages/farmer/MarketInfo.tsx
import { useAnalytics } from "@/contexts/AnalyticsContext";

export function MarketInfo() {
  const {
    marketInfo,
    fetchMarketInfo
  } = useAnalytics();

  useEffect(() => {
    fetchMarketInfo({ 
      location: "Nairobi",
      variety: "SPK004",
      timeRange: "month" 
    });
  }, [fetchMarketInfo]);

  // Use marketInfo in component
}
```

## Key Principles

1. **Service Layer Isolation**: Components never call service functions directly
2. **Context as Single Source**: All analytics data flows through the context
3. **Lazy Loading**: Components fetch data as needed, not on context mount
4. **Type Safety**: Full TypeScript support throughout the stack
5. **Error Handling**: Centralized error handling in the context

## Backend Endpoints

All endpoints are prefixed with `/api/v1/analytics`:

- `GET /dashboard-stats` - Dashboard statistics
- `GET /trends` - Trend data
- `GET /performance-metrics` - Performance metrics
- `GET /leaderboards/:metric/:period` - Leaderboards
- `GET /market-info` - Market information
- `GET /farmer` - Farmer analytics
- `GET /buyer` - Buyer analytics
- `GET /staff` - Staff analytics
- `GET /county-officer` - County officer analytics
- `GET /input-provider` - Input provider analytics
- `GET /transport-provider` - Transport provider analytics
- `GET /aggregation-manager` - Aggregation manager analytics
- `GET /refresh-views` - Refresh views (admin/staff only)

## Data Flow Example

1. Component calls `fetchFarmerAnalytics({ timeRange: "month" })`
2. Context calls `getFarmerAnalytics({ timeRange: "month" })` from service
3. Service makes API call to `/api/v1/analytics/farmer?timeRange=month`
4. Service transforms response and returns data
5. Context updates `farmerAnalytics` state
6. Component re-renders with new data

## Best Practices

1. **Always use the context hook**: Never import from `analyticsService` directly in components
2. **Fetch on demand**: Only fetch data when the component needs it
3. **Handle loading states**: Use `isLoading` to show loading indicators
4. **Handle errors**: Use `error` to display error messages
5. **Use filters appropriately**: Pass filters to fetch functions to get specific data
6. **Memoize expensive computations**: Use `useMemo` for derived data from analytics
