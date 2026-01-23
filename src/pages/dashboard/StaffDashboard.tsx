import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconSettings,
  IconChartBar,
  IconFileText,
  IconDatabase,
  IconShield,
  IconBuilding,
  IconTrendingUp,
  IconCheck,
  IconAlertTriangle,
  IconReceipt,
} from "@tabler/icons-react";
import {
  StatCard,
  ProgressBar,
  LineChart,
  Sparkline,
  SlopeChart,
  SankeyChart,
  GeographicMap,
} from "@/components/visualizations";
import { useStaff } from "@/contexts/StaffContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useAggregation } from "@/contexts/AggregationContext";
import type { TrendData } from "@/types/analytics";

interface ProgramIndicator {
  name: string;
  current: number;
  target: number;
  unit?: string;
}

interface BeneficiaryGrowth {
  month: string;
  farmers: number;
}

interface SparklineData {
  label: string;
  value: number;
  data: Array<{ name: string; value: number }>;
  color?: string;
}

interface OutcomeData {
  category: string;
  before: number;
  after: number;
}

export function StaffDashboard() {
  const { 
    partners, 
    activityLogs, 
    dataQualityIssues, 
    transactionEvidence, 
    stats: staffStats,
    fetchPartners, 
    fetchActivityLogs, 
    fetchDataQualityIssues, 
    fetchTransactionEvidence,
    fetchStats,
    isLoading: staffLoading 
  } = useStaff();
  
  const { 
    dashboardStats, 
    trends, 
    performanceMetrics,
    staffAnalytics,
    fetchDashboardStats, 
    fetchTrends, 
    fetchPerformanceMetrics,
    fetchStaffAnalytics,
    isLoading: analyticsLoading 
  } = useAnalytics();
  
  const { profiles, fetchProfiles } = useProfile();
  const { centers, inventory, transactions, fetchCenters, fetchInventory, fetchTransactions } = useAggregation();

  // Fetch all data on mount
  useEffect(() => {
    fetchPartners();
    fetchActivityLogs();
    fetchDataQualityIssues();
    fetchTransactionEvidence();
    fetchStats();
    fetchDashboardStats({ timeRange: "month" });
    fetchTrends({ timeRange: "month" });
    fetchPerformanceMetrics({ timeRange: "month" });
    fetchStaffAnalytics({ timeRange: "month" });
    fetchProfiles({ role: "farmer" });
    fetchCenters();
    fetchInventory();
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = staffLoading || analyticsLoading;

  // Calculate quick access stats
  const quickStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = activityLogs.filter(log => log.createdAt.startsWith(today));
    
    // Calculate data quality score
    const totalIssues = dataQualityIssues.length;
    const resolvedIssues = dataQualityIssues.filter(issue => issue.resolvedAt).length;
    const qualityScore = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;

    return {
      partners: partners.length,
      activityLogs: todayLogs.length,
      dataQuality: qualityScore,
      transactions: transactionEvidence.length,
    };
  }, [partners, activityLogs, dataQualityIssues, transactionEvidence]);

  // Calculate program indicators from context data
  const programIndicators = useMemo<ProgramIndicator[]>(() => {
    const farmers = profiles.filter(p => p.role === "farmer").length;
    const totalVolume = inventory.reduce((sum, item) => sum + item.quantity, 0) / 1000; // Convert to tonnes
    const gradeAItems = inventory.filter(item => (item.grade || item.qualityGrade) === "A").length;
    const qualityPercentage = inventory.length > 0 ? Math.round((gradeAItems / inventory.length) * 100) : 0;
    
    // Calculate income increase from performance metrics or trends
    const incomeIncrease = performanceMetrics.find(m => m.metric === "income_increase")?.value || 0;

    return [
      { name: "Beneficiaries", current: farmers, target: 2000, unit: "farmers" },
      { name: "Volume (tonnes)", current: Math.round(totalVolume), target: 100, unit: "tons" },
      { name: "Quality (Gr A)", current: qualityPercentage, target: 80, unit: "%" },
      { name: "Income increase", current: Math.round(incomeIncrease), target: 50, unit: "%" },
    ];
  }, [profiles, inventory, performanceMetrics]);

  // Transform trends data for beneficiary growth chart
  const beneficiaryGrowth = useMemo<BeneficiaryGrowth[]>(() => {
    if (trends.length === 0) return [];
    return trends.map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      farmers: t.farmers || 0,
    }));
  }, [trends]);

  // Calculate sparkline data from trends
  const sparklineData = useMemo<SparklineData[]>(() => {
    if (trends.length === 0) return [];
    
    const farmersData = trends.map((t, i) => ({ name: String(i + 1), value: t.farmers || 0 }));
    const qualityData = trends.map((t, i) => ({ name: String(i + 1), value: t.qualityScore || 0 }));
    const centersData = trends.map((t, i) => ({ name: String(i + 1), value: t.centers || 0 }));
    const volumeData = trends.map((t, i) => ({ name: String(i + 1), value: t.volume || 0 }));
    const incomeData = trends.map((t, i) => ({ name: String(i + 1), value: t.incomeIncrease || 0 }));
    const transactionsData = trends.map((t, i) => ({ name: String(i + 1), value: t.transactions || 0 }));

    const latest = (trends[trends.length - 1] || {}) as TrendData;
    
    return [
      {
        label: "Farmers",
        value: latest.farmers || 0,
        data: farmersData,
        color: "#3B82F6",
      },
      {
        label: "Quality",
        value: latest.qualityScore || 0,
        data: qualityData,
        color: "#22C55E",
      },
      {
        label: "Centres",
        value: latest.centers || centers.length,
        data: centersData,
        color: "#8B5CF6",
      },
      {
        label: "Volume",
        value: latest.volume || 0,
        data: volumeData,
        color: "#F59E0B",
      },
      {
        label: "Income",
        value: latest.incomeIncrease || 0,
        data: incomeData,
        color: "#10B981",
      },
      {
        label: "Trans.",
        value: latest.transactions || transactions.length,
        data: transactionsData,
        color: "#EF4444",
      },
    ];
  }, [trends, centers, transactions]);

  // Calculate outcome data from performance metrics
  const outcomeData = useMemo<OutcomeData[]>(() => {
    const incomeMetric = performanceMetrics.find(m => m.metric === "income_increase");
    const qualityMetric = performanceMetrics.find(m => m.metric === "quality_score");
    
    return [
      { 
        category: "Income", 
        before: incomeMetric?.baseline || 45, 
        after: incomeMetric?.value || 65 
      },
      { 
        category: "Quality", 
        before: qualityMetric?.baseline || 32, 
        after: qualityMetric?.value || 82 
      },
    ];
  }, [performanceMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Project Staff Dashboard (M&E)</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Coordinate partners, monitor performance against targets, ensure data quality and accountability
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/staff/partners">
            <Button size="sm" variant="outline">
              <IconUsers className="mr-2 h-4 w-4" />
              Partners
            </Button>
          </Link>
          <Link to="/dashboard/staff/reports">
            <Button size="sm" variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link to="/dashboard/staff/settings">
            <Button size="sm">
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/dashboard/staff/partners">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Partners</p>
                  <p className="text-2xl font-bold">{quickStats.partners}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active stakeholders</p>
                </div>
                <IconBuilding className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/staff/activity-logs">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activity Logs</p>
                  <p className="text-2xl font-bold">{quickStats.activityLogs}</p>
                  <p className="text-xs text-muted-foreground mt-1">Today's activities</p>
                </div>
                <IconDatabase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/staff/data-quality">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Data Quality</p>
                  <p className="text-2xl font-bold">{quickStats.dataQuality}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Overall score</p>
                </div>
                <IconCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/staff/transaction-evidence">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{quickStats.transactions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">With evidence</p>
                </div>
                <IconReceipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Program Indicators */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Tracking Against Targets</CardTitle>
              <CardDescription>Monitor progress towards program targets and indicators</CardDescription>
            </div>
            <Link to="/dashboard/staff/reports">
              <Button variant="outline" size="sm">
                <IconFileText className="mr-2 h-4 w-4" />
                View Full Report
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {programIndicators.map((indicator, index) => {
                const percentage = (indicator.current / indicator.target) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{indicator.name}</span>
                      <span className="text-muted-foreground">
                        {indicator.current.toLocaleString()}
                        {indicator.unit ? ` ${indicator.unit}` : ""} of{" "}
                        {indicator.target.toLocaleString()}
                        {indicator.unit ? ` ${indicator.unit}` : ""} target
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      maxValue={100}
                      color={percentage >= 100 ? "success" : percentage >= 75 ? "warning" : "default"}
                      size="lg"
                      showValue={false}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {percentage >= 100 ? (
                          <span className="text-green-600 font-medium">Target Achieved ✓</span>
                        ) : percentage >= 75 ? (
                          <span className="text-yellow-600 font-medium">On Track</span>
                        ) : (
                          <span className="text-red-600 font-medium">Below Target</span>
                        )}
                      </span>
                      <span className="text-muted-foreground">{percentage.toFixed(0)}% of target</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficiary Growth & Geographic Reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={beneficiaryGrowth.map((b) => ({ name: b.month, farmers: b.farmers }))}
          lines={[
            {
              dataKey: "farmers",
              name: "Total Beneficiaries",
              color: "#22C55E",
            },
          ]}
          title="Beneficiary Growth"
          description="Cumulative farmer registration over time"
          height={300}
        />

        <GeographicMap
          title="Geographic Reach"
          description="Visual map of aggregation centers in Machakos County"
          height={300}
          activeCoverage={65}
          targetCoverage={35}
        />
      </div>

      {/* Indicator Sparklines */}
      <Card>
        <CardHeader>
          <CardTitle>Indicator Sparklines</CardTitle>
          <CardDescription>All KPIs at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sparklineData.map((sparkline, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {sparkline.label}
                    </span>
                    <span className="text-lg font-bold">
                      {sparkline.value.toLocaleString()}
                      {sparkline.label === "Quality" || sparkline.label === "Income"
                        ? "%"
                        : sparkline.label === "Volume"
                        ? "t"
                        : ""}
                    </span>
                  </div>
                  <div className="h-12">
                    <Sparkline data={sparkline.data} color={sparkline.color} height={48} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outcome Comparison & Value Chain Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SlopeChart
          data={outcomeData}
          title="Outcome Comparison"
          description="Before and after program implementation"
          height={300}
          beforeLabel="Before"
          afterLabel="After"
          formatter={(value) => `${value}%`}
        />

        <SankeyChart
          nodes={[
            { name: "Farmers", value: 1500, color: "#3B82F6" },
            { name: "Centres", value: 45, color: "#22C55E" },
            { name: "Buyers", value: 25, color: "#F59E0B" },
          ]}
          links={[
            { source: "Farmers", target: "Centres", value: 45 },
            { source: "Centres", target: "Buyers", value: 25 },
          ]}
          title="Value Chain Flow"
          description="Flow of produce from farmers through centers to buyers"
          height={300}
        />
      </div>
    </div>
  );
}
