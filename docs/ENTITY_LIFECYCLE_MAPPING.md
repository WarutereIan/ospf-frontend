# Entity Lifecycle Mapping - OFSP Platform

**Date:** January 2025  
**Purpose:** Comprehensive end-to-end lifecycle mapping of all entities, processes, workflows, and outputs across all user roles

---

## Table of Contents

1. [User Roles & Permissions](#user-roles--permissions)
2. [Marketplace Order Lifecycle](#marketplace-order-lifecycle)
3. [Input Order Lifecycle](#input-order-lifecycle)
4. [Storage Batch Lifecycle](#storage-batch-lifecycle)
5. [Transport Request Lifecycle](#transport-request-lifecycle)
6. [Payment & Escrow Lifecycle](#payment--escrow-lifecycle)
7. [Quality Check Lifecycle](#quality-check-lifecycle)
8. [Notification System](#notification-system)
9. [Data Points & Outputs](#data-points--outputs)
10. [Improvement Opportunities](#improvement-opportunities)

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
│ Buyer       │ Buy      │ -        │ -        │ Request  │ Receive │ Report   │ -        │
│ Input Prov  │ Sell     │ -        │ -        │ Request  │ -       │ Report   │ -        │
│ Transport   │ Service  │ Service  │ Service  │ -        │ Service │ Report   │ -        │
│ Aggr Mgr    │ Receive  │ Deliver  │ -        │ Service  │ -       │ Report   │ -        │
│ Officer     │ Monitor  │ Monitor  │ Monitor  │ Monitor  │ Manage  │ -        │ Report   │
│ Staff       │ Manage   │ Manage   │ Manage   │ Manage   │ Manage  │ Manage   │ -        │
└─────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## Marketplace Order Lifecycle

### Status Flow

```
order_placed → order_accepted → payment_secured → in_transit → at_aggregation → 
quality_checked → quality_approved/quality_rejected → out_for_delivery → 
delivered → completed
```

**Alternative paths:**
- `order_placed` → `rejected` (farmer rejects)
- `order_placed` → `cancelled` (buyer cancels)
- Any status → `disputed` (dispute raised)

### Detailed Lifecycle Stages

#### 1. **Order Placed** (`order_placed`)
**Trigger:** Buyer places order from listing or sourcing request

**Actors:**
- **Buyer:** Initiates order
- **Farmer:** Receives notification

**Actions:**
- Buyer selects produce listing
- Buyer specifies quantity, delivery location
- System calculates total amount
- Order created with unique order number
- Batch ID generated for traceability

**Data Points:**
- Order ID, Order Number
- Listing ID (if from listing)
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
**Trigger:** Buyer makes payment (escrow)

**Actors:**
- **Buyer:** Makes payment
- **Payment System:** Processes payment
- **Farmer:** Receives confirmation

**Actions:**
- Buyer initiates payment
- Payment processed through escrow
- Funds held in escrow
- Payment status updated to "secured"
- Order status updated

**Data Points:**
- Payment ID
- Payment Amount
- Payment Status: "secured"
- Payment Timestamp
- Escrow Transaction ID

**Notifications:**
- **To Farmer:** "Payment secured for order #XXX. Proceed with fulfillment"
- **To Buyer:** "Payment secured. Order #XXX is being processed"

**Outputs:**
- Payment record
- EscrowTransaction record
- Updated MarketplaceOrder
- Activity log entry
- Notification records (2)

---

#### 4. **In Transit** (`in_transit`)
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

## Transport Request Lifecycle

### Status Flow

```
pending → accepted → in_transit → delivered → completed
```

**Alternative paths:**
- `pending` → `rejected` (provider rejects)
- `pending` → `cancelled` (requester cancels)
- Any status → `cancelled` (requester cancels)

### Transport Request Types

1. **Produce Pickup** (`produce_pickup`)
   - Farm → Aggregation Center
   - Triggered by: Farmer or Aggregation Manager
   - Related to: MarketplaceOrder

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
**Trigger:** Transport request created

**Actors:**
- **Requester:** Creates request (Farmer, Buyer, Aggregation Manager, Input Provider)
- **Transport Providers:** Receive notification

**Actions:**
- Request created with details
- Providers notified
- Request visible to providers

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

### Escrow Lifecycle

#### 1. **Escrow Created**
**Trigger:** Order accepted and payment initiated

**Actions:**
- Escrow transaction created
- Funds held in escrow
- Payment status: "secured"

**Data Points:**
- Escrow Transaction ID
- Order ID
- Amount
- Created Timestamp

**Outputs:**
- EscrowTransaction record
- Payment record

---

#### 2. **Escrow Held**
**Status:** Funds held during order fulfillment

**Actions:**
- Funds remain in escrow
- Order progresses through lifecycle
- Escrow status: "held"

**Data Points:**
- Held Duration
- Order Status

---

#### 3. **Escrow Released**
**Trigger:** Order completed successfully

**Actions:**
- Funds released to seller (farmer/input provider)
- Payment status: "released"
- Escrow status: "released"

**Data Points:**
- Released At Timestamp
- Final Amount
- Recipient ID

**Notifications:**
- **To Seller:** "Payment released for order #XXX. Amount: KES XXX"

**Outputs:**
- Updated EscrowTransaction
- Updated Payment record
- Notification record

---

#### 4. **Escrow Refunded**
**Trigger:** Order cancelled, rejected, or quality rejected

**Actions:**
- Funds refunded to buyer
- Payment status: "refunded"
- Escrow status: "refunded"

**Data Points:**
- Refunded At Timestamp
- Refund Amount
- Refund Reason

**Notifications:**
- **To Buyer:** "Refund processed for order #XXX. Amount: KES XXX"

**Outputs:**
- Updated EscrowTransaction
- Updated Payment record
- Refund record
- Notification record

---

#### 5. **Escrow Disputed**
**Trigger:** Dispute raised

**Actions:**
- Dispute created
- Escrow status: "disputed"
- Funds held pending resolution

**Data Points:**
- Dispute ID
- Dispute Reason
- Dispute Created At

**Notifications:**
- **To Both Parties:** "Dispute raised for order #XXX"

**Outputs:**
- Dispute record
- Updated EscrowTransaction
- Notification records (2)

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
- **To Buyer:** "Quality check approved for order #XXX"
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

**Next Steps:**
1. Prioritize improvement opportunities
2. Design automated workflows
3. Implement notification preferences
4. Enhance traceability features
5. Develop analytics dashboards
6. Create mobile applications

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Development Team
