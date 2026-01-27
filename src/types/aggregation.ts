/**
 * Aggregation Types
 * 
 * Types for aggregation center functionality:
 * - Aggregation centers
 * - Stock management (in/out)
 * - Quality checks
 * - Inventory management
 * - Storage management
 * - Capacity management
 */

/**
 * Center type
 */
export type CenterType = "main" | "satellite";

/**
 * Center status
 */
export type CenterStatus = "operational" | "maintenance" | "closed";

/**
 * Quality grade
 */
export type QualityGrade = "A" | "B" | "C";

/**
 * Stock transaction type
 */
export type StockTransactionType = "stock_in" | "stock_out" | "transfer" | "wastage" | "adjustment";

/**
 * Stock transaction status
 */
export type StockTransactionStatus = "PENDING_CONFIRMATION" | "CONFIRMED" | "REJECTED";

/**
 * Stock status
 */
export type StockStatus = "fresh" | "aging" | "critical";

/**
 * Wastage category
 */
export type WastageCategory = "spoilage" | "damage" | "expired" | "other";

/**
 * Aggregation Center
 */
export interface AggregationCenter {
  id: string; // UUID
  name: string;
  location: string;
  subCounty: string;
  ward?: string; // For satellite centers
  centerType: CenterType;
  mainCenterId?: string; // For satellite centers - links to parent
  managerId: string;
  managerName: string;
  coordinates: [number, number]; // [lat, lng]
  currentStock: number; // kg
  capacity: number; // kg
  activeFarmers: number;
  status: CenterStatus;
  stockInToday: number; // kg
  stockOutToday: number; // kg
  alerts: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Stock Transaction
 * Represents a stock in/out transaction
 */
export interface StockTransaction {
  id: string; // UUID
  centerId: string;
  centerName: string;
  type: StockTransactionType;
  farmerId?: string; // For stock in
  farmerName?: string;
  buyerId?: string; // For stock out
  buyerName?: string;
  orderId?: string; // Related order ID
  variety: string;
  quantity: number; // kg
  qualityGrade: QualityGrade;
  grade?: QualityGrade; // Alias for qualityGrade (used in some contexts)
  pricePerKg?: number;
  totalAmount?: number;
  photos?: string[]; // Image URLs
  notes?: string;
  createdAt: string; // ISO 8601
  createdBy: string; // User ID
  batchId?: string; // Batch ID for traceability
  qrCode?: string; // QR code
  status?: StockTransactionStatus; // Transaction confirmation status
  confirmedBy?: string; // User ID who confirmed/rejected
  confirmedAt?: string; // ISO 8601 - When confirmed/rejected
  rejectionReason?: string; // Reason if rejected
  // Grading Matrix Criteria (for quality assessment)
  weightRange?: string; // small, medium, large, extra_large
  colorIntensity?: number; // 1-10 scale
  physicalCondition?: string; // excellent, good, fair, poor
  freshness?: string; // very_fresh, fresh, moderate, aging
  daysSinceHarvest?: number; // Number of days since harvest
}

/**
 * Inventory Item
 * Current stock in aggregation center
 */
export interface InventoryItem {
  id: string; // UUID
  centerId: string;
  variety: string;
  qualityGrade: QualityGrade;
  grade?: QualityGrade; // Alias for qualityGrade (used in some contexts)
  quantity: number; // kg
  storageDuration: number; // days
  farmerId: string;
  farmerName: string;
  stockInDate: string; // ISO 8601
  createdAt?: string; // ISO 8601 - Alias for stockInDate (used in some contexts)
  status: StockStatus;
  batchId?: string;
  location?: string; // Storage location within center
  temperature?: number; // Celsius - for storage management
  humidity?: number; // percentage - for storage management
}

/**
 * Quality Check
 */
export interface QualityCheck {
  id: string; // UUID
  centerId: string;
  transactionId: string; // Related stock transaction
  farmerId: string;
  farmerName: string;
  variety: string;
  quantity: number; // kg
  qualityGrade: QualityGrade;
  qualityScore: number; // 0-100
  sizeScore?: number;
  colorScore?: number;
  damageScore?: number;
  dryMatterContent?: number; // percentage
  photos?: string[]; // Quality check photos
  notes?: string;
  checkedBy: string; // User ID
  checkedAt: string; // ISO 8601
  createdAt?: string; // ISO 8601 - Alias for checkedAt (used in some contexts)
  passed?: boolean; // Whether quality check passed
  failed?: boolean; // Whether quality check failed
  status?: "approved" | "rejected" | "pending"; // Quality check status (used in some contexts)
  batchId?: string;
}

/**
 * Storage Management
 * Storage conditions and aging stock
 */
export interface StorageItem {
  id: string;
  centerId: string;
  inventoryItemId: string;
  location: string; // Storage location
  temperature?: number; // Celsius
  humidity?: number; // percentage
  storageDuration: number; // days
  status: StockStatus;
  alerts?: string[];
}

/**
 * Capacity Management
 * Center capacity and utilization
 */
export interface CapacityData {
  centerId: string;
  centerName: string;
  currentStock: number; // kg
  capacity: number; // kg
  utilization: number; // percentage
  availableCapacity: number; // kg
  projectedStock?: number; // kg - projected for next period
  alerts?: string[];
}

/**
 * Aggregation filters
 */
export interface AggregationFilters {
  centerId?: string;
  centerType?: CenterType | "all";
  status?: CenterStatus | "all";
  subCounty?: string;
  searchQuery?: string;
}

/**
 * Stock filters
 */
export interface StockFilters {
  centerId?: string;
  type?: StockTransactionType | "all";
  variety?: string;
  qualityGrade?: QualityGrade | "all";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  farmerId?: string;
  buyerId?: string;
  searchQuery?: string;
  status?: StockTransactionStatus | "all";
}

/**
 * Wastage Entry
 * Tracks wastage/loss of stock
 */
export interface WastageEntry {
  id: string; // UUID
  centerId: string;
  date: string; // ISO 8601
  farmerId: string; // Track farmer origin
  farmerName: string; // Denormalized
  inventoryId?: string; // Link to inventory batch
  variety: string;
  qualityGrade: QualityGrade;
  quantity: number; // kg
  reason: string;
  category: WastageCategory;
  recordedBy: string; // User ID
  recordedByName?: string; // Denormalized
  notes?: string;
  createdAt: string; // ISO 8601
  // Alias for date (used in some contexts)
  recordedAt?: string; // ISO 8601 - Alias for createdAt
}

/**
 * Wastage filters
 */
export interface WastageFilters {
  centerId?: string;
  variety?: string;
  category?: WastageCategory | "all";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  farmerId?: string;
  searchQuery?: string;
}

/**
 * Aggregation statistics
 */
export interface AggregationStats {
  totalCenters: number;
  mainCenters: number; // Number of main centers
  satelliteCenters: number; // Number of satellite centers
  operationalCenters: number;
  totalStock: number; // kg
  totalCapacity: number; // kg
  utilizationRate: number; // percentage
  stockInToday: number; // kg
  stockOutToday: number; // kg
  activeFarmers: number;
  qualityDistribution: {
    gradeA: number;
    gradeB: number;
    gradeC: number;
  };
  totalWastage?: number; // kg
  wastageRate?: number; // percentage
}
