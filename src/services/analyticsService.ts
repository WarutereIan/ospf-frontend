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

// ==================== Reports (Placeholder - Not yet implemented in backend) ====================

/**
 * Get report templates
 * TODO: Implement when backend endpoint is available
 */
export async function getReportTemplates(): Promise<ReportTemplate[]> {
  // Placeholder - backend endpoint not yet implemented
  return [];
}

/**
 * Generate report
 * TODO: Implement when backend endpoint is available
 */
export async function generateReport(
  templateId: string,
  parameters: Record<string, unknown>
): Promise<ApiResponse<Report>> {
  // Placeholder - backend endpoint not yet implemented
  return {
    data: {
      id: "",
      templateId,
      templateName: "",
      type: "sales",
      format: "pdf",
      dateRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
      generatedAt: new Date().toISOString(),
      generatedBy: "",
      status: "generating",
    },
    message: "Report generation not yet implemented",
  };
}

/**
 * Get reports
 * TODO: Implement when backend endpoint is available
 */
export async function getReports(): Promise<Report[]> {
  // Placeholder - backend endpoint not yet implemented
  return [];
}

/**
 * Get report by ID
 * TODO: Implement when backend endpoint is available
 */
export async function getReportById(id: string): Promise<Report | null> {
  // Placeholder - backend endpoint not yet implemented
  return null;
}

/**
 * Download report
 * TODO: Implement when backend endpoint is available
 */
export async function downloadReport(id: string): Promise<string> {
  // Placeholder - backend endpoint not yet implemented
  return "";
}

// ==================== Advisories (Placeholder - Not yet implemented in backend) ====================

/**
 * Get advisories
 * TODO: Implement when backend endpoint is available
 */
export async function getAdvisories(filters?: AdvisoryFilters): Promise<Advisory[]> {
  // Placeholder - backend endpoint not yet implemented
  return [];
}

/**
 * Get advisory by ID
 * TODO: Implement when backend endpoint is available
 */
export async function getAdvisoryById(id: string): Promise<Advisory | null> {
  // Placeholder - backend endpoint not yet implemented
  return null;
}

/**
 * Create advisory
 * TODO: Implement when backend endpoint is available
 */
export async function createAdvisory(advisory: Partial<Advisory>): Promise<ApiResponse<Advisory>> {
  // Placeholder - backend endpoint not yet implemented
  return { data: advisory as Advisory, message: "Advisory creation not yet implemented" };
}

/**
 * Update advisory
 * TODO: Implement when backend endpoint is available
 */
export async function updateAdvisory(id: string, advisory: Partial<Advisory>): Promise<ApiResponse<Advisory>> {
  // Placeholder - backend endpoint not yet implemented
  return { data: advisory as Advisory, message: "Advisory update not yet implemented" };
}

/**
 * Delete advisory
 * TODO: Implement when backend endpoint is available
 */
export async function deleteAdvisory(id: string): Promise<void> {
  // Placeholder - backend endpoint not yet implemented
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
