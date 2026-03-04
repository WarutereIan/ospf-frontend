/**
 * Analytics Service
 * 
 * Handles all analytics and reporting API calls:
 * - Dashboard statistics
 * - Trends
 * - Performance metrics
 * - Leaderboards
 * - Market information
 * - Role-specific analytics (farmer, buyer, staff, etc.)
 * 
 * Backend API endpoints:
 * - GET /api/v1/analytics/dashboard-stats - Get dashboard stats
 * - GET /api/v1/analytics/trends - Get trend data
 * - GET /api/v1/analytics/performance-metrics - Get performance metrics
 * - GET /api/v1/analytics/leaderboards/:metric/:period - Get leaderboard
 * - GET /api/v1/analytics/market-info - Get market information
 * - GET /api/v1/analytics/farmer - Get farmer-specific analytics
 * - GET /api/v1/analytics/buyer - Get buyer-specific analytics
 * - GET /api/v1/analytics/staff - Get staff-specific analytics
 * - GET /api/v1/analytics/county-officer - Get county officer analytics
 * - GET /api/v1/analytics/input-provider - Get input provider analytics
 * - GET /api/v1/analytics/transport-provider - Get transport provider analytics
 * - GET /api/v1/analytics/aggregation-manager - Get aggregation manager analytics
 * - GET /api/v1/analytics/refresh-views - Refresh analytics views (admin/staff only)
 */

import type {
  DashboardStats,
  TrendData,
  PerformanceMetric,
  ReportTemplate,
  Report,
  ReportFormat,
  ReportType,
  Leaderboard,
  LeaderboardEntry,
  Advisory,
  AdvisoryFilters,
  AnalyticsFilters,
  AnalyticsStats,
  TimePeriod,
} from "@/types/analytics";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

// ==================== Helper Functions ====================

/**
 * Map backend period (lowercase) to frontend TimePeriod type
 */
function mapPeriod(backendPeriod: string): TimePeriod {
  const periodMap: Record<string, TimePeriod> = {
    daily: 'daily',
    weekly: 'weekly',
    monthly: 'monthly',
    quarterly: 'quarterly',
    yearly: 'yearly',
    custom: 'custom',
  };
  return periodMap[backendPeriod?.toLowerCase()] || 'monthly';
}

/**
 * Map backend metric (lowercase) to frontend format
 */
function mapMetric(backendMetric: string): string {
  return backendMetric?.toLowerCase() || backendMetric;
}

/**
 * Transform backend dashboard stats to frontend format
 */
function transformDashboardStats(backendData: any): DashboardStats {
  return {
    totalRevenue: backendData.totalRevenue || 0,
    totalOrders: backendData.totalOrders || 0,
    totalFarmers: backendData.totalFarmers || 0,
    totalBuyers: backendData.totalBuyers || 0,
    totalUsers: backendData.totalUsers || 0,
    totalStock: backendData.totalStock || 0,
    averageOrderValue: backendData.averageOrderValue || 0,
    growthRate: backendData.growthRate || 0,
    userGrowthRate: backendData.userGrowthRate,
    orderGrowthRate: backendData.orderGrowthRate,
    revenueGrowthRate: backendData.revenueGrowthRate,
    averagePrice: backendData.averagePrice,
    period: mapPeriod(backendData.period),
    dateRange: backendData.dateRange || {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
  };
}

/**
 * Transform backend trend data to frontend format
 */
function transformTrendData(backendData: any[]): TrendData[] {
  if (!Array.isArray(backendData)) {
    return [];
  }
  
  return backendData.map((item) => ({
    date: item.date || new Date().toISOString(),
    revenue: item.revenue,
    orders: item.orders,
    volume: item.volume,
    users: item.users,
    farmers: item.farmers,
    buyers: item.buyers,
    stockIn: item.stockIn,
    stockOut: item.stockOut,
    averagePrice: item.averagePrice,
  }));
}

/**
 * Transform backend performance metrics to frontend format
 */
function transformPerformanceMetrics(backendData: any[]): PerformanceMetric[] {
  if (!Array.isArray(backendData)) {
    return [];
  }
  
  return backendData.map((item) => ({
    id: item.id || String(Math.random()),
    name: item.name || '',
    metric: item.metric || item.id || '',
    value: item.value || 0,
    baseline: item.baseline,
    target: item.target,
    unit: item.unit,
    trend: item.trend,
    trendPercentage: item.trendPercentage,
    period: mapPeriod(item.period || 'monthly'),
  }));
}

/**
 * Transform backend leaderboard to frontend format
 */
function transformLeaderboard(backendData: any): Leaderboard {
  return {
    id: backendData.id || String(Math.random()),
    title: backendData.title || '',
    metric: mapMetric(backendData.metric),
    period: mapPeriod(backendData.period),
    entries: (backendData.entries || []).map((entry: any) => ({
      id: entry.id || entry.userId || '',
      userId: entry.userId || entry.id,
      name: entry.name || entry.farmerName || '',
      rank: entry.rank || 0,
      score: entry.score || 0,
      metric: mapMetric(backendData.metric),
      totalRevenue: entry.totalRevenue,
      totalSales: entry.totalSales,
      orderCount: entry.orderCount,
      avgRating: entry.avgRating,
      subCounty: entry.subCounty,
      isCurrentUser: entry.isCurrentUser,
      farmerName: entry.farmerName || entry.name,
      change: entry.change,
      avatar: entry.avatar,
      metadata: entry.metadata,
    })),
    generatedAt: backendData.generatedAt || new Date().toISOString(),
  };
}

/**
 * Build query parameters from filters
 */
function buildQueryParams(filters?: AnalyticsFilters): Record<string, any> {
  if (!filters) {
    return {};
  }

  const params: Record<string, any> = {};

  if (filters.timeRange) {
    params.timeRange = filters.timeRange;
  }

  if (filters.period) {
    params.period = filters.period;
  }

  if (filters.dateRange) {
    params.startDate = filters.dateRange.start;
    params.endDate = filters.dateRange.end;
  }

  if (filters.entityId) {
    params.entityId = filters.entityId;
  }

  if (filters.entityType) {
    params.entityType = filters.entityType;
  }

  return params;
}

// ==================== Dashboard Statistics ====================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(filters?: AnalyticsFilters): Promise<DashboardStats> {
  const params = buildQueryParams(filters);
  const data = await apiGet<any>('/analytics/dashboard-stats', params);
  return transformDashboardStats(data);
}

// ==================== Trends ====================

/**
 * Get trend data for charts
 */
export async function getTrends(filters?: AnalyticsFilters): Promise<TrendData[]> {
  const params = buildQueryParams(filters);
  const data = await apiGet<any[]>('/analytics/trends', params);
  return transformTrendData(data);
}

// ==================== Performance Metrics ====================

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(filters?: AnalyticsFilters): Promise<PerformanceMetric[]> {
  const params = buildQueryParams(filters);
  const data = await apiGet<any[]>('/analytics/performance-metrics', params);
  return transformPerformanceMetrics(data);
}

// ==================== Leaderboards ====================

/**
 * Get leaderboard by metric and period
 */
export async function getLeaderboard(
  metric: string,
  period: string,
  filters?: {
    limit?: number;
    subcounty?: string;
    county?: string;
    userId?: string;
  }
): Promise<Leaderboard> {
  const params: Record<string, any> = {};
  
  if (filters?.limit) {
    params.limit = filters.limit;
  }
  if (filters?.subcounty) {
    params.subcounty = filters.subcounty;
  }
  if (filters?.county) {
    params.county = filters.county;
  }
  if (filters?.userId) {
    params.userId = filters.userId;
  }

  const data = await apiGet<any>(`/analytics/leaderboards/${metric}/${period}`, params);
  return transformLeaderboard(data);
}

// ==================== Market Information ====================

/**
 * Get market information (prices, trends, buyer demand)
 */
export async function getMarketInfo(filters?: {
  location?: string;
  variety?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const params: Record<string, any> = {};
  
  if (filters?.location) {
    params.location = filters.location;
  }
  if (filters?.variety) {
    params.variety = filters.variety;
  }
  if (filters?.timeRange) {
    params.timeRange = filters.timeRange;
  }
  if (filters?.startDate) {
    params.startDate = filters.startDate;
  }
  if (filters?.endDate) {
    params.endDate = filters.endDate;
  }

  return await apiGet<any>('/analytics/market-info', params);
}

// ==================== Role-Specific Analytics ====================

/**
 * Get farmer-specific analytics
 */
export async function getFarmerAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/farmer', params);
}

/**
 * Get buyer-specific analytics
 */
export async function getBuyerAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/buyer', params);
}

/**
 * Get staff-specific analytics (M&E Dashboard)
 */
export async function getStaffAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/staff', params);
}

/**
 * Get county officer-specific analytics
 */
export async function getCountyOfficerAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/county-officer', params);
}

/**
 * Get input provider-specific analytics
 */
export async function getInputProviderAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/input-provider', params);
}

/**
 * Get transport provider-specific analytics
 */
export async function getTransportProviderAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/transport-provider', params);
}

/**
 * Get aggregation manager-specific analytics
 */
export async function getAggregationManagerAnalytics(filters?: AnalyticsFilters): Promise<any> {
  const params = buildQueryParams(filters);
  return await apiGet<any>('/analytics/aggregation-manager', params);
}

// ==================== Materialized Views Management ====================

/**
 * Refresh analytics materialized views (admin/staff only)
 */
export async function refreshAnalyticsViews(): Promise<{ success: boolean; message: string; timestamp: string }> {
  return await apiGet<any>('/analytics/refresh-views');
}

// ==================== Reports ====================

/**
 * Map backend report template to frontend ReportTemplate
 */
function mapReportTemplate(backend: any): ReportTemplate {
  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || '',
    type: (backend.type || 'performance') as ReportTemplate['type'],
    category: backend.category,
    frequency: backend.frequency,
    availableFormats: Array.isArray(backend.availableFormats) ? backend.availableFormats : ['pdf', 'csv'],
  };
}

/**
 * Get report templates from backend
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  const data = await apiGet<any[]>('/analytics/report-templates');
  return (Array.isArray(data) ? data : []).map(mapReportTemplate);
}

/**
 * Generate report from template (returns report payload for download/preview)
 */
export async function generateReport(
  templateId: string,
  parameters: Record<string, unknown>
): Promise<{ data: any }> {
  const response = await apiPost<any>('/analytics/reports/generate', {
    templateId,
    parameters: parameters || {},
  });
  return { data: response };
}

/** Saved report list item (from GET /analytics/reports) */
export interface SavedReportListItem {
  id: string;
  templateId: string;
  templateName: string;
  parameters: Record<string, unknown>;
  generatedBy: string | null;
  createdAt: string;
}

/**
 * Get list of saved/generated reports
 */
export async function getSavedReports(options?: { limit?: number; templateId?: string }): Promise<SavedReportListItem[]> {
  const params: Record<string, string> = {};
  if (options?.limit != null) params.limit = String(options.limit);
  if (options?.templateId) params.templateId = options.templateId;
  const response = await apiGet<SavedReportListItem[]>("/analytics/reports", params);
  return Array.isArray(response) ? response : [];
}

/**
 * Get full report payload by id (for viewing/export)
 */
export async function getSavedReportById(id: string): Promise<Record<string, unknown> | null> {
  const response = await apiGet<Record<string, unknown> | null>(`/analytics/reports/${encodeURIComponent(id)}`);
  return response ?? null;
}

/**
 * Get reports (list) - for AnalyticsContext; maps saved reports to Report[] shape
 */
export async function getReports(): Promise<Report[]> {
  const list = await getSavedReports({ limit: 100 });
  return list.map((r) => ({
    id: r.id,
    templateId: r.templateId,
    templateName: r.templateName,
    type: "performance" as ReportType,
    format: "pdf" as ReportFormat,
    dateRange: { start: "", end: "" },
    generatedAt: r.createdAt,
    generatedBy: r.generatedBy ?? "",
    status: "ready" as const,
  }));
}

/**
 * Get report by ID (full payload) - for AnalyticsContext
 */
export async function getReportById(id: string): Promise<Report | null> {
  const payload = await getSavedReportById(id);
  return payload as unknown as Report | null;
}

/**
 * Download report
 * TODO: Implement when backend endpoint is available
 */
export async function downloadReport(id: string): Promise<string> {
  // Placeholder - backend endpoint not yet implemented
  return "";
}

// ==================== Advisories ====================

function mapBackendAdvisoryToFrontend(row: any): Advisory {
  const creator = row.creator;
  const createdByName = creator?.profile
    ? [creator.profile.firstName, creator.profile.lastName].filter(Boolean).join(" ").trim()
    : creator?.email ?? creator?.phone ?? row.createdBy;
  return {
    id: row.id,
    type: (row.type ?? "GENERAL").toLowerCase() as Advisory["type"],
    title: row.title,
    content: row.content,
    message: row.content,
    targetAudience: Array.isArray(row.targetAudience) ? row.targetAudience[0] ?? "all" : row.targetAudience ?? "all",
    targetValue: row.targetValue ?? undefined,
    category: row.category ?? undefined,
    priority: row.priority ?? undefined,
    effectiveDate: row.effectiveDate ? new Date(row.effectiveDate).toISOString() : undefined,
    expiryDate: row.expiryDate ? new Date(row.expiryDate).toISOString() : undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    createdBy: row.createdBy,
    createdByName,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    isActive: row.isActive ?? true,
    views: row.views ?? 0,
    status: row.status ?? undefined,
    sentDate: row.sentDate ? new Date(row.sentDate).toISOString() : undefined,
    deliveryCount: row.deliveryCount ?? 0,
    smsDeliveredCount: row.smsDeliveredCount ?? 0,
    readCount: row.readCount ?? 0,
  };
}

/**
 * Get advisories from backend (sent via SMS + web-push).
 */
export async function getAdvisories(filters?: AdvisoryFilters): Promise<Advisory[]> {
  const params: Record<string, string> = {};
  if (filters?.isActive !== undefined) params.isActive = String(filters.isActive);
  if (filters?.searchQuery) params.limit = "100";
  const data = await apiGet<unknown>("/analytics/advisories", Object.keys(params).length ? params : undefined);
  const raw = Array.isArray(data) ? data : (data as { data?: unknown[]; list?: unknown[] })?.data ?? (data as { list?: unknown[] })?.list;
  const list = Array.isArray(raw) ? raw : [];
  return list.map(mapBackendAdvisoryToFrontend);
}

/**
 * Get advisory by ID
 */
export async function getAdvisoryById(id: string): Promise<Advisory | null> {
  const data = await apiGet<any>(`/analytics/advisories/${id}`);
  if (!data || !data.id) return null;
  return mapBackendAdvisoryToFrontend(data);
}

/**
 * Create and send advisory to farmers (SMS + web-push). Backend resolves recipients and sends.
 */
export async function createAdvisory(advisory: Partial<Advisory>): Promise<ApiResponse<Advisory>> {
  const targetAudience = typeof advisory.targetAudience === "string"
    ? advisory.targetAudience
    : Array.isArray(advisory.targetAudience)
      ? advisory.targetAudience[0]
      : "all";
  const body = {
    title: advisory.title,
    content: advisory.content ?? advisory.message,
    type: advisory.type ? String(advisory.type).toUpperCase() : "GENERAL",
    category: advisory.category,
    priority: advisory.priority,
    targetAudience: targetAudience as "all" | "sub_county" | "farmer_group" | "individual",
    targetValue: advisory.targetValue,
  };
  const data = await apiPost<any>("/analytics/advisories", body);
  const created = data?.data ?? data;
  return {
    data: created ? mapBackendAdvisoryToFrontend(created) : (advisory as Advisory),
    message: data?.message ?? "Advisory sent",
  };
}

/**
 * Update advisory (backend may not support; list/create are primary).
 */
export async function updateAdvisory(id: string, advisory: Partial<Advisory>): Promise<ApiResponse<Advisory>> {
  return { data: advisory as Advisory, message: "Advisory update not yet implemented" };
}

/**
 * Delete advisory. Backend does not expose DELETE yet; no-op to avoid 404.
 */
export async function deleteAdvisory(_id: string): Promise<void> {
  // DELETE /analytics/advisories/:id not yet implemented
}

// ==================== Analytics Statistics ====================

/**
 * Get analytics statistics
 * TODO: Implement when backend endpoint is available
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  // Placeholder - backend endpoint not yet implemented
  return {
    totalReports: 0,
    reportsByType: {
      sales: 0,
      stock: 0,
      performance: 0,
      financial: 0,
      quality: 0,
      farmer: 0,
      buyer: 0,
    },
    totalLeaderboards: 0,
    totalAdvisories: 0,
  };
}
