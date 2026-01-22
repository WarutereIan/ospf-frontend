/**
 * Payment Service
 * 
 * Handles all payment-related API calls:
 * - Payments
 * - Escrow transactions
 * - Payment history
 * 
 * Backend API endpoints:
 * - GET /api/v1/payments - List payments
 * - GET /api/v1/payments/:id - Get payment details
 * - POST /api/v1/payments - Create payment
 * - PUT /api/v1/payments/:id/status - Update payment status
 * - GET /api/v1/payments/escrow - List escrow transactions
 * - GET /api/v1/payments/escrow/:id - Get escrow details
 * - PUT /api/v1/payments/escrow/:id/release - Release escrow
 * - PUT /api/v1/payments/escrow/:id/dispute - Dispute escrow
 * - GET /api/v1/payments/history - Get payment history
 * - GET /api/v1/payments/stats - Get payment statistics
 */

import type {
  Payment,
  EscrowTransaction,
  PaymentHistoryItem,
  PaymentFilters,
  PaymentStats,
} from "@/types/payment";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";

// ==================== Payments ====================

/**
 * Get all payments
 * Backend: GET /api/v1/payments
 */
export async function getPayments(filters?: PaymentFilters): Promise<Payment[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.payerId) params.payerId = filters.payerId;
    if (filters?.payeeId) params.payeeId = filters.payeeId;
    if (filters?.status) params.status = filters.status;
    if (filters?.method) params.method = filters.method;
    if (filters?.orderType) params.orderType = filters.orderType;
    if (filters?.orderId) params.orderId = filters.orderId;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return await apiGet<Payment[]>('/payments', params);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

/**
 * Get payment by ID
 * Backend: GET /api/v1/payments/:id
 */
export async function getPaymentById(id: string): Promise<Payment | null> {
  try {
    return await apiGet<Payment>(`/payments/${id}`);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

/**
 * Create payment
 * Backend: POST /api/v1/payments
 */
export async function createPayment(payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
  try {
    const created = await apiPost<Payment>('/payments', payment);
    return { data: created, message: "Payment initiated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create payment" };
  }
}

/**
 * Process payment
 * TODO: Backend needs to implement POST /api/v1/payments/:id/process
 */
export async function processPayment(id: string): Promise<ApiResponse<Payment>> {
  // Backend doesn't have process endpoint yet - using status update as fallback
  return updatePaymentStatus(id, "processing" as Payment["status"]);
}

/**
 * Update payment status
 * Backend: PUT /api/v1/payments/:id/status
 */
export async function updatePaymentStatus(
  id: string,
  status: Payment["status"]
): Promise<ApiResponse<Payment>> {
  try {
    const updated = await apiPut<Payment>(`/payments/${id}/status`, { status });
    return { data: updated, message: "Payment status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update payment status" };
  }
}

// ==================== Escrow Transactions ====================

/**
 * Get escrow transactions
 * Backend: GET /api/v1/payments/escrow
 */
export async function getEscrowTransactions(orderId?: string): Promise<EscrowTransaction[]> {
  try {
    const params: Record<string, any> = {};
    if (orderId) params.orderId = orderId;

    return await apiGet<EscrowTransaction[]>('/payments/escrow', params);
  } catch (error) {
    console.error('Error fetching escrow transactions:', error);
    return [];
  }
}

/**
 * Get escrow by ID
 * Backend: GET /api/v1/payments/escrow/:id
 */
export async function getEscrowById(id: string): Promise<EscrowTransaction | null> {
  try {
    return await apiGet<EscrowTransaction>(`/payments/escrow/${id}`);
  } catch (error) {
    console.error('Error fetching escrow:', error);
    return null;
  }
}

/**
 * Release escrow
 * Backend: PUT /api/v1/payments/escrow/:id/release
 */
export async function releaseEscrow(id: string): Promise<ApiResponse<EscrowTransaction>> {
  try {
    const released = await apiPut<EscrowTransaction>(`/payments/escrow/${id}/release`, {});
    return { data: released, message: "Escrow released" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to release escrow" };
  }
}

/**
 * Dispute escrow
 * Backend: PUT /api/v1/payments/escrow/:id/dispute
 */
export async function disputeEscrow(id: string, reason: string): Promise<ApiResponse<EscrowTransaction>> {
  try {
    const disputed = await apiPut<EscrowTransaction>(`/payments/escrow/${id}/dispute`, { reason });
    return { data: disputed, message: "Escrow disputed" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to dispute escrow" };
  }
}

// ==================== Payment History ====================

/**
 * Get payment history
 * Backend: GET /api/v1/payments/history
 */
export async function getPaymentHistory(filters?: PaymentFilters): Promise<PaymentHistoryItem[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.payerId) params.userId = filters.payerId;
    if (filters?.orderId) params.orderId = filters.orderId;
    if (filters?.method) params.type = filters.method;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return await apiGet<PaymentHistoryItem[]>('/payments/history', params);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

// ==================== Statistics ====================

/**
 * Get payment statistics
 * Backend: GET /api/v1/payments/stats
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  try {
    return await apiGet<PaymentStats>('/payments/stats');
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return {
      totalPayments: 0,
      totalAmount: 0,
      pendingPayments: 0,
      completedPayments: 0,
      failedPayments: 0,
      averageAmount: 0,
      byMethod: {
        mpesa: 0,
        card: 0,
        bank_transfer: 0,
        escrow: 0,
        cash: 0,
      },
      escrowStats: {
        inEscrow: 0,
        released: 0,
        disputed: 0,
        totalEscrowAmount: 0,
      },
    };
  }
}
