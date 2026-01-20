import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPackage,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconClipboardCheck,
  IconUsers,
  IconBuilding,
  IconBuildingCommunity,
  IconMapPin,
  IconFileText,
} from "@tabler/icons-react";
import {
  StatCard,
  SemiCircleGauge,
  HorizontalBarChart,
  LineChart,
  PieChart,
  ProgressBar,
  AlertCard,
} from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface ManagerStats {
  currentStock: number;
  stockInToday: number;
  stockOutToday: number;
  qualityChecksToday: number;
  pendingChecks: number;
  capacityUtilization: number;
  maxCapacity: number;
}

interface StockByVariety {
  name: string;
  value: number;
}

interface StockMovement {
  day: string;
  stockIn: number;
  stockOut: number;
}

interface StockAging {
  category: string;
  value: number;
  color: string;
}

interface QualityDistribution {
  name: string;
  value: number;
}

interface StockActivity {
  id: string;
  type: "in" | "out";
  farmerName?: string;
  buyerName?: string;
  quantity: number;
  qualityGrade: string;
  timestamp: string;
  status: "pending" | "completed";
}

export function AggregationManagerDashboard() {
  const navigate = useNavigate();
  const { 
    centers,
    selectedCenter, 
    inventory, 
    transactions, 
    qualityChecks,
    stats: aggregationStats,
    fetchCenters, 
    fetchInventory, 
    fetchTransactions, 
    fetchQualityChecks,
    fetchStats,
    isLoading: aggregationLoading 
  } = useAggregation();
  
  const { 
    trends,
    fetchTrends,
    isLoading: analyticsLoading 
  } = useAnalytics();

  // Fetch data on mount
  useEffect(() => {
    fetchCenters();
    fetchInventory();
    fetchTransactions();
    fetchQualityChecks();
    fetchStats();
    fetchTrends({ timeRange: "week" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = aggregationLoading || analyticsLoading;

  // Get center info from selectedCenter or first center
  const center = selectedCenter || (centers.length > 0 ? centers[0] : null);
  const centerName = center?.name || "Aggregation Center";
  const centerType = center?.centerType || "main";
  const centerSubCounty = center?.subCounty || "";
  const centerWard = center?.ward;

  // Calculate stats from context data
  const stats = useMemo<ManagerStats>(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter(t => t.createdAt.startsWith(today));
    const stockInToday = todayTransactions
      .filter(t => t.type === "stock_in")
      .reduce((sum, t) => sum + t.quantity, 0);
    const stockOutToday = todayTransactions
      .filter(t => t.type === "stock_out")
      .reduce((sum, t) => sum + t.quantity, 0);
    
    const todayQualityChecks = qualityChecks.filter(q => (q.createdAt || q.checkedAt)?.startsWith(today));
    const pendingChecks = qualityChecks.filter(q => !q.passed && !q.failed).length;
    
    const currentStock = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const maxCapacity = center?.capacity || 5000;
    const capacityUtilization = maxCapacity > 0 ? Math.round((currentStock / maxCapacity) * 100) : 0;

    return {
      currentStock,
      stockInToday,
      stockOutToday,
      qualityChecksToday: todayQualityChecks.length,
      pendingChecks,
      capacityUtilization,
      maxCapacity,
    };
  }, [transactions, qualityChecks, inventory, center]);

  // Calculate stock by variety
  const stockByVariety = useMemo<StockByVariety[]>(() => {
    const varietyMap = new Map<string, number>();
    inventory.forEach(item => {
      const current = varietyMap.get(item.variety) || 0;
      varietyMap.set(item.variety, current + item.quantity);
    });
    return Array.from(varietyMap.entries()).map(([name, value]) => ({ name, value }));
  }, [inventory]);

  // Calculate stock movement from trends or transactions
  const stockMovement = useMemo<StockMovement[]>(() => {
    if (trends.length > 0) {
      return trends.slice(-7).map(t => ({
        day: new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }),
        stockIn: t.stockIn || 0,
        stockOut: t.stockOut || 0,
      }));
    }
    // Fallback: calculate from transactions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();
    
    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => t.createdAt.startsWith(date));
      return {
        day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
        stockIn: dayTransactions.filter(t => t.type === "stock_in").reduce((sum, t) => sum + t.quantity, 0),
        stockOut: dayTransactions.filter(t => t.type === "stock_out").reduce((sum, t) => sum + t.quantity, 0),
      };
    });
  }, [trends, transactions]);

  // Calculate stock aging
  const stockAging = useMemo<StockAging[]>(() => {
    const now = new Date();
    const fresh = inventory.filter(item => {
      const age = Math.floor((now.getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return age <= 3;
    }).length;
    const aging = inventory.filter(item => {
      const age = Math.floor((now.getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return age > 3 && age <= 6;
    }).length;
    const critical = inventory.filter(item => {
      const age = Math.floor((now.getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return age > 6;
    }).length;
    
    const total = inventory.length;
    if (total === 0) return [];
    
    return [
      { category: "Fresh (0-3d)", value: Math.round((fresh / total) * 100), color: "#22C55E" },
      { category: "Aging (4-6d)", value: Math.round((aging / total) * 100), color: "#F59E0B" },
      { category: "Critical (7+)", value: Math.round((critical / total) * 100), color: "#EF4444" },
    ];
  }, [inventory]);

  // Calculate quality distribution
  const qualityDistribution = useMemo<QualityDistribution[]>(() => {
    const gradeMap = new Map<string, number>();
    inventory.forEach(item => {
      const grade = item.grade || item.qualityGrade;
      const current = gradeMap.get(grade) || 0;
      gradeMap.set(grade, current + 1);
    });
    const total = inventory.length;
    if (total === 0) return [];
    
    return Array.from(gradeMap.entries()).map(([name, count]) => ({
      name: `Grade ${name}`,
      value: Math.round((count / total) * 100),
    }));
  }, [inventory]);

  // Recent activity from transactions
  const recentActivity = useMemo<StockActivity[]>(() => {
    return transactions
      .slice(-10)
      .reverse()
      .map(t => ({
        id: t.id,
        type: (t.type === "stock_in" ? "in" : "out") as "in" | "out",
        farmerName: t.type === "stock_in" ? t.farmerName : undefined,
        buyerName: t.type === "stock_out" ? t.buyerName : undefined,
        quantity: t.quantity,
        qualityGrade: t.grade || t.qualityGrade || "N/A",
        timestamp: t.createdAt,
        status: "completed" as const,
      }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {centerType === "main" ? (
              <IconBuilding className="h-6 w-6 text-blue-600" />
            ) : (
              <IconBuildingCommunity className="h-6 w-6 text-purple-600" />
            )}
            <Badge
              variant="outline"
              className={
                centerType === "main"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }
            >
              {centerType === "main" ? "Main Center - Subcounty Level" : "Satellite Center - Ward Level"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{centerName}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <IconMapPin className="h-4 w-4" />
            <span>
              {centerSubCounty} Subcounty
              {centerWard && ` - ${centerWard} Ward`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stock management and quality control
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/aggregation/stock-in")}>
            <IconTrendingUp className="mr-2 h-4 w-4" />
            Stock In
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard/aggregation/stock-out")}>
            <IconTrendingDown className="mr-2 h-4 w-4" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{stats.currentStock.toLocaleString()} kg</p>
                <ProgressBar
                  value={stats.capacityUtilization}
                  maxValue={100}
                  color={stats.capacityUtilization > 80 ? "danger" : stats.capacityUtilization > 60 ? "warning" : "success"}
                  size="md"
                  showValue={false}
                />
                <p className="text-xs text-muted-foreground">{stats.capacityUtilization}% Capacity</p>
              </div>
            )}
          </CardContent>
        </Card>
        <StatCard
          label="Today's In"
          value={`${stats.stockInToday.toLocaleString()} kg`}
          description={`▲ From ${stats.stockInToday > 0 ? 8 : 0} farmers`}
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Today's Out"
          value={`${stats.stockOutToday.toLocaleString()} kg`}
          description={`To ${stats.stockOutToday > 0 ? 3 : 0} orders`}
          icon={<IconTrendingDown className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Capacity and Stock Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Capacity Gauge</CardTitle>
            <CardDescription>Current storage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex justify-center">
                <SemiCircleGauge
                  value={stats.capacityUtilization}
                  maxValue={100}
                  size={200}
                  color={stats.capacityUtilization > 80 ? "#EF4444" : stats.capacityUtilization > 60 ? "#F59E0B" : "#22C55E"}
                />
              </div>
            )}
          </CardContent>
        </Card>
        <HorizontalBarChart
          data={stockByVariety.map((v) => ({ name: v.name, value: v.value }))}
          title="Stock by Variety"
          description="Current stock breakdown by OFSP variety"
          color="#3B82F6"
          height={250}
          formatter={(value) => `${value} kg`}
        />
      </div>

      {/* Stock Movement Chart */}
      <LineChart
        data={stockMovement.map((m) => ({ name: m.day, stockIn: m.stockIn, stockOut: m.stockOut }))}
        lines={[
          { dataKey: "stockIn", name: "Stock In", color: "#22C55E" },
          { dataKey: "stockOut", name: "Stock Out", color: "#F59E0B" },
        ]}
        title="Stock Movement (7 Days)"
        description="Daily stock in and out trends"
        height={300}
      />

      {/* Stock Aging and Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Aging</CardTitle>
            <CardDescription>Stock distribution by age category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                {stockAging.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <PieChart
          data={qualityDistribution}
          title="Quality Today"
          description="Grade distribution of today's stock"
          height={300}
          showLegend={true}
        />
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {stockAging.find((a) => a.category === "Critical (7+)")?.value && 
         stockAging.find((a) => a.category === "Critical (7+)")!.value > 0 && (
          <AlertCard
            type="error"
            title="🔴 150 kg critical stock (>7 days) - prioritize dispatch"
            message="Stock older than 7 days requires immediate attention"
          />
        )}
        {stats.capacityUtilization >= 70 && (
          <AlertCard
            type="warning"
            title="🟡 Capacity at 70% - prepare for incoming deliveries"
            message={`Current capacity utilization is ${stats.capacityUtilization}%`}
          />
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Stock Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Stock Activity</CardTitle>
            <CardDescription>Stock in/out transactions today</CardDescription>
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
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-3 rounded-lg">
                        {activity.type === "in" ? (
                          <IconTrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.type === "in" ? "Stock In" : "Stock Out"} - {activity.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === "in" ? activity.farmerName : activity.buyerName} •{" "}
                          {activity.quantity} kg • Grade {activity.qualityGrade}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          activity.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {activity.status}
                      </Badge>
                      {activity.type === "in" && activity.status === "pending" && (
                        <Link to={`/dashboard/aggregation/quality-checks/${activity.id}`}>
                          <Button size="sm">Quality Check</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stock activity today</p>
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
              <Link to="/dashboard/aggregation/stock-in" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrendingUp className="mr-2 h-4 w-4" />
                  Stock In
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/stock-out" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrendingDown className="mr-2 h-4 w-4" />
                  Stock Out
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/receive-ward" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconBuildingCommunity className="mr-2 h-4 w-4" />
                  Receive from Ward
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/quality-checks" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconClipboardCheck className="mr-2 h-4 w-4" />
                  Quality Checks
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/buyer-matching" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconUsers className="mr-2 h-4 w-4" />
                  Match Buyer Demand
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/inventory" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconPackage className="mr-2 h-4 w-4" />
                  Inventory Report
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/reports" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconFileText className="mr-2 h-4 w-4" />
                  Reports
                </Button>
              </Link>
              <Link to="/dashboard/aggregation/farmers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconUsers className="mr-2 h-4 w-4" />
                  Farmer Coordination
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
                    <p className="text-sm font-medium">Quality Checks</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingChecks} pending</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {stats.pendingChecks}
                  </Badge>
                </div>
                {stats.capacityUtilization > 80 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Capacity Alert</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.capacityUtilization}% full
                      </p>
                    </div>
                    <IconAlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

