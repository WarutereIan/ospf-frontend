# Negotiation & RFQ Implementation Guide

**Date:** January 2025  
**Status:** ✅ Types, Services, and Context Complete | ⏳ UI Components Pending

---

## Overview

This document outlines the implementation of two key marketplace features:
1. **Negotiation Feature** - Allows buyers and farmers to negotiate price/quantity before placing orders
2. **RFQ (Request for Quotation) Workflows** - Enhanced sourcing requests with proper RFQ workflow management

---

## ✅ Completed Implementation

### 1. Type Definitions (`src/types/marketplace.ts`)

#### Negotiation Types
- `NegotiationStatus` - Status enum: `pending`, `counter_offer`, `accepted`, `rejected`, `expired`, `converted`
- `NegotiationMessage` - Individual message/offer in negotiation thread
- `Negotiation` - Complete negotiation entity with messages, terms, and status
- `NegotiationFilters` - Filter options for negotiations

#### RFQ Types
- `RFQStatus` - Status enum: `draft`, `published`, `closed`, `evaluating`, `awarded`, `cancelled`
- `RFQResponseStatus` - Response status: `draft`, `submitted`, `under_review`, `shortlisted`, `awarded`, `rejected`, `withdrawn`
- `RFQ` - Enhanced sourcing request with RFQ workflow (extends `SourcingRequest`)
- `RFQResponse` - Supplier's quote/response to an RFQ
- `RFQFilters` - Filter options for RFQs
- `RFQResponseFilters` - Filter options for RFQ responses

### 2. Service Functions (`src/services/marketplaceService.ts`)

#### Negotiation Services
- `getNegotiations(filters?)` - List negotiations
- `getNegotiationById(id)` - Get negotiation details
- `initiateNegotiation(listingId, message)` - Start negotiation on a listing
- `sendNegotiationMessage(negotiationId, message)` - Send counter offer/message
- `acceptNegotiation(negotiationId)` - Accept negotiation terms
- `rejectNegotiation(negotiationId)` - Reject negotiation
- `convertNegotiationToOrder(negotiationId)` - Convert accepted negotiation to order

#### RFQ Services
- `getRFQs(filters?)` - List RFQs
- `getRFQById(id)` - Get RFQ details
- `createRFQ(rfq)` - Create new RFQ
- `updateRFQ(id, rfq)` - Update RFQ
- `publishRFQ(id)` - Publish RFQ (make it visible to suppliers)
- `closeRFQ(id)` - Close RFQ (stop accepting responses)
- `cancelRFQ(id)` - Cancel RFQ
- `getRFQResponses(rfqId, filters?)` - Get responses for an RFQ
- `submitRFQResponse(rfqId, response)` - Submit quote/response
- `getRFQResponseById(rfqId, responseId)` - Get response details
- `updateRFQResponseStatus(rfqId, responseId, status)` - Update response status (shortlist, reject, award)
- `awardRFQ(rfqId, responseIds)` - Award RFQ to supplier(s)
- `convertRFQResponseToOrder(rfqId, responseId)` - Convert awarded response to order

### 3. Context Integration (`src/contexts/MarketplaceContext.tsx`)

#### State Added
- `negotiations: Negotiation[]` - List of negotiations
- `selectedNegotiation: Negotiation | null` - Currently selected negotiation
- `negotiationFilters: NegotiationFilters` - Active filters
- `rfqs: RFQ[]` - List of RFQs
- `selectedRFQ: RFQ | null` - Currently selected RFQ
- `rfqFilters: RFQFilters` - Active filters

#### Actions Added
- **Negotiation Actions:**
  - `fetchNegotiations(filters?)`
  - `fetchNegotiationById(id)`
  - `initiateNegotiation(listingId, message)`
  - `sendNegotiationMessage(negotiationId, message)`
  - `acceptNegotiation(negotiationId)`
  - `rejectNegotiation(negotiationId)`
  - `convertNegotiationToOrder(negotiationId)`
  - `setNegotiationFilters(filters)`
  - `clearSelectedNegotiation()`

- **RFQ Actions:**
  - `fetchRFQs(filters?)`
  - `fetchRFQById(id)`
  - `createRFQ(rfq)`
  - `updateRFQ(id, rfq)`
  - `publishRFQ(id)`
  - `closeRFQ(id)`
  - `cancelRFQ(id)`
  - `fetchRFQResponses(rfqId, filters?)`
  - `submitRFQResponse(rfqId, response)`
  - `fetchRFQResponseById(rfqId, responseId)`
  - `updateRFQResponseStatus(rfqId, responseId, status)`
  - `awardRFQ(rfqId, responseIds)`
  - `convertRFQResponseToOrder(rfqId, responseId)`
  - `setRFQFilters(filters)`
  - `clearSelectedRFQ()`

---

## ⏳ Pending Implementation: UI Components

### 1. Negotiation Components

#### `NegotiationDialog.tsx` (Buyer & Farmer)
**Purpose:** Main negotiation interface for viewing and participating in negotiations

**Features:**
- Display negotiation thread with messages
- Show original listing details
- Display current negotiated terms (price, quantity)
- Input fields for counter offers (price, quantity, message)
- Accept/Reject buttons
- Convert to order button (when accepted)
- Status indicators
- Expiration countdown

**Location:** `src/components/marketplace/NegotiationDialog.tsx`

**Usage:**
```tsx
<NegotiationDialog
  negotiationId={negotiation.id}
  open={open}
  onOpenChange={setOpen}
  onConvertToOrder={(orderId) => navigate(`/orders/${orderId}`)}
/>
```

#### `NegotiationList.tsx` (Buyer & Farmer)
**Purpose:** List view of all negotiations

**Features:**
- Filter by status (pending, counter_offer, accepted, rejected, expired, converted)
- Sort by date, status
- Show negotiation summary (listing, counterpart, current terms, status)
- Quick actions (view, accept, reject)
- Badge indicators for unread messages

**Location:** `src/components/marketplace/NegotiationList.tsx`

#### `InitiateNegotiationButton.tsx` (Buyer)
**Purpose:** Button to start negotiation on a listing

**Features:**
- Opens negotiation dialog with initial offer form
- Pre-fills with listing details
- Allows buyer to propose price/quantity

**Location:** `src/components/marketplace/InitiateNegotiationButton.tsx`

**Usage:**
```tsx
<InitiateNegotiationButton
  listing={listing}
  onNegotiationStarted={(negotiationId) => {
    // Handle negotiation started
  }}
/>
```

#### `NegotiationCard.tsx` (Buyer & Farmer)
**Purpose:** Card component for displaying negotiation in lists

**Features:**
- Compact view of negotiation details
- Status badge
- Current terms summary
- Last message preview
- Action buttons

**Location:** `src/components/marketplace/NegotiationCard.tsx`

---

### 2. RFQ Components

#### `RFQManagement.tsx` (Buyer)
**Purpose:** Main RFQ management page for buyers

**Features:**
- Create new RFQ (draft mode)
- List RFQs with filters (draft, published, closed, evaluating, awarded, cancelled)
- View RFQ details
- Publish/Close/Cancel RFQ actions
- View and manage responses
- Award RFQ to suppliers
- Convert awarded responses to orders

**Location:** `src/pages/buyer/RFQManagement.tsx`

**Tabs:**
- All RFQs
- Drafts
- Published
- Evaluating
- Awarded
- Closed

#### `RFQForm.tsx` (Buyer)
**Purpose:** Form for creating/editing RFQs

**Features:**
- Product type selection
- Quantity and unit
- Quality grade requirements
- Price range (optional)
- Deadline for quote submission
- Evaluation deadline
- Delivery location/region
- Terms and conditions
- Evaluation criteria
- Attachments upload
- Recurring RFQ options

**Location:** `src/components/marketplace/RFQForm.tsx`

#### `RFQCard.tsx` (Buyer & Supplier)
**Purpose:** Card component for displaying RFQ in lists

**Features:**
- RFQ summary (product, quantity, deadline)
- Status badge
- Response count
- Quick actions

**Location:** `src/components/marketplace/RFQCard.tsx`

#### `RFQDetails.tsx` (Buyer & Supplier)
**Purpose:** Detailed view of an RFQ

**Features:**
- Full RFQ information
- Response list (for buyers)
- Response submission form (for suppliers)
- Award management (for buyers)
- Convert to order (for buyers)

**Location:** `src/components/marketplace/RFQDetails.tsx`

#### `RFQResponseForm.tsx` (Supplier/Farmer)
**Purpose:** Form for submitting RFQ response/quote

**Features:**
- Quantity offered
- Price per unit
- Quality grade
- Delivery time estimate
- Payment terms
- Additional notes
- Attachments
- Batch selection (if available)

**Location:** `src/components/marketplace/RFQResponseForm.tsx`

#### `RFQResponseCard.tsx` (Buyer)
**Purpose:** Card for displaying RFQ response in comparison view

**Features:**
- Supplier information
- Quote details (price, quantity, quality)
- Status badge
- Comparison metrics
- Actions (shortlist, reject, award)

**Location:** `src/components/marketplace/RFQResponseCard.tsx`

#### `RFQComparisonView.tsx` (Buyer)
**Purpose:** Side-by-side comparison of RFQ responses

**Features:**
- Table/grid view of all responses
- Sortable columns (price, quantity, delivery time, rating)
- Filter by status
- Bulk actions (shortlist multiple, award multiple)
- Export comparison

**Location:** `src/components/marketplace/RFQComparisonView.tsx`

#### `RFQList.tsx` (Supplier/Farmer)
**Purpose:** List of published RFQs for suppliers to browse and respond

**Features:**
- Filter by product type, location, deadline
- Search functionality
- Sort by deadline, quantity, price range
- Quick view of RFQ details
- "Submit Quote" button

**Location:** `src/pages/farmer/RFQList.tsx` or `src/components/marketplace/RFQList.tsx`

---

## Workflow Diagrams

### Negotiation Workflow

```
Buyer Views Listing
    │
    ▼
Buyer Clicks "Negotiate"
    │
    ▼
Initiate Negotiation Dialog Opens
    │
    ├── Buyer enters proposed price/quantity
    ├── Buyer adds optional message
    │
    ▼
Negotiation Created (status: "pending")
    │
    ├── Notification to Farmer
    │
    ▼
Farmer Views Negotiation
    │
    ├── Accept Terms ──────────▶ Negotiation Accepted
    │                                    │
    │                                    ▼
    │                            Convert to Order
    │
    ├── Reject ─────────────────▶ Negotiation Rejected
    │
    └── Counter Offer ──────────▶ Send Counter Offer
                                        │
                                        ▼
                                  Negotiation (status: "counter_offer")
                                        │
                                        ├── Notification to Buyer
                                        │
                                        ▼
                                  Buyer Views Counter Offer
                                        │
                                        ├── Accept ──────▶ Accepted
                                        │
                                        ├── Reject ──────▶ Rejected
                                        │
                                        └── Counter Again ─▶ Back to Counter Offer
```

### RFQ Workflow

```
Buyer Creates RFQ (Draft)
    │
    ▼
Buyer Saves Draft / Publishes
    │
    ├── Save Draft ────────────▶ RFQ Status: "draft"
    │
    └── Publish ─────────────────▶ RFQ Status: "published"
                                        │
                                        ├── Notification to Suppliers
                                        │
                                        ▼
                                  Suppliers Browse RFQs
                                        │
                                        ▼
                                  Supplier Submits Quote
                                        │
                                        ▼
                                  RFQ Response (status: "submitted")
                                        │
                                        ├── Notification to Buyer
                                        │
                                        ▼
                                  Buyer Reviews Responses
                                        │
                                        ├── Shortlist ────▶ Response Status: "shortlisted"
                                        │
                                        ├── Reject ────────▶ Response Status: "rejected"
                                        │
                                        └── Award ─────────▶ Award RFQ
                                                                │
                                                                ├── RFQ Status: "awarded"
                                                                ├── Response Status: "awarded"
                                                                │
                                                                ▼
                                                          Convert to Order(s)
```

---

## Integration Points

### 1. Marketplace Page Integration

**Add to `MarketplacePage.tsx`:**
- "Negotiate" button on listing cards
- Filter option for "Negotiable" listings
- Negotiation badge on listings with active negotiations

### 2. Buyer Dashboard Integration

**Add to `BuyerDashboard.tsx`:**
- Negotiations section (active negotiations count)
- RFQs section (draft, published, evaluating counts)
- Quick links to negotiations and RFQs

### 3. Farmer Dashboard Integration

**Add to `FarmerDashboard.tsx`:**
- Negotiations section (pending negotiations count)
- RFQs section (available RFQs to respond to)
- Quick links to negotiations and RFQ list

### 4. Order Pages Integration

**Add to order detail pages:**
- Show negotiation history if order came from negotiation
- Show RFQ details if order came from RFQ response

---

## Notification Requirements

### Negotiation Notifications

| Event | Recipient | Priority | Message |
|-------|-----------|----------|---------|
| Negotiation Initiated | Farmer | High | "New negotiation request from [Buyer Name]" |
| Counter Offer Sent | Buyer/Farmer | High | "[Name] sent a counter offer" |
| Negotiation Accepted | Buyer/Farmer | High | "Negotiation accepted. Ready to convert to order" |
| Negotiation Rejected | Buyer/Farmer | Medium | "Negotiation rejected" |
| Negotiation Expired | Buyer/Farmer | Low | "Negotiation expired" |

### RFQ Notifications

| Event | Recipient | Priority | Message |
|-------|-----------|----------|---------|
| RFQ Published | Suppliers | High | "New RFQ published: [Product Type]" |
| Quote Submitted | Buyer | High | "New quote received for RFQ #[Number]" |
| Quote Shortlisted | Supplier | High | "Your quote for RFQ #[Number] has been shortlisted" |
| Quote Rejected | Supplier | Medium | "Your quote for RFQ #[Number] was not selected" |
| RFQ Awarded | Supplier | High | "Congratulations! Your quote for RFQ #[Number] has been awarded" |
| RFQ Closed | Suppliers | Medium | "RFQ #[Number] is now closed" |

---

## Data Flow Examples

### Example 1: Buyer Initiates Negotiation

```typescript
// Buyer clicks "Negotiate" on listing
const handleNegotiate = async (listing: ProduceListing) => {
  const message: Partial<NegotiationMessage> = {
    pricePerKg: 50, // Buyer proposes KES 50/kg (listing price is KES 60/kg)
    quantity: 100,  // Buyer wants 100kg
    message: "Can we negotiate the price for bulk purchase?",
    senderType: "buyer",
    isCounterOffer: false,
  };
  
  await initiateNegotiation(listing.id, message);
  // Notification sent to farmer
  // Negotiation created with status "pending"
};
```

### Example 2: Farmer Sends Counter Offer

```typescript
// Farmer responds with counter offer
const handleCounterOffer = async (negotiationId: string) => {
  const message: Partial<NegotiationMessage> = {
    pricePerKg: 55, // Farmer counters with KES 55/kg
    quantity: 100,   // Agrees to 100kg
    message: "I can do KES 55/kg for 100kg minimum",
    senderType: "farmer",
    isCounterOffer: true,
  };
  
  await sendNegotiationMessage(negotiationId, message);
  // Notification sent to buyer
  // Negotiation status updated to "counter_offer"
};
```

### Example 3: Buyer Creates and Publishes RFQ

```typescript
// Buyer creates RFQ
const handleCreateRFQ = async () => {
  const rfq: Partial<RFQ> = {
    title: "Fresh OFSP Roots - Bulk Purchase",
    productType: "fresh_roots",
    variety: "Kenya",
    total: 5000, // 5000 kg
    unit: "kg",
    qualityGrade: "A",
    priceRange: { min: 40, max: 60 },
    priceUnit: "kg",
    deadline: "2025-02-15",
    quoteDeadline: "2025-02-10",
    evaluationDeadline: "2025-02-12",
    deliveryRegion: "Nairobi",
    termsAndConditions: "Payment within 7 days of delivery",
    evaluationCriteria: "Price (40%), Quality (30%), Delivery Time (30%)",
    status: "draft",
    rfqStatus: "draft",
  };
  
  await createRFQ(rfq);
};

// Buyer publishes RFQ
const handlePublishRFQ = async (rfqId: string) => {
  await publishRFQ(rfqId);
  // RFQ status: "published"
  // Notifications sent to all suppliers
};
```

### Example 4: Supplier Submits RFQ Response

```typescript
// Supplier submits quote
const handleSubmitQuote = async (rfqId: string) => {
  const response: Partial<RFQResponse> = {
    quantity: 5000,
    quantityUnit: "kg",
    pricePerUnit: 50,
    priceUnit: "kg",
    qualityGrade: "A",
    variety: "Kenya",
    totalAmount: 250000, // 5000 * 50
    deliveryTime: "7 days",
    paymentTerms: "50% advance, 50% on delivery",
    notes: "Can deliver in batches if needed",
    status: "submitted",
  };
  
  await submitRFQResponse(rfqId, response);
  // Notification sent to buyer
};
```

### Example 5: Buyer Awards RFQ

```typescript
// Buyer awards RFQ to selected suppliers
const handleAwardRFQ = async (rfqId: string, responseIds: string[]) => {
  await awardRFQ(rfqId, responseIds);
  // RFQ status: "awarded"
  // Response statuses: "awarded"
  // Notifications sent to awarded suppliers
  // Option to convert to orders
};

// Convert awarded response to order
const handleConvertToOrder = async (rfqId: string, responseId: string) => {
  await convertRFQResponseToOrder(rfqId, responseId);
  // Order created
  // Navigate to order page
};
```

---

## API Endpoints to Implement (Backend)

### Negotiation Endpoints

```
GET    /api/marketplace/negotiations
GET    /api/marketplace/negotiations/:id
POST   /api/marketplace/negotiations
POST   /api/marketplace/negotiations/:id/messages
POST   /api/marketplace/negotiations/:id/accept
POST   /api/marketplace/negotiations/:id/reject
POST   /api/marketplace/negotiations/:id/convert-to-order
```

### RFQ Endpoints

```
GET    /api/marketplace/rfqs
GET    /api/marketplace/rfqs/:id
POST   /api/marketplace/rfqs
PUT    /api/marketplace/rfqs/:id
POST   /api/marketplace/rfqs/:id/publish
POST   /api/marketplace/rfqs/:id/close
POST   /api/marketplace/rfqs/:id/cancel
GET    /api/marketplace/rfqs/:id/responses
POST   /api/marketplace/rfqs/:id/responses
GET    /api/marketplace/rfqs/:rfqId/responses/:responseId
PUT    /api/marketplace/rfqs/:rfqId/responses/:responseId/status
POST   /api/marketplace/rfqs/:id/award
POST   /api/marketplace/rfqs/:rfqId/responses/:responseId/convert-to-order
```

---

## Next Steps

1. **Create UI Components** (Priority: High)
   - Start with `NegotiationDialog.tsx` and `RFQManagement.tsx`
   - Build supporting components as needed

2. **Update Existing Pages**
   - Add negotiation buttons to marketplace listings
   - Add RFQ links to buyer/farmer dashboards
   - Integrate negotiation/RFQ history in order pages

3. **Backend Implementation**
   - Implement API endpoints
   - Set up database schema for negotiations and RFQs
   - Implement notification triggers

4. **Testing**
   - Test negotiation workflows end-to-end
   - Test RFQ workflows end-to-end
   - Test notification delivery
   - Test order conversion from negotiations and RFQs

---

## Notes

- **Negotiation Expiration:** Consider implementing automatic expiration (e.g., 7 days) if no activity
- **RFQ Response Limits:** Consider limiting number of responses per supplier per RFQ
- **Bulk Operations:** Consider allowing buyers to create multiple orders from multiple RFQ responses
- **Analytics:** Track negotiation success rate, average rounds, RFQ response rates, etc.

---

**Document Version:** 1.0  
**Last Updated:** January 2025
