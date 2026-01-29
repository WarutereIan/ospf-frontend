import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconTrendingUp,
  IconFileText,
  IconChartBar,
  IconMapPin,
  IconAlertCircle,
  IconDownload,
  IconClipboardCheck,
} from "@tabler/icons-react";
import {
  StatCard,
  AreaChart,
  LineChart,
  HorizontalBarChart,
} from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface OfficerStats {
  totalFarmers: number;
  activeFarmers: number;
  totalOrders: number;
  totalRevenue: number;
  aggregationCenters: number;
  pendingAdvisories: number;
  volume: number;
  quality: number;
  value: number;
}

interface MonthlyProduction {
  month: string;
  volume: number;
}

interface FarmerGrowth {
  month: string;
  farmers: number;
}

interface CentrePerformance {
  name: string;
  utilization: number;
}

interface FarmerActivity {
  id: string;
  name: string;
  subCounty: string;
  totalSales: number;
  quantity: number; // kg sold
  orderCount: number;
  lastActivity: string;
  status: "active" | "inactive";
  activity?: string;
  type?: "order" | "listing";
}

export function OfficerDashboard() {
  const { 
    centers, 
    transactions,
    inventory,
    stats: aggregationStats,
    fetchCenters, 
    fetchTransactions,
    fetchInventory,
    fetchStats,
    isLoading: aggregationLoading 
  } = useAggregation();
  
  const { 
    profiles,
    fetchProfiles,
    isLoading: profileLoading 
  } = useProfile();
  
  const { 
    advisories,
    trends,
    dashboardStats,
    countyOfficerAnalytics,
    fetchAdvisories,
    fetchTrends,
    fetchDashboardStats,
    fetchCountyOfficerAnalytics,
    isLoading: analyticsLoading 
  } = useAnalytics();

  // Fetch data on mount
  useEffect(() => {
    fetchCenters();
    fetchTransactions();
    fetchInventory();
    fetchStats();
    fetchProfiles({ role: "farmer" });
    fetchAdvisories();
    fetchTrends({ timeRange: "year" });
    fetchDashboardStats({ timeRange: "year" });
    fetchCountyOfficerAnalytics({ timeRange: "year" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = aggregationLoading || profileLoading || analyticsLoading;

  // Calculate stats from countyOfficerAnalytics data, fallback to raw data if not available
  const stats = useMemo<OfficerStats>(() => {
    // Use analytics data if available
    if (countyOfficerAnalytics?.dashboardMetrics) {
      const metrics = countyOfficerAnalytics.dashboardMetrics;
      return {
        totalFarmers: metrics.totalFarmers || 0,
        activeFarmers: metrics.activeFarmers || 0,
        totalOrders: 0, // Not directly available in dashboardMetrics
        totalRevenue: metrics.totalValue || 0,
        aggregationCenters: metrics.aggregationCentersCount || 0,
        pendingAdvisories: metrics.pendingAdvisories || 0,
        volume: Math.round((metrics.totalProductionVolume || 0) * 1000), // Convert tons to kg
        quality: Math.round(metrics.qualityScore || 0),
        value: metrics.totalValue || 0,
      };
    }

    // Fallback to raw data calculation
    const farmers = profiles.filter(p => p.role === "farmer");
    const activeFarmers = farmers.filter(f => f.status === "active").length;
    
    const totalVolume = inventory.reduce((sum, item) => sum + item.quantity, 0); // Keep in kg
    const totalRevenue = transactions
      .filter(t => t.type === "stock_out")
      .reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    
    // Quality score from quality checks or inventory
    const gradeAItems = inventory.filter(item => (item.grade || item.qualityGrade) === "A").length;
    const quality = inventory.length > 0 ? Math.round((gradeAItems / inventory.length) * 100) : 0;
    
    const pendingAdvisories = advisories.filter(a => !a.readCount || a.readCount === 0).length;

    return {
      totalFarmers: farmers.length,
      activeFarmers,
      totalOrders: transactions.length,
      totalRevenue,
      aggregationCenters: centers.length,
      pendingAdvisories,
      volume: Math.round(totalVolume),
      quality,
      value: totalRevenue,
    };
  }, [countyOfficerAnalytics, profiles, centers, transactions, inventory, advisories]);

  // Recent farmer activity - use analytics data if available
  const recentActivity = useMemo<FarmerActivity[]>(() => {
    // Use analytics data if available
    if (countyOfficerAnalytics?.farmerActivity && Array.isArray(countyOfficerAnalytics.farmerActivity)) {
      return countyOfficerAnalytics.farmerActivity
        .slice(0, 5)
        .map((activity: any) => ({
          id: activity.farmerId || activity.id,
          name: activity.farmerName || "Unknown",
          subCounty: activity.subCounty || "Unknown",
          totalSales: activity.value || 0,
          quantity: activity.quantity || 0,
          orderCount: activity.type === "order" ? 1 : 0,
          lastActivity: activity.date || new Date().toISOString(),
          status: "active" as const,
          activity: activity.activity,
          type: activity.type,
        }));
    }

    // Fallback to raw data calculation
    const farmers = profiles.filter(p => p.role === "farmer");
    return farmers
      .slice(0, 5)
      .map(farmer => {
        const farmerOrders = transactions.filter(t => t.farmerId === farmer.id);
        const totalSales = farmerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalQuantity = farmerOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
        const lastOrder = farmerOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

        return {
          id: farmer.id,
          name: farmer.name,
          subCounty: (farmer as any).subCounty || "Unknown",
          totalSales,
          quantity: totalQuantity,
          orderCount: farmerOrders.length,
          lastActivity: lastOrder?.createdAt || farmer.createdAt,
          status: farmer.status === "active" ? "active" as const : "inactive" as const,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [countyOfficerAnalytics, profiles, transactions]);

  // Monthly production from analytics data
  const monthlyProduction = useMemo<MonthlyProduction[]>(() => {
    // Use analytics data if available
    if (countyOfficerAnalytics?.productionAnalytics?.monthlyProductionTrend && 
        Array.isArray(countyOfficerAnalytics.productionAnalytics.monthlyProductionTrend)) {
      return countyOfficerAnalytics.productionAnalytics.monthlyProductionTrend
        .slice(-12)
        .map((item: any) => ({
          month: new Date(item.month || item.period || item.date).toLocaleDateString("en-US", { month: "short" }),
          volume: Math.round((item.volume || item.productionVolume || 0) * 1000), // Convert tons to kg
        }));
    }
    
    // Fallback to trends
    if (trends.length === 0) return [];
    return trends.slice(-12).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      volume: Math.round(t.volume || 0), // Already in kg from trends
    }));
  }, [countyOfficerAnalytics, trends]);

  // Farmer growth from analytics data
  const farmerGrowth = useMemo<FarmerGrowth[]>(() => {
    // Use analytics data if available
    if (countyOfficerAnalytics?.farmerGrowth && Array.isArray(countyOfficerAnalytics.farmerGrowth)) {
      return countyOfficerAnalytics.farmerGrowth
        .slice(-12)
        .map((item: any) => ({
          month: new Date(item.period || item.date).toLocaleDateString("en-US", { month: "short" }),
          farmers: item.cumulativeCount || item.farmers || 0,
        }));
    }
    
    // Fallback to trends
    if (trends.length === 0) return [];
    return trends.slice(-12).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      farmers: t.farmers || 0,
    }));
  }, [countyOfficerAnalytics, trends]);

  // Centre performance from analytics data
  const centrePerformance = useMemo<CentrePerformance[]>(() => {
    // Use analytics data if available
    if (countyOfficerAnalytics?.centerPerformance?.topPerformingCenters && 
        Array.isArray(countyOfficerAnalytics.centerPerformance.topPerformingCenters)) {
      return countyOfficerAnalytics.centerPerformance.topPerformingCenters
        .map((center: any) => ({
          name: center.name || "Unknown",
          utilization: Math.round(center.utilizationRate || 0),
        }));
    }
    
    // Fallback to raw data calculation
    return centers
      .slice(0, 5)
      .map(center => {
        const centerInventory = inventory.filter(i => i.centerId === center.id);
        const totalCapacity = center.capacity || 1000;
        const usedCapacity = centerInventory.reduce((sum, i) => sum + i.quantity, 0);
        const utilization = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

        return {
          name: center.name,
          utilization,
        };
      })
      .sort((a, b) => b.utilization - a.utilization);
  }, [countyOfficerAnalytics, centers, inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Agricultural Officer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Technical guidance, quality assurance, compliance monitoring, and data-driven planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link to="/dashboard/county-officer/advisory">
            <Button size="sm">
              <IconAlertCircle className="mr-2 h-4 w-4" />
              Send Advisory
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Farmers"
          value={stats.totalFarmers.toString()}
          description={`${stats.activeFarmers} active`}
          icon={<IconUsers className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Volume"
          value={`${stats.volume.toLocaleString()} kg`}
          description="Total production"
          trend={{ value: 15, direction: "up" }}
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Centres"
          value={stats.aggregationCenters.toString()}
          description="Active"
          icon={<IconMapPin className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Quality"
          value={`${stats.quality}%`}
          description="Grade A"
          icon={<IconChartBar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Value"
          value={`KES ${(stats.value / 1000000).toFixed(1)}M`}
          description="Total value"
          trend={{ value: 22, direction: "up" }}
          icon={<IconChartBar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Production Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaChart
          data={monthlyProduction.map((m) => ({ name: m.month, volume: m.volume }))}
          areas={[
            {
              dataKey: "volume",
              name: "Production",
              color: "#3B82F6",
              gradient: true,
            },
          ]}
          title="Production Trend (12 months)"
          description="Monthly production volume in kilograms"
          height={300}
        />
        <LineChart
          data={farmerGrowth.map((f) => ({ name: f.month, farmers: f.farmers }))}
          lines={[
            {
              dataKey: "farmers",
              name: "Total Farmers",
              color: "#22C55E",
            },
          ]}
          title="Farmer Growth"
          description="Cumulative farmer registration"
          height={300}
        />
      </div>

      {/* Centre Performance */}
      <HorizontalBarChart
        data={centrePerformance.map((c) => ({ name: c.name, value: c.utilization }))}
        title="Top Performing Centres"
        description="Centre utilization rates"
        color="#22C55E"
        height={250}
        sorted={true}
      />

      {/* Farmer Participation & Volumes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Farmer Participation & Volumes</CardTitle>
              <CardDescription>Visibility of farmer participation and production volumes by location</CardDescription>
            </div>
            <Link to="/dashboard/county-officer/location-summary">
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Active Farmers</div>
              <div className="text-2xl font-bold">{stats.activeFarmers}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {countyOfficerAnalytics?.farmerParticipation?.participationRate !== undefined
                  ? `${countyOfficerAnalytics.farmerParticipation.participationRate.toFixed(1)}% participation`
                  : stats.totalFarmers > 0 
                    ? `${((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1)}% of total`
                    : '0% of total'}
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Production</div>
              <div className="text-2xl font-bold">{stats.volume.toLocaleString()} kg</div>
              <div className="text-xs text-muted-foreground mt-1">This period</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Avg per Farmer</div>
              <div className="text-2xl font-bold">
                {countyOfficerAnalytics?.productionAnalytics?.averageProductionPerFarmer 
                  ? `${Math.round(countyOfficerAnalytics.productionAnalytics.averageProductionPerFarmer * 1000).toLocaleString()} kg`
                  : stats.activeFarmers > 0 
                    ? `${Math.round(stats.volume / stats.activeFarmers).toLocaleString()} kg`
                    : '0 kg'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Average production</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Participation Rate</div>
              <div className="text-2xl font-bold">
                {countyOfficerAnalytics?.farmerParticipation?.participationRate !== undefined
                  ? `${countyOfficerAnalytics.farmerParticipation.participationRate.toFixed(1)}%`
                  : stats.totalFarmers > 0 
                    ? `${((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1)}%`
                    : '0%'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Active participation</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Farmer Participation:</strong> {stats.activeFarmers} out of {stats.totalFarmers} registered farmers are actively participating in the marketplace.
            </p>
            <p className="mt-2">
              <strong>Production Volumes:</strong> Total production of {stats.volume.toLocaleString()} kg across all sub-counties, with an average of{" "}
              {countyOfficerAnalytics?.productionAnalytics?.averageProductionPerFarmer 
                ? `${Math.round(countyOfficerAnalytics.productionAnalytics.averageProductionPerFarmer * 1000).toLocaleString()}`
                : stats.activeFarmers > 0 
                  ? `${Math.round(stats.volume / stats.activeFarmers).toLocaleString()}`
                  : '0'} kg per active farmer.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Farmer Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Farmer Activity</CardTitle>
            <CardDescription>Recent farmer activities and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-3 rounded-lg">
                        <IconUsers className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farmer.subCounty} • {farmer.quantity > 0 ? `${farmer.quantity.toLocaleString()} kg` : `KES ${farmer.totalSales.toLocaleString()}`} • {farmer.orderCount} {farmer.orderCount === 1 ? 'order' : 'orders'}
                        </p>
                        {farmer.activity && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {farmer.activity}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: {new Date(farmer.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          farmer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {farmer.status}
                      </Badge>
                      <Link to={`/dashboard/county-officer/farmers/${farmer.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No farmer activity data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard/county-officer/farmers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconUsers className="mr-2 h-4 w-4" />
                  View All Farmers
                </Button>
              </Link>
              <Link to="/dashboard/county-officer/quality-standards" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconClipboardCheck className="mr-2 h-4 w-4" />
                  Quality Standards
                </Button>
              </Link>
              <Link to="/dashboard/county-officer/location-summary" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconMapPin className="mr-2 h-4 w-4" />
                  Location Summary
                </Button>
              </Link>
              <Link to="/dashboard/county-officer/reports" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconFileText className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </Link>
              <Link to="/dashboard/county-officer/centers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconMapPin className="mr-2 h-4 w-4" />
                  Manage Centers
                </Button>
              </Link>
              <Link to="/dashboard/county-officer/advisory" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconAlertCircle className="mr-2 h-4 w-4" />
                  Send Advisory
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Advisories</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingAdvisories} pending</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {stats.pendingAdvisories}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

