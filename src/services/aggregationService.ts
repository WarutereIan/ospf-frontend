/**
 * Aggregation Service
 * 
 * Handles all aggregation center-related API calls:
 * - Aggregation centers
 * - Stock transactions
 * - Inventory management
 * - Quality checks
 * - Wastage entries
 * 
 * Backend API endpoints:
 * - GET /api/v1/aggregation/centers - List aggregation centers
 * - GET /api/v1/aggregation/centers/:id - Get center details
 * - POST /api/v1/aggregation/centers - Create aggregation center
 * - PUT /api/v1/aggregation/centers/:id - Update aggregation center
 * - GET /api/v1/aggregation/stock-transactions - List stock transactions
 * - POST /api/v1/aggregation/stock-in - Create stock in transaction
 * - POST /api/v1/aggregation/stock-out - Create stock out transaction
 * - GET /api/v1/aggregation/inventory - Get inventory
 * - GET /api/v1/aggregation/quality-checks - List quality checks
 * - POST /api/v1/aggregation/quality-checks - Create quality check
 * - GET /api/v1/aggregation/wastage - List wastage entries
 * - POST /api/v1/aggregation/wastage - Create wastage entry
 * - GET /api/v1/aggregation/stats - Get aggregation statistics
 */

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
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";

/**
 * Get all aggregation centers
 * Backend: GET /api/v1/aggregation/centers
 */
export async function getAggregationCenters(filters?: AggregationFilters): Promise<AggregationCenter[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerType) params.centerType = filters.centerType;
    if (filters?.status) params.status = filters.status;
    if (filters?.county) params.county = filters.county;

    return await apiGet<AggregationCenter[]>('/aggregation/centers', params);
  } catch (error) {
    console.error('Error fetching aggregation centers:', error);
    return [];
  }
}

/**
 * Get aggregation center by ID
 * Backend: GET /api/v1/aggregation/centers/:id
 */
export async function getAggregationCenterById(id: string): Promise<AggregationCenter | null> {
  try {
    return await apiGet<AggregationCenter>(`/aggregation/centers/${id}`);
  } catch (error) {
    console.error('Error fetching aggregation center:', error);
    return null;
  }
}

/**
 * Create aggregation center
 * Backend: POST /api/v1/aggregation/centers
 */
export async function createAggregationCenter(center: Partial<AggregationCenter>): Promise<ApiResponse<AggregationCenter>> {
  try {
    const created = await apiPost<AggregationCenter>('/aggregation/centers', center);
    return { data: created, message: "Aggregation center created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create aggregation center" };
  }
}

/**
 * Update aggregation center
 * Backend: PUT /api/v1/aggregation/centers/:id
 */
export async function updateAggregationCenter(id: string, updates: Partial<AggregationCenter>): Promise<ApiResponse<AggregationCenter>> {
  try {
    const updated = await apiPut<AggregationCenter>(`/aggregation/centers/${id}`, updates);
    return { data: updated, message: "Aggregation center updated successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update aggregation center" };
  }
}

/**
 * Get stock transactions
 * Backend: GET /api/v1/aggregation/stock-transactions
 */
export async function getStockTransactions(filters?: StockFilters): Promise<StockTransaction[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.type) params.type = filters.type;
    if (filters?.variety) params.variety = filters.variety;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return await apiGet<StockTransaction[]>('/aggregation/stock-transactions', params);
  } catch (error) {
    console.error('Error fetching stock transactions:', error);
    return [];
  }
}

/**
 * Create stock in transaction
 * Backend: POST /api/v1/aggregation/stock-in
 */
export async function createStockIn(transaction: Partial<StockTransaction>): Promise<ApiResponse<StockTransaction>> {
  try {
    const created = await apiPost<StockTransaction>('/aggregation/stock-in', transaction);
    return { data: created, message: "Stock in recorded" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to record stock in" };
  }
}

/**
 * Create stock out transaction
 * Backend: POST /api/v1/aggregation/stock-out
 */
export async function createStockOut(transaction: Partial<StockTransaction>): Promise<ApiResponse<StockTransaction>> {
  try {
    const created = await apiPost<StockTransaction>('/aggregation/stock-out', transaction);
    return { data: created, message: "Stock out recorded" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to record stock out" };
  }
}

/**
 * Get inventory items
 * Backend: GET /api/v1/aggregation/inventory
 */
export async function getInventory(centerId?: string): Promise<InventoryItem[]> {
  try {
    const params: Record<string, any> = {};
    if (centerId) params.centerId = centerId;

    return await apiGet<InventoryItem[]>('/aggregation/inventory', params);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

/**
 * Get quality checks
 * Backend: GET /api/v1/aggregation/quality-checks
 */
export async function getQualityChecks(filters?: { centerId?: string; transactionId?: string; orderId?: string }): Promise<QualityCheck[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.transactionId) params.transactionId = filters.transactionId;
    if (filters?.orderId) params.orderId = filters.orderId;

    return await apiGet<QualityCheck[]>('/aggregation/quality-checks', params);
  } catch (error) {
    console.error('Error fetching quality checks:', error);
    return [];
  }
}

/**
 * Create quality check
 * Backend: POST /api/v1/aggregation/quality-checks
 */
export async function createQualityCheck(check: Partial<QualityCheck>): Promise<ApiResponse<QualityCheck>> {
  try {
    const created = await apiPost<QualityCheck>('/aggregation/quality-checks', check);
    return { data: created, message: "Quality check recorded" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to record quality check" };
  }
}

/**
 * Get wastage entries
 * Backend: GET /api/v1/aggregation/wastage
 */
export async function getWastageEntries(filters?: WastageFilters): Promise<WastageEntry[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.category) params.category = filters.category;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;

    return await apiGet<WastageEntry[]>('/aggregation/wastage', params);
  } catch (error) {
    console.error('Error fetching wastage entries:', error);
    return [];
  }
}

/**
 * Create wastage entry
 * Backend: POST /api/v1/aggregation/wastage
 */
export async function createWastageEntry(entry: Partial<WastageEntry>): Promise<ApiResponse<WastageEntry>> {
  try {
    const created = await apiPost<WastageEntry>('/aggregation/wastage', entry);
    return { data: created, message: "Wastage entry recorded" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to record wastage entry" };
  }
}

/**
 * Get aggregation statistics
 * Backend: GET /api/v1/aggregation/stats
 */
export async function getAggregationStats(): Promise<AggregationStats> {
  try {
    return await apiGet<AggregationStats>('/aggregation/stats');
  } catch (error) {
    console.error('Error fetching aggregation stats:', error);
    return {
      totalCenters: 0,
      mainCenters: 0,
      satelliteCenters: 0,
      operationalCenters: 0,
      totalStock: 0,
      totalCapacity: 0,
      utilizationRate: 0,
      stockInToday: 0,
      stockOutToday: 0,
      activeFarmers: 0,
      qualityDistribution: {
        gradeA: 0,
        gradeB: 0,
        gradeC: 0,
      },
      totalWastage: 0,
      wastageRate: 0,
    };
  }
}
