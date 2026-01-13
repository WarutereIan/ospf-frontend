import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconFileText,
  IconDownload,
  IconCalendar,
  IconChartBar,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFileCode,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Reports() {
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("month");
  const [subCountyFilter, setSubCountyFilter] = useState<string>("all");
  const [farmerGroupFilter, setFarmerGroupFilter] = useState<string>("all");
  const [buyerTypeFilter, setBuyerTypeFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<string>("excel");

  const reportTypes = [
    { value: "farmer-performance", label: "Farmer Performance Report" },
    { value: "sales-summary", label: "Sales Summary Report" },
    { value: "order-analysis", label: "Order Analysis Report" },
    { value: "revenue-breakdown", label: "Revenue Breakdown" },
    { value: "center-performance", label: "Aggregation Center Performance" },
    { value: "advisory-impact", label: "Advisory Impact Report" },
  ];

  const handleGenerateReport = () => {
    // TODO: Implement report generation
    console.log("Generating report:", {
      reportType,
      dateRange,
      subCountyFilter,
      farmerGroupFilter,
      buyerTypeFilter,
      exportFormat,
    });
    alert(`Generating ${reportType} report in ${exportFormat.toUpperCase()} format...`);
  };

  const handleExport = (format: string) => {
    // TODO: Implement export
    alert(`Exporting report in ${format.toUpperCase()} format...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Reports</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Generate and download various reports
        </p>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Report Type</label>
              <Select value={reportType} onValueChange={setReportType} className="flex-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange} className="flex-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <Label className="w-32 flex-shrink-0">Start Date</Label>
                <Input type="date" className="flex-1" />
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32 flex-shrink-0">End Date</Label>
                <Input type="date" className="flex-1" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Sub-County Filter</label>
              <Select value={subCountyFilter} onValueChange={setSubCountyFilter} className="flex-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Counties</SelectItem>
                  <SelectItem value="kangundo">Kangundo</SelectItem>
                  <SelectItem value="kathiani">Kathiani</SelectItem>
                  <SelectItem value="masinga">Masinga</SelectItem>
                  <SelectItem value="yatta">Yatta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Farmer Group Filter</label>
              <Select value={farmerGroupFilter} onValueChange={setFarmerGroupFilter} className="flex-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="group1">Group 1</SelectItem>
                  <SelectItem value="group2">Group 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Buyer Type Filter</label>
              <Select value={buyerTypeFilter} onValueChange={setBuyerTypeFilter} className="flex-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buyer Types</SelectItem>
                  <SelectItem value="retailer">Retailer</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="processor">Processor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium w-32 flex-shrink-0">Export Format</label>
              <div className="flex gap-2 flex-1">
                <Button
                  variant={exportFormat === "excel" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExportFormat("excel")}
                >
                  <IconFileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant={exportFormat === "pdf" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExportFormat("pdf")}
                >
                  <IconFileTypePdf className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setExportFormat("csv")}
                >
                  <IconFileCode className="mr-2 h-4 w-4" />
                  CSV
                </Button>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerateReport} className="w-full" disabled={!reportType}>
            <IconFileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      {/* Charts/Graphs Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Report Visualization</CardTitle>
          <CardDescription>Charts and graphs for data insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <div className="text-center">
              <IconChartBar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Chart visualization would go here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Integration with charting library (e.g., Recharts, Chart.js) for trends, comparisons, and forecasts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Farmer Performance Report - January 2024",
                type: "farmer-performance",
                generated: "2024-01-15",
                size: "2.4 MB",
              },
              {
                name: "Sales Summary - Q4 2023",
                type: "sales-summary",
                generated: "2024-01-01",
                size: "1.8 MB",
              },
              {
                name: "Order Analysis - December 2023",
                type: "order-analysis",
                generated: "2023-12-31",
                size: "3.1 MB",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconFileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Generated on {report.generated} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport("excel")}
                    title="Download as Excel"
                  >
                    <IconFileSpreadsheet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport("pdf")}
                    title="Download as PDF"
                  >
                    <IconFileTypePdf className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport("csv")}
                    title="Download as CSV"
                  >
                    <IconFileCode className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
