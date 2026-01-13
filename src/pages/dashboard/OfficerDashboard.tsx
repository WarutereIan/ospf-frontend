import { useState, useEffect } from "react";
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
} from "@tabler/icons-react";
import {
  StatCard,
  AreaChart,
  LineChart,
  HorizontalBarChart,
} from "@/components/visualizations";

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
  orderCount: number;
  lastActivity: string;
  status: "active" | "inactive";
}

export function OfficerDashboard() {
  const [stats, setStats] = useState<OfficerStats>({
    totalFarmers: 0,
    activeFarmers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    aggregationCenters: 4,
    pendingAdvisories: 0,
    volume: 0,
    quality: 0,
    value: 0,
  });
  const [recentActivity, setRecentActivity] = useState<FarmerActivity[]>([]);
  const [monthlyProduction, setMonthlyProduction] = useState<MonthlyProduction[]>([]);
  const [farmerGrowth, setFarmerGrowth] = useState<FarmerGrowth[]>([]);
  const [centrePerformance, setCentrePerformance] = useState<CentrePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        totalFarmers: 1245,
        activeFarmers: 1200,
        totalOrders: 450,
        totalRevenue: 6750000,
        aggregationCenters: 8,
        pendingAdvisories: 3,
        volume: 45,
        quality: 82,
        value: 6700000,
      });
      setRecentActivity([
        {
          id: "F001",
          name: "James Mutua",
          subCounty: "Kangundo",
          totalSales: 5000,
          orderCount: 45,
          lastActivity: new Date().toISOString(),
          status: "active",
        },
        {
          id: "F002",
          name: "Mary Wanjiku",
          subCounty: "Kathiani",
          totalSales: 4500,
          orderCount: 38,
          lastActivity: new Date().toISOString(),
          status: "active",
        },
      ]);
      // Monthly production (12 months)
      setMonthlyProduction([
        { month: "Jan", volume: 35 },
        { month: "Feb", volume: 38 },
        { month: "Mar", volume: 40 },
        { month: "Apr", volume: 42 },
        { month: "May", volume: 43 },
        { month: "Jun", volume: 44 },
        { month: "Jul", volume: 43 },
        { month: "Aug", volume: 44 },
        { month: "Sep", volume: 45 },
        { month: "Oct", volume: 44 },
        { month: "Nov", volume: 45 },
        { month: "Dec", volume: 45 },
      ]);
      // Farmer growth (cumulative)
      setFarmerGrowth([
        { month: "Jan", farmers: 800 },
        { month: "Feb", farmers: 850 },
        { month: "Mar", farmers: 900 },
        { month: "Apr", farmers: 950 },
        { month: "May", farmers: 1000 },
        { month: "Jun", farmers: 1050 },
        { month: "Jul", farmers: 1100 },
        { month: "Aug", farmers: 1150 },
        { month: "Sep", farmers: 1180 },
        { month: "Oct", farmers: 1200 },
        { month: "Nov", farmers: 1220 },
        { month: "Dec", farmers: 1245 },
      ]);
      // Centre performance
      setCentrePerformance([
        { name: "Kangundo Main", utilization: 95 },
        { name: "Tala Satellite", utilization: 88 },
        { name: "Kathiani Main", utilization: 75 },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">County Officer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor farmer activities and generate reports
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
          description={`+${stats.totalFarmers - 1200} new`}
          icon={<IconUsers className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Volume"
          value={`${stats.volume} tons`}
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
          description="Monthly production volume in tons"
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
                          {farmer.subCounty} • {farmer.totalSales} kg sold • {farmer.orderCount} orders
                        </p>
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

