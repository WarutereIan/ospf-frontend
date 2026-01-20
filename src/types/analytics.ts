/**
 * Analytics Types
 * 
 * Types for analytics and reporting functionality:
 * - Dashboard statistics
 * - Reports
 * - Trends
 * - Performance metrics
 */

import type { UserRole } from "@/contexts/AuthContext";

/**
 * Report type
 */
export type ReportType = 
  | "sales" 
  | "stock" 
  | "performance" 
  | "financial" 
  | "quality" 
  | "farmer" 
  | "buyer";

/**
 * Report format
 */
export type ReportFormat = "pdf" | "excel" | "csv" | "json";

/**
 * Time period
 */
export type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

/**
 * Dashboard Statistics
 * Aggregated statistics for dashboards
 */
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalFarmers: number;
  totalBuyers: number;
  totalUsers?: number; // Total users (farmers + buyers + others)
  totalStock: number; // kg
  averageOrderValue: number;
  growthRate: number; // percentage
  userGrowthRate?: number; // User growth percentage
  orderGrowthRate?: number; // Order growth percentage
  revenueGrowthRate?: number; // Revenue growth percentage
  averagePrice?: number; // Average price per kg (used in some contexts)
  period: TimePeriod;
  dateRange: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Trend Data Point
 */
export interface TrendDataPoint {
  date: string; // ISO 8601 or formatted date
  value: number;
  label?: string;
}

/**
 * Trend Data
 * Time series data for charts
 * Can be either structured chart data or flat metric data
 */
export interface TrendData {
  label?: string;
  data?: TrendDataPoint[];
  color?: string;
  // Flat metric data structure (used in dashboards)
  date: string; // ISO 8601 or formatted date
  farmers?: number;
  qualityScore?: number;
  centers?: number;
  volume?: number; // in kg or tonnes
  incomeIncrease?: number; // percentage
  transactions?: number;
  revenue?: number;
  averagePrice?: number;
  users?: number;
  orders?: number; // Number of orders
  buyers?: number; // Number of buyers
  stockIn?: number; // Stock in (kg)
  stockOut?: number; // Stock out (kg)
}

/**
 * Performance Metric
 */
export interface PerformanceMetric {
  id: string;
  name: string;
  metric: string; // Metric identifier (e.g., "income_increase", "quality_score")
  value: number;
  baseline?: number; // Baseline value for comparison
  target?: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendPercentage?: number;
  period: TimePeriod;
}

/**
 * Report Template
 */
export interface ReportTemplate {
  category?: "performance" | "financial" | "operational" | "compliance"; // Report category
  frequency?: string; // Report frequency (e.g., "daily", "weekly", "monthly")
  lastGenerated?: string; // ISO 8601 - Last time report was generated
  id: string;
  name: string;
  type: ReportType;
  description: string;
  availableFormats: ReportFormat[];
  parameters?: Record<string, unknown>; // Report-specific parameters
}

/**
 * Report
 */
export interface Report {
  id: string;
  templateId: string;
  templateName: string;
  type: ReportType;
  format: ReportFormat;
  dateRange: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  generatedAt: string; // ISO 8601
  generatedBy: string; // User ID
  downloadUrl?: string;
  status: "generating" | "ready" | "failed";
  error?: string;
}

/**
 * Time range for analytics queries
 */
export type TimeRange = "day" | "week" | "month" | "quarter" | "year" | "all";

/**
 * Analytics filters
 */
export interface AnalyticsFilters {
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  timeRange?: TimeRange; // Quick time range selector
  period?: TimePeriod;
  entityId?: string; // Filter by specific entity (farmer, buyer, center, etc.)
  entityType?: string;
}

/**
 * Leaderboard Entry
 */
export interface LeaderboardEntry {
  id: string; // User ID
  name: string;
  rank: number;
  score: number;
  metric: string; // e.g., "total_sales", "quality_score", "revenue"
  change?: number; // Rank change from previous period
  avatar?: string;
  metadata?: Record<string, unknown>; // Additional data
  // Extended properties used in components
  totalRevenue?: number;
  totalSales?: number;
  orderCount?: number;
  avgRating?: number;
  subCounty?: string;
  // Extended properties used in components
  isCurrentUser?: boolean; // Whether this entry is for the current user
  farmerName?: string; // Farmer name (used in some contexts)
  userId?: string; // User ID (used in some contexts)
}

/**
 * Leaderboard
 */
export interface Leaderboard {
  id: string;
  title: string;
  metric: string;
  period: TimePeriod;
  entries: LeaderboardEntry[];
  generatedAt: string; // ISO 8601
}

/**
 * Advisory Type
 */
export type AdvisoryType = "best_practice" | "warning" | "alert" | "information" | "training";

/**
 * Advisory
 * Advisory/guidance for farmers, officers, etc.
 */
export interface Advisory {
  id: string; // UUID
  type: AdvisoryType;
  title: string;
  content: string;
  message?: string; // Alias for content (used in some contexts)
  targetAudience: UserRole[] | "all" | "sub_county" | "farmer_group" | "individual"; // Who should see this (can be array of roles or string for legacy)
  targetValue?: string; // Target value for specific audience (sub_county, farmer_group, individual)
  category?: string; // e.g., "quality", "pricing", "storage"
  priority?: "low" | "medium" | "high";
  effectiveDate?: string; // ISO 8601
  expiryDate?: string; // ISO 8601
  attachments?: string[]; // File URLs
  createdBy: string; // User ID
  createdByName?: string; // Denormalized
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  isActive: boolean;
  views?: number; // Number of times viewed
  // Delivery tracking properties
  status?: "draft" | "sent" | "delivered" | "failed"; // Advisory delivery status
  sentDate?: string; // ISO 8601 - When advisory was sent
  deliveryCount?: number; // Number of successful deliveries
  readCount?: number; // Number of times advisory was read
  impact?: { // Impact metrics
    ordersIncrease?: number; // Percentage increase in orders
    engagementIncrease?: number; // Percentage increase in engagement
  };
}

/**
 * Advisory filters
 */
export interface AdvisoryFilters {
  type?: AdvisoryType | "all";
  targetAudience?: UserRole | "all";
  category?: string;
  priority?: "low" | "medium" | "high" | "all";
  isActive?: boolean;
  searchQuery?: string;
}

/**
 * Analytics statistics
 */
export interface AnalyticsStats {
  totalReports: number;
  reportsByType: Record<ReportType, number>;
  lastGenerated?: string; // ISO 8601
  totalLeaderboards?: number;
  totalAdvisories?: number;
}
