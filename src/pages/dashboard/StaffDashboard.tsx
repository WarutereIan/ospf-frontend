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
  IconShoppingCart,
  IconCurrency,
} from "@tabler/icons-react";
import {
  StatCard,
  ProgressBar,
  LineChart,
  StackedBarChart,
  SankeyChart,
  GeographicMap,
} from "@/components/visualizations";
import { useStaff } from "@/contexts/StaffContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useAggregation } from "@/contexts/AggregationContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
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

interface TrendData {
  label: string;
  value: number;
  data: Array<{ name: string; [key: string]: string | number }>;
  dataKey: string;
  color?: string;
  formatter?: (value: number) => string;
}

interface OutcomeData {
  category: string;
  before: number;
  after: number;
}

export function StaffDashboard() {
  const { 
    activityLogs, 
    dataQualityIssues, 
    transactionEvidence, 
    stats: staffStats,
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
  const { orders, fetchOrders, isLoading: marketplaceLoading } = useMarketplace();

  // Fetch all data on mount
  useEffect(() => {
    fetchActivityLogs();
    fetchDataQualityIssues();
    fetchTransactionEvidence();
    fetchStats();
    fetchOrders(); // Fetch all marketplace orders for orders/revenue metrics
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

  const isLoading = staffLoading || analyticsLoading || marketplaceLoading;

  // Calculate quick access stats
  const quickStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = activityLogs.filter(log => log.createdAt.startsWith(today));
    
    // Calculate data quality score from real data sources
    // Check completeness and consistency across profiles, orders, inventory, and transactions
    let totalRecords = 0;
    let validRecords = 0;
    
    // 1. Profile completeness (30% weight)
    const profileCompleteness = profiles.length > 0 ? profiles.map(profile => {
      // Check for name (could be firstName/lastName or just name)
      const hasName = (profile as any).name || ((profile as any).firstName && (profile as any).lastName);
      const requiredFields = [
        hasName,
        (profile as any).phone || (profile as any).alternatePhone,
        (profile as any).location || (profile as any).county,
        (profile as any).subCounty,
      ];
      const optionalButImportant = [
        (profile as any).address,
        (profile as any).coordinates,
        (profile as any).email,
      ];
      const requiredCount = requiredFields.filter(f => f && (typeof f === 'string' ? f.trim() !== '' : f !== null && f !== undefined)).length;
      const optionalCount = optionalButImportant.filter(f => f && (typeof f === 'string' ? f.trim() !== '' : f !== null && f !== undefined)).length;
      return {
        required: requiredCount / requiredFields.length,
        optional: optionalCount / optionalButImportant.length,
      };
    }) : [];
    
    const avgProfileCompleteness = profileCompleteness.length > 0
      ? profileCompleteness.reduce((sum, p) => sum + (p.required * 0.7 + p.optional * 0.3), 0) / profileCompleteness.length
      : 1;
    totalRecords += profiles.length;
    validRecords += profiles.length * avgProfileCompleteness;
    
    // 2. Order completeness (25% weight)
    const orderCompleteness = orders.length > 0 ? orders.map(order => {
      const requiredFields = [
        order.quantity,
        order.totalAmount,
        order.status,
        order.farmerId || order.farmer?.id,
        order.buyerId || order.buyer?.id,
      ];
      const validFields = requiredFields.filter(f => f !== null && f !== undefined && f !== '').length;
      return validFields / requiredFields.length;
    }) : [];
    
    const avgOrderCompleteness = orderCompleteness.length > 0
      ? orderCompleteness.reduce((sum, o) => sum + o, 0) / orderCompleteness.length
      : 1;
    totalRecords += orders.length;
    validRecords += orders.length * avgOrderCompleteness;
    
    // 3. Inventory completeness (25% weight)
    const inventoryCompleteness = inventory.length > 0 ? inventory.map(item => {
      const requiredFields = [
        item.variety,
        item.quantity,
        item.qualityGrade || item.grade,
        item.batchId,
        item.centerId || item.center?.id,
      ];
      const validFields = requiredFields.filter(f => f !== null && f !== undefined && f !== '').length;
      return validFields / requiredFields.length;
    }) : [];
    
    const avgInventoryCompleteness = inventoryCompleteness.length > 0
      ? inventoryCompleteness.reduce((sum, i) => sum + i, 0) / inventoryCompleteness.length
      : 1;
    totalRecords += inventory.length;
    validRecords += inventory.length * avgInventoryCompleteness;
    
    // 4. Transaction completeness (20% weight)
    const transactionCompleteness = transactions.length > 0 ? transactions.map(transaction => {
      const requiredFields = [
        transaction.type,
        transaction.quantity,
        transaction.centerId || transaction.center?.id,
        transaction.createdAt,
      ];
      const validFields = requiredFields.filter(f => f !== null && f !== undefined && f !== '').length;
      return validFields / requiredFields.length;
    }) : [];
    
    const avgTransactionCompleteness = transactionCompleteness.length > 0
      ? transactionCompleteness.reduce((sum, t) => sum + t, 0) / transactionCompleteness.length
      : 1;
    totalRecords += transactions.length;
    validRecords += transactions.length * avgTransactionCompleteness;
    
    // Calculate overall data quality score
    // Weighted average: Profiles 30%, Orders 25%, Inventory 25%, Transactions 20%
    const qualityScore = totalRecords > 0
      ? Math.round(
          (profiles.length > 0 ? avgProfileCompleteness * 0.3 : 0) +
          (orders.length > 0 ? avgOrderCompleteness * 0.25 : 0) +
          (inventory.length > 0 ? avgInventoryCompleteness * 0.25 : 0) +
          (transactions.length > 0 ? avgTransactionCompleteness * 0.2 : 0)
        ) * 100
      : 100;

    // Calculate orders and revenue from marketplace orders
    // Only count completed/delivered orders for accurate metrics
    const completedOrders = orders.filter(order => {
      const completedStatuses = ["completed", "delivered", "collected"];
      return completedStatuses.includes(order.status.toLowerCase());
    });
    const totalOrders = completedOrders.length;
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return {
      orders: totalOrders,
      revenue: totalRevenue,
      activityLogs: todayLogs.length,
      dataQuality: qualityScore,
      transactions: transactionEvidence.length,
    };
  }, [orders, activityLogs, profiles, inventory, transactions, transactionEvidence]);

  // Calculate program indicators from context data
  const programIndicators = useMemo<ProgramIndicator[]>(() => {
    const farmers = profiles.filter(p => p.role === "farmer").length;
    const totalVolume = inventory.reduce((sum, item) => sum + item.quantity, 0); // Keep in kgs
    const gradeAItems = inventory.filter(item => (item.grade || item.qualityGrade) === "A").length;
    const qualityPercentage = inventory.length > 0 ? Math.round((gradeAItems / inventory.length) * 100) : 0;
    
    // Calculate revenue from completed orders
    const completedOrders = orders.filter(order => {
      const completedStatuses = ["completed", "delivered", "collected"];
      return completedStatuses.includes(order.status.toLowerCase());
    });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    // Revenue target: 5,000,000 KES (5M)
    const revenueTarget = 5000000;
    // Volume target: 100,000 kg (100 tonnes)
    const volumeTarget = 100000;

    return [
      { name: "Beneficiaries", current: farmers, target: 2000, unit: "farmers" },
      { name: "Volume", current: Math.round(totalVolume), target: volumeTarget, unit: "kg" },
      { name: "Quality (Gr A)", current: qualityPercentage, target: 80, unit: "%" },
      { name: "Revenue", current: Math.round(totalRevenue), target: revenueTarget, unit: "KES" },
    ];
  }, [profiles, inventory, orders]);

  // Transform trends data for beneficiary growth chart
  const beneficiaryGrowth = useMemo<BeneficiaryGrowth[]>(() => {
    if (trends.length === 0) return [];
    return trends.map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      farmers: t.farmers || 0,
    }));
  }, [trends]);

  // Calculate trendline data from trends and real data sources
  const trendlineData = useMemo<TrendData[]>(() => {
    // Farmers data from trends (real backend data)
    const farmersData = trends.length > 0 
      ? trends.map((t) => {
          const date = new Date(t.date);
          const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          return { name: monthLabel, farmers: t.farmers || 0 };
        })
      : [];
    
    // Revenue data from orders grouped by month (real data)
    const completedOrders = orders.filter(order => {
      const completedStatuses = ["completed", "delivered", "collected"];
      return completedStatuses.includes(order.status.toLowerCase());
    });
    
    // Group orders by month for revenue sparkline
    const revenueByMonth = new Map<string, number>();
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = revenueByMonth.get(monthKey) || 0;
      revenueByMonth.set(monthKey, current + (order.totalAmount || 0));
    });
    
    // Volume data from completed orders grouped by month (in kgs)
    const volumeByMonth = new Map<string, number>();
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = volumeByMonth.get(monthKey) || 0;
      // Sum quantity in kgs (assuming order.quantity is already in kgs)
      volumeByMonth.set(monthKey, current + (order.quantity || 0));
    });
    
    const volumeData = Array.from(volumeByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, value]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return { name: monthLabel, volume: Math.round(value) };
      });
    
    // Convert to array format matching trends structure
    const revenueData = Array.from(revenueByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, value]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return { name: monthLabel, revenue: Math.round(value / 1000) }; // Convert to K (thousands)
      });

    // Quality data from inventory grouped by month (real data)
    // Calculate quality score (Grade A percentage) per month
    const qualityByMonth = new Map<string, { total: number; gradeA: number }>();
    inventory.forEach(item => {
      const date = new Date(item.stockInDate || item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = qualityByMonth.get(monthKey) || { total: 0, gradeA: 0 };
      current.total += 1;
      if ((item.qualityGrade || item.grade) === "A") {
        current.gradeA += 1;
      }
      qualityByMonth.set(monthKey, current);
    });
    
    const qualityData = Array.from(qualityByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, stats]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return {
          name: monthLabel,
          quality: stats.total > 0 ? Math.round((stats.gradeA / stats.total) * 100) : 0
        };
      });

    // Centers data - count active centers over time (real data)
    // Group centers by creation month
    const centersByMonth = new Map<string, number>();
    centers.forEach(center => {
      const date = new Date(center.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = centersByMonth.get(monthKey) || 0;
      centersByMonth.set(monthKey, current + 1);
    });
    
    // Calculate cumulative centers count
    const centersDataArray = Array.from(centersByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b));
    
    let cumulativeCenters = 0;
    const centersData = centersDataArray.map(([monthKey, count]) => {
      cumulativeCenters += count;
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      return { name: monthLabel, centers: cumulativeCenters };
    });

    // Transactions data grouped by month (real data)
    const transactionsByMonth = new Map<string, number>();
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = transactionsByMonth.get(monthKey) || 0;
      transactionsByMonth.set(monthKey, current + 1);
    });
    
    const transactionsData = Array.from(transactionsByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        return { name: monthLabel, transactions: count };
      });

    // Get latest values
    const latest = (trends[trends.length - 1] || {}) as TrendData;
    const currentRevenue = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate current volume from completed orders (in kgs)
    const currentVolume = completedOrders.reduce((sum, order) => sum + (order.quantity || 0), 0);
    
    // Calculate current quality score from inventory
    const gradeAItems = inventory.filter(item => (item.grade || item.qualityGrade) === "A").length;
    const currentQuality = inventory.length > 0 ? Math.round((gradeAItems / inventory.length) * 100) : 0;
    
    return [
      {
        label: "Farmers",
        value: latest.farmers || profiles.filter(p => p.role === "farmer").length,
        data: farmersData.length > 0 ? farmersData : [{ name: "No Data", farmers: profiles.filter(p => p.role === "farmer").length }],
        dataKey: "farmers",
        color: "#3B82F6",
      },
      {
        label: "Quality",
        value: currentQuality,
        data: qualityData.length > 0 ? qualityData : [{ name: "No Data", quality: currentQuality }],
        dataKey: "quality",
        color: "#22C55E",
        formatter: (value: number) => `${value}%`,
      },
      {
        label: "Centres",
        value: centers.length,
        data: centersData.length > 0 ? centersData : [{ name: "No Data", centers: centers.length }],
        dataKey: "centers",
        color: "#8B5CF6",
      },
      {
        label: "Volume",
        value: Math.round(currentVolume),
        data: volumeData.length > 0 ? volumeData : [{ name: "No Data", volume: 0 }],
        dataKey: "volume",
        color: "#F59E0B",
        formatter: (value: number) => `${value.toLocaleString()} kg`,
      },
      {
        label: "Revenue",
        value: Math.round(currentRevenue / 1000), // Display in thousands (K)
        data: revenueData.length > 0 ? revenueData : [{ name: "No Data", revenue: 0 }],
        dataKey: "revenue",
        color: "#10B981",
        formatter: (value: number) => `KES ${value}K`,
      },
      {
        label: "Trans.",
        value: transactions.length,
        data: transactionsData.length > 0 ? transactionsData : [{ name: "No Data", transactions: transactions.length }],
        dataKey: "transactions",
        color: "#EF4444",
      },
    ];
  }, [trends, centers, transactions, orders, inventory, profiles]);

  // Calculate volume comparison data by center (orders and revenue segmented by completion status)
  const centerVolumeData = useMemo(() => {
    // Get all orders except cancelled
    const activeOrders = orders.filter(order => {
      const cancelledStatuses = ["cancelled", "rejected"];
      return !cancelledStatuses.includes(order.status.toLowerCase());
    });

    // Define completed order statuses
    const completedStatuses = ["completed", "delivered", "collected"];

    // Group orders by center
    const centerStats = new Map<string, { 
      name: string; 
      orders: number; 
      revenueCompleted: number;
      revenuePending: number;
    }>();

    activeOrders.forEach(order => {
      // Try to get center from stockTransactions or aggregationCenter field
      let centerName = "Unknown";
      
      // Check if order has stockTransactions with center info
      if ((order as any).stockTransactions && Array.isArray((order as any).stockTransactions) && (order as any).stockTransactions.length > 0) {
        const stockTx = (order as any).stockTransactions[0];
        if (stockTx?.center?.name) {
          centerName = stockTx.center.name;
        } else if (stockTx?.centerId) {
          // Find center by ID
          const center = centers.find(c => c.id === stockTx.centerId);
          centerName = center?.name || "Unknown";
        }
      }
      
      // Fallback to aggregationCenter field if available
      if (centerName === "Unknown" && order.aggregationCenter) {
        centerName = order.aggregationCenter;
      }
      
      // If still unknown, try to match by location or use a default
      if (centerName === "Unknown" && order.location) {
        // Try to find center by matching location
        const matchingCenter = centers.find(c => 
          c.location?.toLowerCase().includes(order.location?.toLowerCase() || '') ||
          c.subCounty?.toLowerCase().includes(order.location?.toLowerCase() || '')
        );
        if (matchingCenter) {
          centerName = matchingCenter.name;
        }
      }

      // Initialize center stats if not exists
      if (!centerStats.has(centerName)) {
        centerStats.set(centerName, { 
          name: centerName, 
          orders: 0, 
          revenueCompleted: 0,
          revenuePending: 0,
        });
      }

      const stats = centerStats.get(centerName)!;
      stats.orders += 1;
      
      const orderAmount = order.totalAmount || 0;
      const isCompleted = completedStatuses.includes(order.status.toLowerCase());
      
      if (isCompleted) {
        stats.revenueCompleted += orderAmount;
      } else {
        stats.revenuePending += orderAmount;
      }
    });

    // Also include centers with no orders (for completeness)
    centers.forEach(center => {
      if (!centerStats.has(center.name)) {
        centerStats.set(center.name, { 
          name: center.name, 
          orders: 0, 
          revenueCompleted: 0,
          revenuePending: 0,
        });
      }
    });

    // Convert to array and sort by total revenue (descending)
    return Array.from(centerStats.values())
      .map(stat => ({
        name: stat.name,
        orders: stat.orders,
        revenueCompleted: Math.round(stat.revenueCompleted / 1000), // Convert to thousands
        revenuePending: Math.round(stat.revenuePending / 1000), // Convert to thousands
        revenueTotal: stat.revenueCompleted + stat.revenuePending, // Keep raw total for sorting
      }))
      .sort((a, b) => b.revenueTotal - a.revenueTotal)
      .slice(0, 10); // Limit to top 10 centers for readability
  }, [orders, centers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Project Staff Dashboard (M&E)</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor performance against targets, track orders and revenue, ensure data quality and accountability
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{quickStats.orders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
              </div>
              <IconShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">KES {quickStats.revenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">From completed orders</p>
              </div>
              <IconCurrency className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
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

      {/* Indicator Trendlines */}
      <Card>
        <CardHeader>
          <CardTitle>Indicator Trendlines</CardTitle>
          <CardDescription>All KPIs at a glance with trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendlineData.map((trend, index) => (
                <Card key={index} className="border">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {trend.label}
                      </CardTitle>
                      <span className="text-lg font-bold">
                        {trend.formatter 
                          ? trend.formatter(trend.value)
                          : `${trend.value.toLocaleString()}${trend.label === "Quality" ? "%" : trend.label === "Volume" ? " kg" : trend.label === "Revenue" ? "K" : ""}`}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={trend.data}
                      lines={[
                        {
                          dataKey: trend.dataKey,
                          name: trend.label,
                          color: trend.color,
                          strokeWidth: 2,
                        },
                      ]}
                      height={150}
                      showGrid={true}
                      showLegend={false}
                      formatter={trend.formatter}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Comparison by Center & Value Chain Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StackedBarChart
          data={centerVolumeData}
          bars={[
            {
              dataKey: "orders",
              name: "Orders (count)",
              color: "#3B82F6",
            },
            {
              dataKey: "revenueCompleted",
              name: "Revenue - Completed (KES K)",
              color: "#22C55E",
            },
            {
              dataKey: "revenuePending",
              name: "Revenue - Pending (KES K)",
              color: "#F59E0B",
            },
          ]}
          title="Volume Comparison by Center"
          description="Orders and revenue (completed vs pending) across aggregation centers (revenue in thousands)"
          height={400}
          layout="vertical"
          formatter={(value: number) => {
            // Value is already normalized (revenue in thousands, orders as count)
            return value.toLocaleString();
          }}
        />

        <SankeyChart
          nodes={[
            { name: "Farmers", value: (profiles || []).filter(p => p.role === "farmer").length || 0, color: "#3B82F6" },
            { name: "Centres", value: (centers || []).length || 0, color: "#22C55E" },
            { name: "Buyers", value: new Set((orders || []).map(o => o.buyerId || o.buyer?.id).filter(Boolean)).size || 0, color: "#F59E0B" },
            { name: "Orders", value: (orders || []).filter(o => o?.status && !["cancelled", "rejected"].includes(o.status.toLowerCase())).length || 0, color: "#8B5CF6" },
          ]}
          links={[
            { source: "Farmers", target: "Centres", value: (profiles || []).filter(p => p.role === "farmer").length || 0 },
            { source: "Centres", target: "Buyers", value: new Set((orders || []).map(o => o.buyerId || o.buyer?.id).filter(Boolean)).size || 0 },
            { source: "Buyers", target: "Orders", value: (orders || []).filter(o => o?.status && !["cancelled", "rejected"].includes(o.status.toLowerCase())).length || 0 },
          ]}
          title="Value Chain Flow"
          description="Flow of produce from farmers through centers to buyers and orders"
          height={400}
        />
      </div>
    </div>
  );
}
