# Complete Context Architecture

All contexts and services have been created for end-to-end platform operation.

## ✅ Completed Contexts

### 1. **Profile Context** (`contexts/ProfileContext.tsx`)
- **Purpose**: Generic user profiles (farmer, buyer, input provider, transport provider)
- **Use Cases**: View profiles from any role/context
- **Key Features**: 
  - Fetch farmer/buyer/provider profiles
  - Profile statistics
  - Profile filtering

### 2. **Input Context** (`contexts/InputContext.tsx`)
- **Purpose**: Input provider functionality
- **Use Cases**: 
  - Input product management
  - Input orders from farmers
  - Customer (farmer) management
- **Key Features**:
  - Input CRUD operations
  - Order status management
  - Customer analytics

### 3. **Marketplace Context** (`contexts/MarketplaceContext.tsx`)
- **Purpose**: Marketplace functionality
- **Use Cases**:
  - Produce listings
  - Marketplace orders (farmer-buyer)
  - Marketplace transactions
- **Key Features**:
  - Listing management
  - Order lifecycle management
  - Marketplace statistics

### 4. **Transport Context** (`contexts/TransportContext.tsx`)
- **Purpose**: Transport provider functionality
- **Use Cases**:
  - Transport requests
  - Active deliveries
  - Delivery tracking
- **Key Features**:
  - Request management (accept/reject)
  - Real-time tracking
  - Delivery status updates

### 5. **Aggregation Context** (`contexts/AggregationContext.tsx`)
- **Purpose**: Aggregation center functionality
- **Use Cases**:
  - Center management
  - Stock in/out transactions
  - Inventory management
  - Quality checks
- **Key Features**:
  - Stock transaction recording
  - Inventory tracking
  - Quality check management
  - Center statistics

### 6. **Payment Context** (`contexts/PaymentContext.tsx`)
- **Purpose**: Payment and escrow functionality
- **Use Cases**:
  - Payment processing
  - Escrow management
  - Payment history
- **Key Features**:
  - Payment creation/processing
  - Escrow release/dispute
  - Payment statistics

### 7. **Notification Context** (`contexts/NotificationContext.tsx`)
- **Purpose**: Notifications and alerts
- **Use Cases**:
  - User notifications
  - System alerts
  - Notification management
- **Key Features**:
  - Notification CRUD
  - Alert acknowledgment
  - Unread count tracking

### 8. **Analytics Context** (`contexts/AnalyticsContext.tsx`)
- **Purpose**: Analytics and reporting
- **Use Cases**:
  - Dashboard statistics
  - Trend analysis
  - Report generation
- **Key Features**:
  - Dashboard stats
  - Trend data
  - Report templates and generation
  - Performance metrics

### 9. **Staff Context** (`contexts/StaffContext.tsx`)
- **Purpose**: Staff/admin functionality
- **Use Cases**:
  - Partner management
  - Activity logging
  - Data quality monitoring
  - Transaction evidence
- **Key Features**:
  - Partner CRUD
  - Activity log tracking
  - Data quality issue resolution
  - Evidence management

## 📁 File Structure

```
src/
├── types/
│   ├── profile.ts          ✅
│   ├── marketplace.ts      ✅
│   ├── input.ts            ✅
│   ├── transport.ts        ✅
│   ├── aggregation.ts      ✅
│   ├── payment.ts          ✅
│   ├── notification.ts     ✅
│   ├── analytics.ts        ✅
│   ├── staff.ts            ✅
│   └── order.ts            ✅ (Generic order types)
│
├── services/
│   ├── profileService.ts       ✅
│   ├── inputService.ts         ✅
│   ├── marketplaceService.ts   ✅
│   ├── transportService.ts     ✅
│   ├── aggregationService.ts   ✅
│   ├── paymentService.ts       ✅
│   ├── notificationService.ts ✅
│   ├── analyticsService.ts    ✅
│   └── staffService.ts         ✅
│
└── contexts/
    ├── ProfileContext.tsx      ✅
    ├── InputContext.tsx         ✅
    ├── MarketplaceContext.tsx   ✅
    ├── TransportContext.tsx     ✅
    ├── AggregationContext.tsx   ✅
    ├── PaymentContext.tsx       ✅
    ├── NotificationContext.tsx  ✅
    ├── AnalyticsContext.tsx     ✅
    └── StaffContext.tsx         ✅
```

## 🔗 Context Hierarchy

```
App
├── AuthProvider (authentication)
├── ProfileProvider (user profiles - reusable)
├── InputProvider (input domain)
├── MarketplaceProvider (marketplace domain)
├── TransportProvider (transport domain)
├── AggregationProvider (aggregation domain)
├── PaymentProvider (payment domain)
├── NotificationProvider (notifications)
├── AnalyticsProvider (analytics/reports)
└── StaffProvider (staff/admin)
```

## 🎯 Usage Examples

### Profile Context
```typescript
import { useProfile } from "@/contexts/ProfileContext";

const { fetchFarmerProfile, selectedProfile } = useProfile();
```

### Input Context
```typescript
import { useInput } from "@/contexts/InputContext";

const { inputs, inputOrders, customers, fetchInputs } = useInput();
```

### Marketplace Context
```typescript
import { useMarketplace } from "@/contexts/MarketplaceContext";

const { listings, orders, fetchListings, createOrder } = useMarketplace();
```

### Transport Context
```typescript
import { useTransport } from "@/contexts/TransportContext";

const { requests, acceptRequest, fetchActiveDeliveries } = useTransport();
```

### Aggregation Context
```typescript
import { useAggregation } from "@/contexts/AggregationContext";

const { centers, recordStockIn, fetchInventory } = useAggregation();
```

### Payment Context
```typescript
import { usePayment } from "@/contexts/PaymentContext";

const { payments, escrowTransactions, releaseEscrow } = usePayment();
```

### Notification Context
```typescript
import { useNotification } from "@/contexts/NotificationContext";

const { notifications, unreadCount, markAsRead } = useNotification();
```

### Analytics Context
```typescript
import { useAnalytics } from "@/contexts/AnalyticsContext";

const { dashboardStats, trends, generateReportAction } = useAnalytics();
```

### Staff Context
```typescript
import { useStaff } from "@/contexts/StaffContext";

const { partners, activityLogs, dataQualityIssues } = useStaff();
```

## 📋 Backend API Endpoints

All services document the required backend API endpoints. See each service file for detailed endpoint specifications.

### Key Endpoint Patterns:
- `GET /api/{domain}/` - List resources
- `GET /api/{domain}/:id` - Get resource by ID
- `POST /api/{domain}/` - Create resource
- `PUT /api/{domain}/:id` - Update resource
- `DELETE /api/{domain}/:id` - Delete resource
- `GET /api/{domain}/stats` - Get statistics

## ✅ Next Steps

1. **Update Pages**: Migrate all pages to use the new contexts
2. **Backend Development**: Use service files as API contracts
3. **Database Schemas**: Generate schemas from TypeScript types
4. **Testing**: Add unit tests for contexts and services
5. **Documentation**: Complete API documentation from service files

## 🎉 Status

**All contexts and services are complete and ready for use!**

The platform now has a complete, thematic context architecture covering all user roles and entities.
