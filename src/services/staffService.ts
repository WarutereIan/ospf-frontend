/**
 * Staff Service
 * 
 * Handles all staff/admin-related API calls:
 * - Partners
 * - Activity logs
 * - Data quality
 * - Transaction evidence
 * 
 * Backend API endpoints to implement:
 * - GET /api/staff/partners - List partners
 * - GET /api/staff/partners/:id - Get partner details
 * - POST /api/staff/partners - Create partner
 * - PUT /api/staff/partners/:id - Update partner
 * - DELETE /api/staff/partners/:id - Delete partner
 * - GET /api/staff/activity-logs - List activity logs
 * - GET /api/staff/data-quality - List data quality issues
 * - PUT /api/staff/data-quality/:id/resolve - Resolve issue
 * - GET /api/staff/transaction-evidence - List transaction evidence
 * - POST /api/staff/transaction-evidence - Upload evidence
 * - GET /api/staff/stats - Get staff statistics
 */

import type {
  Partner,
  ActivityLog,
  DataQualityIssue,
  TransactionEvidence,
  Setting,
  StaffFilters,
  ActivityLogFilters,
  DataQualityFilters,
  SettingsFilters,
  StaffStats,
} from "@/types/staff";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet } from "@/lib/api-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

const MOCK_PARTNERS: Partner[] = [];
const MOCK_DATA_QUALITY: DataQualityIssue[] = [];
const MOCK_EVIDENCE: TransactionEvidence[] = [];

export async function getPartners(filters?: StaffFilters): Promise<Partner[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_PARTNERS;
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_PARTNERS.find(partner => partner.id === id) || null;
}

export async function createPartner(partner: Partial<Partner>): Promise<ApiResponse<Partner>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: partner as Partner, message: "Partner created successfully" };
}

export async function updatePartner(id: string, partner: Partial<Partner>): Promise<ApiResponse<Partner>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: partner as Partner, message: "Partner updated successfully" };
}

export async function deletePartner(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

export async function getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.userId) params.userId = filters.userId;
    if (filters?.action) params.action = filters.action;
    if (filters?.entityType) params.entityType = filters.entityType;
    if (filters?.entityId) params.entityId = filters.entityId;
    if (filters?.dateRange?.start) params.startDate = filters.dateRange.start;
    if (filters?.dateRange?.end) params.endDate = filters.dateRange.end;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.searchQuery) params.searchQuery = filters.searchQuery;
    
    // Backend returns { data: ActivityLog[], total: number, count: number }
    const response = await apiGet<{ data: ActivityLog[]; total: number; count: number }>('/staff/activity-logs', params);
    
    // Return the data array, or empty array if response is invalid
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback for old format (direct array) or invalid response
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    // Return empty array if endpoint doesn't exist yet
    return [];
  }
}

export async function getDataQualityIssues(filters?: DataQualityFilters): Promise<DataQualityIssue[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_DATA_QUALITY;
}

export async function resolveDataQualityIssue(
  id: string,
  resolution: string
): Promise<ApiResponse<DataQualityIssue>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const issue = MOCK_DATA_QUALITY.find(i => i.id === id);
  if (!issue) {
    return { data: issue!, error: "Issue not found" };
  }
  return {
    data: { ...issue, resolvedAt: new Date().toISOString(), resolution },
    message: "Issue resolved",
  };
}

export async function getTransactionEvidence(transactionId?: string): Promise<TransactionEvidence[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (transactionId) {
    return MOCK_EVIDENCE.filter(evidence => evidence.transactionId === transactionId);
  }
  return MOCK_EVIDENCE;
}

export async function uploadTransactionEvidence(
  evidence: Partial<TransactionEvidence>
): Promise<ApiResponse<TransactionEvidence>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: evidence as TransactionEvidence, message: "Evidence uploaded successfully" };
}

export async function getSettings(filters?: SettingsFilters): Promise<Setting[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
}

export async function getSettingByKey(key: string): Promise<Setting | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return null;
}

export async function updateSetting(key: string, value: string | number | boolean | Record<string, unknown>): Promise<ApiResponse<Setting>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: { id: "", key, value, category: "general", label: "", type: "string" } as Setting, message: "Setting updated successfully" };
}

export async function getStaffStats(): Promise<StaffStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    totalPartners: 0,
    activePartners: 0,
    totalActivityLogs: 0,
    dataQualityIssues: 0,
    unresolvedIssues: 0,
    totalEvidence: 0,
    verifiedEvidence: 0,
    totalSettings: 0,
  };
}
