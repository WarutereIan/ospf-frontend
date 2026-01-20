/**
 * Payment Service
 * 
 * Handles all payment-related API calls:
 * - Payments
 * - Escrow transactions
 * - Payment history
 * 
 * Backend API endpoints to implement:
 * - GET /api/payments - List payments
 * - GET /api/payments/:id - Get payment details
 * - POST /api/payments - Create payment
 * - POST /api/payments/:id/process - Process payment
 * - GET /api/payments/escrow - List escrow transactions
 * - GET /api/payments/escrow/:id - Get escrow details
 * - PUT /api/payments/escrow/:id/release - Release escrow
 * - PUT /api/payments/escrow/:id/dispute - Dispute escrow
 * - GET /api/payments/history - Get payment history
 * - GET /api/payments/stats - Get payment statistics
 */

import type {
  Payment,
  EscrowTransaction,
  PaymentHistoryItem,
  PaymentFilters,
  PaymentStats,
} from "@/types/payment";
import type { ApiResponse } from "@/types/inputCustomer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

const MOCK_PAYMENTS: Payment[] = [];
const MOCK_ESCROW: EscrowTransaction[] = [];
const MOCK_HISTORY: PaymentHistoryItem[] = [];

export async function getPayments(filters?: PaymentFilters): Promise<Payment[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_PAYMENTS;
}

export async function getPaymentById(id: string): Promise<Payment | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_PAYMENTS.find(payment => payment.id === id) || null;
}

export async function createPayment(payment: Partial<Payment>): Promise<ApiResponse<Payment>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: payment as Payment, message: "Payment initiated" };
}

export async function processPayment(id: string): Promise<ApiResponse<Payment>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const payment = MOCK_PAYMENTS.find(p => p.id === id);
  if (!payment) {
    return { data: payment!, error: "Payment not found" };
  }
  return { data: { ...payment, status: "processing" }, message: "Payment processing" };
}

export async function getEscrowTransactions(orderId?: string): Promise<EscrowTransaction[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (orderId) {
    return MOCK_ESCROW.filter(escrow => escrow.orderId === orderId);
  }
  return MOCK_ESCROW;
}

export async function getEscrowById(id: string): Promise<EscrowTransaction | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_ESCROW.find(escrow => escrow.id === id) || null;
}

export async function releaseEscrow(id: string): Promise<ApiResponse<EscrowTransaction>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const escrow = MOCK_ESCROW.find(e => e.id === id);
  if (!escrow) {
    return { data: escrow!, error: "Escrow not found" };
  }
  return { data: { ...escrow, status: "released", releasedAt: new Date().toISOString() }, message: "Escrow released" };
}

export async function disputeEscrow(id: string, reason: string): Promise<ApiResponse<EscrowTransaction>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const escrow = MOCK_ESCROW.find(e => e.id === id);
  if (!escrow) {
    return { data: escrow!, error: "Escrow not found" };
  }
  return { data: { ...escrow, status: "disputed", disputeReason: reason, disputedAt: new Date().toISOString() }, message: "Escrow disputed" };
}

export async function getPaymentHistory(filters?: PaymentFilters): Promise<PaymentHistoryItem[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_HISTORY;
}

export async function getPaymentStats(): Promise<PaymentStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
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
