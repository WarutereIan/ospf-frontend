import { useState, useEffect } from "react";
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
  const [stats, setStats] = useState<ProcurementStats>({
    volumeSourced: 0,
    volumeTarget: 0,
    volumeTrend: 0,
    avgPricePerKg: 0,
    priceTrend: 0,
    marketAvgPrice: 0,
    qualityAcceptance: 0,
    activeSuppliers: 0,
    deliveriesThisWeek: 0,
  });
  const [priceTrendData, setPriceTrendData] = useState<PriceTrendData[]>([]);
  const [sourcingMix, setSourcingMix] = useState<SourcingMixData[]>([]);
  const [topRegions, setTopRegions] = useState<SourcingRegion[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("q3");

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        volumeSourced: 24.5,
        volumeTarget: 37.5,
        volumeTrend: 12,
        avgPricePerKg: 38,
        priceTrend: -4,
        marketAvgPrice: 40,
        qualityAcceptance: 96.8,
        activeSuppliers: 6,
        deliveriesThisWeek: 2,
      });

      setPriceTrendData([
        { month: "Aug", yourPrice: 36, marketAvg: 42 },
        { month: "Sep", yourPrice: 37, marketAvg: 41 },
        { month: "Oct", yourPrice: 35, marketAvg: 40 },
        { month: "Nov", yourPrice: 35, marketAvg: 39 },
        { month: "Dec (Est)", yourPrice: 38, marketAvg: 40 },
      ]);

      setSourcingMix([
        { name: "Fresh Roots (Grade A)", value: 14.7, percentage: 60, color: "#FF8C00" },
        { name: "OFSP Flour", value: 6.125, percentage: 25, color: "#475569" },
        { name: "Vines/Planting", value: 3.675, percentage: 15, color: "#94A3B8" },
      ]);

      setTopRegions([
        { name: "Homa Bay", volume: 8.5, percentage: 35 },
        { name: "Migori", volume: 7.2, percentage: 29 },
        { name: "Kakamega", volume: 5.8, percentage: 24 },
        { name: "Bungoma", volume: 3.0, percentage: 12 },
      ]);

      setRecentDeliveries([
        {
          batchId: "BATCH-2024-001",
          supplier: "James Mutua",
          origin: "Kangundo",
          weight: 2500,
          grading: "92% Grade A",
          status: "on_route",
        },
        {
          batchId: "BATCH-2024-002",
          supplier: "Mary Wanjiku",
          origin: "Kathiani",
          weight: 1800,
          grading: "88% Grade A",
          status: "received",
        },
        {
          batchId: "BATCH-2024-003",
          supplier: "Peter Kamau",
          origin: "Masinga",
          weight: 3200,
          grading: "95% Grade A",
          status: "inspecting",
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

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
