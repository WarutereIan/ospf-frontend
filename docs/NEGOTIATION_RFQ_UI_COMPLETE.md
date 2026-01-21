# Negotiation & RFQ UI Implementation - Complete

**Date:** January 2025  
**Status:** ✅ All Core UI Components Implemented

---

## ✅ Completed UI Components

### Negotiation Components

#### 1. **NegotiationDialog.tsx** ✅
**Location:** `src/components/marketplace/NegotiationDialog.tsx`

**Features:**
- View negotiation thread with all messages
- Display original listing details and current negotiated terms
- Send text messages
- Make counter offers (price, quantity)
- Accept/reject negotiation terms
- Convert accepted negotiation to order
- Status indicators and expiration tracking
- Real-time message updates

**Props:**
```typescript
interface NegotiationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  negotiationId?: string; // Load existing negotiation
  listingId?: string; // Initiate new negotiation
  onConvertToOrder?: (orderId: string) => void;
}
```

**Usage:**
```tsx
<NegotiationDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  negotiationId={negotiation.id}
  onConvertToOrder={(orderId) => navigate(`/orders/${orderId}`)}
/>
```

---

#### 2. **InitiateNegotiationButton.tsx** ✅
**Location:** `src/components/marketplace/InitiateNegotiationButton.tsx`

**Features:**
- Button to start negotiation on a listing
- Opens dialog with initial offer form
- Pre-fills with listing details
- Allows buyer to propose price/quantity
- Validates quantity against available stock
- Automatically opens NegotiationDialog after initiation

**Props:**
```typescript
interface InitiateNegotiationButtonProps {
  listing: ProduceListing;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}
```

**Usage:**
```tsx
<InitiateNegotiationButton
  listing={listing}
  variant="outline"
  size="icon"
/>
```

---

#### 3. **NegotiationList.tsx** ✅
**Location:** `src/components/marketplace/NegotiationList.tsx`

**Features:**
- List view of all negotiations
- Filter by status (pending, counter_offer, accepted, rejected, expired, converted)
- Search by negotiation number or counterpart name
- Display negotiation summary (listing, counterpart, current terms, status)
- Quick actions (view, convert to order)
- Badge indicators for status
- Last message timestamp

**Usage:**
```tsx
<NegotiationList />
```

---

### RFQ Components

#### 4. **RFQManagement.tsx** ✅
**Location:** `src/pages/buyer/RFQManagement.tsx`

**Features:**
- Main RFQ management page for buyers
- Create new RFQ (draft mode)
- List RFQs with tabs (All, Drafts, Published, Evaluating, Awarded, Closed)
- View RFQ details
- Publish/Close/Cancel RFQ actions
- Search functionality
- Status filtering

**Views:**
- List view (default)
- Create view (RFQForm)
- Details view (RFQDetails)

**Usage:**
```tsx
// Route: /buyer/rfqs
<RFQManagement />
```

---

#### 5. **RFQForm.tsx** ✅
**Location:** `src/components/marketplace/RFQForm.tsx`

**Features:**
- Form for creating/editing RFQs
- Product type selection (fresh_roots, process_grade, planting_vines)
- Quantity and unit selection
- Quality grade requirements
- Price range (optional)
- Deadline for quote submission
- Evaluation deadline
- Delivery location/region
- Terms and conditions
- Evaluation criteria
- Recurring RFQ options
- Save as draft or publish

**Props:**
```typescript
interface RFQFormProps {
  rfq?: RFQ; // If provided, edit mode
  onSubmit: (rfq: Partial<RFQ>) => Promise<void>;
  onCancel: () => void;
}
```

**Usage:**
```tsx
<RFQForm
  onSubmit={handleCreateRFQ}
  onCancel={() => setView("list")}
/>
```

---

#### 6. **RFQDetails.tsx** ✅
**Location:** `src/components/marketplace/RFQDetails.tsx`

**Features:**
- Detailed view of an RFQ
- Display all RFQ information
- Response list with management actions
- Response submission form (for suppliers)
- Award management (for buyers)
- Convert to order functionality
- Status badges and indicators
- Response count and statistics

**Props:**
```typescript
interface RFQDetailsProps {
  rfq: RFQ;
  onUpdate?: (id: string, rfq: Partial<RFQ>) => Promise<void>;
  onPublish?: (id: string) => Promise<void>;
  onClose?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
}
```

**Usage:**
```tsx
<RFQDetails
  rfq={selectedRFQ}
  onUpdate={handleUpdateRFQ}
  onPublish={handlePublishRFQ}
  onClose={closeRFQ}
  onCancel={cancelRFQ}
/>
```

---

#### 7. **RFQResponseForm.tsx** ✅
**Location:** `src/components/marketplace/RFQResponseForm.tsx`

**Features:**
- Form for submitting RFQ response/quote
- Quantity offered
- Price per unit
- Quality grade selection
- Variety selection (for fresh roots)
- Delivery time estimate
- Payment terms
- Additional notes
- Total amount calculation
- Validation against RFQ requirements

**Props:**
```typescript
interface RFQResponseFormProps {
  rfq: RFQ;
  onSubmit: (response: Partial<RFQResponse>) => Promise<void>;
  onCancel: () => void;
}
```

**Usage:**
```tsx
<RFQResponseForm
  rfq={rfq}
  onSubmit={handleSubmitResponse}
  onCancel={() => setShowResponseForm(false)}
/>
```

---

#### 8. **RFQResponseCard.tsx** ✅
**Location:** `src/components/marketplace/RFQResponseCard.tsx`

**Features:**
- Card for displaying RFQ response in list view
- Supplier information with rating
- Quote details (price, quantity, quality)
- Status badge
- Delivery time and payment terms
- Actions (shortlist, reject, award, convert to order)
- Highlighted when awarded or shortlisted

**Props:**
```typescript
interface RFQResponseCardProps {
  response: RFQResponse;
  rfq: RFQ;
  onUpdateStatus?: (responseId: string, status: RFQResponseStatus) => Promise<void>;
  onConvertToOrder?: (responseId: string) => Promise<void>;
}
```

**Usage:**
```tsx
<RFQResponseCard
  response={response}
  rfq={rfq}
  onUpdateStatus={handleUpdateResponseStatus}
  onConvertToOrder={handleConvertToOrder}
/>
```

---

#### 9. **RFQComparisonView.tsx** ✅
**Location:** `src/components/marketplace/RFQComparisonView.tsx`

**Features:**
- Side-by-side comparison of RFQ responses
- Table view with sortable columns (price, quantity, delivery time, rating)
- Multi-select for bulk actions
- Filter by status
- Bulk actions (shortlist multiple, award multiple)
- Visual highlighting of selected responses
- Quick actions per response

**Props:**
```typescript
interface RFQComparisonViewProps {
  responses: RFQResponse[];
  selectedResponseIds: string[];
  onSelectResponse: (id: string) => void;
  onUpdateStatus?: (responseId: string, status: RFQResponseStatus) => Promise<void>;
  onConvertToOrder?: (responseId: string) => Promise<void>;
}
```

**Usage:**
```tsx
<RFQComparisonView
  responses={responses}
  selectedResponseIds={selectedResponseIds}
  onSelectResponse={(id) => {
    setSelectedResponseIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  }}
  onUpdateStatus={handleUpdateResponseStatus}
  onConvertToOrder={handleConvertToOrder}
/>
```

---

#### 10. **RFQList.tsx** ✅
**Location:** `src/pages/farmer/RFQList.tsx`

**Features:**
- List of published RFQs for suppliers to browse
- Filter by product type
- Search functionality
- Sort by deadline
- Quick view of RFQ details
- "View & Respond" button
- Urgency indicators (days until deadline)
- Response count display

**Usage:**
```tsx
// Route: /farmer/rfqs
<RFQList />
```

---

## Integration Points

### MarketplacePage Integration ✅

**Updated:** `src/pages/marketplace/MarketplacePage.tsx`

- Replaced old negotiation button with `InitiateNegotiationButton`
- Removed old NegotiationDialog usage (now handled by InitiateNegotiationButton)
- Negotiation button appears on each listing card for buyers

**Changes:**
```tsx
// Before:
<Button onClick={() => setNegotiationDialogOpen(true)}>
  <IconMessageCircle />
</Button>

// After:
<InitiateNegotiationButton
  listing={listing}
  variant="outline"
  size="icon"
/>
```

---

## Component Relationships

```
MarketplacePage
    └── InitiateNegotiationButton
            └── NegotiationDialog

NegotiationList
    └── NegotiationDialog

RFQManagement
    ├── RFQForm (create/edit)
    └── RFQDetails
            ├── RFQResponseForm (submit quote)
            ├── RFQResponseCard (list view)
            └── RFQComparisonView (compare view)

RFQList (for suppliers)
    └── RFQDetails
            └── RFQResponseForm
```

---

## Routes to Add

### Buyer Routes
```tsx
// In App.tsx or routing file
<Route path="/buyer/rfqs" element={<RFQManagement />} />
<Route path="/buyer/negotiations" element={<NegotiationList />} />
```

### Farmer Routes
```tsx
<Route path="/farmer/rfqs" element={<RFQList />} />
<Route path="/farmer/negotiations" element={<NegotiationList />} />
```

---

## Navigation Updates Needed

### Buyer Sidebar
Add to buyer navigation:
- "RFQs" → `/buyer/rfqs`
- "Negotiations" → `/buyer/negotiations`

### Farmer Sidebar
Add to farmer navigation:
- "Available RFQs" → `/farmer/rfqs`
- "Negotiations" → `/farmer/negotiations`

---

## Usage Examples

### Example 1: Buyer Initiates Negotiation

```tsx
// In MarketplacePage.tsx (already integrated)
<InitiateNegotiationButton
  listing={listing}
  variant="outline"
  size="icon"
/>
```

**Flow:**
1. Buyer clicks "Negotiate" button on listing
2. Dialog opens with offer form
3. Buyer enters price, quantity, optional message
4. Negotiation created
5. NegotiationDialog opens automatically
6. Farmer receives notification

---

### Example 2: Buyer Creates RFQ

```tsx
// Navigate to RFQManagement page
<Button onClick={() => navigate("/buyer/rfqs")}>
  Manage RFQs
</Button>

// In RFQManagement, click "Create RFQ"
// RFQForm opens
// Fill form and submit
```

**Flow:**
1. Buyer navigates to RFQ Management
2. Clicks "Create RFQ"
3. Fills RFQForm
4. Saves as draft or publishes
5. If published, suppliers receive notifications

---

### Example 3: Supplier Submits Quote

```tsx
// Supplier navigates to RFQList
// Clicks "View & Respond" on an RFQ
// RFQDetails opens
// Clicks "Submit Quote"
// RFQResponseForm opens
// Fills and submits
```

**Flow:**
1. Supplier browses RFQList
2. Views RFQ details
3. Clicks "Submit Quote"
4. Fills RFQResponseForm
5. Submits quote
6. Buyer receives notification

---

### Example 4: Buyer Awards RFQ

```tsx
// In RFQDetails
// Switch to "Compare" view
// Select responses
// Click "Award Selected"
// Or award individual responses
```

**Flow:**
1. Buyer views RFQ details
2. Reviews responses (list or compare view)
3. Shortlists promising responses
4. Awards selected response(s)
5. Converts awarded response(s) to order(s)

---

## Testing Checklist

### Negotiation Features
- [ ] Buyer can initiate negotiation from listing
- [ ] Negotiation dialog displays correctly
- [ ] Messages can be sent
- [ ] Counter offers can be made
- [ ] Terms can be accepted/rejected
- [ ] Accepted negotiation can be converted to order
- [ ] Negotiation list displays correctly
- [ ] Filters work correctly

### RFQ Features
- [ ] Buyer can create RFQ
- [ ] RFQ can be saved as draft
- [ ] RFQ can be published
- [ ] Suppliers can view published RFQs
- [ ] Suppliers can submit quotes
- [ ] Buyer can view responses
- [ ] Buyer can compare responses
- [ ] Buyer can shortlist responses
- [ ] Buyer can award RFQ
- [ ] Awarded response can be converted to order
- [ ] RFQ can be closed/cancelled

---

## Next Steps

1. **Add Routes** - Update App.tsx with new routes
2. **Update Navigation** - Add links to sidebars
3. **Test Workflows** - Test end-to-end flows
4. **Backend Integration** - Connect to actual API endpoints
5. **Notifications** - Implement notification triggers
6. **Mobile Optimization** - Ensure responsive design

---

## Files Created

### Components
1. `src/components/marketplace/NegotiationDialog.tsx`
2. `src/components/marketplace/InitiateNegotiationButton.tsx`
3. `src/components/marketplace/NegotiationList.tsx`
4. `src/components/marketplace/RFQForm.tsx`
5. `src/components/marketplace/RFQDetails.tsx`
6. `src/components/marketplace/RFQResponseForm.tsx`
7. `src/components/marketplace/RFQResponseCard.tsx`
8. `src/components/marketplace/RFQComparisonView.tsx`

### Pages
1. `src/pages/buyer/RFQManagement.tsx`
2. `src/pages/farmer/RFQList.tsx`

### Updated Files
1. `src/pages/marketplace/MarketplacePage.tsx` - Added InitiateNegotiationButton

---

## Component Dependencies

### UI Components Used
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/dialog`
- `@/components/ui/input`
- `@/components/ui/textarea`
- `@/components/ui/select`
- `@/components/ui/badge`
- `@/components/ui/table`
- `@/components/ui/label`

### Icons Used
- `@tabler/icons-react` - Various icons

### Contexts Used
- `@/contexts/AuthContext` - User authentication
- `@/contexts/MarketplaceContext` - Marketplace state

---

## Notes

- **Checkbox Component**: Using native HTML checkbox input instead of UI component (can be replaced later)
- **Tabs Component**: Using simple button-based tabs instead of Tabs component (can be replaced later)
- **Table Component**: Using `@/components/ui/table` for comparison view
- **All components follow existing code patterns and styling**

---

**Implementation Status:** ✅ Complete  
**Ready for:** Backend integration and testing
