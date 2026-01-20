/**
 * Analytics Context
 * 
 * Provides global state management for analytics and reporting:
 * - Dashboard statistics
 * - Reports
 * - Trends
 * - Performance metrics
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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
} from "@/types/analytics";
import {
  getDashboardStats,
  getTrends,
  getPerformanceMetrics,
  getReportTemplates,
  generateReport,
  getReports,
  getReportById,
  downloadReport,
  getLeaderboard,
  getAdvisories,
  getAdvisoryById,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  getAnalyticsStats,
} from "@/services/analyticsService";

interface AnalyticsContextType {
  dashboardStats: DashboardStats | null;
  trends: TrendData[];
  performanceMetrics: PerformanceMetric[];
  reportTemplates: ReportTemplate[];
  reports: Report[];
  selectedReport: Report | null;
  leaderboards: Leaderboard[];
  advisories: Advisory[];
  selectedAdvisory: Advisory | null;
  filters: AnalyticsFilters;
  advisoryFilters: AdvisoryFilters;
  stats: AnalyticsStats | null;
  isLoading: boolean;
  error: string | null;
  
  fetchDashboardStats: (filters?: AnalyticsFilters) => Promise<void>;
  fetchTrends: (filters?: AnalyticsFilters) => Promise<void>;
  fetchPerformanceMetrics: (filters?: AnalyticsFilters) => Promise<void>;
  fetchReportTemplates: () => Promise<void>;
  generateReportAction: (templateId: string, parameters: Record<string, unknown>) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchReportById: (id: string) => Promise<void>;
  downloadReportAction: (id: string) => Promise<string>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: AnalyticsFilters) => void;
  clearSelectedReport: () => void;
  
  // Leaderboard Actions
  fetchLeaderboard: (metric: string, period: string) => Promise<void>;
  
  // Advisory Actions
  fetchAdvisories: (filters?: AdvisoryFilters) => Promise<void>;
  fetchAdvisoryById: (id: string) => Promise<void>;
  createAdvisory: (advisory: Partial<Advisory>) => Promise<void>;
  updateAdvisory: (id: string, advisory: Partial<Advisory>) => Promise<void>;
  deleteAdvisory: (id: string) => Promise<void>;
  setAdvisoryFilters: (filters: AdvisoryFilters) => void;
  clearSelectedAdvisory: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [selectedAdvisory, setSelectedAdvisory] = useState<Advisory | null>(null);
  const [advisoryFilters, setAdvisoryFiltersState] = useState<AdvisoryFilters>({});
  const [filters, setFiltersState] = useState<AnalyticsFilters>({});
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async (newFilters?: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getDashboardStats(appliedFilters);
      setDashboardStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard stats");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchTrends = useCallback(async (newFilters?: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getTrends(appliedFilters);
      setTrends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch trends");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchPerformanceMetrics = useCallback(async (newFilters?: AnalyticsFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getPerformanceMetrics(appliedFilters);
      setPerformanceMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch performance metrics");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchReportTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReportTemplates();
      setReportTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReportAction = useCallback(async (templateId: string, parameters: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      await generateReport(templateId, parameters);
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  }, [fetchReports]);

  const fetchReportById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const report = await getReportById(id);
      setSelectedReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch report");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const downloadReportAction = useCallback(async (id: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await downloadReport(id);
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download report");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAnalyticsStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFiltersState(newFilters);
    // Call service functions directly to avoid circular dependency
    void (async () => {
      try {
        const statsData = await getDashboardStats(newFilters);
        setDashboardStats(statsData);
        const trendsData = await getTrends(newFilters);
        setTrends(trendsData);
        const metricsData = await getPerformanceMetrics(newFilters);
        setPerformanceMetrics(metricsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
      }
    })();
  }, []);

  const clearSelectedReport = () => {
    setSelectedReport(null);
  };

  // Leaderboard Actions
  const fetchLeaderboard = useCallback(async (metric: string, period: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const leaderboard = await getLeaderboard(metric, period);
      setLeaderboards([leaderboard]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Advisory Actions
  const fetchAdvisories = useCallback(async (newFilters?: AdvisoryFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || advisoryFilters;
      const data = await getAdvisories(appliedFilters);
      setAdvisories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch advisories");
    } finally {
      setIsLoading(false);
    }
  }, [advisoryFilters]);

  const fetchAdvisoryById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const advisory = await getAdvisoryById(id);
      setSelectedAdvisory(advisory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch advisory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAdvisoryAction = useCallback(async (advisory: Partial<Advisory>) => {
    setIsLoading(true);
    setError(null);
    try {
      await createAdvisory(advisory);
      await fetchAdvisories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create advisory");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdvisories]);

  const updateAdvisoryAction = useCallback(async (id: string, advisory: Partial<Advisory>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateAdvisory(id, advisory);
      await fetchAdvisories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update advisory");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdvisories]);

  const deleteAdvisoryAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteAdvisory(id);
      await fetchAdvisories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete advisory");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAdvisories]);

  const setAdvisoryFilters = useCallback((newFilters: AdvisoryFilters) => {
    setAdvisoryFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getAdvisories(newFilters);
        setAdvisories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch advisories");
      }
    })();
  }, []);

  const clearSelectedAdvisory = () => {
    setSelectedAdvisory(null);
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchTrends();
    fetchPerformanceMetrics();
    fetchReportTemplates();
    fetchReports();
    fetchAdvisories();
    fetchStats();
  }, []);

  const value: AnalyticsContextType = {
    dashboardStats,
    trends,
    performanceMetrics,
    reportTemplates,
    reports,
    selectedReport,
    leaderboards,
    advisories,
    selectedAdvisory,
    filters,
    advisoryFilters,
    stats,
    isLoading,
    error,
    fetchDashboardStats,
    fetchTrends,
    fetchPerformanceMetrics,
    fetchReportTemplates,
    generateReportAction,
    fetchReports,
    fetchReportById,
    downloadReportAction,
    fetchStats,
    setFilters,
    clearSelectedReport,
    fetchLeaderboard,
    fetchAdvisories,
    fetchAdvisoryById,
    createAdvisory: createAdvisoryAction,
    updateAdvisory: updateAdvisoryAction,
    deleteAdvisory: deleteAdvisoryAction,
    setAdvisoryFilters,
    clearSelectedAdvisory,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}
