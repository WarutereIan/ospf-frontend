# Buyer Delivery Confirmation Flow

## Overview
This document explains how the system determines which orders can be marked as delivered by buyers and the complete workflow.

## Complete Flow

### 1. Order Creation with Transport Request
- Buyer creates order with `fulfillmentType: "request_transport"`
- System automatically creates `TransportRequest` with `type: "ORDER_DELIVERY"`
- Transport request is linked to order via `orderId`
- Transport request has `requesterId = order.buyerId`

### 2. Driver Confirms Delivery (First Step)
**Location:** `transport.service.ts` - `updateTransportRequestStatus()`

When transport provider marks delivery as complete:
- Transport request status changes to `DELIVERED`
- Backend automatically updates linked order status to `DELIVERED` (line 411-417)
- Order status: `DELIVERED` (driver has confirmed)

**Code:**
```typescript
// In transport.service.ts, line 411-417
if (newStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
  await this.marketplaceService.updateOrderStatus(
    request.orderId,
    { status: 'DELIVERED' },
    userId,
  );
}
```

### 3. Buyer Sees Delivery in LogisticsDeliveries Page
**Location:** `LogisticsDeliveries.tsx`

**Data Fetching:**
1. `fetchOrders({ buyerId: user.id })` - Fetches all buyer's orders
2. `fetchRequests({ requesterId: user.id })` - Fetches transport requests where buyer is requester
3. Backend includes `order: true` in transport request query (line 77 in transport.service.ts)

**Order Matching:**
- Transport requests include the `order` relation from backend
- Orders are also fetched separately and stored in `ordersMap`
- Code prioritizes order from transport request (most up-to-date), falls back to ordersMap
- Order is transformed from backend format (UPPER_CASE status) to frontend format (lowercase)

**Code:**
```typescript
// Line 222-268 in LogisticsDeliveries.tsx
const orderFromRequest = (request as any).order; // From backend transport request
const orderFromMap = request.orderId ? ordersMap.get(request.orderId) : undefined;
// Use order from request (most up-to-date), transform status from UPPER_CASE to lowercase
```

### 4. Button Display Logic
**Location:** `LogisticsDeliveries.tsx` - Table row (line 447-450) and Modal (line 634-637)

**Conditions for "Confirm Delivery" button:**
1. `batch.orderId` exists (order is linked to transport request)
2. `batch.order?.fulfillmentType === "request_transport"` (only for transport deliveries)
3. `batch.order?.status === "delivered"` (driver has confirmed delivery first)

**Code:**
```typescript
{batch.orderId && 
 batch.order?.fulfillmentType === "request_transport" && 
 batch.order?.status === "delivered" && (
  <Button onClick={() => confirmDeliveryByBuyer(batch.orderId)}>
    Confirm Delivery
  </Button>
)}
```

### 5. Buyer Confirms Delivery (Second Step)
**Location:** `marketplace.service.ts` - `confirmDeliveryByBuyer()`

**Backend Validation:**
1. Verifies user is the buyer (`order.buyerId === userId`)
2. Checks `fulfillmentType === 'request_transport'`
3. Ensures order status is `DELIVERED` (driver confirmed first)
4. Updates order status to `COMPLETED`
5. Sets `completedAt` timestamp
6. Creates notifications and activity logs

**Code:**
```typescript
// Line 987-1067 in marketplace.service.ts
async confirmDeliveryByBuyer(id: string, userId: string) {
  // Verify buyer
  if (order.buyerId !== userId) throw BadRequestException;
  
  // Verify fulfillment type
  if (order.fulfillmentType !== 'request_transport') throw BadRequestException;
  
  // Verify driver confirmed first
  if (order.status !== 'DELIVERED') throw BadRequestException;
  
  // Update to COMPLETED
  await this.prisma.marketplaceOrder.update({
    where: { id },
    data: { 
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
}
```

### 6. Order Status: COMPLETED
After buyer confirmation:
- Order status: `COMPLETED`
- Both parties have confirmed delivery
- Order is finalized

## Status Flow Summary

For `request_transport` orders:
```
PROCESSING → READY_FOR_COLLECTION → RELEASED → COLLECTED → 
IN_TRANSIT → DELIVERED (Driver confirms) → COMPLETED (Buyer confirms)
```

## Key Points

1. **Two-Step Confirmation:**
   - Driver must confirm first (DELIVERED status)
   - Buyer confirms second (COMPLETED status)

2. **Order Data Source:**
   - Transport requests include order relation from backend
   - This ensures we have the most up-to-date order status
   - Falls back to separately fetched orders if needed

3. **Button Visibility:**
   - Only shows for `request_transport` fulfillment type
   - Only shows when order status is `delivered` (driver confirmed)
   - Hidden once order is `completed` (both confirmed)

4. **Backend Validation:**
   - Prevents buyer from confirming before driver
   - Prevents confirming non-transport orders
   - Ensures proper workflow sequence
