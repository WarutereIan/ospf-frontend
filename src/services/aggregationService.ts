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
  CenterType,
  CenterStatus,
  StockTransactionType,
} from "@/types/aggregation";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut } from "@/lib/api-client";
import { showSuccess } from "@/lib/toast";

// ==================== Enum Transformation Utilities ====================

/**
 * Map backend center type (UPPER_CASE) to frontend format (lowercase)
 */
function mapCenterType(backendType: string): CenterType {
  const typeMap: Record<string, CenterType> = {
    MAIN: 'main',
    SATELLITE: 'satellite',
  };
  return typeMap[backendType] || 'main';
}

/**
 * Map backend center status (UPPER_CASE) to frontend format (lowercase)
 */
function mapCenterStatus(backendStatus: string): CenterStatus {
  const statusMap: Record<string, CenterStatus> = {
    OPERATIONAL: 'operational',
    MAINTENANCE: 'maintenance',
    CLOSED: 'closed',
  };
  return statusMap[backendStatus] || 'operational';
}

/**
 * Map backend stock transaction type (UPPER_CASE) to frontend format (lowercase)
 */
function mapStockTransactionType(backendType: string): StockTransactionType {
  const typeMap: Record<string, StockTransactionType> = {
    STOCK_IN: 'stock_in',
    STOCK_OUT: 'stock_out',
    TRANSFER: 'transfer',
    WASTAGE: 'wastage',
    ADJUSTMENT: 'adjustment',
  };
  return typeMap[backendType] || 'stock_in';
}

/**
 * Transform aggregation center from backend format to frontend format.
 * Backend uses totalCapacity; frontend type uses capacity — map so edit/display work.
 */
function transformAggregationCenter(center: any): AggregationCenter {
  const capacity = center.totalCapacity ?? center.capacity;
  const capacityNum = typeof capacity === "number" && !Number.isNaN(capacity) ? capacity : 0;
  return {
    ...center,
    capacity: capacityNum,
    centerType: center.centerType ? mapCenterType(center.centerType) : center.centerType,
    status: center.status ? mapCenterStatus(center.status) : center.status,
  };
}

/**
 * Transform stock transaction from backend format to frontend format
 */
function transformStockTransaction(transaction: any): StockTransaction {
  return {
    ...transaction,
    type: mapStockTransactionType(transaction.type),
  };
}

/**
 * Get all aggregation centers
 * Backend: GET /api/v1/aggregation/centers
 */
export async function getAggregationCenters(filters?: AggregationFilters): Promise<AggregationCenter[]> {
  try {
    const params: Record<string, any> = {};
    // Transform filters to backend format (UPPER_CASE) if provided
    if (filters?.centerType && filters.centerType !== "all") {
      params.centerType = filters.centerType.toUpperCase();
    }
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase();
    }
    if (filters?.county) params.county = filters.county;

    const centers = await apiGet<any[]>('/aggregation/centers', params);
    return centers.map(transformAggregationCenter);
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
 * Backend CreateAggregationCenterDto shape (POST /aggregation/centers).
 */
interface CreateAggregationCenterDto {
  name: string;
  location: string;
  county: string;
  subCounty?: string;
  ward?: string;
  coordinates: string;
  centerType: 'MAIN' | 'SATELLITE';
  mainCenterId?: string;
  totalCapacity: number;
  managerId: string;
  managerName?: string;
  managerPhone?: string;
  status?: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED';
}

/**
 * Map frontend aggregation center to backend CreateAggregationCenterDto.
 */
function toCreateAggregationCenterDto(center: Partial<AggregationCenter>): CreateAggregationCenterDto {
  const centerType = center.centerType
    ? (center.centerType === 'main' ? 'MAIN' : 'SATELLITE')
    : 'MAIN';

  const cap = center.totalCapacity ?? center.capacity;
  const totalCapacity =
    typeof cap === "number" && !Number.isNaN(cap)
      ? Math.max(0, cap)
      : Math.max(0, Number(cap) || 0);

  const coords = center.coordinates;
  const coordinatesStr =
    Array.isArray(coords) && coords.length === 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1])
      ? `${coords[0]},${coords[1]}`
      : typeof coords === "string"
        ? coords
        : "";

  return {
    name: center.name || '',
    location: center.location || '',
    county: center.county || '',
    subCounty: center.subCounty,
    ward: center.ward,
    coordinates: coordinatesStr,
    centerType: centerType as CreateAggregationCenterDto['centerType'],
    mainCenterId: center.centerType === "main" || !center.mainCenterId?.trim() ? undefined : center.mainCenterId?.trim(),
    totalCapacity,
    managerId: center.managerId || '',
    managerName: center.managerName,
    managerPhone: center.managerPhone,
    status: center.status
      ? (center.status === 'operational' ? 'OPERATIONAL' :
         center.status === 'maintenance' ? 'MAINTENANCE' : 'CLOSED') as CreateAggregationCenterDto['status']
      : undefined,
  };
}

/**
 * Create aggregation center
 * Backend: POST /api/v1/aggregation/centers
 */
export async function createAggregationCenter(center: Partial<AggregationCenter>): Promise<ApiResponse<AggregationCenter>> {
  try {
    const dto = toCreateAggregationCenterDto(center);
    const created = await apiPost<any>('/aggregation/centers', dto);
    return { data: transformAggregationCenter(created), message: "Aggregation center created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create aggregation center" };
  }
}

/**
 * Map frontend update payload to backend format (centerType and status UPPER_CASE; mainCenterId null for main).
 */
function toUpdateAggregationCenterPayload(updates: Partial<AggregationCenter>): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.centerType !== undefined) {
    payload.centerType = updates.centerType === "main" ? "MAIN" : "SATELLITE";
  }
  if (updates.status !== undefined) {
    payload.status =
      updates.status === "operational"
        ? "OPERATIONAL"
        : updates.status === "maintenance"
          ? "MAINTENANCE"
          : "CLOSED";
  }
  // Capacity: ensure number >= 0 (backend @Min(0))
  const cap = updates.totalCapacity ?? (updates as Record<string, unknown>).capacity;
  if (cap !== undefined) {
    const num = Number(cap);
    payload.totalCapacity = Number.isNaN(num) ? 0 : Math.max(0, num);
  }
  // Main centers must have mainCenterId null; avoid sending empty string (FK violation)
  if (updates.centerType === "main") {
    payload.mainCenterId = null;
  } else if (updates.mainCenterId !== undefined && typeof updates.mainCenterId === "string" && updates.mainCenterId.trim()) {
    payload.mainCenterId = updates.mainCenterId.trim();
  } else if (updates.mainCenterId === "" || (updates.mainCenterId !== undefined && !String(updates.mainCenterId).trim())) {
    payload.mainCenterId = null;
  }
  return payload;
}

/**
 * Update aggregation center
 * Backend: PUT /api/v1/aggregation/centers/:id
 */
export async function updateAggregationCenter(id: string, updates: Partial<AggregationCenter>): Promise<ApiResponse<AggregationCenter>> {
  try {
    const payload = toUpdateAggregationCenterPayload(updates);
    const updated = await apiPut<any>(`/aggregation/centers/${id}`, payload);
    return { data: transformAggregationCenter(updated), message: "Aggregation center updated successfully" };
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
    if (filters?.status) params.status = filters.status;

    const transactions = await apiGet<any[]>('/aggregation/stock-transactions', params);
    return transactions.map(transformStockTransaction);
  } catch (error) {
    console.error('Error fetching stock transactions:', error);
    return [];
  }
}

/**
 * Confirm a pending stock transaction
 * Backend: POST /api/v1/aggregation/stock-transactions/:id/confirm
 */
export async function confirmStockTransaction(transactionId: string): Promise<ApiResponse<StockTransaction>> {
  try {
    const confirmed = await apiPost<any>(`/aggregation/stock-transactions/${transactionId}/confirm`, {});
    return { data: transformStockTransaction(confirmed), message: "Stock transaction confirmed successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to confirm stock transaction" };
  }
}

/**
 * Reject a pending stock transaction
 * Backend: POST /api/v1/aggregation/stock-transactions/:id/reject
 */
export async function rejectStockTransaction(transactionId: string, reason: string): Promise<ApiResponse<StockTransaction>> {
  try {
    const rejected = await apiPost<any>(`/aggregation/stock-transactions/${transactionId}/reject`, { reason });
    return { data: transformStockTransaction(rejected), message: "Stock transaction rejected" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to reject stock transaction" };
  }
}

/**
 * Search batches using PostgreSQL full-text search
 * Backend: GET /api/v1/aggregation/batches/search
 */
export async function searchBatches(query: string, limit: number = 10): Promise<StockTransaction[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const params: Record<string, any> = { q: query.trim() };
    if (limit) params.limit = limit;

    const transactions = await apiGet<any[]>('/aggregation/batches/search', params);
    return transactions.map(transformStockTransaction);
  } catch (error) {
    console.error('Error searching batches:', error);
    return [];
  }
}

/**
 * Order search result interface
 */
export interface OrderSearchResult {
  id: string;
  orderNumber: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

/**
 * Search orders using PostgreSQL full-text search by order ID or buyer name
 * Backend: GET /api/v1/aggregation/orders/search
 */
export async function searchOrders(query: string, limit: number = 10): Promise<OrderSearchResult[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const params: Record<string, any> = { q: query.trim() };
    if (limit) params.limit = limit;

    const orders = await apiGet<OrderSearchResult[]>('/aggregation/orders/search', params);
    return orders;
  } catch (error) {
    console.error('Error searching orders:', error);
    return [];
  }
}

/**
 * Farmer search result interface
 */
export interface FarmerSearchResult {
  userId: string;
  name: string;
  phone: string;
  email: string;
  businessName: string;
  county: string;
  subCounty: string;
  ward: string;
}

/**
 * Search farmers using PostgreSQL full-text search by name, phone, or email
 * Backend: GET /api/v1/aggregation/farmers/search
 */
export async function searchFarmers(query: string, limit: number = 10): Promise<FarmerSearchResult[]> {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const params: Record<string, any> = { q: query.trim() };
    if (limit) params.limit = limit;

    const farmers = await apiGet<FarmerSearchResult[]>('/aggregation/farmers/search', params);
    return farmers;
  } catch (error) {
    console.error('Error searching farmers:', error);
    return [];
  }
}

/**
 * Backend CreateStockTransactionDto shape (POST /aggregation/stock-in, /aggregation/stock-out).
 */
interface CreateStockTransactionDto {
  centerId: string;
  variety: string;
  quantity: number;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerKg?: number;
  orderId?: string;
  farmerId?: string;
  farmerName?: string;
  buyerId?: string;
  buyerName?: string;
  batchId?: string;
  qrCode?: string;
  notes?: string;
  sourceCenterId?: string;
  transferTransactionId?: string;
  // Grading Matrix Criteria
  weightRange?: string;
  colorIntensity?: number;
  physicalCondition?: string;
  freshness?: string;
  daysSinceHarvest?: number;
}

/**
 * Map frontend stock transaction to backend CreateStockTransactionDto.
 */
function toCreateStockTransactionDto(transaction: Partial<StockTransaction>): CreateStockTransactionDto {
  return {
    centerId: transaction.centerId || '',
    variety: transaction.variety || '',
    quantity: typeof transaction.quantity === 'number' ? transaction.quantity : 0,
    qualityGrade: (transaction.qualityGrade === 'A' || transaction.qualityGrade === 'B' || transaction.qualityGrade === 'C')
      ? transaction.qualityGrade
      : 'B',
    pricePerKg: transaction.pricePerKg,
    orderId: transaction.orderId,
    farmerId: transaction.farmerId,
    farmerName: transaction.farmerName,
    buyerId: transaction.buyerId,
    buyerName: transaction.buyerName,
    batchId: transaction.batchId,
    qrCode: transaction.qrCode,
    notes: transaction.notes,
    sourceCenterId: transaction.sourceCenterId,
    transferTransactionId: transaction.transferTransactionId,
    // Grading Matrix Criteria
    weightRange: transaction.weightRange,
    colorIntensity: transaction.colorIntensity,
    physicalCondition: transaction.physicalCondition,
    freshness: transaction.freshness,
    daysSinceHarvest: transaction.daysSinceHarvest,
  };
}

/**
 * Create stock in transaction
 * Backend: POST /api/v1/aggregation/stock-in
 */
export async function createStockIn(transaction: Partial<StockTransaction>): Promise<ApiResponse<StockTransaction>> {
  try {
    const dto = toCreateStockTransactionDto(transaction);
    const created = await apiPost<any>('/aggregation/stock-in', dto);
    return { data: transformStockTransaction(created), message: "Stock in recorded" };
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
    const dto = toCreateStockTransactionDto(transaction);
    const created = await apiPost<any>('/aggregation/stock-out', dto);
    return { data: transformStockTransaction(created), message: "Stock out recorded" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to record stock out" };
  }
}

/**
 * Get inventory items
 * Backend: GET /api/v1/aggregation/inventory
 */
export async function getInventory(filters?: {
  centerId?: string;
  farmerId?: string;
  qualityGrade?: string;
}): Promise<InventoryItem[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.qualityGrade) params.qualityGrade = filters.qualityGrade;

    return await apiGet<InventoryItem[]>('/aggregation/inventory', params);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

/**
 * Get inventory batches with stock transaction details for compliance checking
 * Backend: GET /api/v1/aggregation/inventory/batches
 */
export async function getInventoryBatches(filters?: {
  centerId?: string;
  farmerId?: string;
  qualityGrade?: string;
  dateFrom?: string;
  dateTo?: string;
  county?: string;
  subCounty?: string;
  centerType?: string;
}): Promise<(InventoryItem & { stockTransaction: any })[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.qualityGrade) params.qualityGrade = filters.qualityGrade;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.county) params.county = filters.county;
    if (filters?.subCounty) params.subCounty = filters.subCounty;
    if (filters?.centerType) params.centerType = filters.centerType;

    return await apiGet<(InventoryItem & { stockTransaction: any })[]>('/aggregation/inventory/batches', params);
  } catch (error) {
    console.error('Error fetching inventory batches:', error);
    return [];
  }
}

/**
 * Get quality checks
 * Backend: GET /api/v1/aggregation/quality-checks
 */
export async function getQualityChecks(filters?: { 
  centerId?: string; 
  transactionId?: string; 
  orderId?: string;
  dateFrom?: string;
  dateTo?: string;
  county?: string;
  subCounty?: string;
  centerType?: string;
}): Promise<QualityCheck[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.centerId) params.centerId = filters.centerId;
    if (filters?.transactionId) params.transactionId = filters.transactionId;
    if (filters?.orderId) params.orderId = filters.orderId;
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    if (filters?.county) params.county = filters.county;
    if (filters?.subCounty) params.subCounty = filters.subCounty;
    if (filters?.centerType) params.centerType = filters.centerType;

    return await apiGet<QualityCheck[]>('/aggregation/quality-checks', params);
  } catch (error) {
    console.error('Error fetching quality checks:', error);
    return [];
  }
}

/**
 * Backend CreateQualityCheckDto shape (POST /aggregation/quality-checks).
 */
interface CreateQualityCheckDto {
  centerId: string;
  orderId?: string;
  transactionId?: string;
  farmerId?: string;
  farmerName?: string;
  batchId?: string;
  variety: string;
  quantity: number;
  weightRange?: string;
  colorIntensity?: number;
  physicalCondition?: string;
  freshness?: string;
  daysSinceHarvest?: number;
  qualityGrade: 'A' | 'B' | 'C';
  qualityScore: number;
  colorScore?: number;
  damageScore?: number;
  sizeScore?: number;
  dryMatterContent?: number;
  notes?: string;
  photos?: string[];
}

/**
 * Map frontend quality check to backend CreateQualityCheckDto.
 */
function toCreateQualityCheckDto(check: Partial<QualityCheck>): CreateQualityCheckDto {
  return {
    centerId: check.centerId || '',
    orderId: check.orderId,
    transactionId: check.transactionId,
    farmerId: check.farmerId,
    farmerName: check.farmerName,
    batchId: check.batchId,
    variety: check.variety || '',
    quantity: typeof check.quantity === 'number' ? check.quantity : 0,
    weightRange: check.weightRange,
    colorIntensity: check.colorIntensity,
    physicalCondition: check.physicalCondition,
    freshness: check.freshness,
    daysSinceHarvest: check.daysSinceHarvest,
    qualityGrade: (check.qualityGrade === 'A' || check.qualityGrade === 'B' || check.qualityGrade === 'C')
      ? check.qualityGrade
      : 'B',
    qualityScore: typeof check.qualityScore === 'number' ? check.qualityScore : 0,
    colorScore: check.colorScore,
    damageScore: check.damageScore,
    sizeScore: check.sizeScore,
    dryMatterContent: check.dryMatterContent,
    notes: check.notes,
    photos: check.photos,
  };
}

/**
 * Create quality check
 * Backend: POST /api/v1/aggregation/quality-checks
 */
export async function createQualityCheck(check: Partial<QualityCheck>): Promise<ApiResponse<QualityCheck>> {
  try {
    const dto = toCreateQualityCheckDto(check);
    const created = await apiPost<QualityCheck>('/aggregation/quality-checks', dto);
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
 * Backend CreateWastageEntryDto shape (POST /aggregation/wastage).
 */
interface CreateWastageEntryDto {
  centerId: string;
  inventoryItemId?: string;
  batchId?: string;
  variety: string;
  quantity: number;
  qualityGrade: 'A' | 'B' | 'C';
  category: 'SPOILAGE' | 'DAMAGE' | 'EXPIRED' | 'OTHER';
  reason?: string;
  notes?: string;
}

/**
 * Map frontend wastage entry to backend CreateWastageEntryDto.
 */
function toCreateWastageEntryDto(entry: Partial<WastageEntry>): CreateWastageEntryDto {
  const cat = entry.category ? String(entry.category).toUpperCase() : 'OTHER';
  const category = (cat === 'SPOILAGE' || cat === 'DAMAGE' || cat === 'EXPIRED' || cat === 'OTHER' ? cat : 'OTHER') as CreateWastageEntryDto['category'];
  return {
    centerId: entry.centerId || '',
    inventoryItemId: entry.inventoryItemId ?? entry.inventoryId,
    batchId: entry.batchId,
    variety: entry.variety || '',
    quantity: typeof entry.quantity === 'number' ? entry.quantity : 0,
    qualityGrade: (entry.qualityGrade === 'A' || entry.qualityGrade === 'B' || entry.qualityGrade === 'C')
      ? entry.qualityGrade
      : 'B',
    category,
    reason: entry.reason,
    notes: entry.notes,
  };
}

/**
 * Create wastage entry
 * Backend: POST /api/v1/aggregation/wastage
 */
export async function createWastageEntry(entry: Partial<WastageEntry>): Promise<ApiResponse<WastageEntry>> {
  try {
    const dto = toCreateWastageEntryDto(entry);
    const created = await apiPost<WastageEntry>('/aggregation/wastage', dto);
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
