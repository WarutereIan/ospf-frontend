/**
 * Aggregation Context
 * 
 * Provides global state management for aggregation center functionality:
 * - Aggregation centers
 * - Stock transactions
 * - Inventory management
 * - Quality checks
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type {
  AggregationCenter,
  StockTransaction,
  InventoryItem,
  QualityCheck,
  WastageEntry,
  WastageFilters,
  AggregationFilters,
  StockFilters,
  AggregationStats,
} from "@/types/aggregation";
import {
  getAggregationCenters,
  getAggregationCenterById,
  getStockTransactions,
  createStockIn,
  createStockOut,
  getInventory,
  getQualityChecks,
  createQualityCheck,
  getWastageEntries,
  createWastageEntry,
  getAggregationStats,
} from "@/services/aggregationService";

interface AggregationContextType {
  centers: AggregationCenter[];
  selectedCenter: AggregationCenter | null;
  transactions: StockTransaction[];
  inventory: InventoryItem[];
  qualityChecks: QualityCheck[];
  wastageEntries: WastageEntry[];
  centerFilters: AggregationFilters;
  stockFilters: StockFilters;
  wastageFilters: WastageFilters;
  stats: AggregationStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCenters: (filters?: AggregationFilters) => Promise<void>;
  fetchCenterById: (id: string) => Promise<void>;
  fetchTransactions: (filters?: StockFilters) => Promise<void>;
  recordStockIn: (transaction: Partial<StockTransaction>) => Promise<void>;
  recordStockOut: (transaction: Partial<StockTransaction>) => Promise<void>;
  fetchInventory: (centerId?: string) => Promise<void>;
  fetchQualityChecks: (filters?: { centerId?: string; transactionId?: string }) => Promise<void>;
  recordQualityCheck: (check: Partial<QualityCheck>) => Promise<void>;
  fetchWastageEntries: (filters?: WastageFilters) => Promise<void>;
  recordWastageEntry: (entry: Partial<WastageEntry>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setCenterFilters: (filters: AggregationFilters) => void;
  setStockFilters: (filters: StockFilters) => void;
  setWastageFilters: (filters: WastageFilters) => void;
  setSelectedCenter: (center: AggregationCenter | null) => void;
  clearSelectedCenter: () => void;
  
  filteredCenters: AggregationCenter[];
  filteredTransactions: StockTransaction[];
}

const AggregationContext = createContext<AggregationContextType | undefined>(undefined);

export function AggregationProvider({ children }: { children: ReactNode }) {
  const [centers, setCenters] = useState<AggregationCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<AggregationCenter | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [wastageEntries, setWastageEntries] = useState<WastageEntry[]>([]);
  const [centerFilters, setCenterFiltersState] = useState<AggregationFilters>({});
  const [stockFilters, setStockFiltersState] = useState<StockFilters>({});
  const [wastageFilters, setWastageFiltersState] = useState<WastageFilters>({});
  const [stats, setStats] = useState<AggregationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = useCallback(async (newFilters?: AggregationFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || centerFilters;
      const data = await getAggregationCenters(appliedFilters);
      setCenters(data);
    } catch (err: any) {
      // Don't set error state for auth errors (401) or rate limit errors (429)
      // The API client already handles these and prevents retries
      if (err?.statusCode === 401 || err?.statusCode === 429) {
        // Silently fail - API client will handle redirect/rate limiting
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to fetch centers");
    } finally {
      setIsLoading(false);
    }
  }, [centerFilters]);

  const fetchCenterById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const center = await getAggregationCenterById(id);
      setSelectedCenter(center);
    } catch (err: any) {
      // Don't set error state for auth errors (401) or rate limit errors (429)
      // The API client already handles these and prevents retries
      if (err?.statusCode === 401 || err?.statusCode === 429) {
        // Silently fail - API client will handle redirect/rate limiting
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to fetch center");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async (newFilters?: StockFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || stockFilters;
      const data = await getStockTransactions(appliedFilters);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [stockFilters]);

  const fetchInventory = useCallback(async (centerId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getInventory(centerId);
      setInventory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQualityChecks = useCallback(async (filters?: { 
    centerId?: string; 
    transactionId?: string;
    orderId?: string;
    dateFrom?: string;
    dateTo?: string;
    county?: string;
    subCounty?: string;
    centerType?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getQualityChecks(filters);
      setQualityChecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch quality checks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAggregationStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordStockIn = useCallback(async (transaction: Partial<StockTransaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createStockIn(transaction);
      // Refresh related data - call service functions directly to avoid circular dependencies
      const transactionData = await getStockTransactions(stockFilters);
      setTransactions(transactionData);
      const inventoryData = await getInventory();
      setInventory(inventoryData);
      const statsData = await getAggregationStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record stock in");
    } finally {
      setIsLoading(false);
    }
  }, [stockFilters]);

  const recordStockOut = useCallback(async (transaction: Partial<StockTransaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createStockOut(transaction);
      // Refresh related data - call service functions directly to avoid circular dependencies
      const transactionData = await getStockTransactions(stockFilters);
      setTransactions(transactionData);
      const inventoryData = await getInventory();
      setInventory(inventoryData);
      const statsData = await getAggregationStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record stock out");
    } finally {
      setIsLoading(false);
    }
  }, [stockFilters]);

  const recordQualityCheck = useCallback(async (check: Partial<QualityCheck>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createQualityCheck(check);
      // Refresh quality checks - call service function directly
      const data = await getQualityChecks();
      setQualityChecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record quality check");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWastageEntries = useCallback(async (newFilters?: WastageFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || wastageFilters;
      const data = await getWastageEntries(appliedFilters);
      setWastageEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch wastage entries");
    } finally {
      setIsLoading(false);
    }
  }, [wastageFilters]);

  const recordWastageEntry = useCallback(async (entry: Partial<WastageEntry>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createWastageEntry(entry);
      // Refresh related data - call service functions directly
      const wastageData = await getWastageEntries(wastageFilters);
      setWastageEntries(wastageData);
      const statsData = await getAggregationStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record wastage entry");
    } finally {
      setIsLoading(false);
    }
  }, [wastageFilters]);

  const setCenterFilters = useCallback((newFilters: AggregationFilters) => {
    setCenterFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getAggregationCenters(newFilters);
        setCenters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch centers");
      }
    })();
  }, []);

  const setStockFilters = useCallback((newFilters: StockFilters) => {
    setStockFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getStockTransactions(newFilters);
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock transactions");
      }
    })();
  }, []);

  const setWastageFilters = useCallback((newFilters: WastageFilters) => {
    setWastageFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getWastageEntries(newFilters);
        setWastageEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch wastage entries");
      }
    })();
  }, []);

  const setSelectedCenterAction = useCallback((center: AggregationCenter | null) => {
    setSelectedCenter(center);
  }, []);

  const clearSelectedCenter = useCallback(() => {
    setSelectedCenter(null);
  }, []);

  const filteredCenters = centers;
  const filteredTransactions = transactions;

  // No context-level fetch: each page fetches only what it needs (e.g. StockInForm → fetchCenters;
  // InventoryManagement → fetchCenters, fetchInventory; Reports → fetchTransactions, fetchStats, fetchQualityChecks).

  const value: AggregationContextType = {
    centers,
    selectedCenter,
    transactions,
    inventory,
    qualityChecks,
    wastageEntries,
    centerFilters,
    stockFilters,
    wastageFilters,
    stats,
    isLoading,
    error,
    fetchCenters,
    fetchCenterById,
    fetchTransactions,
    recordStockIn,
    recordStockOut,
    fetchInventory,
    fetchQualityChecks,
    recordQualityCheck,
    fetchWastageEntries,
    recordWastageEntry,
    fetchStats,
    setCenterFilters,
    setStockFilters,
    setWastageFilters,
    setSelectedCenter: setSelectedCenterAction,
    clearSelectedCenter,
    filteredCenters,
    filteredTransactions,
  };

  return (
    <AggregationContext.Provider value={value}>
      {children}
    </AggregationContext.Provider>
  );
}

export function useAggregation() {
  const context = useContext(AggregationContext);
  if (context === undefined) {
    throw new Error("useAggregation must be used within an AggregationProvider");
  }
  return context;
}
