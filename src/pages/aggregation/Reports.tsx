import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconDownload,
  IconFileText,
  IconCalendar,
  IconTrendingUp,
  IconTrendingDown,
  IconPackage,
  IconClipboardCheck,
  IconUsers,
} from "@tabler/icons-react";
import { LineChart, PieChart } from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface DailySummary {
  date: string;
  stockIn: number;
  stockOut: number;
  qualityChecks: number;
  farmersServed: number;
  buyersServed: number;
  netStock: number;
}

interface WeeklySummary {
  week: string;
  totalStockIn: number;
  totalStockOut: number;
  avgDailyIn: number;
  avgDailyOut: number;
  qualityChecks: number;
  farmersServed: number;
  buyersServed: number;
}

export function AggregationReports() {
  const { transactions, fetchTransactions, stats, fetchStats, qualityChecks, fetchQualityChecks, selectedCenter } = useAggregation();
  const { performanceMetrics, fetchPerformanceMetrics } = useAnalytics();
  
  const [reportType, setReportType] = useState<"daily" | "weekly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedWeek, setSelectedWeek] = useState("2024-W03");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data on mount and when report type changes
  useEffect(() => {
    fetchTransactions();
    fetchStats();
    fetchQualityChecks();
    fetchPerformanceMetrics();
  }, [fetchTransactions, fetchStats, fetchQualityChecks, fetchPerformanceMetrics]);

  // Calculate daily summaries from transactions
  const dailySummaries: DailySummary[] = (() => {
    const summaries: DailySummary[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayTransactions = transactions.filter((t) => {
        const txnDate = new Date(t.createdAt).toISOString().split("T")[0];
        return txnDate === dateStr;
      });

      const stockIn = dayTransactions
        .filter((t) => t.type === "stock_in")
        .reduce((sum, t) => sum + t.quantity, 0);
      const stockOut = dayTransactions
        .filter((t) => t.type === "stock_out")
        .reduce((sum, t) => sum + t.quantity, 0);
      
      const dayQualityChecks = qualityChecks.filter((qc) => {
        const qcDate = new Date(qc.checkedAt || qc.createdAt).toISOString().split("T")[0];
        return qcDate === dateStr;
      });

      summaries.push({
        date: dateStr,
        stockIn,
        stockOut,
        qualityChecks: dayQualityChecks.length,
        farmersServed: new Set(dayTransactions.filter((t) => t.farmerId).map((t) => t.farmerId)).size,
        buyersServed: new Set(dayTransactions.filter((t) => t.buyerId).map((t) => t.buyerId)).size,
        netStock: 0,
      });
    }
    
    // Calculate net stock
    summaries.forEach((summary, index) => {
      if (index === 0) {
        summary.netStock = summary.stockIn - summary.stockOut;
      } else {
        summary.netStock = summaries[index - 1].netStock + summary.stockIn - summary.stockOut;
      }
    });
    
    return summaries;
  })();

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  // Calculate weekly summaries
  const weeklySummaries: WeeklySummary[] = (() => {
    const summaries: WeeklySummary[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekNum = getWeekNumber(weekStart);
      
      const weekTransactions = transactions.filter((t) => {
        const txnDate = new Date(t.createdAt);
        return txnDate >= weekStart && txnDate <= weekEnd;
      });

      const totalStockIn = weekTransactions
        .filter((t) => t.type === "stock_in")
        .reduce((sum, t) => sum + t.quantity, 0);
      const totalStockOut = weekTransactions
        .filter((t) => t.type === "stock_out")
        .reduce((sum, t) => sum + t.quantity, 0);

      const weekQualityChecks = qualityChecks.filter((qc) => {
        const qcDate = new Date(qc.checkedAt || qc.createdAt);
        return qcDate >= weekStart && qcDate <= weekEnd;
      });

      summaries.push({
        week: `Week ${weekNum}`,
        totalStockIn,
        totalStockOut,
        avgDailyIn: totalStockIn / 7,
        avgDailyOut: totalStockOut / 7,
        qualityChecks: weekQualityChecks.length,
        farmersServed: new Set(weekTransactions.filter((t) => t.farmerId).map((t) => t.farmerId)).size,
        buyersServed: new Set(weekTransactions.filter((t) => t.buyerId).map((t) => t.buyerId)).size,
      });
    }
    return summaries;
  })();

  const handleExport = (format: "csv" | "pdf") => {
    // TODO: Implement export functionality
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
  };

  const selectedDailySummary = dailySummaries.find((s) => s.date === selectedDate);
  const selectedWeeklySummary = weeklySummaries.find((s) => s.week === selectedWeek);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Daily and weekly summaries for county and project teams
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <IconFileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Label>Report Type:</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as "daily" | "weekly")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
            {reportType === "daily" && (
              <>
                <Label>Select Date:</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
              </>
            )}
            {reportType === "weekly" && (
              <>
                <Label>Select Week:</Label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weeklySummaries.map((summary) => (
                      <SelectItem key={summary.week} value={summary.week}>
                        {summary.week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Report */}
      {reportType === "daily" && selectedDailySummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedDailySummary.stockIn} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <IconTrendingUp className="h-3 w-3 inline mr-1" />
                  Incoming produce
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedDailySummary.stockOut} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <IconTrendingDown className="h-3 w-3 inline mr-1" />
                  Dispatched produce
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedDailySummary.qualityChecks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <IconClipboardCheck className="h-3 w-3 inline mr-1" />
                  Verifications completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedDailySummary.netStock} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <IconPackage className="h-3 w-3 inline mr-1" />
                  End of day balance
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Farmers Served</CardTitle>
                <CardDescription>Number of farmers who delivered produce</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{selectedDailySummary.farmersServed}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <IconUsers className="h-4 w-4 inline mr-1" />
                  Active farmers today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Buyers Served</CardTitle>
                <CardDescription>Number of buyers who received produce</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{selectedDailySummary.buyersServed}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <IconUsers className="h-4 w-4 inline mr-1" />
                  Active buyers today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Trends Chart */}
          <LineChart
            data={dailySummaries.map((s) => ({
              name: new Date(s.date).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
              stockIn: s.stockIn,
              stockOut: s.stockOut,
              netStock: s.netStock,
            }))}
            lines={[
              { dataKey: "stockIn", name: "Stock In", color: "#22C55E" },
              { dataKey: "stockOut", name: "Stock Out", color: "#F59E0B" },
              { dataKey: "netStock", name: "Net Stock", color: "#3B82F6" },
            ]}
            title="7-Day Stock Movement Trend"
            description="Daily stock in, out, and net balance"
            height={300}
          />

          {/* Daily Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Summary Table</CardTitle>
              <CardDescription>Last 7 days of activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Stock In (kg)</TableHead>
                    <TableHead>Stock Out (kg)</TableHead>
                    <TableHead>Net Stock (kg)</TableHead>
                    <TableHead>Quality Checks</TableHead>
                    <TableHead>Farmers</TableHead>
                    <TableHead>Buyers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailySummaries.map((summary) => (
                    <TableRow key={summary.date}>
                      <TableCell className="font-medium">
                        {new Date(summary.date).toLocaleDateString("en-KE", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{summary.stockIn.toLocaleString()}</TableCell>
                      <TableCell>{summary.stockOut.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={summary.netStock > 0 ? "outline" : "secondary"}>
                          {summary.netStock.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>{summary.qualityChecks}</TableCell>
                      <TableCell>{summary.farmersServed}</TableCell>
                      <TableCell>{summary.buyersServed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Weekly Report */}
      {reportType === "weekly" && selectedWeeklySummary && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Stock In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedWeeklySummary.totalStockIn.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {selectedWeeklySummary.avgDailyIn} kg/day
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Stock Out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedWeeklySummary.totalStockOut.toLocaleString()} kg</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {selectedWeeklySummary.avgDailyOut} kg/day
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedWeeklySummary.qualityChecks}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total verifications
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Farmers Served</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedWeeklySummary.farmersServed}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique farmers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends Chart */}
          <LineChart
            data={weeklySummaries.map((s) => ({
              name: s.week,
              totalStockIn: s.totalStockIn,
              totalStockOut: s.totalStockOut,
            }))}
            lines={[
              { dataKey: "totalStockIn", name: "Total Stock In", color: "#22C55E" },
              { dataKey: "totalStockOut", name: "Total Stock Out", color: "#F59E0B" },
            ]}
            title="4-Week Stock Movement Trend"
            description="Weekly totals for stock in and out"
            height={300}
          />

          {/* Weekly Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary Table</CardTitle>
              <CardDescription>Last 4 weeks of activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week</TableHead>
                    <TableHead>Total Stock In (kg)</TableHead>
                    <TableHead>Total Stock Out (kg)</TableHead>
                    <TableHead>Avg Daily In (kg)</TableHead>
                    <TableHead>Avg Daily Out (kg)</TableHead>
                    <TableHead>Quality Checks</TableHead>
                    <TableHead>Farmers</TableHead>
                    <TableHead>Buyers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklySummaries.map((summary) => (
                    <TableRow key={summary.week}>
                      <TableCell className="font-medium">{summary.week}</TableCell>
                      <TableCell>{summary.totalStockIn.toLocaleString()}</TableCell>
                      <TableCell>{summary.totalStockOut.toLocaleString()}</TableCell>
                      <TableCell>{summary.avgDailyIn.toLocaleString()}</TableCell>
                      <TableCell>{summary.avgDailyOut.toLocaleString()}</TableCell>
                      <TableCell>{summary.qualityChecks}</TableCell>
                      <TableCell>{summary.farmersServed}</TableCell>
                      <TableCell>{summary.buyersServed}</TableCell>
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
