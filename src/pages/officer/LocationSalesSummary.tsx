import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconMapPin,
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconPackage,
  IconCurrency,
  IconUsers,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, HorizontalBarChart, PieChart } from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";

interface LocationSales {
  location: string;
  subCounty: string;
  ward?: string;
  totalSales: number; // kg
  totalValue: number; // KES
  orderCount: number;
  activeFarmers: number;
  avgPricePerKg: number;
  growthRate: number;
}

interface LocationStock {
  location: string;
  subCounty: string;
  currentStock: number; // kg
  stockIn: number; // kg
  stockOut: number; // kg
  capacity: number; // kg
  utilization: number; // %
  centers: number;
}

interface MonthlyLocationData {
  month: string;
  kangundo: number;
  kathiani: number;
  masinga: number;
  yatta: number;
}

export function LocationSalesSummary() {
  const { centers, transactions, inventory, fetchCenters, fetchTransactions, fetchInventory, isLoading: aggregationLoading } = useAggregation();
  const { dashboardStats, trends, fetchDashboardStats, fetchTrends, isLoading: analyticsLoading } = useAnalytics();
  const { orders, fetchOrders, isLoading: marketplaceLoading } = useMarketplace();
  
  const [reportType, setReportType] = useState<"sales" | "stock">("sales");
  const [dateRange, setDateRange] = useState<string>("month");

  const isLoading = aggregationLoading || analyticsLoading || marketplaceLoading;

  useEffect(() => {
    fetchCenters();
    fetchTransactions();
    fetchInventory();
    fetchOrders(); // Fetch marketplace orders for accurate order counts and values
    fetchDashboardStats({ timeRange: "year" });
    fetchTrends({ timeRange: "year" });
  }, [fetchCenters, fetchTransactions, fetchInventory, fetchOrders, fetchDashboardStats, fetchTrends]);

  // Resolve date range boundaries for filtering
  const dateRangeBounds = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (dateRange) {
      case "week":
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(start.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setMonth(start.getMonth() - 1);
    }

    return { start, end };
  }, [dateRange]);

  // Filter transactions for the selected date range and ignore rejected ones
  const filteredTransactions = useMemo(() => {
    const { start, end } = dateRangeBounds;
    return transactions.filter((tx) => {
      const createdAt = new Date(tx.createdAt);
      if (isNaN(createdAt.getTime())) return false;
      if (createdAt < start || createdAt > end) return false;
      if (tx.status && tx.status === "REJECTED") return false;
      return true;
    });
  }, [transactions, dateRangeBounds]);

  // Filter orders for the selected date range - only completed/delivered orders count
  const filteredOrders = useMemo(() => {
    const { start, end } = dateRangeBounds;
    const completedStatuses: string[] = ["completed", "delivered", "collected"];
    
    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      if (isNaN(createdAt.getTime())) return false;
      if (createdAt < start || createdAt > end) return false;
      // Only count completed/delivered orders for accurate sales metrics
      if (!completedStatuses.includes(order.status.toLowerCase())) return false;
      return true;
    });
  }, [orders, dateRangeBounds]);

  // Calculate location sales from stock-out transactions (for volume) and orders (for order counts, values, farmers)
  const locationSales: LocationSales[] = useMemo(() => {
    const salesMap = new Map<string, LocationSales>();
    const ordersByLocation = new Map<string, Set<string>>();
    const farmersByLocation = new Map<string, Set<string>>();

    // First, aggregate stock-out transactions for physical volume (totalSales)
    filteredTransactions.forEach((tx) => {
      if (tx.type !== "stock_out") return;
      const center = centers.find((c) => c.id === tx.centerId);
      if (!center) return;

      const locationKey = center.subCounty || center.location || "Unknown";

      if (!salesMap.has(locationKey)) {
        salesMap.set(locationKey, {
          location: locationKey,
          subCounty: center.subCounty || "",
          ward: center.ward,
          totalSales: 0,
          totalValue: 0,
          orderCount: 0,
          activeFarmers: 0,
          avgPricePerKg: 0,
          growthRate: 0,
        });
      }

      const entry = salesMap.get(locationKey)!;
      entry.totalSales += tx.quantity || 0;
    });

    // Then, aggregate actual marketplace orders for order counts, values, and active farmers
    filteredOrders.forEach((order) => {
      // Determine location from order's centerLocation or find center by aggregationCenter
      let locationKey = "Unknown";
      let subCounty = "";
      let ward: string | undefined;

      if (order.centerLocation) {
        // Use centerLocation if available
        const center = centers.find((c) => c.name === order.centerLocation || c.location === order.centerLocation);
        if (center) {
          locationKey = center.subCounty || center.location || "Unknown";
          subCounty = center.subCounty || "";
          ward = center.ward;
        } else {
          // Fallback: use centerLocation as-is
          locationKey = order.centerLocation;
          subCounty = order.centerLocation;
        }
      } else if (order.aggregationCenter) {
        // Find center by name
        const center = centers.find((c) => c.name === order.aggregationCenter || c.id === order.aggregationCenter);
        if (center) {
          locationKey = center.subCounty || center.location || "Unknown";
          subCounty = center.subCounty || "";
          ward = center.ward;
        }
      } else {
        // Try to find center from stock transactions linked to this order
        const linkedTx = filteredTransactions.find((tx) => tx.orderId === order.id);
        if (linkedTx) {
          const center = centers.find((c) => c.id === linkedTx.centerId);
          if (center) {
            locationKey = center.subCounty || center.location || "Unknown";
            subCounty = center.subCounty || "";
            ward = center.ward;
          }
        }
      }

      // Initialize entry if needed
      if (!salesMap.has(locationKey)) {
        salesMap.set(locationKey, {
          location: locationKey,
          subCounty,
          ward,
          totalSales: 0,
          totalValue: 0,
          orderCount: 0,
          activeFarmers: 0,
          avgPricePerKg: 0,
          growthRate: 0,
        });
      }

      const entry = salesMap.get(locationKey)!;
      
      // Aggregate order value (use totalAmount from order, not stock transaction)
      entry.totalValue += order.totalAmount || 0;

      // Track distinct orders
      if (!ordersByLocation.has(locationKey)) {
        ordersByLocation.set(locationKey, new Set<string>());
      }
      ordersByLocation.get(locationKey)!.add(order.id);

      // Track distinct active farmers (from orders, not stock transactions)
      if (order.farmerId) {
        if (!farmersByLocation.has(locationKey)) {
          farmersByLocation.set(locationKey, new Set<string>());
        }
        farmersByLocation.get(locationKey)!.add(order.farmerId);
      }
    });

    // Finalize derived metrics
    const result: LocationSales[] = [];
    salesMap.forEach((entry, locationKey) => {
      const totalSales = entry.totalSales;
      const totalValue = entry.totalValue;
      const orderCount = ordersByLocation.get(locationKey)?.size ?? 0;
      const activeFarmers = farmersByLocation.get(locationKey)?.size ?? 0;

      result.push({
        ...entry,
        orderCount,
        activeFarmers,
        avgPricePerKg: totalSales > 0 ? Math.round((totalValue / totalSales) * 100) / 100 : 0,
        // Growth rate can later be derived from analytics trends; for now, keep neutral
        growthRate: 0,
      });
    });

    // Sort by total sales descending for a more useful view
    return result.sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredTransactions, filteredOrders, centers]);

  // Calculate location stock summary grouped by center location
  const locationStock: LocationStock[] = useMemo(() => {
    const stockMap = new Map<string, LocationStock>();

    // Aggregate current inventory by center
    const inventoryByCenter = new Map<string, number>();
    inventory.forEach((item) => {
      const current = inventoryByCenter.get(item.centerId) || 0;
      inventoryByCenter.set(item.centerId, current + (item.quantity || 0));
    });

    // Initialize per-location entries from centers
    centers.forEach((center) => {
      const locationKey = center.subCounty || center.location || "Unknown";
      const existing = stockMap.get(locationKey);
      const centerStock = inventoryByCenter.get(center.id) ?? center.currentStock ?? 0;

      if (!existing) {
        stockMap.set(locationKey, {
          location: locationKey,
          subCounty: center.subCounty || "",
          currentStock: centerStock,
          stockIn: 0,
          stockOut: 0,
          capacity: center.capacity || 0,
          utilization: 0,
          centers: 1,
        });
      } else {
        existing.currentStock += centerStock;
        existing.capacity += center.capacity || 0;
        existing.centers += 1;
      }
    });

    // Aggregate stock movements (stock in/out) from filtered transactions
    filteredTransactions.forEach((tx) => {
      const center = centers.find((c) => c.id === tx.centerId);
      if (!center) return;
      const locationKey = center.subCounty || center.location || "Unknown";

      if (!stockMap.has(locationKey)) {
        stockMap.set(locationKey, {
          location: locationKey,
          subCounty: center.subCounty || "",
          currentStock: 0,
          stockIn: 0,
          stockOut: 0,
          capacity: center.capacity || 0,
          utilization: 0,
          centers: 1,
        });
      }

      const entry = stockMap.get(locationKey)!;
      if (tx.type === "stock_in") {
        entry.stockIn += tx.quantity || 0;
      } else if (tx.type === "stock_out") {
        entry.stockOut += tx.quantity || 0;
      }
    });

    // Finalize utilization percentages
    const result: LocationStock[] = [];
    stockMap.forEach((entry) => {
      const utilization =
        entry.capacity > 0 ? Math.round(((entry.currentStock || 0) / entry.capacity) * 100) : 0;
      result.push({
        ...entry,
        utilization,
      });
    });

    // Sort by current stock descending
    return result.sort((a, b) => b.currentStock - a.currentStock);
  }, [centers, inventory, filteredTransactions]);

  // Map orders into simple monthly series per key locations (sub-counties) for sales trends
  const monthlyData: MonthlyLocationData[] = useMemo(() => {
    // Determine up to four primary sub-counties to display
    const distinctSubCounties = Array.from(
      new Set(centers.map((c) => c.subCounty).filter((s): s is string => !!s))
    );

    const seriesKeys = ["kangundo", "kathiani", "masinga", "yatta"] as const;
    type SeriesKey = (typeof seriesKeys)[number];

    const subCountyToSeries = new Map<string, SeriesKey>();
    distinctSubCounties.slice(0, seriesKeys.length).forEach((subCounty, index) => {
      subCountyToSeries.set(subCounty.toLowerCase(), seriesKeys[index]);
    });

    const byMonth = new Map<string, MonthlyLocationData>();

    // Use orders for monthly trends (more accurate than stock transactions)
    filteredOrders.forEach((order) => {
      // Determine location from order (same logic as locationSales)
      let locationKey = "Unknown";
      
      if (order.centerLocation) {
        const center = centers.find((c) => c.name === order.centerLocation || c.location === order.centerLocation);
        if (center && center.subCounty) {
          locationKey = center.subCounty;
        } else {
          locationKey = order.centerLocation;
        }
      } else if (order.aggregationCenter) {
        const center = centers.find((c) => c.name === order.aggregationCenter || c.id === order.aggregationCenter);
        if (center && center.subCounty) {
          locationKey = center.subCounty;
        }
      } else {
        // Try to find center from stock transactions linked to this order
        const linkedTx = filteredTransactions.find((tx) => tx.orderId === order.id);
        if (linkedTx) {
          const center = centers.find((c) => c.id === linkedTx.centerId);
          if (center && center.subCounty) {
            locationKey = center.subCounty;
          }
        }
      }

      if (!locationKey || locationKey === "Unknown") return;

      const seriesKey = subCountyToSeries.get(locationKey.toLowerCase());
      if (!seriesKey) return; // Ignore locations beyond the primary four

      const createdAt = new Date(order.createdAt);
      if (isNaN(createdAt.getTime())) return;

      const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}`;
      let entry = byMonth.get(monthKey);
      if (!entry) {
        entry = {
          month: createdAt.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          kangundo: 0,
          kathiani: 0,
          masinga: 0,
          yatta: 0,
        };
      }

      // Use order quantity for monthly trends
      entry[seriesKey] = (entry[seriesKey] || 0) + (order.quantity || 0);
      byMonth.set(monthKey, entry);
    });

    return Array.from(byMonth.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([, entry]) => entry);
  }, [filteredOrders, filteredTransactions, centers]);

  const handleExport = () => {
    // TODO: Implement export
    alert(`Exporting ${reportType} summary report...`);
  };

  const totalSales = locationSales.reduce((sum, l) => sum + l.totalSales, 0);
  const totalValue = locationSales.reduce((sum, l) => sum + l.totalValue, 0);
  const totalOrders = locationSales.reduce((sum, l) => sum + l.orderCount, 0);
  const totalFarmers = locationSales.reduce((sum, l) => sum + l.activeFarmers, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Location-Based Sales & Stock Summary</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Sales and stock summaries by location for planning and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Report Type Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Label>Report Type:</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as "sales" | "stock")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Summary</SelectItem>
                <SelectItem value="stock">Stock Summary</SelectItem>
              </SelectContent>
            </Select>
            <Label>Date Range:</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
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
          </div>
        </CardContent>
      </Card>

      {/* Sales Summary */}
      {reportType === "sales" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground mt-1">Across all locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {(totalValue / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground mt-1">Total revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalFarmers}</div>
                <p className="text-xs text-muted-foreground mt-1">Participating farmers</p>
              </CardContent>
            </Card>
          </div>

          {/* Location Trends Chart */}
          <LineChart
            data={monthlyData.map((m) => ({
              name: m.month,
              Kangundo: m.kangundo,
              Kathiani: m.kathiani,
              Masinga: m.masinga,
              Yatta: m.yatta,
            }))}
            lines={[
              { dataKey: "Kangundo", name: "Kangundo", color: "#3B82F6" },
              { dataKey: "Kathiani", name: "Kathiani", color: "#22C55E" },
              { dataKey: "Masinga", name: "Masinga", color: "#F59E0B" },
              { dataKey: "Yatta", name: "Yatta", color: "#EF4444" },
            ]}
            title="Sales Trends by Location"
            description="Monthly sales volume by sub-county"
            height={300}
          />

          {/* Location Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Location</CardTitle>
              <CardDescription>Detailed sales breakdown by sub-county</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Sales (kg)</TableHead>
                    <TableHead>Total Value (KES)</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Active Farmers</TableHead>
                    <TableHead>Avg Price/Kg</TableHead>
                    <TableHead>Growth Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationSales.map((location) => (
                    <TableRow key={location.location}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{location.totalSales.toLocaleString()} kg</TableCell>
                      <TableCell className="font-medium">KES {location.totalValue.toLocaleString()}</TableCell>
                      <TableCell>{location.orderCount}</TableCell>
                      <TableCell>{location.activeFarmers}</TableCell>
                      <TableCell>KES {location.avgPricePerKg}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {location.growthRate > 0 ? (
                            <IconTrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <IconTrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={location.growthRate > 0 ? "text-green-600" : "text-red-600"}>
                            {location.growthRate > 0 ? "+" : ""}{location.growthRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sales Distribution Chart */}
          <HorizontalBarChart
            data={locationSales.map((l) => ({ name: l.location, value: l.totalSales }))}
            title="Sales Distribution by Location"
            description="Sales volume comparison across locations"
            color="#3B82F6"
            height={250}
            sorted={true}
            formatter={(value) => `${value} kg`}
          />
        </>
      )}

      {/* Stock Summary */}
      {reportType === "stock" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Current Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationStock.reduce((sum, l) => sum + l.currentStock, 0).toLocaleString()} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all centers</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Stock In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationStock.reduce((sum, l) => sum + l.stockIn, 0).toLocaleString()} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationStock.reduce((sum, l) => sum + l.stockOut, 0).toLocaleString()} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">This period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {locationStock.reduce((sum, l) => sum + l.capacity, 0).toLocaleString()} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">System capacity</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Distribution Chart */}
          <PieChart
            data={locationStock.map((l) => ({ name: l.location, value: l.currentStock }))}
            title="Stock Distribution by Location"
            description="Current stock levels by sub-county"
            height={300}
            showLegend={true}
          />

          {/* Location Stock Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock by Location</CardTitle>
              <CardDescription>Detailed stock breakdown by sub-county</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Current Stock (kg)</TableHead>
                    <TableHead>Stock In (kg)</TableHead>
                    <TableHead>Stock Out (kg)</TableHead>
                    <TableHead>Capacity (kg)</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Centers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locationStock.map((location) => (
                    <TableRow key={location.location}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{location.currentStock.toLocaleString()} kg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <IconTrendingUp className="h-3 w-3" />
                          <span>{location.stockIn.toLocaleString()} kg</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-orange-600">
                          <IconTrendingDown className="h-3 w-3" />
                          <span>{location.stockOut.toLocaleString()} kg</span>
                        </div>
                      </TableCell>
                      <TableCell>{location.capacity.toLocaleString()} kg</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{location.utilization}%</span>
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                location.utilization >= 80
                                  ? "bg-red-500"
                                  : location.utilization >= 60
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${location.utilization}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{location.centers} centers</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
