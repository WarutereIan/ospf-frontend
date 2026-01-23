/**
 * Payment Context
 * 
 * Provides global state management for payment functionality:
 * - Payments
 * - Escrow transactions
 * - Payment history
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  Payment,
  EscrowTransaction,
  PaymentHistoryItem,
  PaymentFilters,
  PaymentStats,
} from "@/types/payment";
import {
  getPayments,
  getPaymentById,
  createPayment,
  processPayment,
  getEscrowTransactions,
  getEscrowById,
  releaseEscrow,
  disputeEscrow,
  getPaymentHistory,
  getPaymentStats,
} from "@/services/paymentService";

interface PaymentContextType {
  payments: Payment[];
  selectedPayment: Payment | null;
  escrowTransactions: EscrowTransaction[];
  selectedEscrow: EscrowTransaction | null;
  paymentHistory: PaymentHistoryItem[];
  filters: PaymentFilters;
  stats: PaymentStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  createPaymentAction: (payment: Partial<Payment>) => Promise<void>;
  processPaymentAction: (id: string) => Promise<void>;
  fetchEscrowTransactions: (orderId?: string) => Promise<void>;
  fetchEscrowById: (id: string) => Promise<void>;
  releaseEscrowAction: (id: string) => Promise<void>;
  disputeEscrowAction: (id: string, reason: string) => Promise<void>;
  fetchPaymentHistory: (filters?: PaymentFilters) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: PaymentFilters) => void;
  clearSelectedPayment: () => void;
  clearSelectedEscrow: () => void;
  
  filteredPayments: Payment[];
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [filters, setFiltersState] = useState<PaymentFilters>({});
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async (newFilters?: PaymentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getPayments(appliedFilters);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payments");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchPaymentById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const payment = await getPaymentById(id);
      setSelectedPayment(payment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEscrowTransactions = useCallback(async (orderId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEscrowTransactions(orderId);
      setEscrowTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch escrow transactions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEscrowById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const escrow = await getEscrowById(id);
      setSelectedEscrow(escrow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch escrow");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPaymentHistory = useCallback(async (newFilters?: PaymentFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getPaymentHistory(appliedFilters);
      setPaymentHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payment history");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPaymentStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPaymentAction = useCallback(async (payment: Partial<Payment>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createPayment(payment);
      // Refresh payments - call service function directly to avoid circular dependency
      const data = await getPayments(filters);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const processPaymentAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await processPayment(id);
      // Refresh payments - call service function directly
      const data = await getPayments(filters);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const releaseEscrowAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await releaseEscrow(id);
      // Refresh escrow transactions - call service function directly
      const data = await getEscrowTransactions();
      setEscrowTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to release escrow");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disputeEscrowAction = useCallback(async (id: string, reason: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await disputeEscrow(id, reason);
      // Refresh escrow transactions - call service function directly
      const data = await getEscrowTransactions();
      setEscrowTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dispute escrow");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: PaymentFilters) => {
    setFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const paymentsData = await getPayments(newFilters);
        setPayments(paymentsData);
        const historyData = await getPaymentHistory(newFilters);
        setPaymentHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payment data");
      }
    })();
  }, []);

  const clearSelectedPayment = useCallback(() => {
    setSelectedPayment(null);
  }, []);

  const clearSelectedEscrow = useCallback(() => {
    setSelectedEscrow(null);
  }, []);

  const filteredPayments = payments;

  // No context-level fetch: each page fetches only what it needs (e.g. PaymentHistory → fetchPaymentHistory;
  // BuyerDashboard → fetchPaymentHistory; BuyerOrderDetails → fetchPayments).

  const value: PaymentContextType = {
    payments,
    selectedPayment,
    escrowTransactions,
    selectedEscrow,
    paymentHistory,
    filters,
    stats,
    isLoading,
    error,
    fetchPayments,
    fetchPaymentById,
    createPaymentAction,
    processPaymentAction,
    fetchEscrowTransactions,
    fetchEscrowById,
    releaseEscrowAction,
    disputeEscrowAction,
    fetchPaymentHistory,
    fetchStats,
    setFilters,
    clearSelectedPayment,
    clearSelectedEscrow,
    filteredPayments,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
