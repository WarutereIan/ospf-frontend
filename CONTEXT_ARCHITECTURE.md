# Context & Service Architecture

This document outlines the thematic organization of contexts and services for the OFSP platform.

## Architecture Overview

Contexts and services are organized by **thematic domains** rather than by pages. This allows for:
- **Reusability**: Same context can be used across multiple pages
- **Consistency**: Shared data structures and operations
- **Maintainability**: Clear separation of concerns
- **Backend Guidance**: Clear API endpoint structure

## Domain Structure

### 1. Profile Domain (`types/profile.ts`, `services/profileService.ts`, `contexts/ProfileContext.tsx`)

**Purpose**: Generic user profiles that can be viewed by different roles.

**Use Cases**:
- Buyer viewing farmer profile
- Input provider viewing customer (farmer) profile
- Farmer viewing buyer profile
- Any role viewing any user profile

**Key Types**:
- `FarmerProfile` - Farmer user profile
- `BuyerProfile` - Buyer user profile
- `InputProviderProfile` - Input provider profile
- `TransportProviderProfile` - Transport provider profile
- `Profile` - Union type for all profiles

**API Endpoints** (to implement):
- `GET /api/profiles/:id` - Get any profile by ID
- `GET /api/profiles/farmers/:id` - Get farmer profile
- `GET /api/profiles/buyers/:id` - Get buyer profile
- `GET /api/profiles` - List profiles with filters
- `GET /api/profiles/stats` - Get profile statistics

**Usage**:
```typescript
import { useProfile } from "@/contexts/ProfileContext";

const { fetchFarmerProfile, selectedProfile } = useProfile();
```

---

### 2. Marketplace Domain (`types/marketplace.ts`, `services/marketplaceService.ts`, `contexts/MarketplaceContext.tsx`)

**Purpose**: Marketplace-related functionality (produce listings, marketplace orders).

**Use Cases**:
- Farmer listing produce
- Buyer browsing marketplace
- Placing marketplace orders
- Managing marketplace transactions

**Key Types**:
- `ProduceListing` - Produce available for sale
- `MarketplaceOrder` - Order placed through marketplace
- `MarketplaceFilters` - Filters for listings
- `MarketplaceOrderFilters` - Filters for orders

**API Endpoints** (to implement):
- `GET /api/marketplace/listings` - List produce listings
- `GET /api/marketplace/listings/:id` - Get listing details
- `POST /api/marketplace/listings` - Create listing
- `GET /api/marketplace/orders` - List marketplace orders
- `GET /api/marketplace/orders/:id` - Get order details
- `POST /api/marketplace/orders` - Create order
- `PUT /api/marketplace/orders/:id/status` - Update order status

**Usage**:
```typescript
import { useMarketplace } from "@/contexts/MarketplaceContext";

const { listings, fetchListings, orders, fetchOrders } = useMarketplace();
```

---

### 3. Input Domain (`types/input.ts`, `services/inputService.ts`, `contexts/InputContext.tsx`)

**Purpose**: Input provider functionality (products, orders, customers).

**Use Cases**:
- Input provider managing products
- Input provider managing orders from farmers
- Input provider viewing customers (farmers)
- Farmer ordering inputs

**Key Types**:
- `Input` - Input product
- `InputOrder` - Order for inputs
- `InputCustomer` - Farmer who orders inputs (uses FarmerProfile)
- `InputFilters` - Filters for inputs
- `InputOrderFilters` - Filters for orders
- `CustomerFilters` - Filters for customers

**API Endpoints** (to implement):
- `GET /api/inputs` - List inputs
- `GET /api/inputs/:id` - Get input details
- `POST /api/inputs` - Create input
- `PUT /api/inputs/:id` - Update input
- `GET /api/input-providers/orders` - List input orders
- `GET /api/input-providers/orders/:id` - Get order details
- `PUT /api/input-providers/orders/:id/status` - Update order status
- `GET /api/input-providers/customers` - List customers
- `GET /api/input-providers/customers/:id` - Get customer details
- `GET /api/input-providers/customers/:id/orders` - Get customer order history

**Usage**:
```typescript
import { useInput } from "@/contexts/InputContext";

const { 
  inputs, 
  inputOrders, 
  customers, 
  fetchInputs, 
  fetchInputOrders, 
  fetchCustomers 
} = useInput();
```

---

### 4. Order Domain (`types/order.ts`, `services/orderService.ts`, `contexts/OrderContext.tsx`)

**Purpose**: Generic order operations shared across contexts.

**Use Cases**:
- Common order status management
- Order timeline tracking
- Order statistics

**Key Types**:
- `BaseOrder` - Base order interface
- `OrderStatus` - Generic order status
- `PaymentStatus` - Generic payment status
- `OrderTimelineEvent` - Order timeline event
- `OrderFilters` - Generic order filters

**Note**: This domain provides shared functionality. Specific order types (MarketplaceOrder, InputOrder) extend BaseOrder.

---

## Context Hierarchy

```
App
├── AuthProvider (authentication)
├── ProfileProvider (user profiles - reusable)
├── InputProvider (input domain)
│   └── Uses ProfileProvider for customer profiles
├── MarketplaceProvider (marketplace domain)
│   └── Uses ProfileProvider for farmer/buyer profiles
└── OrderProvider (generic order operations)
    └── Used by both InputProvider and MarketplaceProvider
```

## Migration Guide

### From Page-Specific to Thematic

**Before** (page-specific):
```typescript
// InputCustomers.tsx
const [customers, setCustomers] = useState([]);
useEffect(() => {
  // Fetch customers
}, []);
```

**After** (thematic):
```typescript
// InputCustomers.tsx
import { useInput } from "@/contexts/InputContext";

const { customers, fetchCustomers, isLoading } = useInput();
```

### Updating Pages

1. **Input Customers Page**: Use `useInput()` hook
2. **Input Orders Page**: Use `useInput()` hook
3. **Marketplace Page**: Use `useMarketplace()` hook
4. **Buyer Orders Page**: Use `useMarketplace()` hook
5. **Farmer Orders Page**: Use `useMarketplace()` hook
6. **Profile Views**: Use `useProfile()` hook

## Benefits

1. **Reusability**: Same context used across multiple pages
2. **Consistency**: Shared data structures
3. **Type Safety**: Centralized type definitions
4. **Backend Guidance**: Clear API endpoint structure
5. **Maintainability**: Single source of truth for each domain

## Next Steps

1. ✅ Create Profile domain (types, service, context)
2. ✅ Create Input domain (types, service, context)
3. ⏳ Create Marketplace domain (types, service, context)
4. ⏳ Create Order domain (types, service, context)
5. ⏳ Update all pages to use thematic contexts
6. ⏳ Document API endpoints for backend development
7. ⏳ Generate database schemas from types
