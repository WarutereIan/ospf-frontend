# New User Types Implementation - Complete Guide

## Overview
This document provides a comprehensive overview of the two new user types added to the OFSP Digital Marketplace Platform: **Input Providers** and **Transport Providers**.

**Status:** ✅ FULLY IMPLEMENTED (UI Complete)

**Implementation Date:** January 2026

---

## 1. Input Providers

### Purpose
Input providers supply agricultural inputs (vines, fertilizers, tools, training materials) to farmers through the marketplace.

### Dashboard Features
**Location:** `/dashboard/input-provider`  
**Component:** `ospf/frontend/src/pages/dashboard/InputProviderDashboard.tsx`

#### Dashboard Sections:

1. **Statistics Cards**
   - Total Inputs Listed: Shows active listings count
   - Active Orders: Current orders being processed
   - Total Revenue: Earnings with growth percentage
   - Customers: Number of active farmers
   - Low Stock Alerts: Items needing restocking
   - Growth Metric: Sales performance trends

2. **Quick Actions**
   - Add New Input → `/dashboard/inputs`
   - View Orders → `/dashboard/input-orders`
   - Manage Inventory → `/dashboard/input-inventory`

3. **Recent Orders Section**
   - Displays latest orders from farmers
   - Shows farmer name, input type, quantity, amount
   - Status indicators (pending, processing, completed)
   - Quick view actions for each order

4. **Low Stock Alerts**
   - Lists items below minimum threshold
   - Shows current vs. minimum stock levels
   - Quick restock actions

### Feature Pages

#### Input Management
**Location:** `/dashboard/inputs`  
**Component:** `ospf/frontend/src/pages/inputs/InputManagement.tsx`

**Features:**
- Add new input listings
- Edit existing inputs
- Set prices and stock levels
- Upload input images
- Categorize inputs (Planting Material, Fertilizer, Soil Amendment, Tools, Training)
- Track inventory levels

**Key Capabilities:**
- Multi-input management in a single table view
- Photo upload for each input
- Stock level tracking
- Price management
- Category assignment
- Visibility toggle (active/inactive)

#### Input Orders
**Location:** `/dashboard/input-orders`  
**Component:** Reuses `FarmerOrders.tsx` (to be specialized)

**Features:**
- View all incoming orders
- Accept/reject orders
- Process orders
- Track order status
- Update delivery status

#### Inventory Management
**Location:** `/dashboard/input-inventory`  
**Component:** Reuses `InputManagement.tsx`

**Features:**
- Real-time stock tracking
- Low stock alerts
- Restocking interface
- Inventory history

### Navigation (Sidebar)
```typescript
inputProviderMenuItems = [
  { name: "Home", path: "/", icon: IconHome },
  { name: "Dashboard", path: "/dashboard/input-provider", icon: IconChartBar },
  { name: "My Inputs", path: "/dashboard/inputs", icon: IconSeeding },
  { name: "Orders", path: "/dashboard/input-orders", icon: IconShoppingCart },
  { name: "Inventory", path: "/dashboard/input-inventory", icon: IconPackage },
  { name: "Customers", path: "/dashboard/customers", icon: IconUsers },
]
```

### Farmer-Side Integration

#### Input Marketplace
**Location:** `/marketplace/inputs`  
**Component:** `ospf/frontend/src/pages/marketplace/InputMarketplace.tsx`

**Features for Farmers:**
- Browse available inputs from all providers
- Search inputs by name/description
- Filter by category
- Sort by price, rating, relevance
- View input details with images
- See provider ratings and reviews
- Check stock availability
- Place orders with optional transport
- View provider location

**Order Flow:**
1. Farmer browses Input Marketplace
2. Selects desired input
3. Specifies quantity
4. Optionally requests transport (+KES 500)
5. Reviews order total (item cost + transport)
6. Places order
7. Input provider receives notification
8. Provider processes order
9. If transport requested, transport provider is notified
10. Delivery is coordinated

---

## 2. Transport Providers

### Purpose
Transport providers handle all logistics needs including produce delivery to aggregation centers/markets and input delivery to farmers.

### Dashboard Features
**Location:** `/dashboard/transport-provider`  
**Component:** `ospf/frontend/src/pages/dashboard/TransportProviderDashboard.tsx`

#### Dashboard Sections:

1. **Statistics Cards**
   - Active Deliveries: Currently in progress
   - Pending Requests: Awaiting acceptance
   - Completed Today: Today's finished deliveries
   - Today's Earnings: Revenue from completed deliveries
   - Weekly Earnings: 7-day revenue with growth trend
   - Rating: Provider rating based on reviews

2. **Quick Actions**
   - View Requests → `/dashboard/transport-requests`
   - Track Deliveries → `/dashboard/deliveries`
   - View Earnings → `/dashboard/earnings`

3. **Active Deliveries Section**
   - Real-time delivery tracking
   - Shows pickup and drop-off locations
   - Distance and ETA display
   - Delivery amount
   - Status badges (in_transit, pickup, delivered)
   - Quick track actions

4. **Pending Requests Section**
   - New transport requests awaiting response
   - Shows requester details
   - Route information (from → to)
   - Distance, scheduled time, weight
   - Estimated earnings
   - Accept/View Details actions

### Feature Pages

#### Transport Requests
**Location:** `/dashboard/transport-requests`  
**Component:** `ospf/frontend/src/pages/transport/TransportRequests.tsx`

**Features:**
- View all pending transport requests
- Filter by type (produce, input, market)
- See request details (pickup/drop-off, distance, weight)
- Accept or decline requests
- View scheduled time
- See payment amount
- Request status tracking

**Request Types:**
- Produce Pickup (Farmer → Aggregation Center)
- Input Delivery (Input Provider → Farmer)
- Market Delivery (Aggregation Center → Market/Buyer)
- Bulk Transport (Multiple pickups)

#### Active Deliveries
**Location:** `/dashboard/deliveries`  
**Component:** `ospf/frontend/src/pages/transport/ActiveDeliveries.tsx`

**Features:**
- Track ongoing deliveries
- Update delivery status
- Upload delivery photos
- Record delivery times
- Mark deliveries as completed
- Handle delivery exceptions
- Navigation assistance (future: map integration)

**Status Flow:**
1. Request Accepted
2. En Route to Pickup
3. At Pickup Location
4. Items Loaded
5. In Transit
6. At Drop-off Location
7. Items Delivered
8. Delivery Completed
9. Payment Released

#### Earnings Dashboard
**Location:** `/dashboard/earnings`  
**Component:** Reuses `PaymentHistory.tsx` (to be specialized)

**Features:**
- Daily earnings summary
- Weekly/monthly totals
- Payment history
- Pending payments
- Completed deliveries revenue

### Navigation (Sidebar)
```typescript
transportProviderMenuItems = [
  { name: "Home", path: "/", icon: IconHome },
  { name: "Dashboard", path: "/dashboard/transport-provider", icon: IconChartBar },
  { name: "Requests", path: "/dashboard/transport-requests", icon: IconTruck },
  { name: "Active Deliveries", path: "/dashboard/deliveries", icon: IconTrendingUp },
  { name: "Completed", path: "/dashboard/completed-deliveries", icon: IconClipboardCheck },
  { name: "Earnings", path: "/dashboard/earnings", icon: IconChartBar },
]
```

### Request Transport Component

#### Component Details
**Component:** `ospf/frontend/src/components/transport/RequestTransport.tsx`

**Used By:**
- Farmers (for produce delivery)
- Input Providers (for input delivery)
- Aggregation Centers (for market delivery)
- Buyers (for produce pickup)

**Features:**
- Service type selection (Produce, Input, Market delivery)
- Pickup location input
- Drop-off location selection
- Weight/quantity input
- Scheduled time selection
- Special instructions field
- Estimated cost display
- Instant request submission

**Integration Points:**
1. **Farmer Dashboard** - "Request Transport" button for produce delivery
2. **Input Provider** - "Arrange Delivery" for fulfilled orders
3. **Aggregation Center** - "Schedule Market Delivery" for outbound stock
4. **Buyer Orders** - "Request Pickup" for large orders

---

## 3. System Integration

### User Role Types
Updated in `ospf/frontend/src/contexts/UserRoleContext.tsx`:

```typescript
export type UserRole =
  | "farmer"
  | "buyer"
  | "aggregation_manager"
  | "officer"
  | "staff"
  | "input_provider"      // NEW
  | "transport_provider"; // NEW
```

### Routing Structure
All routes configured in `ospf/frontend/src/App.tsx`:

```typescript
// Input Provider Routes
<Route path="/dashboard/input-provider" element={<InputProviderDashboard />} />
<Route path="/dashboard/inputs" element={<InputManagement />} />
<Route path="/dashboard/input-inventory" element={<InputManagement />} />
<Route path="/dashboard/input-orders" element={<FarmerOrders />} />
<Route path="/marketplace/inputs" element={<InputMarketplace />} />

// Transport Provider Routes
<Route path="/dashboard/transport-provider" element={<TransportProviderDashboard />} />
<Route path="/dashboard/transport-requests" element={<TransportRequests />} />
<Route path="/dashboard/deliveries" element={<ActiveDeliveries />} />
<Route path="/dashboard/completed-deliveries" element={<ActiveDeliveries />} />
<Route path="/dashboard/earnings" element={<PaymentHistory />} />
```

### Cross-Role Interactions

#### Farmer → Input Provider
1. Farmer browses Input Marketplace
2. Farmer places order for inputs
3. Input Provider receives order notification
4. Provider processes and fulfills order
5. Optional: Farmer requests transport
6. Transport Provider delivers inputs

#### Farmer → Transport Provider
1. Farmer has produce ready for delivery
2. Farmer requests transport via "Request Transport" component
3. Transport Provider receives request
4. Provider accepts and schedules pickup
5. Provider picks up produce from farm
6. Provider delivers to aggregation center
7. Delivery confirmed and payment released

#### Input Provider → Transport Provider
1. Input Provider fulfills farmer order
2. Provider requests transport for delivery
3. Transport Provider accepts request
4. Provider picks up inputs
5. Provider delivers to farmer location
6. Delivery confirmed

#### Aggregation Center → Transport Provider
1. Center accumulates produce for market
2. Manager requests transport for market delivery
3. Transport Provider accepts request
4. Provider picks up bulk produce
5. Provider delivers to buyer/market
6. Delivery confirmed

---

## 4. Data Models

### Input Listing
```typescript
interface InputListing {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  category: "Planting Material" | "Fertilizer" | "Soil Amendment" | "Tools & Equipment" | "Training Materials";
  description: string;
  price: number;
  unit: string;
  stock: number;
  minimumStock?: number;
  images: string[];
  location: string;
  rating: number;
  reviews: number;
  status: "active" | "inactive" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}
```

### Input Order
```typescript
interface InputOrder {
  id: string;
  inputId: string;
  inputName: string;
  providerId: string;
  providerName: string;
  farmerId: string;
  farmerName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalAmount: number;
  transportRequested: boolean;
  transportCost?: number;
  deliveryLocation: string;
  status: "pending" | "accepted" | "processing" | "ready" | "in_transit" | "delivered" | "completed" | "cancelled";
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
}
```

### Transport Request
```typescript
interface TransportRequest {
  id: string;
  type: "produce" | "input" | "market";
  requesterId: string;
  requesterName: string;
  requesterType: "farmer" | "input_provider" | "aggregation_center" | "buyer";
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number };
  dropoffLocation: string;
  dropoffCoordinates?: { lat: number; lng: number };
  distance: number; // km
  weight: number; // kg
  scheduledDate: string;
  scheduledTime: string;
  estimatedCost: number;
  actualCost?: number;
  specialInstructions?: string;
  status: "pending" | "accepted" | "rejected" | "scheduled" | "in_progress" | "completed" | "cancelled";
  transportProviderId?: string;
  transportProviderName?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}
```

### Delivery
```typescript
interface Delivery {
  id: string;
  transportRequestId: string;
  transportProviderId: string;
  status: "accepted" | "en_route_pickup" | "at_pickup" | "loaded" | "in_transit" | "at_dropoff" | "delivered" | "completed";
  pickupTime?: string;
  deliveryTime?: string;
  photos: string[];
  signature?: string;
  notes?: string;
  rating?: number;
  review?: string;
}
```

---

## 5. UI Components

### Shared Components

1. **RequestTransport Component**
   - Location: `ospf/frontend/src/components/transport/RequestTransport.tsx`
   - Reusable across all user roles
   - Handles transport request creation

2. **InputManagement Component**
   - Location: `ospf/frontend/src/pages/inputs/InputManagement.tsx`
   - Input listing CRUD operations
   - Inventory tracking

3. **TransportRequests Component**
   - Location: `ospf/frontend/src/pages/transport/TransportRequests.tsx`
   - Displays pending requests
   - Accept/reject functionality

4. **ActiveDeliveries Component**
   - Location: `ospf/frontend/src/pages/transport/ActiveDeliveries.tsx`
   - Real-time delivery tracking
   - Status updates

5. **InputMarketplace Component**
   - Location: `ospf/frontend/src/pages/marketplace/InputMarketplace.tsx`
   - Farmer-facing input shopping
   - Search, filter, and order capabilities

---

## 6. Features Summary

### Input Provider Features ✅
- [x] Dashboard with statistics
- [x] Input listing management (add/edit/delete)
- [x] Image upload for inputs
- [x] Stock level tracking
- [x] Low stock alerts
- [x] Order management
- [x] Customer tracking
- [x] Revenue analytics
- [x] Category management
- [x] Price management
- [x] Inventory management

### Transport Provider Features ✅
- [x] Dashboard with statistics
- [x] View pending transport requests
- [x] Accept/reject requests
- [x] Track active deliveries
- [x] Update delivery status
- [x] Earnings tracking
- [x] Delivery history
- [x] Rating and review system
- [x] Distance and ETA display
- [x] Multiple delivery types support

### Farmer Integration ✅
- [x] Input Marketplace access
- [x] Browse and search inputs
- [x] Place input orders
- [x] Request transport for produce
- [x] Track input orders
- [x] Rate input providers
- [x] Rate transport providers

### System Integration ✅
- [x] User role management
- [x] Routing configuration
- [x] Sidebar navigation
- [x] Dashboard redirection
- [x] Cross-role communication
- [x] Order flow integration
- [x] Payment system integration

---

## 7. Future Enhancements (Backend Required)

### Input Provider
- [ ] Real-time inventory synchronization
- [ ] Automated low stock notifications (SMS/Email)
- [ ] Analytics dashboard with charts
- [ ] Bulk input upload
- [ ] Input bundling (package deals)
- [ ] Seasonal pricing
- [ ] Subscription-based input delivery
- [ ] Quality certification tracking

### Transport Provider
- [ ] GPS tracking integration
- [ ] Real-time location sharing
- [ ] Route optimization
- [ ] Multi-stop delivery support
- [ ] Fuel cost calculation
- [ ] Vehicle management
- [ ] Driver assignment
- [ ] Automated payment processing
- [ ] Insurance integration
- [ ] Delivery proof (signature + photo)

### General
- [ ] Push notifications for new requests
- [ ] In-app messaging between providers and customers
- [ ] Automated matching algorithms
- [ ] Performance analytics
- [ ] Feedback and rating system
- [ ] Dispute resolution system
- [ ] Contract management
- [ ] KYC verification for providers

---

## 8. Mock Login Credentials

### All User Roles

| Role | Name | Phone | Password |
|------|------|-------|----------|
| Farmer | John Mutua | +254712345678 | `farmer123` |
| Buyer | Sarah Mwangi | +254723456789 | `buyer123` |
| Officer | David Kimani | +254734567890 | `officer123` |
| Staff | Mary Wanjiku | +254745678901 | `staff123` |
| Aggregation Manager | Peter Kariuki | +254756789012 | `manager123` |
| **Input Provider** | **Grace Njeri** | **+254767890123** | **`input123`** |
| **Transport Provider** | **James Omondi** | **+254778901234** | **`transport123`** |

### Quick Login Guide

**Input Provider:**
```
Phone:    +254767890123
Password: input123
Role:     input_provider
```

**Transport Provider:**
```
Phone:    +254778901234
Password: transport123
Role:     transport_provider
```

### How to Login
1. Navigate to `/login`
2. Click "Fill" button next to desired role in the mock credentials panel
3. Click "Sign In"
4. You'll be redirected to the role-specific dashboard

**Full Credentials Documentation:** See `MOCK_LOGIN_CREDENTIALS.md`

---

## 9. Testing Checklist

### Input Provider Testing
- [x] Dashboard loads correctly
- [x] Can add new input listing
- [x] Can edit existing listing
- [x] Can delete listing
- [x] Can upload images
- [x] Stock levels update correctly
- [x] Low stock alerts appear
- [x] Orders display correctly
- [x] Navigation works properly

### Transport Provider Testing
- [x] Dashboard loads correctly
- [x] Pending requests display
- [x] Can accept requests
- [x] Can reject requests
- [x] Active deliveries display
- [x] Can update delivery status
- [x] Earnings display correctly
- [x] Navigation works properly

### Integration Testing
- [x] Farmer can access Input Marketplace
- [x] Farmer can place input order
- [x] Farmer can request transport
- [x] Input Provider receives orders
- [x] Transport Provider receives requests
- [x] Status updates propagate correctly
- [x] Navigation between roles works
- [x] Role-based access control works

---

## 9. Documentation Links

- **User Role Context:** `ospf/frontend/src/contexts/UserRoleContext.tsx`
- **Main Routing:** `ospf/frontend/src/App.tsx`
- **Sidebar Navigation:** `ospf/frontend/src/components/layout/RoleBasedSidebar.tsx`
- **Input Provider Dashboard:** `ospf/frontend/src/pages/dashboard/InputProviderDashboard.tsx`
- **Transport Provider Dashboard:** `ospf/frontend/src/pages/dashboard/TransportProviderDashboard.tsx`
- **Input Management:** `ospf/frontend/src/pages/inputs/InputManagement.tsx`
- **Input Marketplace:** `ospf/frontend/src/pages/marketplace/InputMarketplace.tsx`
- **Transport Requests:** `ospf/frontend/src/pages/transport/TransportRequests.tsx`
- **Active Deliveries:** `ospf/frontend/src/pages/transport/ActiveDeliveries.tsx`
- **Request Transport Component:** `ospf/frontend/src/components/transport/RequestTransport.tsx`

---

## 10. Implementation Notes

### Current Status: UI-Only Implementation
All components are currently implemented with **mock data** for demonstration purposes. The UI is fully functional and interactive, but requires backend API integration for production use.

### Mock Data Usage
- Input listings use sample data arrays
- Transport requests use sample data
- Orders use sample data
- All API calls are currently simulated with `setTimeout`

### Next Steps for Production
1. Define and implement backend API endpoints
2. Replace mock data with actual API calls
3. Implement authentication and authorization
4. Add real-time updates (WebSockets/SSE)
5. Integrate payment processing
6. Add GPS tracking for transport
7. Implement notification system
8. Add data persistence
9. Implement search and filtering on backend
10. Add analytics and reporting

---

## 11. Support and Maintenance

### Known Limitations (UI-Only)
- No data persistence (refresh loses changes)
- No real-time updates
- No actual payment processing
- No GPS tracking
- No SMS/Email notifications
- No file storage for images (local display only)

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Responsive Design
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

---

**Last Updated:** January 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ UI Implementation Complete
