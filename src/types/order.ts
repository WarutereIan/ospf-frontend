/**
 * Order Types
 * 
 * Generic order types that can be shared across different contexts.
 * This provides common order operations and statuses.
 */

/**
 * Generic order status
 * Can be extended by specific order types
 */
export type OrderStatus = 
  | "pending"
  | "accepted"
  | "processing"
  | "in_transit"
  | "delivered"
  | "completed"
  | "cancelled"
  | "rejected"
  | "disputed";

/**
 * Generic payment status
 */
export type PaymentStatus = 
  | "pending" 
  | "paid" 
  | "secured" 
  | "released" 
  | "refunded" 
  | "disputed";

/**
 * Order type
 */
export type OrderType = "marketplace" | "input" | "transport";

/**
 * Base order interface
 * Extended by specific order types
 */
export interface BaseOrder {
  id: string; // UUID
  orderNumber: string; // Human-readable order number
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Order timeline event
 */
export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string; // ISO 8601
  description: string;
  userId?: string; // Who performed the action
  userName?: string; // Denormalized
  metadata?: Record<string, unknown>; // Additional event data
}

/**
 * Order filters (generic)
 */
export interface OrderFilters {
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  type?: OrderType | "all";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Order statistics (generic)
 */
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalValue: number;
  averageValue: number;
}
