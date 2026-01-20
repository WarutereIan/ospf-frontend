import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IconFileText,
  IconDownload,
  IconCalendar,
  IconChartBar,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFileCode,
  IconTrendingUp,
  IconUsers,
  IconCurrency,
  IconPackage,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart } from "@/components/visualizations";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import type { ReportTemplate } from "@/types/analytics";

export function StaffReports() {
  const { reportTemplates, fetchReportTemplates, generateReportAction, isLoading } = useAnalytics();
  
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("month");
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch report templates on mount
  useEffect(() => {
    fetchReportTemplates();
  }, [fetchReportTemplates]);

  // Mock data removed - using context data

  const handleGenerateReport = () => {
    if (!reportType) return;
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Report generated successfully! Downloading ${exportFormat.toUpperCase()}...`);
    }, 2000);
  };

  const handleQuickDownload = (templateId: string, format: "pdf" | "excel" | "csv") => {
    const template = reportTemplates.find((t) => t.id === templateId);
    if (template) {
      alert(`Downloading ${template.name} in ${format.toUpperCase()} format...`);
    }
  };

  const getCategoryColor = (category: ReportTemplate["category"]) => {
    switch (category) {
      case "performance":
        return "bg-blue-100 text-blue-800";
      case "financial":
        return "bg-green-100 text-green-800";
      case "operational":
        return "bg-purple-100 text-purple-800";
      case "compliance":
        return "bg-orange-100 text-orange-800";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <IconFileTypePdf className="h-4 w-4" />;
      case "excel":
        return <IconFileSpreadsheet className="h-4 w-4" />;
      case "csv":
        return <IconFileCode className="h-4 w-4" />;
      default:
        return <IconFileText className="h-4 w-4" />;
    }
  };

  // Sample chart data for preview
  const performanceData = [
    { name: "Jan", value: 65, target: 70 },
    { name: "Feb", value: 72, target: 75 },
    { name: "Mar", value: 78, target: 80 },
    { name: "Apr", value: 82, target: 85 },
    { name: "May", value: 88, target: 90 },
    { name: "Jun", value: 92, target: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Generate, download, and export comprehensive reports and charts
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Reports</p>
                <p className="text-2xl font-bold">{reportTemplates.length}</p>
              </div>
              <IconFileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Generated Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <IconDownload className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <IconChartBar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Create a custom report with specific parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue>
                    {reportType ? "Selected" : "Select report type"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="operational">Operational Report</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                  <SelectItem value="user-activity">User Activity Report</SelectItem>
                  <SelectItem value="transaction-evidence">Transaction Evidence Report</SelectItem>
                  <SelectItem value="data-quality">Data Quality Report</SelectItem>
                  <SelectItem value="partner-engagement">Partner Engagement Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <IconFileTypePdf className="h-4 w-4" />
                      PDF
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <IconFileSpreadsheet className="h-4 w-4" />
                      Excel
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <IconFileCode className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Include Charts</Label>
              <Select defaultValue="yes">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerateReport} disabled={!reportType || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <IconChartBar className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <IconFileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Quick access to frequently used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <Badge variant="outline">{template.frequency}</Badge>
                    </div>
                    {template.lastGenerated && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Generated:</span>
                        <span>{template.lastGenerated}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Available Formats:</span>
                      <div className="flex gap-2">
                        {template.availableFormats.filter(f => f !== "json").map((format) => (
                          <Button
                            key={format}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickDownload(template.id, format as "pdf" | "excel" | "csv")}
                            title={`Download as ${format.toUpperCase()}`}
                          >
                            {getFormatIcon(format)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Chart Preview</CardTitle>
          <CardDescription>Sample visualization available in reports</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={performanceData}
            lines={[
              { dataKey: "value", name: "Actual", color: "#3B82F6" },
              { dataKey: "target", name: "Target", color: "#22C55E" },
            ]}
            title="Performance vs Targets"
            description="Progress tracking against project targets"
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}
