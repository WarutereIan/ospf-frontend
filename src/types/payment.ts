/**
 * Payment Types
 * 
 * Types for payment functionality:
 * - Payments
 * - Escrow
 * - Transactions
 * - Payment methods
 */

/**
 * Payment method
 */
export type PaymentMethod = 
  | "mpesa" 
  | "card" 
  | "bank_transfer" 
  | "escrow" 
  | "cash";

/**
 * Payment status
 */
export type PaymentStatus = 
  | "pending" 
  | "processing" 
  | "completed" 
  | "failed" 
  | "cancelled" 
  | "refunded";

/**
 * Escrow status
 */
export type EscrowStatus = 
  | "pending" 
  | "processing" 
  | "in_escrow" 
  | "quality_check" 
  | "ready_for_release" 
  | "released" 
  | "completed" 
  | "disputed" 
  | "refunded";

/**
 * Payment
 * Represents a payment transaction
 */
export interface Payment {
  id: string; // UUID
  orderId: string; // Related order ID
  orderType: "marketplace" | "input" | "transport";
  payerId: string; // User/entity making payment
  payerName: string;
  payeeId: string; // User/entity receiving payment
  payeeName: string;
  amount: number;
  currency: string; // e.g., "KES"
  method: PaymentMethod;
  status: PaymentStatus;
  escrowStatus?: EscrowStatus; // For marketplace orders
  transactionReference?: string; // M-PESA, card reference, etc.
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  failedAt?: string; // ISO 8601
  failureReason?: string;
  metadata?: Record<string, unknown>; // Additional payment data
}

/**
 * Escrow Transaction
 * Escrow payment for marketplace orders
 */
export interface EscrowTransaction {
  id: string; // UUID
  orderId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  status: EscrowStatus;
  securedAt?: string; // ISO 8601 - when payment was secured
  qualityCheckedAt?: string; // ISO 8601
  releasedAt?: string; // ISO 8601 - when payment was released to farmer
  disputedAt?: string; // ISO 8601
  refundedAt?: string; // ISO 8601
  disputeReason?: string;
  refundReason?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Payment History Item
 */
export interface PaymentHistoryItem {
  farmerName?: string; // Farmer name for filtering/display
  buyerName?: string; // Buyer name for filtering/display
  id: string;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  type: "payment" | "refund" | "escrow_release" | "escrow_refund";
  amount: number;
  status: PaymentStatus | EscrowStatus;
  method: PaymentMethod;
  description: string;
  date: string; // ISO 8601
  counterparty: string; // Other party in transaction
}

/**
 * Payment filters
 */
export interface PaymentFilters {
  status?: PaymentStatus | "all";
  method?: PaymentMethod | "all";
  orderType?: "marketplace" | "input" | "transport" | "all";
  orderId?: string; // Filter by specific order ID
  userId?: string; // Filter by user ID (buyer/farmer)
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Payment statistics
 */
export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  averageAmount: number;
  byMethod: Record<PaymentMethod, number>;
  escrowStats: {
    inEscrow: number;
    released: number;
    disputed: number;
    totalEscrowAmount: number;
  };
}
