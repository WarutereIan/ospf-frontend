import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconPackage,
  IconCurrency,
  IconDownload,
  IconCalendar,
} from "@tabler/icons-react";
import { LineChart } from "@/components/visualizations";

interface AnalyticsData {
  period: string;
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  platformFee: number;
  growthRate: {
    users: number;
    orders: number;
    revenue: number;
  };
  trends: {
    date: string;
    orders: number;
    revenue: number;
    users?: number;
    farmers?: number;
    buyers?: number;
  }[];
}

export function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<string>("month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setData({
        period: "January 2024",
        totalUsers: 200,
        totalFarmers: 150,
        totalBuyers: 50,
        totalOrders: 500,
        totalRevenue: 2500000,
        averageOrderValue: 5000,
        platformFee: 50000,
        growthRate: {
          users: 15,
          orders: 25,
          revenue: 30,
        },
        trends: [
          { date: "2024-01-01", orders: 10, revenue: 50000, users: 120, farmers: 90, buyers: 30 },
          { date: "2024-01-08", orders: 25, revenue: 125000, users: 135, farmers: 100, buyers: 35 },
          { date: "2024-01-15", orders: 40, revenue: 200000, users: 150, farmers: 110, buyers: 40 },
          { date: "2024-01-22", orders: 55, revenue: 275000, users: 170, farmers: 125, buyers: 45 },
          { date: "2024-01-29", orders: 70, revenue: 350000, users: 200, farmers: 150, buyers: 50 },
        ],
      });
      setIsLoading(false);
    }, 1000);
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Performance analytics, trends, comparisons, and forecasts
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data?.totalUsers || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {data && data.growthRate.users > 0 ? (
                    <>
                      <IconTrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">+{data.growthRate.users}%</span>
                    </>
                  ) : (
                    <>
                      <IconTrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600">
                        {data ? data.growthRate.users : 0}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <IconUsers className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{data?.totalOrders || 0}</p>
                <div className="flex items-center gap-1 mt-1">
                  {data && data.growthRate.orders > 0 ? (
                    <>
                      <IconTrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">+{data.growthRate.orders}%</span>
                    </>
                  ) : (
                    <>
                      <IconTrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600">
                        {data ? data.growthRate.orders : 0}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <IconPackage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  KES {data?.totalRevenue.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {data && data.growthRate.revenue > 0 ? (
                    <>
                      <IconTrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">+{data.growthRate.revenue}%</span>
                    </>
                  ) : (
                    <>
                      <IconTrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-xs text-red-600">
                        {data ? data.growthRate.revenue : 0}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <IconCurrency className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Platform Fee</p>
                <p className="text-2xl font-bold">KES {data?.platformFee.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">2% transaction fee</p>
              </div>
              <IconChartBar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalFarmers || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {data ? Math.round((data.totalFarmers / data.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.totalBuyers || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {data ? Math.round((data.totalBuyers / data.totalUsers) * 100) : 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {data?.averageOrderValue.toLocaleString() || 0}</div>
            <p className="text-sm text-muted-foreground mt-2">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trends Over Time</CardTitle>
          <CardDescription>Orders and revenue trends for {data?.period}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          ) : data && data.trends.length > 0 ? (
            <div className="space-y-6">
              {/* Orders and Revenue Chart */}
              <div>
                <h3 className="text-sm font-medium mb-4">Orders & Revenue</h3>
                <LineChart
                  data={data.trends.map((trend) => ({
                    name: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    orders: trend.orders,
                    revenue: Math.round(trend.revenue / 1000), // Convert to thousands for readability
                    revenueActual: trend.revenue, // Keep actual value for tooltip
                  }))}
                  lines={[
                    { dataKey: "orders", name: "Orders", color: "#3B82F6", strokeWidth: 2 },
                    { dataKey: "revenue", name: "Revenue (K KES)", color: "#22C55E", strokeWidth: 2 },
                  ]}
                  height={300}
                  showGrid={true}
                  showLegend={true}
                  formatter={(value: number) => value.toLocaleString()}
                />
              </div>

              {/* User Growth Chart */}
              {data.trends[0].users !== undefined && (
                <div>
                  <h3 className="text-sm font-medium mb-4">User Growth</h3>
                  <LineChart
                    data={data.trends.map((trend) => ({
                      name: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                      totalUsers: trend.users || 0,
                      farmers: trend.farmers || 0,
                      buyers: trend.buyers || 0,
                    }))}
                    lines={[
                      { dataKey: "totalUsers", name: "Total Users", color: "#8B5CF6", strokeWidth: 2 },
                      { dataKey: "farmers", name: "Farmers", color: "#F59E0B", strokeWidth: 2 },
                      { dataKey: "buyers", name: "Buyers", color: "#EF4444", strokeWidth: 2 },
                    ]}
                    height={300}
                    showGrid={true}
                    showLegend={true}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center">
                <IconChartBar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No trend data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasts</CardTitle>
          <CardDescription>Projected metrics for next period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Projected Orders</p>
              <p className="text-2xl font-bold mt-2">
                {data ? Math.round(data.totalOrders * 1.2) : 0}
              </p>
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-800">
                +20% forecast
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Projected Revenue</p>
              <p className="text-2xl font-bold mt-2">
                KES {data ? Math.round(data.totalRevenue * 1.25).toLocaleString() : 0}
              </p>
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-800">
                +25% forecast
              </Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Projected Users</p>
              <p className="text-2xl font-bold mt-2">
                {data ? Math.round(data.totalUsers * 1.15) : 0}
              </p>
              <Badge variant="outline" className="mt-2 bg-green-50 text-green-800">
                +15% forecast
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
