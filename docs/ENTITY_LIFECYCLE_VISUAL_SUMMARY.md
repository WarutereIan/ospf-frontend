# Entity Lifecycle Visual Summary

**Quick Reference Guide for Entity Lifecycles and Workflows**

---

## Marketplace Order Lifecycle (Simplified)

```
┌─────────────┐
│ Order Placed│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Order Accepted│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Payment Secured│
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│ In Transit  │─────▶│At Aggregation│
│ (Pickup)    │      │   Center     │
└─────────────┘      └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │Quality Checked│
                     └──────┬───────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
            ┌──────────────┐ ┌──────────────┐
            │Quality Approved│ │Quality Rejected│
            └──────┬───────┘ └──────┬───────┘
                    │               │
                    │               ▼
                    │        ┌──────────────┐
                    │        │   Refunded   │
                    │        └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │Out for Delivery│
            └──────┬───────┘
                    │
                    ▼
            ┌──────────────┐
            │   Delivered  │
            └──────┬───────┘
                    │
                    ▼
            ┌──────────────┐
            │  Completed   │
            └──────────────┘
```

**Key Actors:**
- Buyer (initiates)
- Farmer (fulfills)
- Transport Provider (2x: pickup + delivery)
- Aggregation Manager (quality check)
- Payment System (escrow)

---

## Input Order Lifecycle (Simplified)

```
┌─────────────┐
│   Pending   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Accepted  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Processing │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Ready Pickup │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│  In Transit │ │   Pickup    │
│  (Delivery) │ │  Confirmed  │
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               │
               ▼
       ┌─────────────┐
       │  Delivered  │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │  Completed  │
       └─────────────┘
```

**Key Actors:**
- Farmer (orders)
- Input Provider (fulfills)
- Transport Provider (if delivery)

---

## Storage Batch Journey

```
┌─────────────┐
│Batch Created│
│  (at Farm)  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│   Listed    │ │   Ordered   │
└──────┬──────┘ └──────┬───────┘
       │               │
       └───────┬───────┘
               │
               ▼
       ┌─────────────┐
       │Stock In     │
       │(at Center)  │
       └──────┬──────┘
              │
              ▼
       ┌─────────────┐
       │Quality Check│
       └──────┬──────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│   Approved  │ │   Rejected  │
└──────┬──────┘ └──────┬──────┘
       │               │
       │               ▼
       │        ┌─────────────┐
       │        │   Wastage   │
       │        └─────────────┘
       │
       ▼
┌─────────────┐
│  Storage    │
│ (Monitored) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Stock Out  │
│ (Allocated) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Delivered  │
│  (to Buyer) │
└─────────────┘
```

**Key Actors:**
- Farmer (creates batch)
- Aggregation Manager (receives, checks, stores)
- Transport Provider (transports)
- Buyer (receives)

---

## Transport Request Flow

```
┌─────────────┐
│   Pending   │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│   Accepted  │ │   Rejected  │
└──────┬──────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│  In Transit │
│ (Pickup)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  In Transit │
│ (Delivery)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Delivered  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Completed  │
└─────────────┘
```

**Request Types:**
1. Produce Pickup (Farm → Center)
2. Produce Delivery (Center → Buyer)
3. Input Delivery (Provider → Farmer)

---

## Payment & Escrow Flow

```
┌─────────────┐
│   Pending   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Secured   │
│ (in Escrow) │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│   Released  │ │  Disputed  │
│ (to Seller) │ └──────┬──────┘
└─────────────┘        │
                       │
                       ├──────────────┐
                       │              │
                       ▼              ▼
                ┌─────────────┐ ┌─────────────┐
                │   Released  │ │  Refunded   │
                └─────────────┘ └─────────────┘
```

---

## Entity Relationships

```
MarketplaceOrder
    ├── ProduceListing (source)
    ├── Payment (payment)
    ├── EscrowTransaction (escrow)
    ├── TransportRequest × 2 (pickup + delivery)
    ├── StockTransaction × 2 (in + out)
    ├── InventoryItem (storage)
    ├── QualityCheck (quality)
    ├── Notification × 14-16
    └── ActivityLog × 12-14

InputOrder
    ├── Input (product)
    ├── Payment (payment)
    ├── TransportRequest (delivery, optional)
    ├── Notification × 7-8
    └── ActivityLog × 7-8

StorageBatch (via batchId)
    ├── ProduceListing (if listed)
    ├── MarketplaceOrder (if ordered)
    ├── StockTransaction × 2 (in + out)
    ├── InventoryItem (storage)
    ├── QualityCheck (quality)
    ├── StorageItem (conditions)
    └── WastageEntry (if wasted)

TransportRequest
    ├── MarketplaceOrder (if produce)
    ├── InputOrder (if input)
    ├── Payment (fee)
    ├── DeliveryTrackingUpdate × N
    ├── Notification × 5-6
    └── ActivityLog × 5-6
```

---

## User Role Interactions

```
┌──────────────┐
│   FARMER     │
└──────┬───────┘
       │
       ├──────────────▶ Creates Listing
       ├──────────────▶ Accepts Order
       ├──────────────▶ Creates Transport (Pickup)
       ├──────────────▶ Receives Payment
       └──────────────▶ Creates Batch

┌──────────────┐
│    BUYER     │
└──────┬───────┘
       │
       ├──────────────▶ Places Order
       ├──────────────▶ Makes Payment
       ├──────────────▶ Tracks Delivery
       └──────────────▶ Rates Farmer

┌──────────────┐
│INPUT PROVIDER│
└──────┬───────┘
       │
       ├──────────────▶ Accepts Order
       ├──────────────▶ Processes Order
       ├──────────────▶ Creates Transport (Delivery)
       └──────────────▶ Receives Payment

┌──────────────┐
│TRANSPORT PROV│
└──────┬───────┘
       │
       ├──────────────▶ Accepts Request
       ├──────────────▶ Picks Up
       ├──────────────▶ Delivers
       └──────────────▶ Receives Payment

┌──────────────┐
│AGGREGATION   │
│   MANAGER    │
└──────┬───────┘
       │
       ├──────────────▶ Receives Stock
       ├──────────────▶ Performs Quality Check
       ├──────────────▶ Manages Storage
       ├──────────────▶ Creates Stock Out
       └──────────────▶ Records Wastage
```

---

## Notification Flow by Entity

### Marketplace Order Notifications

```
Order Placed
    ├──▶ Farmer (high priority)
    └──▶ Buyer (medium priority)

Order Accepted
    └──▶ Buyer (high priority)

Payment Secured
    ├──▶ Farmer (high priority)
    └──▶ Buyer (medium priority)

In Transit
    └──▶ Buyer (medium priority)

At Aggregation
    ├──▶ Buyer (medium priority)
    └──▶ Aggregation Manager (high priority)

Quality Checked
    ├──▶ Buyer (medium priority)
    └──▶ Farmer (medium priority)

Quality Approved/Rejected
    ├──▶ Buyer (high priority)
    └──▶ Farmer (high priority)

Out for Delivery
    └──▶ Buyer (medium priority)

Delivered
    ├──▶ Buyer (high priority)
    ├──▶ Farmer (medium priority)
    └──▶ Aggregation Manager (medium priority)

Completed
    ├──▶ Farmer (high priority - payment)
    └──▶ Buyer (medium priority - rate)
```

---

## Data Points Summary

### Per Marketplace Order
- **~35-40 records** created
- **14-16 notifications** sent
- **12-14 activity logs** recorded
- **2 transport requests** (pickup + delivery)
- **2 stock transactions** (in + out)
- **1 quality check** (if applicable)

### Per Input Order
- **~17-20 records** created
- **7-8 notifications** sent
- **7-8 activity logs** recorded
- **0-1 transport request** (if delivery)

### Per Storage Batch
- **~5-8 records** created
- Links to multiple orders
- Full traceability chain

### Per Transport Request
- **~15-20 records** created
- **5-6 notifications** sent
- **Multiple tracking updates**
- **0-1 rating**

---

## Key Metrics to Track

### Order Metrics
- Order completion rate
- Average order value
- Order cancellation rate
- Time to fulfillment
- Quality rejection rate

### Payment Metrics
- Payment success rate
- Escrow release time
- Refund rate
- Dispute rate

### Transport Metrics
- On-time delivery rate
- Average delivery time
- Transport cost per order
- Provider acceptance rate

### Quality Metrics
- Quality pass rate
- Average quality score
- Quality rejection reasons
- Quality trend over time

### Storage Metrics
- Storage utilization rate
- Wastage rate
- Average storage duration
- Storage capacity alerts

---

## Workflow Automation Opportunities

### High Priority
1. **Automated Escrow Release** - Release on delivery confirmation
2. **Automated Quality Scheduling** - Schedule check on stock in
3. **Automated Transport Request** - Create on order acceptance
4. **Automated Notifications** - Smart notification batching

### Medium Priority
1. **Automated Status Transitions** - Based on conditions
2. **Automated Refunds** - On quality rejection
3. **Automated Storage Alerts** - Based on conditions
4. **Automated Payment Reminders** - For pending payments

### Low Priority
1. **Predictive Analytics** - Demand forecasting
2. **Route Optimization** - Transport routes
3. **Quality Prediction** - AI-powered quality assessment
4. **Wastage Prediction** - Predictive wastage models

---

**Quick Reference Version:** 1.0  
**See Full Documentation:** `ENTITY_LIFECYCLE_MAPPING.md`
