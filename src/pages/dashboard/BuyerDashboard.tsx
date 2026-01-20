import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconDownload,
  IconPlus,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconBell,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import { LineChart, PieChart } from "@/components/visualizations";
import { Progress } from "@/components/ui/progress";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useAuth } from "@/contexts/AuthContext";

interface ProcurementStats {
  volumeSourced: number; // in tons
  volumeTarget: number; // quarterly target in tons
  volumeTrend: number; // percentage change
  avgPricePerKg: number; // KES
  priceTrend: number; // percentage change
  marketAvgPrice: number; // KES
  qualityAcceptance: number; // percentage
  activeSuppliers: number;
  deliveriesThisWeek: number;
}

interface PriceTrendData {
  month: string;
  yourPrice: number;
  marketAvg: number;
}

interface SourcingMixData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SourcingRegion {
  name: string;
  volume: number; // in tons
  percentage: number;
}

interface RecentDelivery {
  batchId: string;
  supplier: string;
  origin: string;
  weight: number; // in kg
  grading: string; // e.g., "92% Grade A"
  status: "on_route" | "received" | "inspecting" | "approved";
}

export function BuyerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    orders, 
    fetchOrders,
    isLoading: marketplaceLoading 
  } = useMarketplace();
  
  const { 
    paymentHistory,
    fetchPaymentHistory,
    isLoading: paymentLoading 
  } = usePayment();
  
  const { 
    trends,
    dashboardStats,
    fetchTrends,
    fetchDashboardStats,
    isLoading: analyticsLoading 
  } = useAnalytics();

  const [selectedPeriod, setSelectedPeriod] = useState("q3");

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id });
      fetchPaymentHistory({ userId: user.id });
      fetchTrends({ timeRange: "quarter" });
      fetchDashboardStats({ timeRange: "quarter" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isLoading = marketplaceLoading || paymentLoading || analyticsLoading;

  // Filter buyer's orders
  const buyerOrders = useMemo(() => {
    return orders.filter(order => order.buyerId === user?.id);
  }, [orders, user?.id]);

  // Calculate stats from context data
  const stats = useMemo<ProcurementStats>(() => {
    const completedOrders = buyerOrders.filter(o => o.status === "completed" || o.status === "delivered");
    const totalVolume = completedOrders.reduce((sum, o) => sum + (o.totalQuantity || 0), 0) / 1000; // Convert to tons
    const totalValue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgPricePerKg = totalVolume > 0 ? totalValue / (totalVolume * 1000) : 0;
    
    // Get market average from trends or dashboard stats
    const marketAvgPrice = dashboardStats?.averagePrice || 40;
    
    // Calculate quality acceptance (orders with grade A)
    const gradeAOrders = completedOrders.filter(o => o.items?.some(item => item.grade === "A")).length;
    const qualityAcceptance = completedOrders.length > 0 ? (gradeAOrders / completedOrders.length) * 100 : 0;
    
    // Get unique suppliers
    const uniqueSuppliers = new Set(completedOrders.map(o => o.sellerId || o.farmerId).filter(Boolean));
    
    // Deliveries this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const deliveriesThisWeek = buyerOrders.filter(o => 
      new Date(o.createdAt) >= weekAgo && 
      (o.status === "in_transit" || o.status === "delivered" || o.status === "completed")
    ).length;

    // Calculate trends (simplified - would need historical data)
    const volumeTrend = trends.length > 1 ? 
      ((trends[trends.length - 1].volume || 0) - (trends[0].volume || 0)) / (trends[0].volume || 1) * 100 : 0;
    const priceTrend = trends.length > 1 ?
      ((trends[trends.length - 1].averagePrice || 0) - (trends[0].averagePrice || 0)) / (trends[0].averagePrice || 1) * 100 : 0;

    return {
      volumeSourced: Math.round(totalVolume * 10) / 10,
      volumeTarget: 37.5, // TODO: Get from settings or config
      volumeTrend: Math.round(volumeTrend * 10) / 10,
      avgPricePerKg: Math.round(avgPricePerKg),
      priceTrend: Math.round(priceTrend * 10) / 10,
      marketAvgPrice: Math.round(marketAvgPrice),
      qualityAcceptance: Math.round(qualityAcceptance * 10) / 10,
      activeSuppliers: uniqueSuppliers.size,
      deliveriesThisWeek,
    };
  }, [buyerOrders, trends, dashboardStats]);

  // Price trend data from trends
  const priceTrendData = useMemo<PriceTrendData[]>(() => {
    if (trends.length === 0) return [];
    return trends.slice(-5).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      yourPrice: t.averagePrice || stats.avgPricePerKg,
      marketAvg: dashboardStats?.averagePrice || stats.marketAvgPrice,
    }));
  }, [trends, dashboardStats, stats]);

  // Sourcing mix from orders
  const sourcingMix = useMemo<SourcingMixData[]>(() => {
    const mixMap = new Map<string, number>();
    buyerOrders.forEach(order => {
      order.items?.forEach(item => {
        const category = `${item.variety} (Grade ${item.grade})`;
        const current = mixMap.get(category) || 0;
        mixMap.set(category, current + (item.quantity || 0));
      });
    });
    
    const total = Array.from(mixMap.values()).reduce((sum, v) => sum + v, 0) / 1000; // Convert to tons
    if (total === 0) return [];
    
    const colors = ["#FF8C00", "#475569", "#94A3B8", "#F59E0B", "#10B981"];
    let colorIndex = 0;
    
    return Array.from(mixMap.entries())
      .map(([name, value]) => ({
        name,
        value: value / 1000, // Convert to tons
        percentage: Math.round((value / 1000 / total) * 100),
        color: colors[colorIndex++ % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [buyerOrders]);

  // Top regions from orders
  const topRegions = useMemo<SourcingRegion[]>(() => {
    const regionMap = new Map<string, number>();
    buyerOrders.forEach(order => {
      const region = order.origin || order.location || "Unknown";
      const current = regionMap.get(region) || 0;
      regionMap.set(region, current + (order.totalQuantity || 0));
    });
    
    const total = Array.from(regionMap.values()).reduce((sum, v) => sum + v, 0) / 1000; // Convert to tons
    if (total === 0) return [];
    
    return Array.from(regionMap.entries())
      .map(([name, volume]) => ({
        name,
        volume: Math.round((volume / 1000) * 10) / 10,
        percentage: Math.round((volume / 1000 / total) * 100),
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4);
  }, [buyerOrders]);

  // Recent deliveries from orders
  const recentDeliveries = useMemo<RecentDelivery[]>(() => {
    return buyerOrders
      .filter(o => o.status !== "order_placed" && o.status !== "cancelled")
      .slice(-5)
      .reverse()
      .map(order => {
        const gradeAItems = order.items?.filter(item => item.grade === "A").length || 0;
        const totalItems = order.items?.length || 1;
        const grading = `${Math.round((gradeAItems / totalItems) * 100)}% Grade A`;
        
        let status: RecentDelivery["status"] = "on_route";
        if (order.status === "delivered" || order.status === "completed") {
          status = "approved";
        } else if (order.status === "in_transit" || order.status === "at_aggregation") {
          status = "inspecting";
        }

        return {
          batchId: order.id,
          supplier: order.sellerName || order.farmerName || "Unknown",
          origin: order.origin || order.location || "Unknown",
          weight: order.totalQuantity || 0,
          grading,
          status,
        };
      });
  }, [buyerOrders]);

  const getStatusColor = (status: RecentDelivery["status"]) => {
    switch (status) {
      case "on_route":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "received":
        return "bg-green-100 text-green-800 border-green-200";
      case "inspecting":
        return "bg-stone-100 text-stone-800 border-stone-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  const getStatusLabel = (status: RecentDelivery["status"]) => {
    switch (status) {
      case "on_route":
        return "On Route";
      case "received":
        return "Received";
      case "inspecting":
        return "Inspecting";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  const volumeProgress = stats.volumeTarget > 0 ? (stats.volumeSourced / stats.volumeTarget) * 100 : 0;
  const priceDifference = stats.marketAvgPrice - stats.avgPricePerKg;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Procurement Overview</h1>
          <p className="text-stone-500 mt-1">Track your OFSP sourcing volume, quality, and market prices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-stone-200 hover:border-orange-500 hover:text-orange-500"
          >
            <IconDownload className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => navigate("/marketplace")}
          >
            <IconPlus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Volume Sourced */}
        <Card className="bg-white border-stone-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Volume Sourced</div>
              <div className="text-2xl font-bold text-stone-900">{stats.volumeSourced} tons</div>
              <div className="flex items-center gap-2">
                {stats.volumeTrend > 0 ? (
                  <IconTrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <IconTrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${stats.volumeTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(stats.volumeTrend)}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>{Math.round(volumeProgress)}% of quarterly target achieved</span>
                </div>
                <Progress value={volumeProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Avg Price / KG */}
        <Card className="bg-white border-stone-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Avg. Price / KG</div>
              <div className="text-2xl font-bold text-stone-900">
                KES {stats.avgPricePerKg}
                <span className="text-sm font-normal text-stone-500">/kg</span>
              </div>
              <div className="flex items-center gap-2">
                {stats.priceTrend < 0 ? (
                  <IconTrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <IconTrendingUp className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${stats.priceTrend < 0 ? "text-green-600" : "text-red-600"}`}>
                  {Math.abs(stats.priceTrend)}%
                </span>
              </div>
              <div className="text-xs text-stone-500">
                KES {priceDifference.toFixed(2)} below market avg
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Acceptance */}
        <Card className="bg-white border-stone-200 relative">
          <div className="absolute top-3 right-3">
            <IconClock className="h-4 w-4 text-stone-400" />
          </div>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Quality Acceptance</div>
              <div className="text-2xl font-bold text-stone-900">{stats.qualityAcceptance}%</div>
              <div className="text-xs text-stone-500">Based on last 5 deliveries</div>
            </div>
          </CardContent>
        </Card>

        {/* Active Suppliers */}
        <Card className="bg-white border-stone-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Active Suppliers</div>
              <div className="text-2xl font-bold text-stone-900">{stats.activeSuppliers}</div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-700">
                    JC
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-700">
                    FM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-600">
                    +{stats.activeSuppliers - 2}
                  </div>
                </div>
              </div>
              <div className="text-xs text-stone-500">
                {stats.deliveriesThisWeek} deliveries arriving this week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Trend Analysis */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Your purchase price vs. Market average (KES/kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={priceTrendData.map((item) => ({
                name: item.month,
                yourPrice: item.yourPrice,
                marketAvg: item.marketAvg,
              }))}
              lines={[
          {
                  dataKey: "yourPrice",
                  name: "Your Price",
                  color: "#FF8C00",
                  strokeWidth: 2,
                },
                {
                  dataKey: "marketAvg",
                  name: "Market Avg",
                  color: "#94A3B8",
                  strokeWidth: 2,
          },
        ]}
              height={280}
              showLegend={true}
              formatter={(value) => `KES ${value.toFixed(2)}`}
            />
          </CardContent>
        </Card>

        {/* Sourcing Mix */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Volume distribution by product type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex items-center justify-center h-[280px]">
              <PieChart
                data={sourcingMix.map((item) => ({ name: item.name, value: item.value }))}
                height={280}
                innerRadius={60}
                showLegend={false}
                showLabels={false}
                colors={sourcingMix.map((item) => item.color)}
                formatter={(value) => `${value.toFixed(1)}t`}
      />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-bold text-stone-900">
                    {sourcingMix.reduce((sum, item) => sum + item.value, 0).toFixed(0)}t
                  </div>
                  <div className="text-xs text-stone-500">Total</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {sourcingMix.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-stone-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-stone-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sourcing Regions */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Top Sourcing Regions</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
              {topRegions.map((region) => (
                <div key={region.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-900">{region.name}</span>
                    <span className="text-stone-600">{region.volume} tons</span>
                  </div>
                  <Progress value={region.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Deliveries */}
        <Card className="bg-white border-stone-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-stone-900">Recent Deliveries</CardTitle>
                <CardDescription className="text-stone-500">Status of your inbound logistics</CardDescription>
              </div>
              <Link to="/dashboard/buyer/orders">
                <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-stone-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                    <TableHead className="text-stone-600">Batch ID</TableHead>
                    <TableHead className="text-stone-600">Supplier</TableHead>
                    <TableHead className="text-stone-600">Origin</TableHead>
                    <TableHead className="text-stone-600">Weight</TableHead>
                    <TableHead className="text-stone-600">Grading</TableHead>
                    <TableHead className="text-stone-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {recentDeliveries.map((delivery) => (
                    <TableRow key={delivery.batchId}>
                      <TableCell className="font-medium text-stone-900">{delivery.batchId}</TableCell>
                      <TableCell className="text-stone-700">{delivery.supplier}</TableCell>
                      <TableCell className="text-stone-600">{delivery.origin}</TableCell>
                      <TableCell className="text-stone-700">{(delivery.weight / 1000).toFixed(1)}t</TableCell>
                      <TableCell className="text-stone-700">{delivery.grading}</TableCell>
                          <TableCell>
                        <Badge variant="outline" className={getStatusColor(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
