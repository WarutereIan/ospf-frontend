import { useState, useEffect } from "react";
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
  const [reportType, setReportType] = useState<"sales" | "stock">("sales");
  const [dateRange, setDateRange] = useState<string>("month");
  const [locationSales, setLocationSales] = useState<LocationSales[]>([]);
  const [locationStock, setLocationStock] = useState<LocationStock[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyLocationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setIsLoading(true);
    setTimeout(() => {
      setLocationSales([
        {
          location: "Kangundo",
          subCounty: "Kangundo",
          totalSales: 15000,
          totalValue: 525000,
          orderCount: 450,
          activeFarmers: 320,
          avgPricePerKg: 35,
          growthRate: 12.5,
        },
        {
          location: "Kathiani",
          subCounty: "Kathiani",
          totalSales: 12000,
          totalValue: 420000,
          orderCount: 380,
          activeFarmers: 280,
          avgPricePerKg: 35,
          growthRate: 8.3,
        },
        {
          location: "Masinga",
          subCounty: "Masinga",
          totalSales: 10000,
          totalValue: 350000,
          orderCount: 320,
          activeFarmers: 240,
          avgPricePerKg: 35,
          growthRate: 15.2,
        },
        {
          location: "Yatta",
          subCounty: "Yatta",
          totalSales: 8000,
          totalValue: 280000,
          orderCount: 250,
          activeFarmers: 180,
          avgPricePerKg: 35,
          growthRate: 5.8,
        },
      ]);

      setLocationStock([
        {
          location: "Kangundo",
          subCounty: "Kangundo",
          currentStock: 5000,
          stockIn: 1200,
          stockOut: 800,
          capacity: 10000,
          utilization: 50,
          centers: 3,
        },
        {
          location: "Kathiani",
          subCounty: "Kathiani",
          currentStock: 3200,
          stockIn: 800,
          stockOut: 500,
          capacity: 8000,
          utilization: 40,
          centers: 2,
        },
        {
          location: "Masinga",
          subCounty: "Masinga",
          currentStock: 2500,
          stockIn: 600,
          stockOut: 400,
          capacity: 7000,
          utilization: 36,
          centers: 2,
        },
        {
          location: "Yatta",
          subCounty: "Yatta",
          currentStock: 2000,
          stockIn: 500,
          stockOut: 300,
          capacity: 6000,
          utilization: 33,
          centers: 2,
        },
      ]);

      // Monthly data for trends
      setMonthlyData([
        { month: "Jan", kangundo: 12000, kathiani: 10000, masinga: 8000, yatta: 6000 },
        { month: "Feb", kangundo: 12500, kathiani: 10500, masinga: 8500, yatta: 6500 },
        { month: "Mar", kangundo: 13000, kathiani: 11000, masinga: 9000, yatta: 7000 },
        { month: "Apr", kangundo: 13500, kathiani: 11200, masinga: 9200, yatta: 7200 },
        { month: "May", kangundo: 14000, kathiani: 11500, masinga: 9500, yatta: 7500 },
        { month: "Jun", kangundo: 15000, kathiani: 12000, masinga: 10000, yatta: 8000 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [dateRange, reportType]);

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
