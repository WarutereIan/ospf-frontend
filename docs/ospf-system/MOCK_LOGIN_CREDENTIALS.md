# OFSP Digital Marketplace - Mock Login Credentials

## Overview
This document contains all mock login credentials for testing the OFSP Digital Marketplace Platform. These credentials provide access to different user roles and their respective dashboards.

**⚠️ For Development/Testing Only**

---

## Quick Reference Table

| Role | Name | Phone | Password | Dashboard |
|------|------|-------|----------|-----------|
| Farmer | John Mutua | +254712345678 | `farmer123` | `/dashboard/farmer` |
| Buyer | Sarah Mwangi | +254723456789 | `buyer123` | `/dashboard/buyer` |
| Officer | David Kimani | +254734567890 | `officer123` | `/dashboard/officer` |
| Staff | Mary Wanjiku | +254745678901 | `staff123` | `/dashboard/staff` |
| Aggregation Manager | Peter Kariuki | +254756789012 | `manager123` | `/dashboard/aggregation` |
| Input Provider | Grace Njeri | +254767890123 | `input123` | `/dashboard/input-provider` |
| Transport Provider | James Omondi | +254778901234 | `transport123` | `/dashboard/transport-provider` |
| Lead Farmer | Kamau Mwangi | +254789012345 | `leadfarmer123` | `/dashboard/lead-farmer` |

---

## Detailed Credentials

### 1. Farmer - John Mutua
```
Phone:    +254712345678
Password: farmer123
Role:     farmer
```

**Features Access:**
- View and manage produce listings
- Track orders from buyers
- Access marketplace to sell produce
- View peer leaderboard
- Access market information
- Purchase inputs from Input Marketplace
- Request transport services
- View payment history

**Dashboard:** `/dashboard/farmer`

---

### 2. Buyer - Sarah Mwangi
```
Phone:    +254723456789
Password: buyer123
Role:     buyer
```

**Features Access:**
- Browse and purchase produce from marketplace
- Place orders with farmers
- Track order status
- Rate and review farmers
- Negotiate prices
- Request quotes (RFQ)
- Use smart matching
- Create bulk orders
- Set up recurring orders
- Request transport services
- View payment history

**Dashboard:** `/dashboard/buyer`

---

### 3. Officer - David Kimani
```
Phone:    +254734567890
Password: officer123
Role:     officer
```

**Features Access:**
- Monitor farmer activities
- View aggregation centers
- Generate reports
- Provide advisory services
- Track overall system performance
- Manage farmer registrations
- View analytics

**Dashboard:** `/dashboard/officer`

---

### 4. Staff - Mary Wanjiku
```
Phone:    +254745678901
Password: staff123
Role:     staff
```

**Features Access:**
- User management
- System analytics
- Generate reports
- System settings
- View all activities
- Manage permissions
- Monitor platform health

**Dashboard:** `/dashboard/staff`

---

### 5. Aggregation Manager - Peter Kariuki
```
Phone:    +254756789012
Password: manager123
Role:     aggregation_manager
```

**Features Access:**
- Stock in/out management
- Quality check inspections
- Inventory management
- Storage management
- Capacity tracking
- Wastage tracking
- Farmer produce tracking
- Request transport for market deliveries
- Generate receipts
- View analytics

**Dashboard:** `/dashboard/aggregation`

---

### 6. Input Provider - Grace Njeri ✨ NEW
```
Phone:    +254767890123
Password: input123
Role:     input_provider
```

**Features Access:**
- Manage input listings (vines, fertilizers, tools, training materials)
- Upload product images
- Track inventory and stock levels
- Receive and process orders from farmers
- View customer list
- Track revenue and sales
- Manage pricing
- Set low stock alerts
- View order history
- Request transport for deliveries

**Dashboard:** `/dashboard/input-provider`

**Key Pages:**
- Input Management: `/dashboard/inputs`
- Order Management: `/dashboard/input-orders`
- Inventory: `/dashboard/input-inventory`
- Customer List: `/dashboard/customers`

---

### 7. Transport Provider - James Omondi ✨ NEW
```
Phone:    +254778901234
Password: transport123
Role:     transport_provider
```

**Features Access:**
- View and accept transport requests
- Track active deliveries
- Update delivery status
- View completed deliveries
- Track earnings (daily/weekly)
- View route information
- Upload delivery photos
- Receive ratings and reviews
- View distance and ETA
- Manage multiple delivery types:
  - Produce pickup (Farm → Aggregation Center)
  - Input delivery (Provider → Farmer)
  - Market delivery (Center → Market/Buyer)

**Dashboard:** `/dashboard/transport-provider`

**Key Pages:**
- Transport Requests: `/dashboard/transport-requests`
- Active Deliveries: `/dashboard/deliveries`
- Completed Deliveries: `/dashboard/completed-deliveries`
- Earnings: `/dashboard/earnings`

---

### 8. Lead Farmer - Kamau Mwangi
```
Phone:    +254789012345
Password: leadfarmer123
Role:     lead_farmer
```

**Features Access:**
- All farmer features (post produce, orders, pickup schedules, marketplace, inputs, analytics)
- Approvals: review and approve/reject commodity listings from farmers before they go live
- Pending approval queue at `/dashboard/lead-farmer`

**Dashboard:** `/dashboard/lead-farmer`

**Key Pages:**
- Pending Approval: `/dashboard/lead-farmer` (commodity posting approval queue)
- My Produce: `/dashboard/produce`
- Pickup Schedules: `/dashboard/farmer/pickup-schedules`

---

## Login Instructions

### Method 1: Manual Entry
1. Navigate to `/login` page
2. Enter phone number (with or without spaces/dashes)
3. Enter password
4. Click "Sign In"

### Method 2: Auto-Fill (Recommended)
1. Navigate to `/login` page
2. View the "Mock Login Credentials" panel on the right
3. Click the "Fill" button next to any credential
4. The form will auto-populate
5. Click "Sign In"

### Method 3: Copy Credentials
1. Navigate to `/login` page
2. Click the copy icon next to phone or password
3. Paste into the respective field
4. Click "Sign In"

---

## Testing Workflows

### 1. Complete Order Flow (Farmer → Buyer)
```
1. Login as Farmer (John Mutua)
   - Create produce listing
   - Set quality grade, quantity, price
   
2. Login as Buyer (Sarah Mwangi)
   - Browse marketplace
   - Place order
   - Make payment
   
3. Login as Farmer (John Mutua)
   - Accept order
   - Request transport
   
4. Login as Transport Provider (James Omondi)
   - Accept transport request
   - Update delivery status
   
5. Login as Aggregation Manager (Peter Kariuki)
   - Perform stock-in
   - Quality check
   - Confirm receipt
   
6. Login as Buyer (Sarah Mwangi)
   - Track order status
   - Rate farmer
```

### 2. Input Purchase Flow (Input Provider → Farmer)
```
1. Login as Input Provider (Grace Njeri)
   - Add input listings (vines, fertilizer)
   - Upload product images
   - Set prices and stock
   
2. Login as Farmer (John Mutua)
   - Browse Input Marketplace
   - Place order for inputs
   - Optionally request transport
   
3. Login as Input Provider (Grace Njeri)
   - View incoming order
   - Accept and process
   - Request transport (if needed)
   
4. Login as Transport Provider (James Omondi)
   - Accept delivery request
   - Pick up inputs
   - Deliver to farmer
   - Confirm delivery
```

### 3. Transport Service Flow
```
1. Login as Farmer (John Mutua)
   - Have produce ready
   - Request transport
   
2. Login as Transport Provider (James Omondi)
   - View pending requests
   - Accept request
   - Update status (en route, pickup, loaded, in transit)
   - Mark delivered
   
3. Login as Aggregation Manager (Peter Kariuki)
   - Confirm receipt at center
```

---

## Role Permissions Matrix

| Feature | Farmer | Buyer | Officer | Staff | Agg. Manager | Input Provider | Transport Provider |
|---------|--------|-------|---------|-------|--------------|----------------|-------------------|
| Create Produce Listing | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Purchase Produce | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create Input Listing | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Purchase Inputs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Request Transport | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Provide Transport | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Stock In/Out | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Quality Checks | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Reports | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| User Management | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Rate/Review | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Navigation After Login

### Farmer Dashboard
- **Sidebar Menu:**
  - Home
  - Marketplace (sell produce)
  - Inputs (buy inputs)
  - Dashboard
  - My Produce
  - Orders
  - Leaderboard
  - Market Info

### Buyer Dashboard
- **Sidebar Menu:**
  - Home
  - Marketplace (buy produce)
  - Dashboard
  - My Orders
  - Rate Farmers

### Input Provider Dashboard
- **Sidebar Menu:**
  - Home
  - Dashboard
  - My Inputs
  - Orders
  - Inventory
  - Customers

### Transport Provider Dashboard
- **Sidebar Menu:**
  - Home
  - Dashboard
  - Requests
  - Active Deliveries
  - Completed
  - Earnings

### Aggregation Manager Dashboard
- **Sidebar Menu:**
  - Home
  - Dashboard
  - Stock In
  - Stock Out
  - Quality Checks
  - Inventory
  - Farmers

### Officer Dashboard
- **Sidebar Menu:**
  - Home
  - Dashboard
  - Farmers
  - Reports
  - Centers
  - Advisory

### Staff Dashboard
- **Sidebar Menu:**
  - Home
  - Dashboard
  - Users
  - Analytics
  - Reports
  - Settings

---

## Password Reset

**Mock Implementation:**
- Navigate to `/forgot-password` (UI ready, backend needed)
- For testing, use the passwords provided above
- All mock passwords follow the pattern: `{role}123`

---

## Security Notes

### Current Implementation (Mock/Demo)
- ✅ Client-side role switching
- ✅ Phone number validation
- ✅ Password matching
- ❌ No actual authentication
- ❌ No session management
- ❌ No password hashing
- ❌ No token-based auth
- ❌ No refresh tokens
- ❌ No password strength validation

### Production Requirements
- Implement JWT-based authentication
- Add bcrypt password hashing
- Add rate limiting
- Implement 2FA (SMS OTP)
- Add session management
- Implement refresh tokens
- Add CSRF protection
- Add brute force protection
- Implement password reset flow
- Add account lockout after failed attempts

---

## Development Tips

### Switching Roles
To quickly test different roles:
1. Logout from current session
2. Navigate to `/login`
3. Use auto-fill for quick login

### Persistent Login
- Mock login persists in React context
- Refreshing the page will log out
- No localStorage/sessionStorage currently used

### Testing Multi-Role Interactions
- Use incognito/private windows for multiple simultaneous logins
- Use different browsers for different roles
- Clear browser cache when switching roles

---

## API Integration (Future)

### Login Endpoint
```typescript
POST /api/auth/login
Body: {
  phone: string,
  password: string
}
Response: {
  token: string,
  user: {
    id: string,
    name: string,
    phone: string,
    role: UserRole,
    // ... other user data
  }
}
```

### Logout Endpoint
```typescript
POST /api/auth/logout
Headers: {
  Authorization: "Bearer {token}"
}
Response: {
  success: boolean
}
```

---

## Troubleshooting

### Login Issues

**Problem:** "Invalid phone number or password"
- **Solution:** Check phone format (+254XXXXXXXXX)
- **Solution:** Copy credentials directly from mock panel
- **Solution:** Use auto-fill button

**Problem:** Not redirecting after login
- **Solution:** Check browser console for errors
- **Solution:** Ensure role exists in UserRoleContext
- **Solution:** Clear browser cache

**Problem:** Wrong dashboard displayed
- **Solution:** Check role assignment in DashboardPage.tsx
- **Solution:** Verify routing in App.tsx

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review React DevTools for state
3. Verify routing configuration
4. Check UserRoleContext state

---

**Last Updated:** January 13, 2026  
**Version:** 1.0.0  
**Status:** ✅ Mock Credentials Active (7 Roles)
