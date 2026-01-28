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
import { useTransport } from "@/contexts/TransportContext";

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
  yourPrice: number | null;
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
    buyerAnalytics,
    fetchTrends,
    fetchDashboardStats,
    fetchBuyerAnalytics,
    isLoading: analyticsLoading 
  } = useAnalytics();

  const {
    requests,
    fetchRequests,
    isLoading: transportLoading
  } = useTransport();

  const [selectedPeriod, setSelectedPeriod] = useState("q3");

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id });
      fetchPaymentHistory({ userId: user.id });
      fetchTrends({ timeRange: "quarter" });
      fetchDashboardStats({ timeRange: "quarter" });
      fetchBuyerAnalytics({ timeRange: "quarter" });
      // Fetch transport requests where buyer is the requester
      // Note: TransportFilters doesn't have requesterId, so we filter client-side
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isLoading = marketplaceLoading || paymentLoading || analyticsLoading || transportLoading;

  // Filter buyer's orders
  const buyerOrders = useMemo(() => {
    return orders.filter(order => order.buyerId === user?.id);
  }, [orders, user?.id]);

  // Calculate stats from context data
  const stats = useMemo<ProcurementStats>(() => {
    const completedOrders = buyerOrders.filter(o => o.status === "completed" || o.status === "delivered");
    const totalVolume = completedOrders.reduce((sum, o) => sum + (o.totalQuantity || o.quantity || 0), 0) / 1000; // Convert to tons
    const totalValue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgPricePerKg = totalVolume > 0 && totalValue > 0 ? totalValue / (totalVolume * 1000) : 0;
    
    // Get market average from trends or dashboard stats
    const marketAvgPrice = dashboardStats?.averagePrice || trends?.[trends.length - 1]?.averagePrice || 80;
    
    // Calculate quality acceptance (percentage of Grade A items across all orders)
    let totalGradeAItems = 0;
    let totalItems = 0;
    completedOrders.forEach(order => {
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          totalItems += item.quantity || 0;
          if (item.grade === "A") {
            totalGradeAItems += item.quantity || 0;
          }
        });
      } else if (order.qualityGrade === "A") {
        // Single item order with Grade A
        totalItems += order.quantity || order.totalQuantity || 0;
        totalGradeAItems += order.quantity || order.totalQuantity || 0;
      } else {
        // Single item order without grade A
        totalItems += order.quantity || order.totalQuantity || 0;
      }
    });
    const qualityAcceptance = totalItems > 0 ? (totalGradeAItems / totalItems) * 100 : 0;
    
    // Get unique suppliers from completed orders
    const uniqueSuppliers = new Set(completedOrders.map(o => o.sellerId || o.farmerId).filter(Boolean));
    
    // Deliveries this week (from transport requests)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const deliveriesThisWeekRequests = requests.filter(
      req => req.type === "order_delivery" && 
      req.requesterId === user?.id &&
      new Date(req.createdAt) >= weekAgo &&
      (req.status === "in_transit" || req.status === "delivered" || req.status === "accepted" || req.status === "completed")
    );
    const deliveriesThisWeek = deliveriesThisWeekRequests.length;

    // Calculate trends with proper zero handling
    let volumeTrend = 0;
    if (trends.length > 1) {
      const currentVolume = trends[trends.length - 1]?.volume || 0;
      const previousVolume = trends[0]?.volume || 0;
      if (previousVolume > 0) {
        volumeTrend = ((currentVolume - previousVolume) / previousVolume) * 100;
      } else if (currentVolume > 0) {
        // If previous was 0 and current > 0, show positive trend but cap at reasonable value
        volumeTrend = Math.min(100, (currentVolume / 0.1) * 100); // Cap at 100% if starting from near-zero
      }
    }

    let priceTrend = 0;
    if (trends.length > 1) {
      const currentPrice = trends[trends.length - 1]?.averagePrice || 0;
      const previousPrice = trends[0]?.averagePrice || 0;
      if (previousPrice > 0) {
        priceTrend = ((currentPrice - previousPrice) / previousPrice) * 100;
      } else if (currentPrice > 0 && previousPrice === 0) {
        // Price went from 0 to something - show as positive
        priceTrend = 100;
      }
    }

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
  }, [buyerOrders, trends, dashboardStats, requests, user?.id]);

  // Price trend data from trends
  const priceTrendData = useMemo<PriceTrendData[]>(() => {
    if (trends.length === 0) {
      // If no trends, show current stats for the current month
      const currentMonth = new Date().toLocaleDateString("en-US", { month: "short" });
      return [{
        month: currentMonth,
        yourPrice: stats.avgPricePerKg > 0 ? stats.avgPricePerKg : null,
        marketAvg: stats.marketAvgPrice,
      }];
    }
    return trends.slice(-5).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      yourPrice: t.averagePrice && t.averagePrice > 0 ? t.averagePrice : (stats.avgPricePerKg > 0 ? stats.avgPricePerKg : null),
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

  // Recent deliveries from transport requests (ORDER_DELIVERY type)
  const recentDeliveries = useMemo<RecentDelivery[]>(() => {
      // Get order delivery transport requests for this buyer
      const orderDeliveryRequests = requests
        .filter(req => 
          req.type === "order_delivery" && 
          req.requesterId === user?.id &&
          req.status !== "pending" && 
          req.status !== "rejected" && 
          req.status !== "cancelled"
        )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Create a map of orders for quick lookup
    const ordersMap = new Map(buyerOrders.map(order => [order.id, order]));

    return orderDeliveryRequests.map(request => {
      // Get related order for additional info
      const order = request.orderId ? ordersMap.get(request.orderId) : null;
      
      // Calculate grading from order items or use quality score
      let grading = "0% Grade A";
      if (order?.items && order.items.length > 0) {
        const gradeAQuantity = order.items
          .filter(item => item.grade === "A")
          .reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalQuantity = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
        if (totalQuantity > 0) {
          const gradeAPercentage = Math.round((gradeAQuantity / totalQuantity) * 100);
          grading = `${gradeAPercentage}% Grade A`;
        }
      } else if (order?.qualityScore !== undefined) {
        grading = `${Math.round(order.qualityScore)}% Grade A`;
      } else if (order?.qualityGrade === "A") {
        grading = "100% Grade A";
      }
      
      // Determine status from transport request status
      let status: RecentDelivery["status"] = "on_route";
      if (request.status === "delivered" || request.status === "completed") {
        status = "approved";
      } else if (request.status === "accepted") {
        status = "inspecting";
      } else if (request.status === "in_transit") {
        status = "on_route";
      }

      // Get supplier name from order or transport request
      const supplier = order?.farmerName || order?.sellerName || request.providerName || "Unknown";
      
      // Get origin from transport request or order
      const origin = request.from || request.pickupLocation || order?.origin || order?.location || "Unknown";
      
      // Get weight from transport request or order
      const weight = request.weight || order?.totalQuantity || order?.quantity || 0;

      return {
        batchId: request.orderNumber || request.id.slice(0, 9),
        supplier,
        origin,
        weight,
        grading,
        status,
      };
    });
  }, [requests, buyerOrders, user?.id]);

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
              <div className="text-2xl font-bold text-stone-900">
                {stats.volumeSourced > 0 ? `${stats.volumeSourced} tons` : '0 tons'}
              </div>
              {stats.volumeSourced > 0 && (
                <div className="flex items-center gap-2">
                  {stats.volumeTrend > 0 ? (
                    <IconTrendingUp className="h-4 w-4 text-green-600" />
                  ) : stats.volumeTrend < 0 ? (
                    <IconTrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  {stats.volumeTrend !== 0 && (
                    <span className={`text-sm font-medium ${stats.volumeTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(stats.volumeTrend)}%
                    </span>
                  )}
                </div>
              )}
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
                {stats.avgPricePerKg > 0 ? (
                  <>
                    KES {stats.avgPricePerKg}
                    <span className="text-sm font-normal text-stone-500">/kg</span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-stone-500">No data</span>
                )}
              </div>
              {stats.avgPricePerKg > 0 && (
                <div className="flex items-center gap-2">
                  {stats.priceTrend < 0 ? (
                    <IconTrendingDown className="h-4 w-4 text-green-600" />
                  ) : stats.priceTrend > 0 ? (
                    <IconTrendingUp className="h-4 w-4 text-red-600" />
                  ) : null}
                  {stats.priceTrend !== 0 && (
                    <span className={`text-sm font-medium ${stats.priceTrend < 0 ? "text-green-600" : "text-red-600"}`}>
                      {Math.abs(stats.priceTrend)}%
                    </span>
                  )}
                </div>
              )}
              <div className="text-xs text-stone-500">
                {stats.avgPricePerKg > 0 
                  ? `KES ${priceDifference.toFixed(2)} ${priceDifference > 0 ? 'below' : 'above'} market avg`
                  : 'No price data available'
                }
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
              <div className="text-2xl font-bold text-stone-900">
                {stats.qualityAcceptance > 0 ? `${stats.qualityAcceptance}%` : 'N/A'}
              </div>
              <div className="text-xs text-stone-500">
                {stats.qualityAcceptance > 0 
                  ? `Based on ${buyerOrders.filter(o => o.status === "completed" || o.status === "delivered").length} completed deliveries`
                  : 'No quality data available'
                }
              </div>
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
                  {stats.activeSuppliers > 2 && (
                    <div className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white flex items-center justify-center text-xs font-bold text-stone-600">
                      +{stats.activeSuppliers - 2}
                    </div>
                  )}
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
                yourPrice: item.yourPrice ?? 0,
                marketAvg: item.marketAvg ?? 0,
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
              formatter={(value) => value > 0 ? `KES ${value.toFixed(2)}` : 'N/A'}
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
                      <TableCell className="text-stone-700">
                        {delivery.weight > 0 ? `${(delivery.weight / 1000).toFixed(1)}t` : 'N/A'}
                      </TableCell>
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
