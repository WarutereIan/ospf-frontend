/**
 * Aggregation Service
 * 
 * Handles all aggregation center-related API calls:
 * - Aggregation centers
 * - Stock transactions
 * - Inventory management
 * - Quality checks
 * 
 * Backend API endpoints to implement:
 * - GET /api/aggregation/centers - List aggregation centers
 * - GET /api/aggregation/centers/:id - Get center details
 * - GET /api/aggregation/stock/transactions - List stock transactions
 * - POST /api/aggregation/stock/in - Create stock in transaction
 * - POST /api/aggregation/stock/out - Create stock out transaction
 * - GET /api/aggregation/inventory - Get inventory
 * - GET /api/aggregation/quality-checks - List quality checks
 * - POST /api/aggregation/quality-checks - Create quality check
 * - GET /api/aggregation/stats - Get aggregation statistics
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

const MOCK_CENTERS: AggregationCenter[] = [];
const MOCK_TRANSACTIONS: StockTransaction[] = [];
const MOCK_INVENTORY: InventoryItem[] = [];
const MOCK_QUALITY_CHECKS: QualityCheck[] = [];

export async function getAggregationCenters(filters?: AggregationFilters): Promise<AggregationCenter[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_CENTERS;
}

export async function getAggregationCenterById(id: string): Promise<AggregationCenter | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_CENTERS.find(center => center.id === id) || null;
}

export async function getStockTransactions(filters?: StockFilters): Promise<StockTransaction[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_TRANSACTIONS;
}

export async function createStockIn(transaction: Partial<StockTransaction>): Promise<ApiResponse<StockTransaction>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { ...transaction, type: "stock_in" } as StockTransaction, message: "Stock in recorded" };
}

export async function createStockOut(transaction: Partial<StockTransaction>): Promise<ApiResponse<StockTransaction>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { ...transaction, type: "stock_out" } as StockTransaction, message: "Stock out recorded" };
}

export async function getInventory(centerId?: string): Promise<InventoryItem[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (centerId) {
    return MOCK_INVENTORY.filter(item => item.centerId === centerId);
  }
  return MOCK_INVENTORY;
}

export async function getQualityChecks(filters?: { centerId?: string; transactionId?: string }): Promise<QualityCheck[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_QUALITY_CHECKS;
}

export async function createQualityCheck(check: Partial<QualityCheck>): Promise<ApiResponse<QualityCheck>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: check as QualityCheck, message: "Quality check recorded" };
}

export async function getWastageEntries(filters?: WastageFilters): Promise<WastageEntry[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
}

export async function createWastageEntry(entry: Partial<WastageEntry>): Promise<ApiResponse<WastageEntry>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: entry as WastageEntry, message: "Wastage entry recorded" };
}

export async function getAggregationStats(): Promise<AggregationStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
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
