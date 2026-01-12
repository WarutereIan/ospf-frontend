# Aggregation Center Hierarchy Structure

## Overview
The OFSP Digital Marketplace Platform implements a two-tier hierarchical structure for aggregation centers to support efficient produce collection and distribution across Machakos County.

**Implementation Date:** January 13, 2026  
**Status:** ✅ Implemented in UI

---

## Hierarchical Structure

### 1. Main Aggregation Centers (Subcounty Level)

**Definition:** Main centers are large-scale aggregation facilities located at the subcounty level that serve as primary collection and distribution hubs.

**Characteristics:**
- **Location:** Subcounty headquarters or major market towns
- **Capacity:** 5,000 - 10,000 kg storage capacity
- **Coverage:** Serves entire subcounty and coordinates satellite centers
- **Infrastructure:** 
  - Large storage facilities
  - Quality control equipment
  - Cold storage (optional)
  - Loading/unloading zones
  - Office facilities for management
- **Staff:** 
  - Center Manager
  - Quality Control Officers
  - Stock Management Team
  - Administrative Staff

**Functions:**
- Primary collection point for produce from satellite centers
- Quality inspection and grading
- Bulk storage before market distribution
- Coordination of transport to markets
- Record keeping and reporting
- Training and support for satellite centers

### 2. Satellite Aggregation Centers (Ward Level)

**Definition:** Satellite centers are smaller collection points located at the ward level that feed into their designated main center.

**Characteristics:**
- **Location:** Ward-level markets or community centers
- **Capacity:** 1,000 - 2,000 kg storage capacity
- **Coverage:** Serves farmers within specific ward
- **Infrastructure:**
  - Basic storage facility
  - Simple weighing equipment
  - Minimal quality check tools
- **Staff:**
  - Center Coordinator
  - 1-2 Support Staff

**Functions:**
- First collection point for farmers
- Basic quality checks
- Local storage for immediate sales
- **Direct sales to local buyers** (small-scale purchases)
- **Delivery scheduling and coordination** (local deliveries)
- Transfer surplus to main center
- Farmer aggregation and coordination
- Local market liaison
- Community-level farmer support

**Relationship:** Each satellite center is linked to one main center within the same subcounty. Satellite centers can handle both local sales and transfers to main centers.

---

## Current Implementation

### Machakos County Centers

#### Main Centers (4)

| ID | Name | Subcounty | Location | Capacity | Status |
|----|------|-----------|----------|----------|--------|
| AC001 | Kangundo Main Aggregation Center | Kangundo | Kangundo Town | 10,000 kg | Operational |
| AC002 | Kathiani Main Aggregation Center | Kathiani | Kathiani Market | 8,000 kg | Operational |
| AC003 | Matungulu Main Aggregation Center | Matungulu | Matungulu Town | 7,000 kg | Operational |
| AC004 | Yatta Main Aggregation Center | Yatta | Yatta Market | 6,000 kg | Operational |

**Total Main Center Capacity:** 31,000 kg

#### Satellite Centers (6)

| ID | Name | Subcounty | Ward | Main Center | Capacity | Status |
|----|------|-----------|------|-------------|----------|--------|
| SAT001 | Kangundo East Satellite Center | Kangundo | Kangundo East | AC001 | 2,000 kg | Operational |
| SAT002 | Kangundo West Satellite Center | Kangundo | Kangundo West | AC001 | 1,500 kg | Operational |
| SAT003 | Kathiani Central Satellite Center | Kathiani | Kathiani Central | AC002 | 1,800 kg | Operational |
| SAT004 | Mitaboni Satellite Center | Kathiani | Mitaboni | AC002 | 1,500 kg | Operational |
| SAT005 | Matungulu North Satellite Center | Matungulu | Matungulu North | AC003 | 1,000 kg | Maintenance |
| SAT006 | Yatta South Satellite Center | Yatta | Yatta South | AC004 | 1,200 kg | Operational |

**Total Satellite Center Capacity:** 9,000 kg

**Overall System Capacity:** 40,000 kg (31,000 main + 9,000 satellite)

---

## Operational Flow

### Produce Collection and Distribution Flow

```
Farmer Harvest
    ↓
Satellite Center (Ward Level)
    - Basic quality check
    - Weighing and recording
    - Local storage
    ↓
    ├─→ LOCAL SALES PATH (Small-scale buyers)
    │   - Direct purchase at satellite center
    │   - Immediate pickup/delivery
    │   - Local market supply
    │   
    └─→ TRANSFER PATH (Surplus/Bulk orders)
        ↓
        Main Center (Subcounty Level)
        - Quality inspection and grading
        - Bulk storage
        - Consolidated inventory
        ↓
        Market/Large Buyer Delivery
        - Transport coordination
        - Bulk deliveries
        - Wholesale/export markets
```

### Two Purchase Channels

**1. Satellite Center Purchases (Local/Small-Scale)**
- Small quantity purchases (typically <100 kg)
- Local buyers (restaurants, retailers, individual consumers)
- Immediate pickup available
- Community-level transactions
- Quick turnaround

**2. Main Center Purchases (Bulk/Large-Scale)**
- Large quantity purchases (typically >100 kg)
- Institutional buyers, wholesalers, exporters
- Scheduled deliveries
- Quality-graded produce
- Consolidated from multiple sources

### Stock Movement Examples

#### Example 1: Farmer to Main Center (via Satellite)

**Scenario:** Farmer John in Kangundo East Ward delivers 250 kg OFSP

1. **Farmer to Satellite:**
   - John delivers to Kangundo East Satellite Center (SAT001)
   - Center Coordinator weighs and records
   - Basic visual quality check
   - Local storage

2. **Two Possible Paths:**

**Path A: Local Sale at Satellite**
   - Local buyer (e.g., restaurant owner) purchases 50 kg
   - Immediate transaction at satellite center
   - Buyer picks up directly from satellite
   - Remaining 200 kg stays in satellite storage

**Path B: Transfer to Main Center**
   - Evening consolidation (remaining 200 kg + other farmers' produce)
   - Transport arranged to Kangundo Main Center (AC001)
   - Batch transfer with updated inventory records
   - Main center processes and grades
   - Available for bulk buyers

#### Example 2: Buyer Purchase from Satellite Center

**Scenario:** Local restaurant owner needs 30 kg OFSP

1. **Browse Marketplace:**
   - Buyer views available stock
   - Filters by location (shows all centers)
   - Sees stock at Tala Satellite Center (nearby)

2. **Purchase from Satellite:**
   - Places order for 30 kg at Tala Satellite
   - Selects pickup at satellite center
   - Payment processed via escrow
   - Pickup scheduled

3. **Fulfillment:**
   - Satellite center prepares order
   - Quality check performed
   - Buyer picks up same day
   - Payment released to farmer

#### Example 3: Buyer Purchase from Main Center

**Scenario:** Wholesale buyer needs 500 kg OFSP

1. **Browse Marketplace:**
   - Buyer places bulk order
   - Selects Kangundo Main Center
   - Requires quality-graded produce

2. **Purchase from Main:**
   - Main center consolidates from multiple sources
   - Full quality inspection and grading
   - Bulk packaging prepared
   - Transport arranged

3. **Fulfillment:**
   - Quality certification provided
   - Scheduled delivery to buyer
   - Payment released to farmers
   - Records updated

#### Example 4: Delivery Scheduling from Satellite Center

**Scenario:** Restaurant owner in Tala needs 50 kg delivered

1. **Order Placement:**
   - Buyer places order for produce at Tala Satellite Center
   - Selects "Delivery" instead of pickup
   - Provides delivery address in Tala town
   - System calculates delivery fee (short distance)

2. **Transport Request:**
   - Satellite center manager requests transport
   - Local transport provider receives notification
   - Short-distance delivery (within ward)
   - Quick turnaround time

3. **Fulfillment:**
   - Transport provider picks up from satellite center
   - Delivers to buyer's restaurant
   - Payment released (produce + transport)
   - Efficient local logistics

#### Example 5: Delivery Scheduling from Main Center

**Scenario:** Wholesale buyer in Nairobi needs 2,000 kg

1. **Bulk Order:**
   - Large buyer places order from Kangundo Main Center
   - Requests delivery to Nairobi warehouse
   - Selects delivery date
   - System calculates transport cost (long distance)

2. **Transport Coordination:**
   - Main center manager requests transport
   - Transport provider with appropriate vehicle capacity accepts
   - Long-distance delivery coordination
   - Scheduled pickup time

3. **Fulfillment:**
   - Quality check and documentation
   - Loading and securing cargo
   - Transport to Nairobi
   - Delivery confirmation
   - Payment released to all parties

---

## Delivery and Transport Logistics

### From Satellite Centers

**Characteristics:**
- **Local deliveries** within ward or nearby areas
- **Small to medium quantities** (typically 10-200 kg)
- **Quick turnaround** (same-day or next-day)
- **Lower transport costs** (shorter distances)
- **Flexible scheduling** (responsive to local needs)

**Typical Use Cases:**
- Restaurant/hotel deliveries
- Small shop/vendor supplies
- Direct consumer deliveries
- Community institution orders (schools, hospitals)

**Transport Options:**
- Motorcycle/boda-boda (5-50 kg)
- Small pickup trucks (50-200 kg)
- Local transport providers familiar with area

### From Main Centers

**Characteristics:**
- **Medium to long-distance deliveries**
- **Bulk quantities** (typically 200-5,000 kg)
- **Scheduled deliveries** (advance planning required)
- **Higher transport costs** (longer distances, larger vehicles)
- **Consolidated shipments** (multiple orders combined)

**Typical Use Cases:**
- Wholesale market deliveries
- Large buyer warehouse deliveries
- Export market shipments
- Inter-regional transfers
- Consolidated satellite center supplies

**Transport Options:**
- Medium trucks (200-1,000 kg)
- Large trucks (1,000-5,000 kg)
- Refrigerated vehicles (for long distances)
- Professional logistics providers

### Transport Request Process

**For Farmers, Buyers, and Aggregation Centers:**

1. **Request Initiation:**
   - Select pickup location (main or satellite center)
   - Specify delivery destination
   - Indicate quantity and weight
   - Choose preferred time window

2. **Transport Provider Matching:**
   - System notifies available providers
   - Filters by vehicle capacity and location
   - Provider reviews and quotes price
   - Buyer/requester accepts or negotiates

3. **Execution:**
   - Provider picks up from center
   - Real-time tracking available
   - Delivery confirmation
   - Payment processing

4. **Rating and Feedback:**
   - Service quality rating
   - Delivery timeliness feedback
   - Build provider reputation

---

## Data Model

### AggregationCenter Interface

```typescript
interface AggregationCenter {
  id: string;
  name: string;
  location: string;
  subCounty: string;
  ward?: string; // For satellite centers only
  centerType: "main" | "satellite";
  mainCenterId?: string; // For satellite centers - links to parent main center
  manager: string;
  currentStock: number;
  capacity: number;
  activeFarmers: number;
  status: "operational" | "maintenance" | "closed";
  stockInToday: number;
  stockOutToday: number;
  alerts: string[];
}
```

### Key Fields Explanation

- **centerType:** Distinguishes between main and satellite centers
- **ward:** Only populated for satellite centers
- **mainCenterId:** Links satellite center to its parent main center
- **subCounty:** All centers (main and satellite) belong to a subcounty
- **capacity:** Storage capacity in kg (main: 5,000-10,000 kg, satellite: 1,000-2,000 kg)

---

## UI Implementation

### Officer Dashboard - Centers View

**Location:** `/dashboard/centers` (Officer role)

**Features:**
1. **Summary Statistics:**
   - Total Centers (10)
   - Main Centers (4)
   - Satellite Centers (7)
   - Total Stock across all centers
   - Stock In/Out Today
   - Overall Capacity Utilization

2. **Filter by Center Type:**
   - All Centers
   - Main Centers only
   - Satellite Centers only

3. **Center Cards:**
   - Visual indicators for center type (building icons)
   - Color-coded badges (blue for main, purple for satellite)
   - Location hierarchy display (Subcounty - Ward)
   - Stock levels and capacity
   - Status indicators
   - Manager information

4. **Summary Table:**
   - Sortable columns
   - Center type column
   - Location with hierarchy
   - Stock metrics
   - Utilization percentages

### Aggregation Manager Dashboard

**Location:** `/dashboard/aggregation`

**Features:**
- Center type badge display
- Location hierarchy (Subcounty/Ward)
- Visual indicators (building icons)
- Contextual information based on center type
- Dashboard title reflects center type

### Marketplace & Order Flows

**Location:** `/marketplace`, `/dashboard/buyer/orders`, `/dashboard/orders`

**Features:**
1. **Delivery/Pickup Location Selection:**
   - Dropdown shows ALL aggregation centers (main + satellite)
   - Each center displays:
     - Center name
     - Type indicator (Main or Satellite)
     - Location hierarchy (Subcounty/Ward)
     - Visual icon (Building for main, Community for satellite)

2. **Center Display Format:**
   ```
   Kangundo Main Aggregation Center (Main - Kangundo Subcounty)
   Tala Satellite Center (Satellite - Tala Ward, Kangundo)
   Mitaboni Satellite Center (Satellite - Mitaboni Ward, Kathiani)
   ```

3. **Buyer Benefits:**
   - **Small-scale buyers:** Can select nearby satellite centers for quick pickup
   - **Bulk buyers:** Can select main centers for larger quantities
   - **Flexibility:** Choose based on convenience and quantity needs

4. **Order Examples:**
   - Order #1: 30 kg → Tala Satellite Center (local restaurant)
   - Order #2: 500 kg → Kangundo Main Center (wholesale buyer)
   - Order #3: 100 kg → Mitaboni Satellite Center (local retailer)

### Data Structure (Shared)

**File:** `ospf/frontend/src/data/aggregationCenters.ts`

**Exports:**
- `mainCenters`: Array of main centers
- `satelliteCenters`: Array of satellite centers
- `allAggregationCenters`: Combined array
- `getCenterByValue()`: Helper function
- `getCentersByType()`: Filter by type
- `getSatellitesByMainCenter()`: Get satellites for a main center
- `formatCenterLabel()`: Format display label with type info

**Usage in Components:**
```typescript
import { allAggregationCenters, formatCenterLabel } from "@/data/aggregationCenters";

// In marketplace order dialog
<SelectContent>
  {allAggregationCenters.map((center) => (
    <SelectItem key={center.value} value={center.value}>
      {formatCenterLabel(center)}
    </SelectItem>
  ))}
</SelectContent>
```

---

## Benefits of Hierarchical Structure

### For Farmers
- **Proximity:** Satellite centers closer to farms
- **Convenience:** Shorter travel distances
- **Cost Savings:** Reduced transport costs to collection point
- **Flexibility:** More frequent deliveries possible

### For Aggregation System
- **Efficiency:** Better geographical coverage
- **Scalability:** Easy to add new satellite centers
- **Quality Control:** Staged quality checks
- **Logistics:** Optimized transport routes
- **Data Granularity:** Ward-level analytics

### For Buyers
- **Flexible Purchase Options:** Buy from main centers (bulk) or satellite centers (small-scale)
- **Proximity:** Satellite centers offer local pickup for nearby buyers
- **Consolidated Supply:** Bulk availability at main centers
- **Quality Assurance:** Quality checks at both center types
- **Reliable Inventory:** Better stock management
- **Multiple Collection Points:** Choose nearest center (main or satellite)

---

## Expansion Recommendations

### Short-term (Next 6 Months)
1. Add 2-3 satellite centers per subcounty
2. Establish standard operating procedures for satellite centers
3. Implement digital weighing and recording at all satellites
4. Set up regular transfer schedules (satellite → main)

### Medium-term (6-12 Months)
1. Introduce mobile collection points (mobile satellite centers)
2. Implement IoT sensors for real-time stock monitoring
3. Add cooling facilities at main centers
4. Establish quality standards training program

### Long-term (12+ Months)
1. Expand to additional subcounties
2. Implement blockchain for traceability
3. Add value-addition facilities at main centers
4. Integrate with national market information systems

---

## Coordination Between Centers

### Daily Operations

**Morning (7:00 AM - 9:00 AM):**
- Satellite centers open for farmer deliveries
- Main centers prepare for incoming transfers
- Quality checks performed

**Midday (12:00 PM - 2:00 PM):**
- Satellite centers consolidate morning collections
- First transfer to main centers
- Main centers process and grade incoming stock

**Afternoon (3:00 PM - 5:00 PM):**
- Second satellite center deliveries
- Main centers prepare buyer orders
- Transport coordination for market deliveries

**Evening (6:00 PM - 7:00 PM):**
- Final consolidation at satellites
- Evening transfer to main centers
- Daily reconciliation and reporting

### Communication Protocols

1. **Daily Reports:**
   - Satellite → Main: Stock received, quality issues
   - Main → Officer: Consolidated inventory, alerts

2. **Quality Alerts:**
   - Immediate escalation of quality concerns
   - Farmer feedback loops

3. **Capacity Alerts:**
   - 80% capacity warning from satellite to main
   - Overflow management coordination

---

## Technical Features

### Dashboard Features Implemented

1. **Visual Hierarchy:**
   - Icon indicators (Building vs. Community)
   - Color-coded badges
   - Location breadcrumbs

2. **Filtering:**
   - Filter by center type
   - Quick stats for each type
   - Filtered views in tables and cards

3. **Data Relationships:**
   - Satellite centers linked to main centers
   - Hierarchical location display
   - Capacity aggregation

4. **Responsive Design:**
   - Mobile-friendly cards
   - Tablet-optimized grids
   - Desktop full-feature tables

### Backend Requirements (Future)

1. **API Endpoints:**
   ```
   GET /api/centers?type=main|satellite
   GET /api/centers/:id/satellites
   GET /api/centers/:mainId/summary
   POST /api/transfers/satellite-to-main
   ```

2. **Data Aggregation:**
   - Real-time stock levels
   - Transfer tracking
   - Cross-center analytics

3. **Notifications:**
   - Low stock alerts
   - Quality issues
   - Transfer confirmations

---

## Success Metrics

### Key Performance Indicators (KPIs)

1. **Coverage:**
   - Number of wards with satellite centers
   - Average distance farmer → satellite center
   - Farmer registration rate per center

2. **Efficiency:**
   - Average time satellite → main transfer
   - Stock turnover rate
   - Capacity utilization percentage

3. **Quality:**
   - Grade distribution (A/B/C)
   - Rejection rate at main centers
   - Buyer satisfaction scores

4. **Financial:**
   - Cost per kg handled
   - Revenue per center
   - Farmer payment turnaround time

---

## Compliance and Standards

### Quality Standards
- Main centers: Full quality inspection equipment
- Satellite centers: Visual inspection guidelines
- Standardized grading criteria across all centers

### Record Keeping
- Digital records at all levels
- Traceability from farm to market
- Audit trail for stock movements

### Safety and Hygiene
- Food safety protocols
- Storage condition monitoring
- Regular facility audits

---

## Support and Training

### Center Manager Training
- Stock management
- Quality control procedures
- System usage
- Farmer liaison

### Satellite Coordinator Training
- Basic quality checks
- Weighing and recording
- Farmer communication
- Transfer procedures

### Continuous Improvement
- Monthly review meetings
- Best practice sharing
- Performance feedback
- Technology updates

---

## Implementation Summary

### Delivery and Transport Integration

**✅ Implemented Features:**

1. **Transport Request System**
   - Request transport from any aggregation center (main or satellite)
   - Deliver to any location (center, market, or custom address)
   - Support for multiple transport types:
     - Produce pickup (Farm → Center)
     - Produce delivery (Center → Market/Buyer)
     - Input delivery (Supplier → Farmer)

2. **Location Selection**
   - All 12 centers (4 main + 8 satellite) available for selection
   - Clear visual indicators (🏢 main, 🏪 satellite)
   - Location context (subcounty/ward information)
   - Custom location entry option

3. **Request Management**
   - Transport providers view all pending requests
   - Accept/reject requests
   - Track active deliveries
   - Complete delivery confirmation
   - Rating and feedback system

4. **Center-Specific Delivery Use Cases:**

   **From Satellite Centers:**
   - Local restaurant/shop deliveries (quick, short-distance)
   - Small quantities (10-200 kg)
   - Same-day delivery capability
   - Lower transport costs

   **From Main Centers:**
   - Bulk wholesale deliveries
   - Long-distance transport to markets
   - Large quantities (200-5,000 kg)
   - Consolidated shipments
   - Inter-regional transfers

### Key Files Updated:

1. `ospf/frontend/src/components/transport/RequestTransport.tsx`
   - Uses centralized `aggregationCenters` data
   - Displays all main and satellite centers
   - Visual indicators for center types

2. `ospf/frontend/src/pages/transport/TransportRequests.tsx`
   - Updated mock data to show satellite center deliveries
   - Demonstrates both local and long-distance requests

3. `ospf/frontend/src/data/aggregationCenters.ts`
   - Single source of truth for all center data
   - Used across marketplace, orders, and transport modules

4. Documentation updated to reflect:
   - Delivery scheduling from both center types
   - Transport logistics differences
   - Use case examples

---

**Last Updated:** January 13, 2026  
**Version:** 1.1.0  
**Status:** ✅ UI Complete - Delivery Integration Verified
