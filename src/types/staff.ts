/**
 * Staff Types
 * 
 * Types for staff/admin functionality:
 * - Partners
 * - Activity logs
 * - Data quality
 * - Transaction evidence
 * - User management
 */

/**
 * Partner type
 */
export type PartnerType = 
  | "ngo" 
  | "government" 
  | "donor" 
  | "private" 
  | "private_sector" 
  | "academic" 
  | "other";

/**
 * Partner engagement level
 */
export type EngagementLevel = "low" | "medium" | "high";

/**
 * Partner status
 */
export type PartnerStatus = "active" | "inactive" | "pending";

/**
 * Activity log action
 */
export type ActivityAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "view" 
  | "approve" 
  | "reject" 
  | "export" 
  | "login" 
  | "logout";

/**
 * Data quality issue type
 */
export type DataQualityIssueType = 
  | "missing_data" 
  | "invalid_data" 
  | "duplicate" 
  | "inconsistency" 
  | "outdated";

/**
 * Data quality severity
 */
export type DataQualitySeverity = "low" | "medium" | "high" | "critical";

/**
 * Partner
 */
export interface Partner {
  id: string; // UUID
  name: string;
  type: PartnerType;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  status: PartnerStatus;
  engagementLevel: EngagementLevel;
  contributions: string[]; // Array of contribution descriptions
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastContact?: string; // ISO 8601
  notes?: string;
}

/**
 * Activity Log
 */
export interface ActivityLog {
  id: string; // UUID
  userId: string;
  userName: string;
  userRole: string;
  action: ActivityAction;
  entityType: string; // e.g., "order", "farmer", "payment"
  entityId: string;
  entityName?: string; // Denormalized for quick reference
  description: string;
  metadata?: Record<string, unknown>; // Additional action data
  ipAddress?: string;
  userAgent?: string;
  createdAt: string; // ISO 8601
}

/**
 * Data Quality Issue
 */
export interface DataQualityIssue {
  id: string; // UUID
  type: DataQualityIssueType;
  severity: DataQualitySeverity;
  entityType: string; // e.g., "order", "farmer", "payment"
  entityId: string;
  entity?: string; // Entity name/type (alias for entityType or separate field)
  recordId?: string; // Record ID that has the issue
  field?: string; // Specific field with issue
  description: string;
  detectedAt: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
  resolvedBy?: string; // User ID
  resolution?: string;
}

/**
 * Transaction Evidence
 * Evidence/documentation for sales transactions
 */
export interface TransactionEvidence {
  id: string; // UUID
  transactionId: string; // Related transaction/order ID
  transactionType: "marketplace" | "input" | "transport";
  evidenceType: "photo" | "receipt" | "document" | "signature";
  fileUrl: string;
  fileType: string; // MIME type
  fileName: string;
  uploadedBy: string; // User ID
  uploadedAt: string; // ISO 8601
  description?: string;
  verified?: boolean;
  verifiedBy?: string; // User ID
  verifiedAt?: string; // ISO 8601
}

/**
 * Staff filters
 */
export interface StaffFilters {
  searchQuery?: string;
  type?: string;
  status?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Activity log filters
 */
export interface ActivityLogFilters {
  userId?: string;
  action?: ActivityAction | "all";
  entityType?: string;
  entityId?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  limit?: number;
  searchQuery?: string;
}

/**
 * Data quality filters
 */
export interface DataQualityFilters {
  type?: DataQualityIssueType | "all";
  severity?: DataQualitySeverity | "all";
  entityType?: string;
  resolved?: boolean;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Settings Category
 */
export type SettingsCategory = 
  | "general" 
  | "notifications" 
  | "security" 
  | "integrations" 
  | "reporting" 
  | "system";

/**
 * Setting
 * System/application setting
 */
export interface Setting {
  id: string; // UUID
  key: string; // Setting key (e.g., "notification.email.enabled")
  category: SettingsCategory;
  value: string | number | boolean | Record<string, unknown>; // Setting value
  label: string; // Human-readable label
  description?: string;
  type: "string" | "number" | "boolean" | "json";
  defaultValue?: string | number | boolean | Record<string, unknown>;
  isPublic?: boolean; // Whether non-admin users can view
  updatedBy?: string; // User ID
  updatedAt?: string; // ISO 8601
}

/**
 * Settings filters
 */
export interface SettingsFilters {
  category?: SettingsCategory | "all";
  searchQuery?: string;
}

/**
 * Staff statistics
 */
export interface StaffStats {
  totalPartners: number;
  activePartners: number;
  totalActivityLogs: number;
  dataQualityIssues: number;
  unresolvedIssues: number;
  totalEvidence: number;
  verifiedEvidence: number;
  totalSettings?: number;
}
