# New User Types Implementation: Input Providers & Transport Providers

## Overview

We have successfully integrated two new user types into the OFSP Marketplace platform to create a more complete agricultural value chain ecosystem:

1. **Input Providers** - Supply agricultural inputs (vines, fertilizers, training materials) to farmers
2. **Transport Providers** - Handle transportation of produce and inputs throughout the value chain

## 1. Input Providers

### Role Description
Input providers are businesses or individuals who supply agricultural inputs necessary for OFSP farming. They manage inventory, process orders from farmers, and facilitate delivery of inputs.

### Key Features

#### Dashboard (`InputProviderDashboard.tsx`)
- **Overview Statistics**
  - Total active input listings
  - Number of active orders and pending approvals
  - Total revenue and growth metrics
  - Customer count (active farmers)
  - Low stock alerts
  - Sales growth trends

- **Quick Actions**
  - Add new input listings
  - View and manage orders
  - Manage inventory levels
  - View customer list

- **Recent Orders Display**
  - Latest orders from farmers
  - Order status tracking (pending, processing, completed)
  - Quick access to order details

- **Low Stock Alerts**
  - Real-time monitoring of inventory levels
  - Automatic alerts when stock falls below minimum threshold
  - Quick restock actions

#### Input Management (`InputManagement.tsx`)
- **Add/Edit Inputs**
  - Input name and description
  - Category selection (Planting Material, Fertilizer, Soil Amendment, Tools, Training Materials)
  - Price per unit
  - Unit of measurement (cutting, kg, liter, piece, book, bundle)
  - Stock levels and minimum thresholds
  - Automatic status updates (available, low_stock, out_of_stock)

- **Input Catalog Display**
  - Tabular view of all inputs
  - Filtering and sorting capabilities
  - Edit and delete functions
  - Stock status indicators

- **Inventory Management**
  - Real-time stock tracking
  - Minimum stock level alerts
  - Restock recommendations

#### Sidebar Navigation
- Home
- Dashboard
- My Inputs (Input Management)
- Orders (Track sales)
- Inventory (Stock management)
- Customers (Customer list)

### Integration Points

1. **Input Marketplace** (`InputMarketplace.tsx`)
   - Farmers can browse all available inputs
   - Search and filter by category
   - Sort by price and rating
   - View provider details and ratings
   - Place orders directly
   - Optional transport request integration

2. **Order Management**
   - Input providers receive notifications of new orders
   - Order status tracking through fulfillment
   - Payment integration (future enhancement)

## 2. Transport Providers

### Role Description
Transport providers offer logistics services for moving produce from farms to aggregation centres, from centres to markets, and for delivering inputs to farmers.

### Key Features

#### Dashboard (`TransportProviderDashboard.tsx`)
- **Overview Statistics**
  - Number of active deliveries
  - Pending transport requests
  - Completed deliveries (today)
  - Daily and weekly earnings
  - Provider rating and reviews

- **Quick Actions**
  - View pending transport requests
  - Track active deliveries
  - View earnings history

- **Active Deliveries Display**
  - Real-time delivery status
  - Route information (from/to)
  - Distance and ETA
  - Delivery amount
  - Quick tracking access

- **Pending Requests Display**
  - New transport requests awaiting response
  - Request details (type, route, weight, scheduled time)
  - Accept/reject actions
  - Estimated earnings per request

#### Transport Requests Management (`TransportRequests.tsx`)
- **Request Types**
  - Produce Pickup (Farm to Aggregation Centre)
  - Produce Delivery (Centre to Market)
  - Input Delivery (Provider to Farmer)

- **Request Details**
  - Requester information
  - Pickup and delivery locations
  - Distance calculation
  - Scheduled time
  - Load weight and description
  - Payment amount

- **Request Actions**
  - View detailed request information
  - Accept or reject requests
  - Status tracking (pending, accepted, rejected)

#### Active Deliveries Tracking (`ActiveDeliveries.tsx`)
- **Delivery Progress**
  - Visual progress indicators
  - Current location tracking
  - ETA calculation
  - Status updates (pickup, in_transit, delivered)

- **Photo Documentation**
  - Upload proof of pickup
  - Upload proof of delivery
  - Photo verification for all parties

- **Completion Actions**
  - Mark as delivered
  - Confirm completion
  - Automatic payment processing

#### Sidebar Navigation
- Home
- Dashboard
- Requests (Pending transport requests)
- Active Deliveries (Current ongoing deliveries)
- Completed (Historical deliveries)
- Earnings (Payment history)

### Integration Points

1. **Request Transport Component** (`RequestTransport.tsx`)
   - Accessible to farmers, buyers, aggregation centres, and input providers
   - Integrated into multiple workflows:
     - Farmers can request transport when posting produce
     - Aggregation centres can request transport for market deliveries
     - Input providers can offer transport with orders
     - Buyers can request transport for large purchases

2. **Produce Management Integration**
   - "Request Transport" button in farmer's produce management
   - Automatic transport request when farmer wants to deliver to centre

3. **Order Flow Integration**
   - Transport request option during checkout
   - Delivery tracking linked to order status
   - Delivery confirmation triggers order progression

## Technical Implementation

### User Role System

#### Updated UserRoleContext (`UserRoleContext.tsx`)
```typescript
export type UserRole =
  | "farmer"
  | "buyer"
  | "officer"
  | "staff"
  | "aggregation_manager"
  | "input_provider"        // NEW
  | "transport_provider";    // NEW
```

#### Role-Based Routing (`App.tsx`)
- Dashboard redirects for new user types
- Role-specific route protection
- Dedicated routes for each user type's features

#### Sidebar Navigation (`RoleBasedSidebar.tsx`)
- Dynamic menu generation based on user role
- Icon-based navigation for better UX
- Context-aware active state highlighting

### Component Structure

```
src/
├── pages/
│   ├── dashboard/
│   │   ├── InputProviderDashboard.tsx     (NEW)
│   │   └── TransportProviderDashboard.tsx (NEW)
│   ├── inputs/
│   │   └── InputManagement.tsx            (NEW)
│   ├── marketplace/
│   │   └── InputMarketplace.tsx           (NEW)
│   └── transport/
│       ├── TransportRequests.tsx          (NEW)
│       └── ActiveDeliveries.tsx           (NEW)
└── components/
    └── transport/
        └── RequestTransport.tsx            (NEW)
```

## User Workflows

### Input Provider Workflow

1. **Setup**
   - Register as input provider
   - Add initial input listings
   - Set inventory levels

2. **Daily Operations**
   - Monitor dashboard for new orders
   - Process pending orders
   - Update inventory levels
   - Respond to low stock alerts

3. **Order Fulfillment**
   - Review order details
   - Confirm availability
   - Coordinate delivery or pickup
   - Update order status
   - Receive payment

### Transport Provider Workflow

1. **Setup**
   - Register as transport provider
   - Set service areas and capabilities
   - Define vehicle specifications

2. **Request Management**
   - Browse pending transport requests
   - Evaluate distance, weight, and payment
   - Accept suitable requests
   - Decline unsuitable requests

3. **Delivery Execution**
   - Navigate to pickup location
   - Verify and load cargo
   - Upload pickup photo
   - Transit to delivery location
   - Upload delivery photo
   - Confirm delivery completion
   - Receive payment

### Farmer Integration

1. **Browsing Inputs**
   - Access "Inputs" menu item
   - Browse input marketplace
   - Search and filter inputs
   - View provider ratings and reviews

2. **Purchasing Inputs**
   - Select desired input
   - Specify quantity
   - Optionally request transport
   - Complete order

3. **Requesting Transport**
   - Access "Request Transport" from produce management
   - Specify pickup and delivery locations
   - Provide load details
   - Submit request
   - Wait for provider acceptance

## Future Enhancements

### For Input Providers
1. **Advanced Features**
   - Bulk upload of inputs via CSV
   - Input variations (e.g., different package sizes)
   - Promotional pricing and discounts
   - Subscription services for recurring inputs
   - Integration with supplier management

2. **Analytics**
   - Sales trends analysis
   - Popular products dashboard
   - Customer segmentation
   - Inventory turnover rates
   - Profitability analysis per product

3. **Marketing**
   - Featured inputs
   - Promotional banners
   - Customer reviews and ratings
   - Loyalty programs

### For Transport Providers
1. **Advanced Features**
   - Route optimization
   - Multi-stop deliveries
   - Real-time GPS tracking
   - Vehicle capacity management
   - Maintenance scheduling

2. **Performance Metrics**
   - On-time delivery rate
   - Customer satisfaction scores
   - Earnings analytics
   - Vehicle utilization
   - Fuel efficiency tracking

3. **Integration**
   - Third-party mapping services (Google Maps, Mapbox)
   - Mobile app for drivers
   - Push notifications for new requests
   - Automated dispatch system

### Cross-cutting Enhancements
1. **Payment Integration**
   - M-PESA integration for instant payments
   - Escrow services for secure transactions
   - Payment history and invoicing
   - Automated payment splits (e.g., transport fee + product cost)

2. **Rating and Review System**
   - Farmers rate input providers and transport providers
   - Providers rate farmers (delivery cooperation)
   - Dispute resolution mechanism
   - Quality assurance feedback loops

3. **Communication**
   - In-app messaging between parties
   - SMS notifications for status updates
   - WhatsApp Business integration
   - Call initiation from app

4. **Compliance and Certification**
   - Input provider licensing verification
   - Transport provider vehicle inspection records
   - Insurance verification
   - Quality certifications display

## Database Schema Considerations

### Input Providers
```typescript
interface InputProvider {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  businessRegistration: string;
  rating: number;
  totalOrders: number;
  isVerified: boolean;
}

interface Input {
  id: string;
  providerId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  minStock: number;
  status: 'available' | 'low_stock' | 'out_of_stock';
  photos: string[];
  specifications: Record<string, any>;
}

interface InputOrder {
  id: string;
  inputId: string;
  providerId: string;
  farmerId: string;
  quantity: number;
  totalAmount: number;
  deliveryLocation: string;
  transportRequired: boolean;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}
```

### Transport Providers
```typescript
interface TransportProvider {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleCapacity: number; // in kg
  serviceAreas: string[];
  rating: number;
  totalDeliveries: number;
  isVerified: boolean;
  hasRefrigeration: boolean;
}

interface TransportRequest {
  id: string;
  type: 'produce_pickup' | 'produce_delivery' | 'input_delivery';
  requesterId: string;
  requesterType: 'farmer' | 'buyer' | 'centre' | 'input_provider';
  fromLocation: string;
  toLocation: string;
  distance: number;
  weight: number;
  scheduledTime: Date;
  description: string;
  specialRequirements: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  providerId?: string;
  createdAt: Date;
}

interface Delivery {
  id: string;
  requestId: string;
  providerId: string;
  status: 'pickup' | 'in_transit' | 'delivered';
  progress: number; // percentage
  currentLocation?: string;
  eta?: string;
  pickupPhoto?: string;
  deliveryPhoto?: string;
  startedAt: Date;
  completedAt?: Date;
}
```

## API Endpoints

### Input Providers
```
POST   /api/inputs                   - Create new input
GET    /api/inputs                   - List all inputs (with filters)
GET    /api/inputs/:id               - Get input details
PUT    /api/inputs/:id               - Update input
DELETE /api/inputs/:id               - Delete input

GET    /api/input-providers/:id/orders     - Get provider's orders
PUT    /api/input-orders/:id/status        - Update order status

GET    /api/input-providers/:id/dashboard  - Get dashboard stats
GET    /api/input-providers/:id/analytics  - Get analytics data
```

### Transport Providers
```
GET    /api/transport-requests              - List transport requests
POST   /api/transport-requests              - Create transport request
GET    /api/transport-requests/:id          - Get request details
PUT    /api/transport-requests/:id/accept   - Accept request
PUT    /api/transport-requests/:id/reject   - Reject request

GET    /api/transport-providers/:id/deliveries      - Get active deliveries
PUT    /api/deliveries/:id/status                   - Update delivery status
POST   /api/deliveries/:id/photos                   - Upload delivery photos

GET    /api/transport-providers/:id/dashboard       - Get dashboard stats
GET    /api/transport-providers/:id/earnings        - Get earnings history
```

## Testing Checklist

### Input Provider Features
- [ ] Register as input provider
- [ ] Add new input listing
- [ ] Edit existing input
- [ ] Delete input
- [ ] View low stock alerts
- [ ] Process incoming orders
- [ ] Update order status
- [ ] View customer list
- [ ] View dashboard statistics

### Transport Provider Features
- [ ] Register as transport provider
- [ ] View pending transport requests
- [ ] Accept transport request
- [ ] Reject transport request
- [ ] Track active delivery
- [ ] Upload pickup photo
- [ ] Upload delivery photo
- [ ] Mark delivery as complete
- [ ] View earnings

### Integration Testing
- [ ] Farmer can browse input marketplace
- [ ] Farmer can place input order
- [ ] Input provider receives order notification
- [ ] Farmer can request transport
- [ ] Transport provider receives request
- [ ] Transport provider accepts request
- [ ] Delivery tracking works end-to-end
- [ ] Order status updates when delivery completes
- [ ] Payment flows correctly through system

## Deployment Notes

1. **Database Migrations**
   - Add `input_provider` and `transport_provider` to user roles enum
   - Create tables for inputs, input_orders, transport_requests, deliveries
   - Add indexes for performance optimization

2. **Configuration**
   - Update authentication system to handle new user types
   - Configure permissions and access control
   - Set up notification systems (email, SMS)

3. **Environment Variables**
   - Mapping API keys (for transport routing)
   - Payment gateway credentials
   - SMS gateway configuration

## Support and Training

### For Input Providers
1. **Onboarding Guide**
   - How to create your profile
   - Adding your first inputs
   - Managing inventory
   - Processing orders

2. **Best Practices**
   - Accurate product descriptions
   - Competitive pricing strategies
   - Timely order fulfillment
   - Customer service excellence

### For Transport Providers
1. **Onboarding Guide**
   - Setting up your provider profile
   - Understanding request types
   - Using the delivery tracking system
   - Photo documentation requirements

2. **Best Practices**
   - Accepting suitable requests
   - Timely pickups and deliveries
   - Proper cargo handling
   - Communication with customers
   - Safety and compliance

## Conclusion

The integration of Input Providers and Transport Providers completes the OFSP marketplace ecosystem by addressing two critical needs in the agricultural value chain:

1. **Access to Quality Inputs** - Farmers can now easily source necessary inputs (vines, fertilizers, etc.) from verified providers with transparent pricing and ratings.

2. **Reliable Logistics** - All parties can request professional transport services, ensuring produce reaches markets in optimal condition and inputs are delivered to farms efficiently.

These additions create a more self-sufficient platform where all value chain participants can interact seamlessly, reducing friction, improving transparency, and ultimately increasing the success of OFSP farming in the region.

