---
puppeteer:
  format: "A4"
  margin:
    top: "2cm"
    right: "1.5cm"
    bottom: "2cm"
    left: "1.5cm"
  printBackground: true
  displayHeaderFooter: true
  headerTemplate: '<div style="font-size: 9px; margin-left: 1cm; color: #666;">Orange-Fleshed Sweet Potato (OFSP) System Documentation</div>'
  footerTemplate: '<div style="font-size: 9px; margin: 0 auto; color: #666;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
---

<style>
@media print {
  /* Base font settings */
  body {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
  }
  
  /* Headings */
  h1 {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 22pt;
    font-weight: bold;
    color: #1a1a1a;
    page-break-before: always;
    margin-top: 0;
    margin-bottom: 12pt;
  }
  
  h2 {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 18pt;
    font-weight: bold;
    color: #2c3e50;
    page-break-after: avoid;
    margin-top: 18pt;
    margin-bottom: 10pt;
  }
  
  h3 {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 14pt;
    font-weight: bold;
    color: #34495e;
    margin-top: 14pt;
    margin-bottom: 8pt;
  }
  
  h4 {
    font-family: 'Calibri', 'Arial', sans-serif;
    font-size: 12pt;
    font-weight: bold;
    color: #555;
    margin-top: 12pt;
    margin-bottom: 6pt;
  }
  
  /* Paragraphs */
  p {
    font-size: 11pt;
    margin-bottom: 8pt;
    text-align: justify;
  }
  
  /* Lists */
  ul, ol {
    font-size: 11pt;
    margin-bottom: 8pt;
  }
  
  li {
    margin-bottom: 4pt;
  }
  
  /* Tables */
  table {
    font-size: 10pt;
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
    margin-bottom: 12pt;
  }
  
  th {
    font-weight: bold;
    background-color: #f0f0f0;
    padding: 6pt;
  }
  
  td {
    padding: 6pt;
  }
  
  /* Code blocks */
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f4f4f4;
    padding: 2px 4px;
  }
  
  pre {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f8f8f8;
    padding: 10pt;
    border: 1px solid #ddd;
    page-break-inside: avoid;
    overflow-x: auto;
  }
  
  /* Block quotes */
  blockquote {
    font-size: 10pt;
    font-style: italic;
    border-left: 3px solid #ccc;
    padding-left: 10pt;
    margin-left: 0;
    page-break-inside: avoid;
  }
  
  /* Prevent page breaks */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }
  
  pre, blockquote, table, figure {
    page-break-inside: avoid;
  }
  
  /* Mermaid diagrams */
  .mermaid {
    page-break-inside: avoid;
    margin: 12pt 0;
    max-height: 700px;
    max-width: 100%;
    object-fit: contain;
  }
  
  /* Images and figures */
  img {
    max-width: 100%;
    max-height: 650px;
    object-fit: contain;
    page-break-inside: avoid;
    page-break-before: auto;
    page-break-after: auto;
    display: block;
    margin: 12pt auto;
  }
  
  figure {
    page-break-inside: avoid;
    margin: 12pt 0;
    text-align: center;
  }
  
  figure img {
    max-height: 600px;
    width: auto;
    height: auto;
  }
  
  /* SVG images (including Mermaid) */
  svg {
    max-width: 100%;
    max-height: 650px;
    page-break-inside: avoid;
  }
  
  /* Diagrams container */
  div[style*="transform: scale"] {
    page-break-inside: avoid;
    page-break-before: auto;
    page-break-after: auto;
  }
  
  /* Strong/Bold text */
  strong, b {
    font-weight: bold;
    color: #1a1a1a;
  }
  
  /* Emphasis/Italic text */
  em, i {
    font-style: italic;
  }
}
</style>


# Entity Lifecycle Mapping - OFSP Platform

**Date:** January 2025  
**Purpose:** Comprehensive end-to-end lifecycle mapping of all entities, processes, workflows, and outputs across all user roles

---

## Table of Contents

1. [User Roles & Permissions](#user-roles--permissions)
2. [Marketplace Order Lifecycle](#marketplace-order-lifecycle)
3. [Negotiation Lifecycle](#negotiation-lifecycle)
4. [RFQ (Request for Quotation) Lifecycle](#rfq-request-for-quotation-lifecycle)
5. [Sourcing Request Lifecycle](#sourcing-request-lifecycle)
6. [Buyer Requests Workflow](#buyer-requests-workflow)
7. [Farm Pickup Schedule Lifecycle](#farm-pickup-schedule-lifecycle)
8. [Input Order Lifecycle](#input-order-lifecycle)
9. [Storage Batch Lifecycle](#storage-batch-lifecycle)
10. [Transport Request Lifecycle](#transport-request-lifecycle)
11. [Payment & Escrow Lifecycle](#payment--escrow-lifecycle)
12. [Quality Check Lifecycle](#quality-check-lifecycle)
13. [Notification System](#notification-system)
14. [Data Points & Outputs](#data-points--outputs)


---

## User Roles & Permissions

### Role Definitions

| Role | Description | Key Responsibilities |
|------|-------------|---------------------|
| **Farmer** | OFSP producer | Post produce, manage orders, track sales, coordinate transport |
| **Buyer** | Produce purchaser | Browse marketplace, place orders, track purchases, rate farmers |
| **Input Provider** | Agricultural input supplier | Manage input catalog, process orders, coordinate delivery |
| **Transport Provider** | Logistics service provider | Accept transport requests, track deliveries, update status |
| **Aggregation Manager** | Center operations manager | Stock management, quality checks, inventory tracking, wastage management |
| **County Officer** | Extension officer | Monitor activities, generate reports, provide advisory, manage centers |
| **Staff** | System administrator | Full platform access, user management, analytics, system configuration |

### Role Interactions Matrix

```
┌─────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│             │ Farmer   │ Buyer    │ Input    │ Transport│ Aggr Mgr│ Officer  │ Staff    │
│             │          │          │ Provider │ Provider │         │          │          │
├─────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Farmer      │ Peer     │ Sell     │ Buy      │ Request  │ Deliver │ Report   │ -        │
│             │          │ Negotiate│          │          │         │          │          │
│             │          │ Respond  │          │          │         │          │          │
│             │          │ to RFQ   │          │          │         │          │          │
│ Buyer       │ Buy      │ -        │ -        │ Request  │ Receive │ Report   │ -        │
│             │ Negotiate│          │          │          │         │          │          │
│             │ Create   │          │          │          │         │          │          │
│             │ RFQ      │          │          │          │         │          │          │
│ Input Prov  │ Sell     │ -        │ -        │ Request  │ -       │ Report   │ -        │
│ Transport   │ Service  │ Service  │ Service  │ -        │ Service │ Report   │ -        │
│ Aggr Mgr    │ Receive  │ Deliver  │ -        │ Service  │ -       │ Report   │ -        │
│ Officer     │ Monitor  │ Monitor  │ Monitor  │ Monitor  │ Manage  │ -        │ Report   │
│ Staff       │ Manage   │ Manage   │ Manage   │ Manage   │ Manage  │ Manage   │ -        │
└─────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Key Interactions:**
- **Buyer ↔ Farmer:** Direct orders, Negotiations, RFQ responses, Sourcing requests
- **Buyer → RFQ:** Create, publish, manage, award RFQs
- **Farmer → RFQ:** Browse, respond, track responses
- **Buyer → Negotiation:** Initiate, counter-offer, accept/reject
- **Farmer → Negotiation:** Respond, counter-offer, accept/reject

---

## Marketplace Order Lifecycle

### Status Flow

```
order_placed → order_accepted → payment_secured → payment_confirmed_by_farmer → in_transit → at_aggregation → 
quality_checked → quality_approved/quality_rejected → out_for_delivery → 
delivered → completed
```

**Alternative paths:**
- `order_placed` → `rejected` (farmer rejects)
- `order_placed` → `cancelled` (buyer cancels)
- Any status → `disputed` (dispute raised)
- **Via Negotiation:** `negotiation_accepted` → `order_placed` (order created from accepted negotiation)
- **Via RFQ:** `rfq_response_awarded` → `order_placed` (order created from awarded RFQ response)

### Detailed Lifecycle Stages

#### 1. **Order Placed** (`order_placed`)
**Trigger:** Buyer places order from listing, sourcing request, accepted negotiation, or awarded RFQ response

**Actors:**
- **Buyer:** Initiates order
- **Farmer:** Receives notification

**Actions:**
- Buyer selects produce listing, OR
- Buyer accepts negotiation terms, OR
- Buyer awards RFQ response, OR
- Buyer responds to sourcing request
- Buyer specifies quantity, delivery location (if not pre-determined)
- System calculates total amount
- Order created with unique order number
- Batch ID generated for traceability
- If from negotiation: Negotiation status updated to "converted"
- If from RFQ: RFQ response status updated to "awarded"

**Data Points:**
- Order ID, Order Number
- Listing ID (if from listing)
- Negotiation ID (if from negotiation)
- RFQ ID, RFQ Response ID (if from RFQ)
- Sourcing Request ID (if from sourcing request)
- Farmer ID, Buyer ID
- Variety, Quantity, Quality Grade
- Price per Kg, Total Amount
- Delivery Location, Coordinates
- Batch ID, QR Code
- Created Timestamp

**Notifications:**
- **To Farmer:** "New order received from [Buyer Name]"
- **To Buyer:** "Order placed successfully. Order #XXX"

**Outputs:**
- MarketplaceOrder record
- Updated Negotiation (if applicable)
- Updated RFQ Response (if applicable)
- Activity log entry
- Notification records (2)

---

#### 2. **Order Accepted** (`order_accepted`)
**Trigger:** Farmer accepts the order

**Actors:**
- **Farmer:** Accepts order
- **Buyer:** Receives confirmation

**Actions:**
- Farmer reviews order details
- Farmer confirms availability
- Order status updated
- Payment escrow initiated (if applicable)

**Data Points:**
- Updated Timestamp
- Acceptance Timestamp
- Payment Status: "pending"

**Notifications:**
- **To Buyer:** "Farmer [Name] has accepted your order #XXX"
- **To Farmer:** "Order #XXX accepted. Proceed to payment"

**Outputs:**
- Updated MarketplaceOrder
- Payment record (escrow created)
- Activity log entry
- Notification records (2)

---

#### 3. **Payment Secured** (`payment_secured`)
**Trigger:** Buyer confirms payment with evidence

**Actors:**
- **Buyer:** Confirms payment with details and evidence
- **System:** Records payment confirmation
- **Farmer:** Receives confirmation

**Actions:**
- Buyer makes payment externally (M-Pesa, bank transfer, cash, etc.)
- Buyer navigates to order details page
- Buyer clicks "Confirm Payment" button
- Buyer fills payment confirmation form:
  - Payment method (M-Pesa, Bank Transfer, Cash, Credit)
  - Transaction reference/ID
  - Payment amount
  - Payment date
  - Payment details/notes (optional text)
  - Payment evidence (optional image upload - receipt, screenshot, etc.)
- Buyer checks "I confirm I have made this payment" checkbox
- Buyer submits payment confirmation
- System validates payment details
- Payment record created/updated with confirmation details
- Payment status updated to "secured"
- Order status updated to "payment_secured"
- Payment status: "secured" (awaiting farmer confirmation)
- Order processing blocked until farmer confirms payment receipt

**Data Points:**
- Payment ID
- Payment Amount
- Payment Method
- Transaction Reference/ID
- Payment Date
- Payment Details/Notes (text)
- Payment Evidence (image URL if uploaded)
- Confirmed By (Buyer ID)
- Confirmed At Timestamp
- Payment Status: "secured"

**Notifications:**
- **To Farmer:** "Payment confirmed for order #XXX. Amount: KES XXX. Transaction: [Reference]. Please confirm receipt to proceed"
- **To Buyer:** "Payment confirmation recorded. Waiting for farmer confirmation"

**Outputs:**
- Payment record (with confirmation details)
- Updated MarketplaceOrder (status: payment_secured)
- Activity log entry (PAYMENT_CONFIRMED)
- Notification records (2)

**Note:** This replaces the automated escrow system. Buyers now manually confirm payments with evidence. After buyer confirmation, the farmer must also confirm receipt of payment before order processing continues.

---

#### 4. **Farmer Payment Confirmation** (`payment_confirmed_by_farmer`)
**Trigger:** Farmer confirms receipt of buyer's payment

**Actors:**
- **Farmer:** Confirms payment receipt
- **System:** Records farmer confirmation
- **Buyer:** Receives confirmation

**Actions:**
- Farmer receives notification that buyer has confirmed payment
- Farmer navigates to order details page
- Farmer reviews buyer's payment confirmation details:
  - Payment method
  - Transaction reference
  - Payment amount
  - Payment evidence (if provided)
- Farmer clicks "Confirm Payment Received" button
- Farmer optionally adds notes about payment receipt
- Farmer submits confirmation
- System validates farmer owns the order
- Payment status updated to "confirmed_by_farmer"
- Order status remains "payment_secured" (or can be updated to allow processing)
- Order processing can now continue to next stages (transport, fulfillment)

**Data Points:**
- Farmer Confirmation Timestamp
- Farmer Confirmation Notes (optional)
- Payment Status: "confirmed_by_farmer"
- Order Status: "payment_secured" (ready for fulfillment)

**Notifications:**
- **To Buyer:** "Farmer has confirmed receipt of payment for order #XXX. Order is being processed"
- **To Farmer:** "Payment confirmation recorded. You can now proceed with order fulfillment"

**Outputs:**
- Updated Payment record (farmer confirmation timestamp and notes)
- Updated MarketplaceOrder (ready for fulfillment stages)
- Activity log entry (PAYMENT_CONFIRMED_BY_FARMER)
- Notification records (2)

**Note:** This two-step confirmation ensures both parties acknowledge the payment before order fulfillment begins, reducing disputes and ensuring transparency.

---

#### 5. **In Transit** (`in_transit`)
**Trigger:** Transport request accepted and pickup completed

**Actors:**
- **Farmer:** Coordinates pickup
- **Transport Provider:** Accepts and executes transport
- **Buyer:** Tracks delivery

**Actions:**
- Farmer creates transport request (produce_pickup)
- Transport provider accepts
- Pickup completed
- Transport status updated
- Order status updated

**Data Points:**
- Transport Request ID
- Transport Provider ID
- Pickup Timestamp
- Current Coordinates (tracking)
- Estimated Arrival Time
- Progress Percentage

**Notifications:**
- **To Buyer:** "Order #XXX is in transit. Track delivery"
- **To Farmer:** "Transport provider has picked up order #XXX"
- **To Transport Provider:** "Pickup completed. Proceed to aggregation center"

**Outputs:**
- TransportRequest record
- Updated MarketplaceOrder
- DeliveryTrackingUpdate records
- Activity log entry
- Notification records (3)

---

#### 5. **At Aggregation** (`at_aggregation`)
**Trigger:** Produce arrives at aggregation center

**Actors:**
- **Transport Provider:** Delivers to center
- **Aggregation Manager:** Receives stock
- **Farmer/Buyer:** Track status

**Actions:**
- Transport provider arrives at center
- Stock in transaction created
- Inventory updated
- Quality check scheduled
- Order status updated

**Data Points:**
- Center ID
- Stock Transaction ID
- Stock In Timestamp
- Inventory Item ID
- Storage Location
- Temperature, Humidity (if applicable)

**Notifications:**
- **To Aggregation Manager:** "New stock received for order #XXX"
- **To Buyer:** "Order #XXX has arrived at aggregation center"
- **To Farmer:** "Your produce for order #XXX has been received at center"

**Outputs:**
- StockTransaction record (type: "stock_in")
- InventoryItem record
- Updated MarketplaceOrder
- Activity log entry
- Notification records (3)

---

#### 6. **Quality Checked** (`quality_checked`)
**Trigger:** Quality check performed

**Actors:**
- **Aggregation Manager:** Performs quality check
- **Farmer/Buyer:** Receive results

**Actions:**
- Manager performs quality assessment
- Quality scores recorded (size, color, damage, dry matter)
- Quality check record created
- Pass/fail determination

**Data Points:**
- Quality Check ID
- Quality Score (0-100)
- Size Score, Color Score, Damage Score
- Dry Matter Content
- Quality Grade
- Checked By, Checked At
- Photos

**Notifications:**
- **To Buyer:** "Quality check completed for order #XXX"
- **To Farmer:** "Quality check results available for order #XXX"

**Outputs:**
- QualityCheck record
- Updated MarketplaceOrder (qualityScore, qualityFeedback)
- Activity log entry
- Notification records (2)

---

#### 7. **Quality Approved** (`quality_approved`) OR **Quality Rejected** (`quality_rejected`)
**Trigger:** Quality check result

**Actors:**
- **Aggregation Manager:** Approves/rejects
- **Buyer:** Receives result
- **Farmer:** Receives feedback

**Actions:**
- If approved: Proceed to delivery
- If rejected: Handle rejection (refund, dispute, etc.)

**Data Points:**
- Quality Status: "approved" | "rejected"
- Quality Feedback
- Updated Order Status

**Notifications:**
- **If Approved:**
  - **To Buyer:** "Order #XXX quality approved. Preparing for delivery"
  - **To Farmer:** "Order #XXX quality approved"
- **If Rejected:**
  - **To Buyer:** "Order #XXX quality rejected. Refund processing"
  - **To Farmer:** "Order #XXX quality rejected. Review feedback"

**Outputs:**
- Updated MarketplaceOrder
- Updated QualityCheck
- Activity log entry
- Notification records (2)
- If rejected: Refund record

---

#### 8. **Out for Delivery** (`out_for_delivery`)
**Trigger:** Stock out transaction and transport request created

**Actors:**
- **Aggregation Manager:** Creates stock out
- **Transport Provider:** Accepts delivery request
- **Buyer:** Tracks delivery

**Actions:**
- Stock out transaction created
- Transport request created (produce_delivery)
- Transport provider accepts
- Delivery initiated

**Data Points:**
- Stock Transaction ID (type: "stock_out")
- Transport Request ID
- Stock Out Timestamp
- Delivery Start Timestamp
- Current Coordinates

**Notifications:**
- **To Buyer:** "Order #XXX is out for delivery"
- **To Transport Provider:** "New delivery request for order #XXX"

**Outputs:**
- StockTransaction record (type: "stock_out")
- TransportRequest record
- Updated MarketplaceOrder
- Activity log entry
- Notification records (2)

---

#### 9. **Delivered** (`delivered`)
**Trigger:** Transport provider marks delivery complete

**Actors:**
- **Transport Provider:** Completes delivery
- **Buyer:** Receives produce
- **Farmer:** Receives confirmation

**Actions:**
- Delivery completed
- Delivery photos uploaded
- Delivery timestamp recorded
- Order status updated

**Data Points:**
- Delivered At Timestamp
- Delivery Photos
- Delivery Coordinates
- Transport Rating (if provided)

**Notifications:**
- **To Buyer:** "Order #XXX has been delivered"
- **To Farmer:** "Order #XXX delivered successfully"
- **To Aggregation Manager:** "Order #XXX delivered"

**Outputs:**
- Updated TransportRequest
- Updated MarketplaceOrder
- Activity log entry
- Notification records (3)

---

#### 10. **Completed** (`completed`)
**Trigger:** Payment released and order finalized

**Actors:**
- **Payment System:** Releases escrow
- **Buyer:** Confirms receipt
- **Farmer:** Receives payment

**Actions:**
- Buyer confirms delivery
- Escrow released to farmer
- Payment status: "released"
- Order status: "completed"
- Rating enabled

**Data Points:**
- Completed At Timestamp
- Payment Released Timestamp
- Final Payment Status: "released"
- Buyer Rating (if provided)
- Farmer Rating (if provided)

**Notifications:**
- **To Farmer:** "Payment released for order #XXX. Amount: KES XXX"
- **To Buyer:** "Order #XXX completed. Rate your experience"

**Outputs:**
- Updated Payment record
- Updated EscrowTransaction
- Updated MarketplaceOrder
- Rating records (if provided)
- Activity log entry
- Notification records (2)

---

### Marketplace Order Data Model

**Core Entity:** `MarketplaceOrder`

**Related Entities:**
- `ProduceListing` (source listing)
- `Negotiation` (if from negotiation)
- `RFQ`, `RFQResponse` (if from RFQ)
- `SourcingRequest`, `SupplierOffer` (if from sourcing request)
- `Payment` (payment record)
- `EscrowTransaction` (escrow details)
- `TransportRequest` (2x: pickup + delivery)
- `StockTransaction` (2x: stock_in + stock_out)
- `InventoryItem` (storage record)
- `QualityCheck` (quality assessment)
- `Notification` (multiple)
- `ActivityLog` (multiple)

**Traceability:**
- `batchId`: Links to farmer's batch
- `qrCode`: QR code for traceability
- `orderNumber`: Human-readable identifier

---

## Negotiation Lifecycle

### Overview

Negotiations enable buyers and farmers to negotiate price, quantity, and terms before placing a direct order. This provides flexibility for both parties to reach mutually agreeable terms.

### Status Flow

```
pending → counter_offer → accepted/rejected/expired → converted (if accepted)
```

**Alternative paths:**
- `pending` → `rejected` (farmer rejects initial offer)
- `pending` → `accepted` (farmer accepts initial offer)
- `counter_offer` → `accepted` (buyer/farmer accepts counter)
- `counter_offer` → `rejected` (buyer/farmer rejects counter)
- `counter_offer` → `counter_offer` (another counter offer)
- `accepted` → `converted` (order created from negotiation)
- Any status → `expired` (negotiation expires)

### Detailed Lifecycle Stages

#### 1. **Negotiation Initiated** (`pending`)
**Trigger:** Buyer initiates negotiation from a produce listing

**Actors:**
- **Buyer:** Initiates negotiation
- **Farmer:** Receives notification

**Actions:**
- Buyer clicks "Negotiate" on listing
- Buyer enters initial offer (price, quantity, optional message)
- Negotiation created with status "pending"
- Original listing details preserved
- Negotiation thread started

**Data Points:**
- Negotiation ID
- Listing ID
- Buyer ID, Farmer ID
- Initial Offer: Price per Kg, Quantity, Total Amount
- Initial Message (optional)
- Original Listing Price (for reference)
- Status: "pending"
- Created Timestamp
- Expiration Date (if applicable)

**Notifications:**
- **To Farmer:** "New negotiation request from [Buyer Name] for [Listing Title]"
- **To Buyer:** "Negotiation initiated. Waiting for farmer response"

**Outputs:**
- Negotiation record
- NegotiationMessage record (initial offer)
- Activity log entry
- Notification records (2)

---

#### 2. **Counter Offer** (`counter_offer`)
**Trigger:** Farmer or buyer sends a counter offer

**Actors:**
- **Farmer/Buyer:** Sends counter offer
- **Counterparty:** Receives notification

**Actions:**
- Party reviews current offer
- Party enters counter offer (price, quantity, message)
- New message added to negotiation thread
- Negotiation status updated to "counter_offer"
- Previous offer terms preserved for reference

**Data Points:**
- Negotiation Message ID
- Sender Type: "buyer" | "farmer"
- Counter Offer: Price per Kg, Quantity, Total Amount
- Message Text
- Is Counter Offer: true
- Previous Offer Terms (for comparison)
- Sent Timestamp

**Notifications:**
- **To Counterparty:** "New counter offer received for negotiation #XXX"
- **To Sender:** "Counter offer sent. Waiting for response"

**Outputs:**
- NegotiationMessage record
- Updated Negotiation
- Activity log entry
- Notification records (2)

---

#### 3. **Negotiation Accepted** (`accepted`)
**Trigger:** Farmer or buyer accepts the current offer terms

**Actors:**
- **Acceptor:** Accepts terms (Farmer or Buyer)
- **Counterparty:** Receives confirmation

**Actions:**
- Party reviews final offer
- Party accepts terms
- Negotiation status updated to "accepted"
- Terms locked (price, quantity, total amount)
- Option to convert to order becomes available

**Data Points:**
- Accepted At Timestamp
- Final Terms: Price per Kg, Quantity, Total Amount
- Accepted By: Buyer ID or Farmer ID
- Status: "accepted"

**Notifications:**
- **To Counterparty:** "Your negotiation #XXX has been accepted"
- **To Acceptor:** "Negotiation accepted. You can now convert to order"

**Outputs:**
- Updated Negotiation
- Activity log entry
- Notification records (2)

---

#### 4. **Negotiation Rejected** (`rejected`)
**Trigger:** Farmer or buyer rejects the current offer

**Actors:**
- **Rejector:** Rejects offer (Farmer or Buyer)
- **Counterparty:** Receives notification

**Actions:**
- Party rejects current offer
- Negotiation status updated to "rejected"
- Negotiation closed (no further actions possible)
- Option to start new negotiation remains

**Data Points:**
- Rejected At Timestamp
- Rejected By: Buyer ID or Farmer ID
- Rejection Reason (optional)
- Status: "rejected"

**Notifications:**
- **To Counterparty:** "Negotiation #XXX has been rejected"
- **To Rejector:** "Negotiation rejected"

**Outputs:**
- Updated Negotiation
- Activity log entry
- Notification records (2)

---

#### 5. **Negotiation Converted to Order** (`converted`)
**Trigger:** Buyer converts accepted negotiation to marketplace order

**Actors:**
- **Buyer:** Converts to order
- **Farmer:** Receives order notification

**Actions:**
- Buyer clicks "Convert to Order" on accepted negotiation
- Marketplace order created with negotiated terms
- Negotiation status updated to "converted"
- Order proceeds through normal marketplace order lifecycle
- Negotiation linked to order for traceability

**Data Points:**
- Order ID (newly created)
- Negotiation ID (linked)
- Negotiated Terms: Price per Kg, Quantity, Total Amount
- Converted At Timestamp
- Status: "converted"

**Notifications:**
- **To Farmer:** "Negotiation #XXX converted to order #YYY"
- **To Buyer:** "Order #YYY created from negotiation #XXX"

**Outputs:**
- MarketplaceOrder record
- Updated Negotiation
- Activity log entry
- Notification records (2)

---

#### 6. **Negotiation Expired** (`expired`)
**Trigger:** Negotiation expires (time-based or deadline-based)

**Actors:**
- **System:** Auto-expires negotiation
- **Buyer/Farmer:** Receive notification

**Actions:**
- System checks expiration date
- Negotiation status updated to "expired"
- Negotiation closed
- Option to start new negotiation remains

**Data Points:**
- Expired At Timestamp
- Expiration Reason
- Status: "expired"

**Notifications:**
- **To Buyer:** "Negotiation #XXX has expired"
- **To Farmer:** "Negotiation #XXX has expired"

**Outputs:**
- Updated Negotiation
- Activity log entry
- Notification records (2)

---

### Negotiation Data Model

**Core Entity:** `Negotiation`

**Related Entities:**
- `ProduceListing` (source listing)
- `MarketplaceOrder` (if converted)
- `NegotiationMessage[]` (message thread)
- `Notification[]` (multiple)

**Key Fields:**
- `id`: Unique negotiation ID
- `listingId`: Source listing
- `buyerId`, `farmerId`: Parties involved
- `status`: Current status
- `messages`: Array of negotiation messages
- `currentPricePerKg`: Current negotiated price
- `currentQuantity`: Current negotiated quantity
- `expiresAt`: Expiration timestamp

---

## RFQ (Request for Quotation) Lifecycle

### Overview

RFQs (Requests for Quotation) enable buyers to publish structured sourcing requests that suppliers can respond to with quotes. This provides a competitive bidding process for bulk purchases.

### Status Flow

```
draft → published → closed/evaluating → awarded/cancelled
```

**RFQ Response Status Flow:**
```
draft → submitted → under_review → shortlisted/awarded/rejected/withdrawn
```

**Alternative paths:**
- `draft` → `cancelled` (buyer cancels before publishing)
- `published` → `closed` (buyer closes without awarding)
- `published` → `evaluating` (buyer reviewing responses)
- `evaluating` → `awarded` (buyer awards to supplier(s))
- `evaluating` → `closed` (buyer closes without awarding)
- `awarded` → `converted` (order(s) created from awarded response(s))

### Detailed Lifecycle Stages

#### 1. **RFQ Created** (`draft`)
**Trigger:** Buyer creates new RFQ

**Actors:**
- **Buyer:** Creates RFQ
- **System:** Stores draft

**Actions:**
- Buyer navigates to RFQ Management
- Buyer fills RFQ form (title, product type, quantity, price range, deadlines, etc.)
- RFQ saved as draft
- RFQ not visible to suppliers

**Data Points:**
- RFQ ID, RFQ Number
- Buyer ID
- Title, Product Type
- Quantity, Unit
- Price Range (min, max)
- Quality Grade (optional)
- Delivery Deadline
- Quote Submission Deadline
- Evaluation Deadline (optional)
- Delivery Region
- Additional Requirements
- Terms and Conditions
- Evaluation Criteria
- Is Recurring flag
- Recurring Frequency (if recurring)
- Status: "draft"
- Created Timestamp

**Notifications:**
- **To Buyer:** "RFQ draft saved"

**Outputs:**
- RFQ record
- Activity log entry
- Notification record (1)

---

#### 2. **RFQ Published** (`published`)
**Trigger:** Buyer publishes RFQ

**Actors:**
- **Buyer:** Publishes RFQ
- **Suppliers/Farmers:** Receive notification

**Actions:**
- Buyer reviews draft
- Buyer clicks "Publish"
- RFQ status updated to "published"
- RFQ becomes visible to all suppliers
- RFQ appears in supplier's "Buyer Requests" and "RFQ List" views
- Notifications sent to relevant suppliers

**Data Points:**
- Published At Timestamp
- Status: "published"
- Visibility: "public"
- Total Responses: 0 (initial)

**Notifications:**
- **To Suppliers:** "New RFQ published: [RFQ Title]"
- **To Buyer:** "RFQ #XXX published successfully"

**Outputs:**
- Updated RFQ
- Activity log entry
- Notification records (multiple to suppliers + 1 to buyer)

---

#### 3. **RFQ Response Submitted** (`submitted`)
**Trigger:** Supplier submits quote/response to RFQ

**Actors:**
- **Supplier/Farmer:** Submits quote
- **Buyer:** Receives notification

**Actions:**
- Supplier browses published RFQs
- Supplier views RFQ details
- Supplier fills response form (quantity, price, quality grade, delivery time, etc.)
- Supplier submits quote
- RFQ Response created with status "submitted"
- RFQ total responses count incremented

**Data Points:**
- RFQ Response ID
- RFQ ID
- Supplier ID, Supplier Name
- Quantity Offered
- Quantity Unit
- Price Per Unit
- Total Amount
- Quality Grade
- Delivery Time Estimate
- Payment Terms
- Batch ID (if available)
- Notes
- Status: "submitted"
- Submitted At Timestamp

**Notifications:**
- **To Buyer:** "New quote received for RFQ #XXX from [Supplier Name]"
- **To Supplier:** "Quote submitted successfully for RFQ #XXX"

**Outputs:**
- RFQResponse record
- Updated RFQ (totalResponses incremented)
- Activity log entry
- Notification records (2)

---

#### 4. **RFQ Response Under Review** (`under_review`)
**Trigger:** Buyer starts reviewing response

**Actors:**
- **Buyer:** Reviews response
- **Supplier:** Status updated

**Actions:**
- Buyer views RFQ responses
- Buyer opens response details
- Response status updated to "under_review"
- Buyer compares with other responses

**Data Points:**
- Reviewed At Timestamp
- Status: "under_review"

**Outputs:**
- Updated RFQResponse
- Activity log entry

---

#### 5. **RFQ Response Shortlisted** (`shortlisted`)
**Trigger:** Buyer shortlists promising response

**Actors:**
- **Buyer:** Shortlists response
- **Supplier:** Receives notification

**Actions:**
- Buyer identifies promising quotes
- Buyer shortlists response(s)
- Response status updated to "shortlisted"
- Supplier notified of shortlisting

**Data Points:**
- Shortlisted At Timestamp
- Status: "shortlisted"

**Notifications:**
- **To Supplier:** "Your quote for RFQ #XXX has been shortlisted"
- **To Buyer:** "Response shortlisted"

**Outputs:**
- Updated RFQResponse
- Activity log entry
- Notification record (1)

---

#### 6. **RFQ Response Awarded** (`awarded`)
**Trigger:** Buyer awards RFQ to supplier(s)

**Actors:**
- **Buyer:** Awards response
- **Supplier:** Receives notification

**Actions:**
- Buyer selects winning response(s)
- Buyer clicks "Award"
- Response status updated to "awarded"
- RFQ status updated to "awarded"
- Option to convert to order becomes available
- Other responses may be rejected

**Data Points:**
- Awarded At Timestamp
- Awarded By: Buyer ID
- Status: "awarded"
- RFQ Status: "awarded"

**Notifications:**
- **To Supplier:** "Congratulations! Your quote for RFQ #XXX has been awarded"
- **To Buyer:** "RFQ #XXX awarded to [Supplier Name]"
- **To Other Suppliers:** "RFQ #XXX has been awarded to another supplier"

**Outputs:**
- Updated RFQResponse
- Updated RFQ
- Activity log entry
- Notification records (multiple)

---

#### 7. **RFQ Response Converted to Order** (`converted`)
**Trigger:** Buyer converts awarded response to marketplace order

**Actors:**
- **Buyer:** Converts to order
- **Supplier:** Receives order notification

**Actions:**
- Buyer clicks "Convert to Order" on awarded response
- Marketplace order created with RFQ response terms
- RFQ Response status updated (if tracking conversion)
- Order proceeds through normal marketplace order lifecycle
- RFQ and RFQ Response linked to order for traceability

**Data Points:**
- Order ID (newly created)
- RFQ ID, RFQ Response ID (linked)
- Awarded Terms: Price Per Unit, Quantity, Total Amount
- Converted At Timestamp

**Notifications:**
- **To Supplier:** "RFQ #XXX converted to order #YYY"
- **To Buyer:** "Order #YYY created from RFQ #XXX"

**Outputs:**
- MarketplaceOrder record
- Updated RFQResponse
- Updated RFQ
- Activity log entry
- Notification records (2)

---

#### 8. **RFQ Closed** (`closed`)
**Trigger:** Buyer closes RFQ (deadline reached or manually closed)

**Actors:**
- **Buyer:** Closes RFQ
- **Suppliers:** Receive notification

**Actions:**
- Buyer closes RFQ (manually or auto-closed at deadline)
- RFQ status updated to "closed"
- No new responses accepted
- Existing responses remain for review

**Data Points:**
- Closed At Timestamp
- Closed By: Buyer ID (if manual)
- Status: "closed"

**Notifications:**
- **To Suppliers:** "RFQ #XXX has been closed"
- **To Buyer:** "RFQ #XXX closed"

**Outputs:**
- Updated RFQ
- Activity log entry
- Notification records (multiple)

---

#### 9. **RFQ Cancelled** (`cancelled`)
**Trigger:** Buyer cancels RFQ

**Actors:**
- **Buyer:** Cancels RFQ
- **Suppliers:** Receive notification

**Actions:**
- Buyer cancels RFQ
- RFQ status updated to "cancelled"
- All responses marked as cancelled/withdrawn
- RFQ removed from active listings

**Data Points:**
- Cancelled At Timestamp
- Cancelled By: Buyer ID
- Cancellation Reason (optional)
- Status: "cancelled"

**Notifications:**
- **To Suppliers:** "RFQ #XXX has been cancelled"
- **To Buyer:** "RFQ #XXX cancelled"

**Outputs:**
- Updated RFQ
- Updated RFQResponse records (all responses)
- Activity log entry
- Notification records (multiple)

---

### RFQ Data Model

**Core Entity:** `RFQ` (extends `SourcingRequest`)

**Related Entities:**
- `RFQResponse[]` (supplier quotes)
- `MarketplaceOrder[]` (if converted)
- `Notification[]` (multiple)

**Key Fields:**
- `id`: Unique RFQ ID
- `rfqNumber`: Human-readable RFQ number
- `buyerId`: Buyer who created RFQ
- `rfqStatus`: Current RFQ status
- `quoteDeadline`: Deadline for quote submission
- `evaluationDeadline`: Deadline for evaluation
- `totalResponses`: Number of responses received
- `awardedTo`: IDs of awarded suppliers

---

## Buyer Requests Workflow

### Overview

The Buyer Requests workflow provides farmers with a unified view of all buyer opportunities, including RFQs and Sourcing Requests. This streamlines the farmer's experience by consolidating buyer needs into a single marketplace-like interface.

### Workflow Stages

#### 1. **Farmer Views Buyer Requests**
**Trigger:** Farmer navigates to Buyer Requests page

**Actors:**
- **Farmer:** Views opportunities
- **System:** Aggregates RFQs and Sourcing Requests

**Actions:**
- Farmer navigates to `/farmer/marketplace` (Buyer Requests)
- System fetches published RFQs and open Sourcing Requests
- Requests displayed in unified card grid
- Filters available (type, product, status, search)

**Data Points:**
- Request Type: "rfq" | "sourcing"
- Request ID
- Title, Product Type
- Quantity, Unit
- Price Range
- Deadline
- Buyer Name
- Location
- Response Count
- Status

**Outputs:**
- Unified request cards display
- Filtered and sorted results

---

#### 2. **Farmer Views Request Details**
**Trigger:** Farmer clicks "View Details" on a request

**Actors:**
- **Farmer:** Views details
- **System:** Displays full request information

**Actions:**
- Farmer clicks on request card
- Details dialog opens
- Full request information displayed
- For RFQs: Shows RFQDetails component
- For Sourcing Requests: Shows sourcing request details

**Data Points:**
- All request fields
- Buyer information
- Requirements
- Terms and conditions
- Evaluation criteria (for RFQs)

**Outputs:**
- Details dialog display

---

#### 3. **Farmer Submits Response**
**Trigger:** Farmer submits quote (RFQ) or offer (Sourcing Request)

**Actors:**
- **Farmer:** Submits response
- **Buyer:** Receives notification

**Actions:**
- **For RFQ:**
  - Farmer clicks "Submit Quote"
  - RFQResponseForm opens
  - Farmer enters quote details
  - Quote submitted
  - RFQ Response created
  
- **For Sourcing Request:**
  - Farmer clicks "Submit Offer"
  - SupplierOfferForm opens
  - Farmer enters offer details
  - Offer submitted
  - Supplier Offer created

**Data Points:**
- Response/Offer ID
- Quantity Offered
- Price Per Unit
- Quality Grade
- Delivery Time
- Payment Terms
- Batch ID (if available)
- Notes

**Notifications:**
- **To Buyer:** "New quote/offer received for [Request Title]"
- **To Farmer:** "Quote/offer submitted successfully"

**Outputs:**
- RFQResponse or SupplierOffer record
- Updated Request (response count incremented)
- Activity log entry
- Notification records (2)

---

#### 4. **Farmer Tracks Responses**
**Trigger:** Farmer views their submitted responses

**Actors:**
- **Farmer:** Views response status
- **System:** Displays response tracking

**Actions:**
- Farmer navigates to "My RFQs" page
- Farmer switches to "My Responses" tab
- System filters RFQs where farmer has responded
- Response status displayed (submitted, shortlisted, awarded, rejected)
- Farmer can view response details and status updates

**Data Points:**
- Response Status
- Response Details
- Buyer Actions (if any)
- Award Status (if awarded)

**Outputs:**
- Filtered RFQ list
- Response status indicators

---

### Buyer Requests Data Model

**Unified View:** Combines `RFQ[]` and `SourcingRequest[]`

**Key Features:**
- Single interface for all buyer opportunities
- Unified filtering and search
- Type indicators (RFQ vs Sourcing)
- Status badges
- Urgency indicators (deadline countdown)
- Response tracking

---

## Sourcing Request Lifecycle

### Overview

Sourcing Requests enable buyers to post their procurement needs, allowing farmers to submit offers. This is a simpler alternative to RFQs, suitable for less structured procurement needs.

### Status Flow

```
draft → open → closed/fulfilled
```

**Supplier Offer Status Flow:**
```
pending → accepted/rejected
```

**Alternative paths:**
- `draft` → `cancelled` (buyer cancels before publishing)
- `open` → `urgent` (deadline approaching)
- `open` → `closed` (buyer closes)
- `open` → `fulfilled` (order created from accepted offer)
- `pending` (offer) → `accepted` → `converted` (order created)

### Detailed Lifecycle Stages

#### 1. **Sourcing Request Created** (`draft`)
**Trigger:** Buyer creates sourcing request

**Actors:**
- **Buyer:** Creates request
- **System:** Stores draft

**Actions:**
- Buyer navigates to Sourcing Requests
- Buyer fills request form (product type, quantity, price range, deadline, etc.)
- Request saved as draft
- Request not visible to suppliers

**Data Points:**
- Request ID, Request Number
- Buyer ID
- Title, Product Type
- Quantity, Unit
- Price Range (optional)
- Quality Grade (optional)
- Deadline
- Delivery Region
- Additional Requirements
- Is Recurring flag
- Status: "draft"
- Created Timestamp

**Notifications:**
- **To Buyer:** "Sourcing request draft saved"

**Outputs:**
- SourcingRequest record
- Activity log entry
- Notification record (1)

---

#### 2. **Sourcing Request Published** (`open`)
**Trigger:** Buyer publishes sourcing request

**Actors:**
- **Buyer:** Publishes request
- **Suppliers/Farmers:** Receive notification

**Actions:**
- Buyer reviews draft
- Buyer clicks "Publish"
- Request status updated to "open"
- Request becomes visible to suppliers
- Request appears in supplier's "Buyer Requests" view
- Notifications sent to relevant suppliers

**Data Points:**
- Published At Timestamp
- Status: "open"
- Visibility: "public"
- Supplier Count: 0 (initial)

**Notifications:**
- **To Suppliers:** "New sourcing request: [Request Title]"
- **To Buyer:** "Sourcing request #XXX published successfully"

**Outputs:**
- Updated SourcingRequest
- Activity log entry
- Notification records (multiple to suppliers + 1 to buyer)

---

#### 3. **Supplier Offer Submitted** (`pending`)
**Trigger:** Supplier submits offer to sourcing request

**Actors:**
- **Supplier/Farmer:** Submits offer
- **Buyer:** Receives notification

**Actions:**
- Supplier browses open sourcing requests
- Supplier views request details
- Supplier fills offer form (quantity, price, quality grade, batch ID, etc.)
- Supplier submits offer
- Supplier Offer created with status "pending"
- Request supplier count incremented

**Data Points:**
- Supplier Offer ID
- Sourcing Request ID
- Supplier ID, Supplier Name
- Quantity Offered
- Quantity Unit
- Price Per Kg
- Quality Grade
- Batch ID (if available)
- QR Code (if available)
- Status: "pending"
- Submitted At Timestamp

**Notifications:**
- **To Buyer:** "New offer received for sourcing request #XXX from [Supplier Name]"
- **To Supplier:** "Offer submitted successfully for sourcing request #XXX"

**Outputs:**
- SupplierOffer record
- Updated SourcingRequest (suppliers array updated)
- Activity log entry
- Notification records (2)

---

#### 4. **Supplier Offer Accepted** (`accepted`)
**Trigger:** Buyer accepts supplier offer

**Actors:**
- **Buyer:** Accepts offer
- **Supplier:** Receives notification

**Actions:**
- Buyer reviews offers
- Buyer accepts offer
- Offer status updated to "accepted"
- Option to convert to order becomes available
- Other offers may be rejected or remain pending

**Data Points:**
- Accepted At Timestamp
- Accepted By: Buyer ID
- Status: "accepted"

**Notifications:**
- **To Supplier:** "Your offer for sourcing request #XXX has been accepted"
- **To Buyer:** "Offer accepted. You can now convert to order"

**Outputs:**
- Updated SupplierOffer
- Activity log entry
- Notification records (2)

---

#### 5. **Supplier Offer Converted to Order** (`converted`)
**Trigger:** Buyer converts accepted offer to marketplace order

**Actors:**
- **Buyer:** Converts to order
- **Supplier:** Receives order notification

**Actions:**
- Buyer clicks "Convert to Order" on accepted offer
- Marketplace order created with offer terms
- Sourcing Request status updated to "fulfilled" (if fully met)
- Order proceeds through normal marketplace order lifecycle
- Sourcing Request and Supplier Offer linked to order for traceability

**Data Points:**
- Order ID (newly created)
- Sourcing Request ID, Supplier Offer ID (linked)
- Offer Terms: Price Per Kg, Quantity, Total Amount
- Converted At Timestamp

**Notifications:**
- **To Supplier:** "Sourcing request #XXX converted to order #YYY"
- **To Buyer:** "Order #YYY created from sourcing request #XXX"

**Outputs:**
- MarketplaceOrder record
- Updated SupplierOffer
- Updated SourcingRequest
- Activity log entry
- Notification records (2)

---

#### 6. **Sourcing Request Closed** (`closed`)
**Trigger:** Buyer closes request (deadline reached or manually closed)

**Actors:**
- **Buyer:** Closes request
- **Suppliers:** Receive notification

**Actions:**
- Buyer closes request (manually or auto-closed at deadline)
- Request status updated to "closed"
- No new offers accepted
- Existing offers remain for review

**Data Points:**
- Closed At Timestamp
- Closed By: Buyer ID (if manual)
- Status: "closed"

**Notifications:**
- **To Suppliers:** "Sourcing request #XXX has been closed"
- **To Buyer:** "Sourcing request #XXX closed"

**Outputs:**
- Updated SourcingRequest
- Activity log entry
- Notification records (multiple)

---

### Sourcing Request Data Model

**Core Entity:** `SourcingRequest`

**Related Entities:**
- `SupplierOffer[]` (supplier offers)
- `MarketplaceOrder[]` (if converted)
- `Notification[]` (multiple)

**Key Fields:**
- `id`: Unique request ID
- `requestId`: Human-readable request number
- `buyerId`: Buyer who created request
- `status`: Current request status
- `deadline`: Deadline for offers
- `suppliers`: Array of supplier references who have responded
- `fulfilled`: Quantity fulfilled

---

## Input Order Lifecycle

### Status Flow

```
pending → accepted → processing → ready_for_pickup → in_transit → delivered → completed
```

**Alternative paths:**
- `pending` → `rejected` (provider rejects)
- `pending` → `cancelled` (farmer cancels)
- Any status → `cancelled` (farmer cancels)

### Detailed Lifecycle Stages

#### 1. **Pending** (`pending`)
**Trigger:** Farmer places input order

**Actors:**
- **Farmer:** Places order
- **Input Provider:** Receives notification

**Actions:**
- Farmer browses input catalog
- Farmer selects input product
- Farmer specifies quantity
- Order created
- Payment status: "pending"

**Data Points:**
- Order ID, Order Number
- Farmer ID, Input Provider ID
- Input ID, Input Name
- Quantity, Unit
- Price Per Unit, Subtotal
- Transport Fee, Total Amount
- Delivery Location
- Requires Transport flag
- Created Timestamp

**Notifications:**
- **To Input Provider:** "New input order #XXX from [Farmer Name]"
- **To Farmer:** "Input order #XXX placed successfully"

**Outputs:**
- InputOrder record
- Activity log entry
- Notification records (2)

---

#### 2. **Accepted** (`accepted`)
**Trigger:** Input provider accepts order

**Actors:**
- **Input Provider:** Accepts order
- **Farmer:** Receives confirmation

**Actions:**
- Provider reviews order
- Provider confirms availability
- Order status updated
- Payment processing initiated

**Data Points:**
- Updated Timestamp
- Acceptance Timestamp
- Payment Status: "pending" → "paid" (if paid upfront)

**Notifications:**
- **To Farmer:** "Input provider has accepted order #XXX"
- **To Input Provider:** "Order #XXX accepted. Process payment"

**Outputs:**
- Updated InputOrder
- Payment record (if paid)
- Activity log entry
- Notification records (2)

---

#### 3. **Processing** (`processing`)
**Trigger:** Provider starts processing order

**Actors:**
- **Input Provider:** Processes order
- **Farmer:** Tracks progress

**Actions:**
- Provider prepares input items
- Inventory updated (stock reduced)
- Order status updated

**Data Points:**
- Processing Start Timestamp
- Updated Inventory Levels

**Notifications:**
- **To Farmer:** "Order #XXX is being processed"

**Outputs:**
- Updated InputOrder
- Updated Input (stock reduced)
- Activity log entry
- Notification record (1)

---

#### 4. **Ready for Pickup** (`ready_for_pickup`)
**Trigger:** Order prepared and ready

**Actors:**
- **Input Provider:** Marks ready
- **Farmer:** Receives notification

**Actions:**
- Provider marks order ready
- If pickup: Farmer notified
- If delivery: Transport request created

**Data Points:**
- Ready Timestamp
- Pickup Location (if pickup)
- Transport Request ID (if delivery)

**Notifications:**
- **If Pickup:**
  - **To Farmer:** "Order #XXX is ready for pickup at [Location]"
- **If Delivery:**
  - **To Farmer:** "Order #XXX is ready. Delivery arranged"
  - **To Transport Provider:** "New delivery request for input order #XXX"

**Outputs:**
- Updated InputOrder
- TransportRequest (if delivery)
- Activity log entry
- Notification records (1-2)

---

#### 5. **In Transit** (`in_transit`)
**Trigger:** Transport provider picks up (if delivery)

**Actors:**
- **Transport Provider:** Executes delivery
- **Farmer:** Tracks delivery

**Actions:**
- Transport provider picks up
- Delivery in progress
- Tracking updates

**Data Points:**
- Transport Request ID
- Pickup Timestamp
- Current Coordinates
- Estimated Arrival

**Notifications:**
- **To Farmer:** "Input order #XXX is in transit"
- **To Transport Provider:** "Pickup completed. Proceed to delivery"

**Outputs:**
- Updated TransportRequest
- Updated InputOrder
- DeliveryTrackingUpdate records
- Activity log entry
- Notification records (2)

---

#### 6. **Delivered** (`delivered`)
**Trigger:** Delivery completed or pickup confirmed

**Actors:**
- **Transport Provider:** Completes delivery (if delivery)
- **Farmer:** Confirms receipt
- **Input Provider:** Receives confirmation

**Actions:**
- Delivery completed
- Farmer confirms receipt
- Order status updated

**Data Points:**
- Delivered At Timestamp
- Delivery Photos (if applicable)
- Confirmation Timestamp

**Notifications:**
- **To Input Provider:** "Order #XXX delivered successfully"
- **To Farmer:** "Input order #XXX delivered. Confirm receipt"

**Outputs:**
- Updated InputOrder
- Updated TransportRequest (if applicable)
- Activity log entry
- Notification records (2)

---

#### 7. **Completed** (`completed`)
**Trigger:** Order finalized and payment confirmed

**Actors:**
- **Payment System:** Confirms payment
- **Input Provider:** Receives payment
- **Farmer:** Order complete

**Actions:**
- Payment confirmed
- Order finalized
- Customer record updated

**Data Points:**
- Completed At Timestamp
- Payment Status: "paid"
- Final Total Amount

**Notifications:**
- **To Input Provider:** "Order #XXX completed. Payment received"
- **To Farmer:** "Input order #XXX completed"

**Outputs:**
- Updated InputOrder
- Updated Payment record
- Updated InputCustomer (order history)
- Activity log entry
- Notification records (2)

---

### Input Order Data Model

**Core Entity:** `InputOrder`

**Related Entities:**
- `Input` (product)
- `InputCustomer` (farmer as customer)
- `Payment` (payment record)
- `TransportRequest` (if delivery required)
- `Notification` (multiple)
- `ActivityLog` (multiple)

---

## Storage Batch Lifecycle

### Batch Creation & Management

#### 1. **Batch Creation**
**Trigger:** Farmer harvests produce or receives at aggregation center

**Actors:**
- **Farmer:** Creates batch (at farm)
- **Aggregation Manager:** Creates batch (at center)

**Actions:**
- Batch ID generated
- QR code generated
- Batch metadata recorded
- Linked to farmer, variety, quality grade

**Data Points:**
- Batch ID (unique identifier)
- QR Code
- Farmer ID
- Variety
- Quality Grade
- Quantity
- Created Timestamp
- Location (farm or center)

**Outputs:**
- Batch record (implicit in system)
- QR Code image

---

#### 2. **Batch at Farm**
**Status:** Pre-harvest or post-harvest at farm

**Actors:**
- **Farmer:** Manages batch

**Actions:**
- Farmer creates listing from batch
- Batch linked to listing
- Batch tracked through order lifecycle

**Data Points:**
- Listing ID (if listed)
- Batch Status: "at_farm" | "listed" | "ordered"

**Outputs:**
- ProduceListing (if listed)
- MarketplaceOrder (if ordered)

---

#### 3. **Batch at Aggregation Center**
**Status:** Stock in transaction completed

**Actors:**
- **Aggregation Manager:** Receives batch
- **Transport Provider:** Delivers batch

**Actions:**
- Stock in transaction created
- Batch linked to stock transaction
- Inventory item created
- Storage location assigned

**Data Points:**
- Stock Transaction ID
- Inventory Item ID
- Center ID
- Storage Location
- Stock In Date
- Temperature, Humidity (if monitored)

**Outputs:**
- StockTransaction record
- InventoryItem record
- StorageItem record (if storage management enabled)

---

#### 4. **Quality Check**
**Status:** Quality assessment performed

**Actors:**
- **Aggregation Manager:** Performs quality check

**Actions:**
- Quality check performed on batch
- Quality scores recorded
- Batch quality grade confirmed/updated

**Data Points:**
- Quality Check ID
- Quality Score
- Quality Grade
- Batch ID (linked)

**Outputs:**
- QualityCheck record
- Updated InventoryItem (if grade changed)

---

#### 5. **Storage Management**
**Status:** Batch in storage

**Actors:**
- **Aggregation Manager:** Monitors storage

**Actions:**
- Storage conditions monitored
- Aging tracked
- Alerts generated (if needed)
- Storage duration calculated

**Data Points:**
- Storage Duration (days)
- Storage Status: "fresh" | "aging" | "critical"
- Temperature, Humidity
- Alerts

**Outputs:**
- StorageItem record
- Alert records (if conditions critical)

---

#### 6. **Stock Out**
**Status:** Batch allocated to order

**Actors:**
- **Aggregation Manager:** Creates stock out
- **Buyer:** Receives batch

**Actions:**
- Stock out transaction created
- Batch linked to order
- Inventory updated
- Batch status: "allocated" or "delivered"

**Data Points:**
- Stock Transaction ID (type: "stock_out")
- Order ID
- Stock Out Date
- Buyer ID

**Outputs:**
- StockTransaction record
- Updated InventoryItem
- Updated MarketplaceOrder (batch linked)

---

#### 7. **Wastage Tracking**
**Status:** Batch lost/wasted

**Actors:**
- **Aggregation Manager:** Records wastage

**Actions:**
- Wastage entry created
- Batch linked to wastage
- Inventory updated
- Reason and category recorded

**Data Points:**
- Wastage Entry ID
- Quantity Wasted
- Category: "spoilage" | "damage" | "expired" | "other"
- Reason
- Recorded By

**Outputs:**
- WastageEntry record
- Updated InventoryItem
- Alert (if significant wastage)

---

### Storage Batch Data Model

**Core Concept:** Batch (implicit entity tracked via `batchId`)

**Related Entities:**
- `ProduceListing` (batch listed)
- `MarketplaceOrder` (batch ordered)
- `StockTransaction` (batch in/out)
- `InventoryItem` (batch in storage)
- `QualityCheck` (batch quality)
- `StorageItem` (batch storage conditions)
- `WastageEntry` (batch wasted)

**Traceability:**
- `batchId`: Links all batch-related records
- `qrCode`: Physical QR code for scanning
- Full traceability from farm to buyer

---

## Farm Pickup Schedule Lifecycle

### Overview

Farm Pickup Schedules enable transport providers to create scheduled pickup routes from farms to aggregation centers. Farmers can browse available schedules and book slots, with capacity tracking for both transport and aggregation center storage. This system supports bulk deliveries to centers for fulfillment on behalf of farmers.

### Status Flow

```
draft → published → active → completed/cancelled
```

**Alternative paths:**
- `draft` → `cancelled` (provider cancels before publishing)
- `published` → `cancelled` (provider cancels, all bookings cancelled)
- `published` → `active` (schedule date arrives)
- `active` → `completed` (pickup completed)

### Detailed Lifecycle Stages

#### 1. **Schedule Created** (`draft`)
**Trigger:** Transport provider creates pickup schedule

**Actors:**
- **Transport Provider:** Creates schedule
- **System:** Stores draft

**Actions:**
- Provider navigates to Pickup Schedule Management
- Provider fills schedule form:
  - Aggregation center destination
  - Route name
  - Scheduled date and time
  - Total transport capacity
  - Vehicle type
  - Pricing (per kg or fixed)
  - Pickup locations on route
- Schedule saved as draft
- Schedule not visible to farmers

**Data Points:**
- Schedule ID, Schedule Number
- Provider ID, Provider Name
- Aggregation Center ID, Center Name
- Route Name
- Scheduled Date, Scheduled Time
- Estimated Arrival Time
- Total Capacity (kg)
- Used Capacity: 0 (initial)
- Available Capacity: Total Capacity (initial)
- Vehicle Type
- Price Per Kg or Fixed Price
- Pickup Locations Array
- Status: "draft"
- Created Timestamp

**Notifications:**
- **To Provider:** "Pickup schedule draft saved"

**Outputs:**
- FarmPickupSchedule record
- Activity log entry
- Notification record (1)

---

#### 2. **Schedule Published** (`published`)
**Trigger:** Transport provider publishes schedule

**Actors:**
- **Transport Provider:** Publishes schedule
- **Farmers:** Receive notification (if subscribed to route/center)
- **System:** Syncs with aggregation center capacity

**Actions:**
- Provider reviews draft
- Provider clicks "Publish"
- Schedule status updated to "published"
- Schedule becomes visible to farmers
- System fetches aggregation center capacity
- Capacity information displayed to farmers
- Schedule appears in farmer's "Pickup Schedules" view

**Data Points:**
- Published At Timestamp
- Status: "published"
- Visibility: "public"
- Center Available Capacity (synced)
- Center Total Capacity (synced)

**Notifications:**
- **To Farmers:** "New pickup schedule available: [Route] to [Center]"
- **To Provider:** "Schedule published successfully"

**Outputs:**
- Updated FarmPickupSchedule
- AggregationCenterCapacity (synced)
- Activity log entry
- Notification records (multiple to farmers + 1 to provider)

---

#### 3. **Slot Booked** (`booked`)
**Trigger:** Farmer books a slot in the schedule

**Actors:**
- **Farmer:** Books slot
- **Transport Provider:** Receives booking
- **System:** Updates capacity

**Actions:**
- Farmer browses available schedules
- Farmer views schedule details (capacity, center capacity, route, pricing)
- Farmer clicks "Book Pickup Slot"
- Farmer enters booking details:
  - Quantity (kg)
  - Pickup location
  - Notes (optional)
- System validates:
  - Quantity <= available transport capacity
  - Quantity <= center available capacity
- Booking created
- Schedule capacity updated (usedCapacity incremented, availableCapacity decremented)
- Transport request created (linked to schedule)

**Data Points:**
- PickupSlotBooking ID
- Schedule ID, Slot ID
- Farmer ID, Farmer Name
- Quantity (kg)
- Pickup Location
- Contact Phone
- Notes
- Status: "confirmed"
- Booked At Timestamp

**Notifications:**
- **To Provider:** "New booking on schedule [Route]: [Quantity] kg from [Farmer Name]"
- **To Farmer:** "Slot booked successfully for [Route] on [Date]"

**Outputs:**
- PickupSlotBooking record
- Updated FarmPickupSchedule (capacity updated)
- TransportRequest record (linked to schedule)
- Activity log entry
- Notification records (2)

---

#### 4. **Pickup Confirmed & Batch Created** (`picked_up`)
**Trigger:** Farmer confirms pickup when transport provider collects produce

**Actors:**
- **Farmer:** Confirms pickup and creates batch
- **Transport Provider:** Collects produce
- **System:** Generates batch ID, QR code, and receipt

**Actions:**
- Transport provider arrives at farmer's location
- Provider collects produce
- Farmer navigates to "My Pickup Bookings"
- Farmer clicks "Confirm Pickup" on booking
- Farmer enters batch information:
  - Batch ID (auto-generated or manual)
  - Produce variety
  - Quality grade (A, B, or C)
  - Photos (optional)
  - Notes (optional)
- System validates batch ID format
- System generates QR code for batch traceability
- Pickup receipt generated with:
  - Receipt number
  - Batch ID and QR code
  - Pickup details (date, time, location)
  - Quantity, variety, quality grade
  - Farmer and provider information
  - Destination aggregation center
- Booking status updated to "picked_up"
- Batch traceability lifecycle begins
- Receipt stored and linked to booking

**Data Points:**
- Pickup Confirmed: true
- Pickup Confirmed At Timestamp
- Pickup Confirmed By: Farmer ID
- Batch ID (created)
- QR Code (generated)
- Variety
- Quality Grade
- Photos (if provided)
- Notes
- Pickup Receipt ID
- Status: "picked_up"

**Notifications:**
- **To Farmer:** "Pickup confirmed! Receipt generated. Batch ID: [BATCH-ID]"
- **To Provider:** "Pickup confirmed by [Farmer Name]. Batch ID: [BATCH-ID]"
- **To Aggregation Center:** "Incoming delivery with batch [BATCH-ID] from [Route]"

**Outputs:**
- Updated PickupSlotBooking (batch ID, confirmation data)
- PickupReceipt record
- Batch traceability record (first entry)
- QR Code generated
- Activity log entry
- Notification records (3)

**Key Features:**
- **Batch Traceability Starts:** Batch ID is now traceable throughout the supply chain
- **Receipt Generation:** Digital receipt with all pickup details
- **QR Code:** Generated for easy batch scanning and tracking
- **Lifecycle Continuity:** Batch continues through aggregation center, storage, quality checks, and delivery

---

#### 5. **Schedule Active** (`active`)
**Trigger:** Schedule date arrives

**Actors:**
- **System:** Auto-activates schedule
- **Transport Provider:** Executes pickup
- **Farmers:** Track pickup

**Actions:**
- System checks scheduled date
- Schedule status updated to "active"
- Provider proceeds with pickup route
- Provider collects from booked farmers
- Collection status tracked per farmer

**Data Points:**
- Activated At Timestamp
- Status: "active"
- Collection Status per booking

**Outputs:**
- Updated FarmPickupSchedule
- Updated PickupSlotBooking records
- Activity log entry

---

#### 6. **Pickup Completed** (`completed`)
**Trigger:** Produce delivered to aggregation center

**Actors:**
- **Transport Provider:** Delivers to center
- **Aggregation Manager:** Receives stock
- **Farmers:** Receive confirmation

**Actions:**
- Provider arrives at aggregation center
- Stock in transaction created (linked to batch ID from pickup receipt)
- Inventory updated (with batch ID for traceability)
- Schedule status updated to "completed"
- All bookings marked as "completed"
- Transport request status updated to "delivered"
- Batch traceability updated (new entry: "At Aggregation Center")

**Data Points:**
- Completed At Timestamp
- Status: "completed"
- Stock Transaction ID (linked to batch ID)
- Inventory Item ID (linked to batch ID)
- Total Quantity Delivered
- Batch ID (from pickup receipt, now in inventory)

**Notifications:**
- **To Aggregation Manager:** "Stock received from [Route] schedule. Batch IDs: [list]"
- **To Farmers:** "Your produce (Batch [BATCH-ID]) has been delivered to [Center]"
- **To Provider:** "Schedule completed successfully"

**Outputs:**
- Updated FarmPickupSchedule
- StockTransaction record (with batch ID)
- InventoryItem record (with batch ID)
- Updated PickupSlotBooking records (all marked completed)
- Updated TransportRequest
- Batch traceability record (new entry)
- Activity log entry
- Notification records (multiple)

**Traceability Continuity:**
- Batch ID from pickup receipt is now in aggregation center inventory
- Batch can be traced from pickup → center → storage → quality check → delivery

---

#### 7. **Schedule Cancelled** (`cancelled`)
**Trigger:** Provider cancels schedule

**Actors:**
- **Transport Provider:** Cancels schedule
- **Farmers:** Receive notification

**Actions:**
- Provider cancels schedule
- Schedule status updated to "cancelled"
- All bookings cancelled
- Farmers notified
- Option to create new schedule

**Data Points:**
- Cancelled At Timestamp
- Cancelled By: Provider ID
- Cancellation Reason (optional)
- Status: "cancelled"

**Notifications:**
- **To Farmers:** "Pickup schedule [Route] has been cancelled"
- **To Provider:** "Schedule cancelled. All bookings cancelled"

**Outputs:**
- Updated FarmPickupSchedule
- Updated PickupSlotBooking records (all cancelled)
- Activity log entry
- Notification records (multiple)

---

### Farm Pickup Schedule Data Model

**Core Entity:** `FarmPickupSchedule`

**Related Entities:**
- `PickupSlot[]` (time slots within schedule)
- `PickupSlotBooking[]` (farmer bookings)
- `PickupReceipt[]` (pickup receipts with batch IDs)
- `TransportRequest[]` (linked transport requests)
- `AggregationCenterCapacity` (synced capacity)
- `StockTransaction` (when delivered, linked to batch ID)
- `InventoryItem` (with batch ID for traceability)
- `Notification[]` (multiple)

**Key Features:**
- Capacity tracking (transport + center storage)
- Route-based pickup locations
- Slot-based booking system
- Real-time capacity sync with aggregation centers
- Pricing options (per kg or fixed)
- **Batch traceability from pickup confirmation**
- **Pickup receipt generation with QR codes**
- **Lifecycle continuity from pickup to delivery**

---

## Transport Request Lifecycle

### Status Flow

```
pending → accepted → in_transit → delivered → completed
```

**Alternative paths:**
- `pending` → `rejected` (provider rejects)
- `pending` → `cancelled` (requester cancels)
- Any status → `cancelled` (requester cancels)
- **Via Schedule:** `booked` → `accepted` (automatic when booked from schedule)

### Transport Request Types

1. **Produce Pickup** (`produce_pickup`)
   - Farm → Aggregation Center
   - Triggered by: Farmer, Aggregation Manager, OR booked from Pickup Schedule
   - Related to: MarketplaceOrder OR FarmPickupSchedule
   - **New:** Can be standalone request OR linked to pickup schedule booking

2. **Produce Delivery** (`produce_delivery`)
   - Aggregation Center → Buyer/Market
   - Triggered by: Aggregation Manager
   - Related to: MarketplaceOrder

3. **Input Delivery** (`input_delivery`)
   - Input Provider → Farmer
   - Triggered by: Input Provider
   - Related to: InputOrder

### Detailed Lifecycle Stages

#### 1. **Pending** (`pending`)
**Trigger:** Transport request created (standalone) OR slot booked from schedule

**Actors:**
- **Requester:** Creates request (Farmer, Buyer, Aggregation Manager, Input Provider) OR
- **System:** Auto-creates from schedule booking
- **Transport Providers:** Receive notification (if standalone) OR already assigned (if from schedule)

**Actions:**
- **If Standalone:**
  - Request created with details
  - Providers notified
  - Request visible to providers
  
- **If From Schedule:**
  - Request auto-created when farmer books slot
  - Provider already assigned (schedule owner)
  - Request linked to schedule and slot booking
  - Status may be "accepted" immediately (if schedule provider auto-accepts)

**Data Points:**
- Request ID
- Request Type
- Requester ID, Requester Type
- From Location, To Location
- Distance, Weight
- Scheduled Time
- Amount (transport fee)
- Created Timestamp

**Notifications:**
- **To Transport Providers:** "New transport request: [Type] from [From] to [To]"
- **To Requester:** "Transport request #XXX created"

**Outputs:**
- TransportRequest record
- Activity log entry
- Notification records (multiple to providers + 1 to requester)

---

#### 2. **Accepted** (`accepted`)
**Trigger:** Transport provider accepts request

**Actors:**
- **Transport Provider:** Accepts request
- **Requester:** Receives confirmation

**Actions:**
- Provider accepts request
- Provider assigned
- Vehicle/driver assigned (if applicable)
- Request status updated

**Data Points:**
- Provider ID
- Vehicle ID (if applicable)
- Driver Name, Driver Phone
- Accepted At Timestamp

**Notifications:**
- **To Requester:** "Transport provider [Name] has accepted your request #XXX"
- **To Transport Provider:** "Request #XXX accepted. Proceed to pickup"

**Outputs:**
- Updated TransportRequest
- Activity log entry
- Notification records (2)

---

#### 3. **In Transit** (`in_transit`)
**Trigger:** Pickup completed

**Actors:**
- **Transport Provider:** Executes transport
- **Requester:** Tracks delivery

**Actions:**
- Pickup completed
- Collection status: "collected"
- Tracking updates provided
- Progress tracked

**Data Points:**
- Pickup At Timestamp
- Collection Status: "collected"
- Current Coordinates
- Progress Percentage
- Estimated Arrival Time

**Notifications:**
- **To Requester:** "Transport request #XXX is in transit. Track delivery"
- **To Transport Provider:** "Pickup completed. Proceed to delivery"

**Outputs:**
- Updated TransportRequest
- DeliveryTrackingUpdate records
- Activity log entry
- Notification records (2)

---

#### 4. **Delivered** (`delivered`)
**Trigger:** Delivery completed

**Actors:**
- **Transport Provider:** Completes delivery
- **Requester:** Confirms receipt

**Actions:**
- Delivery completed
- Delivery photos uploaded
- Delivery timestamp recorded
- Rating enabled

**Data Points:**
- Delivered At Timestamp
- Delivery Photos
- Delivery Coordinates
- Rating, Review (if provided)

**Notifications:**
- **To Requester:** "Transport request #XXX delivered successfully"
- **To Transport Provider:** "Delivery completed. Rate your experience"

**Outputs:**
- Updated TransportRequest
- Activity log entry
- Notification records (2)
- Rating record (if provided)

---

#### 5. **Completed** (`completed`)
**Trigger:** Payment confirmed and request finalized

**Actors:**
- **Payment System:** Processes payment
- **Transport Provider:** Receives payment
- **Requester:** Request complete

**Actions:**
- Payment processed
- Request finalized
- Rating submitted (if applicable)

**Data Points:**
- Completed At Timestamp
- Payment Status
- Final Rating

**Notifications:**
- **To Transport Provider:** "Request #XXX completed. Payment received"
- **To Requester:** "Request #XXX completed"

**Outputs:**
- Updated TransportRequest
- Updated Payment record
- Activity log entry
- Notification records (2)

---

### Transport Request Data Model

**Core Entity:** `TransportRequest`

**Related Entities:**
- `MarketplaceOrder` (if produce pickup/delivery)
- `InputOrder` (if input delivery)
- `Payment` (transport fee payment)
- `DeliveryTrackingUpdate` (tracking updates)
- `Notification` (multiple)
- `ActivityLog` (multiple)

---

## Payment & Escrow Lifecycle

### Payment Status Flow

```
pending → secured → released
```

**Alternative paths:**
- `pending` → `refunded` (order cancelled/rejected)
- `secured` → `disputed` (dispute raised)
- `disputed` → `released` or `refunded` (dispute resolved)

### Manual Payment Confirmation Flow

#### 1. **Payment Pending** (`pending`)
**Trigger:** Order accepted by farmer

**Status:** Payment not yet confirmed

**Actions:**
- Order status: `order_accepted`
- Payment status: `pending`
- Buyer notified to confirm payment
- Order processing blocked until payment confirmed

**Data Points:**
- Order ID
- Payment Amount
- Payment Status: "pending"

**Notifications:**
- **To Buyer:** "Order #XXX accepted. Please confirm payment to proceed"

**Outputs:**
- MarketplaceOrder (status: order_accepted, paymentStatus: pending)
- Notification record

---

#### 2. **Payment Confirmation** (Manual Process)
**Trigger:** Buyer confirms payment with evidence

**Actors:**
- **Buyer:** Confirms payment
- **System:** Records confirmation

**Actions:**
- Buyer makes payment externally (M-Pesa, bank transfer, cash, etc.)
- Buyer navigates to order details
- Buyer clicks "Confirm Payment" button
- Buyer fills payment confirmation form:
  - **Payment Method:** M-Pesa, Bank Transfer, Cash, Credit
  - **Transaction Reference:** Transaction ID, M-Pesa code, reference number
  - **Payment Amount:** Amount paid (validated against order total)
  - **Payment Date:** Date payment was made
  - **Payment Details:** Optional text notes about payment
  - **Payment Evidence:** Optional image upload (receipt, screenshot, proof of payment)
- Buyer checks confirmation checkbox: "I confirm I have made this payment"
- Buyer submits confirmation
- System validates:
  - Payment amount matches order total (or allows partial with notes)
  - Required fields provided
  - Evidence uploaded (optional but recommended)
- Payment record created/updated with confirmation details
- Payment status updated to "secured"
- Order status updated to "payment_secured"
- Order processing unlocked - can proceed to next stages

**Data Points:**
- Payment ID
- Payment Method
- Transaction Reference/ID
- Payment Amount
- Payment Date
- Payment Details/Notes (text)
- Payment Evidence (image URL)
- Confirmed By (Buyer ID)
- Confirmed At Timestamp
- Payment Status: "secured"

**Notifications:**
- **To Farmer:** "Payment confirmed for order #XXX. Amount: KES XXX. Transaction: [Reference]. Proceed with fulfillment"
- **To Buyer:** "Payment confirmation recorded successfully. Order #XXX is being processed"

**Outputs:**
- Payment record (with confirmation details)
- Updated MarketplaceOrder (status: payment_secured, paymentStatus: secured)
- Activity log entry (PAYMENT_CONFIRMED)
- Notification records (2)

---

#### 3. **Farmer Payment Confirmation** (`confirmed_by_farmer`)
**Trigger:** Farmer confirms receipt of buyer's payment

**Actors:**
- **Farmer:** Confirms payment receipt
- **System:** Records farmer confirmation
- **Buyer:** Receives confirmation

**Actions:**
- Farmer receives notification that buyer has confirmed payment
- Farmer navigates to order details page
- Farmer reviews buyer's payment confirmation details:
  - Payment method
  - Transaction reference
  - Payment amount
  - Payment evidence (if provided)
- Farmer clicks "Confirm Payment Received" button
- Farmer optionally adds notes about payment receipt
- Farmer submits confirmation
- System validates farmer owns the order
- Payment status updated to "confirmed_by_farmer"
- Order status remains "payment_secured" (ready for fulfillment)
- Order processing can now continue to next stages (transport, fulfillment)

**Data Points:**
- Farmer Confirmation Timestamp
- Farmer Confirmation Notes (optional)
- Payment Status: "confirmed_by_farmer"
- Order Status: "payment_secured" (ready for fulfillment)

**Notifications:**
- **To Buyer:** "Farmer has confirmed receipt of payment for order #XXX. Order is being processed"
- **To Farmer:** "Payment confirmation recorded. You can now proceed with order fulfillment"

**Outputs:**
- Updated Payment record (farmer confirmation timestamp and notes)
- Updated MarketplaceOrder (ready for fulfillment stages)
- Activity log entry (PAYMENT_CONFIRMED_BY_FARMER)
- Notification records (2)

**Note:** This two-step confirmation ensures both parties acknowledge the payment before order fulfillment begins, reducing disputes and ensuring transparency.

---

#### 4. **Payment Secured** (`secured`)
**Status:** Payment confirmed by both parties, order processing continues

**Actions:**
- Payment confirmed by buyer
- Payment receipt confirmed by farmer
- Order status: `payment_secured`
- Order can proceed to fulfillment stages:
  - Transport coordination
  - Pickup scheduling
  - Delivery
  - Quality checks

**Data Points:**
- Buyer Confirmation Timestamp
- Farmer Confirmation Timestamp
- Order Status
- Payment Status: "confirmed_by_farmer"

---

#### 4. **Payment Released** (`released`)
**Trigger:** Order completed successfully

**Actions:**
- Order status: `completed` or `delivered`
- Payment status: `released`
- Payment marked as completed
- Farmer receives payment confirmation

**Data Points:**
- Released At Timestamp
- Final Amount
- Recipient ID

**Notifications:**
- **To Farmer:** "Order #XXX completed. Payment confirmed. Amount: KES XXX"

**Outputs:**
- Updated Payment record (status: released)
- Updated MarketplaceOrder
- Notification record

---

#### 5. **Payment Refunded** (`refunded`)
**Trigger:** Order cancelled, rejected, or quality rejected

**Actions:**
- Order cancelled/rejected
- Payment status: `refunded`
- Refund reason recorded
- Buyer notified of refund

**Data Points:**
- Refunded At Timestamp
- Refund Amount
- Refund Reason

**Notifications:**
- **To Buyer:** "Order #XXX cancelled/rejected. Payment refunded. Amount: KES XXX"

**Outputs:**
- Updated Payment record (status: refunded)
- Refund record
- Notification record

---

#### 6. **Payment Disputed** (`disputed`)
**Trigger:** Dispute raised regarding payment

**Actions:**
- Dispute created
- Payment status: `disputed`
- Payment details reviewed
- Dispute resolution process initiated

**Data Points:**
- Dispute ID
- Dispute Reason
- Dispute Created At
- Payment Evidence (for review)

**Notifications:**
- **To Both Parties:** "Payment dispute raised for order #XXX"

**Outputs:**
- Dispute record
- Updated Payment record (status: disputed)
- Notification records (2)

---

### Payment Confirmation Data Model

**Core Entity:** `Payment`

**Payment Confirmation Fields:**
- `paymentMethod`: M-Pesa, Bank Transfer, Cash, Credit
- `transactionReference`: Transaction ID, M-Pesa code, reference number
- `paymentAmount`: Amount paid
- `paymentDate`: Date payment was made
- `paymentDetails`: Optional text notes
- `paymentEvidence`: Optional image URL (receipt, screenshot)
- `confirmedBy`: Buyer ID
- `confirmedAt`: Confirmation timestamp
- `status`: Payment status (pending, secured, released, refunded, disputed)

**Related Entities:**
- `MarketplaceOrder` (marketplace payments)
- `InputOrder` (input order payments)
- `TransportRequest` (transport fee payments)
- `Notification` (payment notifications)
- `ActivityLog` (payment activity tracking)

---

### Payment Data Model

**Core Entity:** `Payment`

**Related Entities:**
- `MarketplaceOrder` (marketplace payments)
- `InputOrder` (input order payments)
- `TransportRequest` (transport fee payments)
- `EscrowTransaction` (escrow details)
- `Notification` (payment notifications)

---

## Quality Check Lifecycle

### Quality Check Process

#### 1. **Quality Check Scheduled**
**Trigger:** Stock arrives at aggregation center

**Actions:**
- Quality check scheduled
- Check assigned to manager
- Stock held pending check

**Data Points:**
- Scheduled Check Date
- Assigned To

**Outputs:**
- Quality check scheduled (implicit)

---

#### 2. **Quality Check Performed**
**Trigger:** Manager performs check

**Actions:**
- Quality assessment performed
- Scores recorded (size, color, damage, dry matter)
- Photos taken
- Quality grade determined
- Pass/fail determination

**Data Points:**
- Quality Check ID
- Quality Score (0-100)
- Size Score, Color Score, Damage Score
- Dry Matter Content
- Quality Grade
- Passed/Failed
- Checked By, Checked At
- Photos

**Outputs:**
- QualityCheck record
- Updated StockTransaction
- Updated InventoryItem

---

#### 3. **Quality Approved**
**Trigger:** Quality check passes

**Actions:**
- Quality approved
- Stock available for allocation
- Order proceeds

**Data Points:**
- Approval Status: "approved"
- Quality Feedback

**Notifications:**
- **To Buyer:** "Quality check approved for order #XXX in case it is related to order"
- **To Farmer:** "Quality check approved for your produce"

**Outputs:**
- Updated QualityCheck
- Updated MarketplaceOrder
- Notification records (2)

---

#### 4. **Quality Rejected**
**Trigger:** Quality check fails

**Actions:**
- Quality rejected
- Stock handled (return, wastage, etc.)
- Order cancelled/refunded

**Data Points:**
- Rejection Status: "rejected"
- Rejection Reason
- Quality Feedback

**Notifications:**
- **To Buyer:** "Quality check rejected for order #XXX. Refund processing"
- **To Farmer:** "Quality check rejected. Review feedback"

**Outputs:**
- Updated QualityCheck
- Updated MarketplaceOrder (status: "quality_rejected")
- Refund record
- Notification records (2)

---

### Quality Check Data Model

**Core Entity:** `QualityCheck`

**Related Entities:**
- `StockTransaction` (checked stock)
- `InventoryItem` (checked inventory)
- `MarketplaceOrder` (order quality)
- `Notification` (quality notifications)

---

## Notification System

### Notification Types

1. **Order Notifications** (`order`)
   - Order placed, accepted, rejected, cancelled
   - Order status updates
   - Order completed

2. **Payment Notifications** (`payment`)
   - Payment secured, released, refunded
   - Escrow updates
   - Payment disputes

3. **Transport Notifications** (`transport`)
   - Transport request created, accepted
   - Pickup completed
   - Delivery updates
   - Delivery completed

4. **Quality Check Notifications** (`quality_check`)
   - Quality check scheduled
   - Quality check results
   - Quality approved/rejected

5. **System Notifications** (`system`)
   - System updates
   - Maintenance notices
   - Feature announcements

6. **Alerts** (`alert`)
   - Critical alerts
   - Warnings
   - Info messages

### Notification Triggers by Entity

#### Marketplace Order Notifications

| Stage | Recipient | Notification Type | Priority |
|-------|-----------|------------------|----------|
| Order Placed | Farmer | order | high |
| Order Placed | Buyer | order | medium |
| Order Accepted | Buyer | order | high |
| Payment Secured | Farmer | payment | high |
| Payment Secured | Buyer | payment | medium |
| In Transit | Buyer | transport | medium |
| At Aggregation | Buyer | order | medium |
| Quality Checked | Buyer | quality_check | medium |
| Quality Approved | Buyer | order | medium |
| Quality Rejected | Buyer | order | high |
| Out for Delivery | Buyer | transport | medium |
| Delivered | Buyer | order | high |
| Delivered | Farmer | order | medium |
| Completed | Farmer | payment | high |
| Completed | Buyer | order | medium |

#### Input Order Notifications

| Stage | Recipient | Notification Type | Priority |
|-------|-----------|------------------|----------|
| Order Placed | Input Provider | order | high |
| Order Accepted | Farmer | order | high |
| Processing | Farmer | order | medium |
| Ready for Pickup | Farmer | order | high |
| In Transit | Farmer | transport | medium |
| Delivered | Farmer | order | high |
| Completed | Input Provider | payment | high |

#### Transport Request Notifications

| Stage | Recipient | Notification Type | Priority |
|-------|-----------|------------------|----------|
| Request Created | Transport Providers | transport | high |
| Request Accepted | Requester | transport | high |
| In Transit | Requester | transport | medium |
| Delivered | Requester | transport | high |
| Completed | Transport Provider | payment | medium |

---

## Data Points & Outputs

### Key Data Points by Entity

#### Marketplace Order Data Points

**Order Identification:**
- Order ID (UUID)
- Order Number (human-readable)
- Batch ID (traceability)
- QR Code

**Stakeholders:**
- Farmer ID, Farmer Name, Farmer Phone
- Buyer ID, Buyer Name, Buyer Phone

**Product Details:**
- Variety, Quantity, Quality Grade
- Price Per Kg, Total Amount

**Status Tracking:**
- Order Status (12 possible states)
- Payment Status (5 possible states)
- Created At, Updated At
- Delivery Date, Actual Delivery Date

**Location Data:**
- Delivery Location, Coordinates
- Farmer Coordinates
- Current Coordinates (in transit)

**Quality Data:**
- Quality Score, Quality Feedback
- Quality Check ID

**Financial Data:**
- Payment Amount
- Payment ID
- Escrow Transaction ID

**Transport Data:**
- Transport Request IDs (pickup + delivery)
- Transport Provider IDs

**Aggregation Data:**
- Aggregation Center ID
- Stock Transaction IDs (in + out)
- Inventory Item ID

---

#### Input Order Data Points

**Order Identification:**
- Order ID, Order Number

**Stakeholders:**
- Farmer ID, Farmer Name, Farmer Phone
- Input Provider ID

**Product Details:**
- Input ID, Input Name, Input Category
- Quantity, Unit
- Price Per Unit, Subtotal
- Transport Fee, Total Amount

**Status Tracking:**
- Order Status (9 possible states)
- Payment Status (3 possible states)
- Created At, Updated At
- Delivery Date

**Transport Data:**
- Transport Request ID (if delivery)
- Requires Transport flag

---

#### Storage Batch Data Points

**Batch Identification:**
- Batch ID (unique)
- QR Code

**Origin:**
- Farmer ID
- Variety, Quality Grade
- Quantity
- Created At, Location

**Storage:**
- Center ID
- Storage Location
- Stock In Date
- Storage Duration
- Temperature, Humidity
- Storage Status

**Quality:**
- Quality Check ID
- Quality Score
- Quality Grade

**Allocation:**
- Order ID (if allocated)
- Stock Out Date
- Buyer ID (if delivered)

**Wastage:**
- Wastage Entry ID (if wasted)
- Wastage Category, Reason
- Quantity Wasted

---

#### Transport Request Data Points

**Request Identification:**
- Request ID
- Request Type (3 types)

**Stakeholders:**
- Requester ID, Requester Type
- Transport Provider ID

**Route:**
- From Location, To Location
- From Coordinates, To Coordinates
- Distance

**Timing:**
- Scheduled Time
- Pickup At, Delivered At
- Estimated Arrival

**Status:**
- Request Status (7 possible states)
- Collection Status (3 possible states)
- Progress Percentage

**Financial:**
- Amount (transport fee)
- Payment Status

**Tracking:**
- Current Coordinates
- Current Location
- Tracking Updates

---

### Output Records by Entity

#### Marketplace Order Outputs

1. **MarketplaceOrder** (1 record)
2. **Payment** (1 record)
3. **EscrowTransaction** (1 record)
4. **TransportRequest** (2 records: pickup + delivery)
5. **StockTransaction** (2 records: stock_in + stock_out)
6. **InventoryItem** (1 record)
7. **QualityCheck** (1 record, if checked)
8. **Notification** (14-16 records)
9. **ActivityLog** (12-14 records)
10. **Rating** (0-2 records: buyer rating farmer, farmer rating transport)

**Total: ~35-40 records per order**

---

#### Input Order Outputs

1. **InputOrder** (1 record)
2. **Payment** (1 record)
3. **TransportRequest** (0-1 record, if delivery)
4. **Notification** (7-8 records)
5. **ActivityLog** (7-8 records)
6. **InputCustomer** (updated)

**Total: ~17-20 records per order**

---

#### Storage Batch Outputs

1. **ProduceListing** (0-1 record, if listed)
2. **MarketplaceOrder** (0-1 record, if ordered)
3. **StockTransaction** (1-2 records: stock_in + stock_out)
4. **InventoryItem** (1 record)
5. **QualityCheck** (0-1 record)
6. **StorageItem** (0-1 record, if storage managed)
7. **WastageEntry** (0-1 record, if wasted)

**Total: ~5-8 records per batch**

---

#### Transport Request Outputs

1. **TransportRequest** (1 record)
2. **Payment** (1 record, if paid)
3. **DeliveryTrackingUpdate** (multiple records)
4. **Notification** (5-6 records)
5. **ActivityLog** (5-6 records)
6. **Rating** (0-1 record)

**Total: ~15-20 records per request**

---

#### Negotiation Outputs

1. **Negotiation** (1 record)
2. **NegotiationMessage[]** (2-10+ messages, depending on counter-offers)
3. **MarketplaceOrder** (0-1 record, if converted)
4. **Notification** (4-12 records, depending on message count)
5. **ActivityLog** (4-12 records)

**Total: ~11-35 records per negotiation**

---

#### RFQ Outputs

1. **RFQ** (1 record)
2. **RFQResponse[]** (0-50+ responses, depending on supplier interest)
3. **MarketplaceOrder[]** (0-10+ orders, if responses awarded and converted)
4. **Notification** (10-100+ records, depending on response count)
5. **ActivityLog** (8-50+ records)

**Total: ~19-200+ records per RFQ** (highly variable based on response volume)

---

#### Sourcing Request Outputs

1. **SourcingRequest** (1 record)
2. **SupplierOffer[]** (0-20+ offers, depending on supplier interest)
3. **MarketplaceOrder[]** (0-5+ orders, if offers accepted and converted)
4. **Notification** (5-50+ records, depending on offer count)
5. **ActivityLog** (5-30+ records)

**Total: ~11-100+ records per sourcing request** (variable based on offer volume)

---

#### Farm Pickup Schedule Outputs

1. **FarmPickupSchedule** (1 record)
2. **PickupLocation[]** (2-10+ locations on route)
3. **PickupSlot[]** (0-20+ slots, if time-based slots used)
4. **PickupSlotBooking[]** (0-50+ bookings, depending on capacity and farmer interest)
5. **PickupReceipt[]** (1 per confirmed pickup, with batch ID and QR code)
6. **TransportRequest[]** (1 per booking, or 1 for entire schedule)
7. **StockTransaction** (1 when delivered to center, linked to batch ID)
8. **InventoryItem** (1 when stock received, with batch ID)
9. **BatchTraceabilityRecord[]** (multiple entries per batch, from pickup to delivery)
10. **Notification** (15-150+ records, depending on booking count)
11. **ActivityLog** (12-70+ records)

**Total: ~35-300+ records per schedule** (highly variable based on bookings)

**Batch Traceability:**
- Each confirmed pickup creates a batch ID that is traceable through:
  - Pickup confirmation (receipt)
  - Aggregation center receipt (stock in)
  - Storage monitoring
  - Quality checks
  - Stock out (delivery to buyer)
  - Final delivery

---

## Improvement Opportunities

### 1. **Notification Optimization**

**Current State:**
- Notifications sent at every stage
- Some notifications may be redundant
- No notification preferences

**Improvements:**
- User notification preferences
- Notification batching
- Smart notification timing
- Notification priority optimization
- Unread notification reminders

---

### 2. **Traceability Enhancement**

**Current State:**
- Batch ID and QR code tracking
- Basic traceability chain

**Improvements:**
- Full blockchain-style traceability
- Public traceability portal
- QR code scanning app
- Real-time traceability dashboard
- Traceability reports

---

### 3. **Quality Check Automation**

**Current State:**
- Manual quality checks
- Subjective scoring

**Improvements:**
- AI-powered quality assessment
- Image recognition for quality
- Automated quality scoring
- Quality prediction models
- Quality trend analysis

---

### 4. **Storage Management Enhancement**

**Current State:**
- Basic storage tracking
- Manual wastage recording

**Improvements:**
- IoT sensor integration (temperature, humidity)
- Automated storage alerts
- Predictive wastage models
- Storage optimization algorithms
- Real-time storage monitoring

---

### 5. **Transport Optimization**

**Current State:**
- Individual transport requests
- No route optimization

**Improvements:**
- Route optimization
- Batch transport requests
- Transport provider matching algorithm
- Real-time tracking enhancement
- Delivery time prediction

---

### 6. **Payment & Escrow Automation**

**Current State:**
- Manual escrow release
- Manual refund processing

**Improvements:**
- Automated escrow release on delivery confirmation
- Automated refunds on quality rejection
- Payment scheduling
- Payment reminders
- Payment analytics

---

### 7. **Data Analytics & Insights**

**Current State:**
- Basic statistics
- Limited analytics

**Improvements:**
- Predictive analytics
- Market trend analysis
- Farmer performance insights
- Buyer behavior analysis
- Supply chain optimization insights
- Revenue forecasting
- Quality trend analysis

---

### 8. **Workflow Automation**

**Current State:**
- Manual status updates
- Manual notifications

**Improvements:**
- Automated status transitions
- Workflow rules engine
- Conditional notifications
- Automated quality check scheduling
- Automated transport request creation
- Automated payment processing

---

### 9. **Mobile App Enhancement**

**Current State:**
- Web-based platform
- Limited mobile optimization

**Improvements:**
- Native mobile apps
- Offline capability
- Push notifications
- Mobile-first workflows
- Camera integration for photos
- GPS integration for tracking

---

### 10. **Integration & APIs**

**Current State:**
- Internal services
- Limited external integration

**Improvements:**
- External payment gateway integration
- SMS gateway integration
- Weather API integration
- Market price API integration
- Logistics API integration
- Open API for third-party integrations

---

## Summary

This document provides a comprehensive mapping of all entity lifecycles, workflows, data points, and outputs in the OFSP platform. Key insights:

1. **Complex Interdependencies:** Entities are highly interconnected (orders → transport → payments → quality checks)

2. **Multiple Stakeholders:** Each entity involves multiple user roles with different responsibilities

3. **Rich Data Points:** Extensive data collection enables traceability, analytics, and optimization

4. **Notification Heavy:** Significant notification volume requires optimization

5. **Automation Opportunities:** Many manual processes can be automated

6. **Analytics Potential:** Rich data enables advanced analytics and insights

7. **Enhanced Marketplace Features:** Negotiation and RFQ workflows provide flexible buyer-farmer interactions

8. **Unified Farmer Experience:** Buyer Requests workflow consolidates opportunities for streamlined farmer engagement

### Recent Improvements (January 2025)

#### 1. **Negotiation Feature**
- Enables price/quantity negotiation before order placement
- Supports counter-offers and message threads
- Provides flexible terms agreement
- Converts accepted negotiations to orders

#### 2. **RFQ (Request for Quotation) Workflows**
- Structured competitive bidding process
- Multi-supplier quote collection
- Response evaluation and shortlisting
- Award management and order conversion
- Recurring RFQ support

#### 3. **Buyer Requests Unified View**
- Single interface for farmers to view all buyer opportunities
- Combines RFQs and Sourcing Requests
- Marketplace-like browsing experience
- Streamlined response submission

#### 4. **Farm Pickup Schedule System**
- Scheduled pickup routes from transport providers
- Capacity-based slot booking for farmers
- Real-time sync with aggregation center storage capacity
- Route-based pickup locations
- Streamlined bulk delivery to aggregation centers
- Supports center fulfillment on behalf of farmers

#### 5. **Analytics Consolidation**
- Combined Dashboard, Leaderboard, and Market Info into single Analytics route
- Tabbed interface for easy navigation
- Improved user experience for farmers



---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Maintained By:**GARTS Development Team
