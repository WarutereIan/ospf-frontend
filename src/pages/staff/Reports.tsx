import { useState, useEffect, useCallback, useRef } from "react";
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
import { ReportMetricVisualizations } from "@/components/reports/ReportMetricVisualizations";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { getSavedReportById, getSavedReports, type SavedReportListItem } from "@/services/analyticsService";
import { showSuccess, showError } from "@/lib/toast";
import { exportReportToPdf } from "@/lib/export-report-pdf";

/** Map backend trends to chart data { name, value, revenue?, orders? } */
function trendsToChartData(trends: Array<{ date?: string; revenue?: number; orders?: number; volume?: number }> | undefined) {
  if (!Array.isArray(trends) || trends.length === 0) {
    return [];
  }
  return trends.map((t) => ({
    name: t.date ? new Date(t.date).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : "",
    value: t.revenue ?? 0,
    revenue: t.revenue ?? 0,
    orders: t.orders ?? 0,
    volume: t.volume ?? 0,
  }));
}

const PARAMETER_SECTIONS = ["financial", "quality", "operational", "users", "geographic", "farmerGroups", "transactionEvidence"] as const;

/** Flatten a parameter object for CSV (key, value rows; skip nested arrays/objects or add sub-rows) */
function flattenParams(obj: Record<string, unknown> | null | undefined): string[][] {
  if (!obj || typeof obj !== "object") return [];
  const rows: string[][] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      if (Array.isArray((v as any)?.length) || (v as any)?.[0] != null) continue;
      rows.push([k, ""]);
      flattenParams(v as Record<string, unknown>).forEach((r) => rows.push(["", r[0], r[1]]));
      continue;
    }
    if (Array.isArray(v)) continue;
    rows.push([k, String(v)]);
  }
  return rows;
}

/** Build CSV from report payload (summary, trends, and framework parameter sections) */
function downloadReportAsCsv(payload: any, filename: string) {
  const rows: string[][] = [];
  if (payload.summary) {
    rows.push(["Summary", ""]);
    Object.entries(payload.summary).forEach(([k, v]) => {
      if (typeof v === "object" && v !== null && !Array.isArray(v)) return;
      rows.push([String(k), String(v)]);
    });
    rows.push([]);
  }
  for (const section of PARAMETER_SECTIONS) {
    if (payload[section] && typeof payload[section] === "object") {
      rows.push([section, ""]);
      flattenParams(payload[section]).forEach((r) => rows.push(r));
      rows.push([]);
    }
  }
  if (Array.isArray(payload.trends) && payload.trends.length > 0) {
    rows.push(["Date", "Revenue", "Orders", "Volume"]);
    payload.trends.forEach((t: any) => {
      rows.push([t.date || "", String(t.revenue ?? 0), String(t.orders ?? 0), String(t.volume ?? 0)]);
    });
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function StaffReports() {
  const { fetchReports, generateReportAction, isLoading } = useAnalytics();
  
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("month");
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [includeCharts, setIncludeCharts] = useState<"yes" | "no">("yes");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [savedReportsList, setSavedReportsList] = useState<SavedReportListItem[]>([]);
  const [loadingReportId, setLoadingReportId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [trendsChartData, setTrendsChartData] = useState<Array<{ name: string; value: number; revenue?: number; orders?: number }>>([]);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const loadSavedReportsList = useCallback(async () => {
    try {
      const list = await getSavedReports({ limit: 100 });
      setSavedReportsList(list);
    } catch {
      setSavedReportsList([]);
    }
  }, []);

  // Fetch saved/generated reports list on mount and keep context in sync
  useEffect(() => {
    loadSavedReportsList();
    fetchReports();
  }, [fetchReports, loadSavedReportsList]);

  // Fetch trends for chart preview on load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getTrends } = await import("@/services/analyticsService");
        const data = await getTrends({ timeRange: "month" });
        if (!cancelled && Array.isArray(data)) {
          setTrendsChartData(trendsToChartData(data));
        }
      } catch {
        if (!cancelled) setTrendsChartData([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleGenerateReport = async () => {
    if (!reportType) return;
    setIsGenerating(true);
    setGeneratedReport(null);
    try {
      const result = await generateReportAction(reportType, {
        timeRange: dateRange,
        format: exportFormat,
      });
      setGeneratedReport(result);
      setSelectedReportId(result?.id ?? null);
      await loadSavedReportsList();
      showSuccess("Report generated and saved. View it below or export.");
      if (result?.trends && result.trends.length > 0) {
        setTrendsChartData(trendsToChartData(result.trends));
      }
    } catch {
      showError("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectReport = async (id: string) => {
    setLoadingReportId(id);
    try {
      const payload = await getSavedReportById(id);
      if (payload) {
        setGeneratedReport(payload);
        setSelectedReportId(id);
        if (payload.trends && Array.isArray(payload.trends) && payload.trends.length > 0) {
          setTrendsChartData(trendsToChartData(payload.trends as any));
        }
      } else {
        showError("Report not found.");
      }
    } catch {
      showError("Failed to load report.");
    } finally {
      setLoadingReportId(null);
    }
  };

  const runPdfExport = useCallback((baseName: string) => {
    const el = reportContentRef.current;
    if (!el) {
      showError("Report content not ready. Ensure a report is loaded and charts are visible, then try again.");
      return;
    }
    setIsExportingPdf(true);
    exportReportToPdf(el, {
      filename: `${baseName}.pdf`,
      onStart: () => showSuccess("Generating PDF…"),
      onComplete: () => showSuccess("PDF downloaded."),
      onError: (err) => showError(err.message || "PDF export failed."),
    })
      .catch(() => showError("PDF export failed."))
      .finally(() => setIsExportingPdf(false));
  }, []);

  const handleExportReport = async (format: "pdf" | "excel" | "csv", reportId?: string, report?: any, name?: string) => {
    let data = report ?? generatedReport;
    let didLoadReport = false;
    // If export from list row and report not loaded, fetch by id
    if (!data && reportId) {
      try {
        data = await getSavedReportById(reportId);
        if (data) {
          setGeneratedReport(data);
          setSelectedReportId(reportId);
          didLoadReport = true;
        }
      } catch {
        showError("Failed to load report for export.");
        return;
      }
    }
    if (!data) {
      showError("No report loaded. Generate or select a report first.");
      return;
    }
    const baseName = name ?? (data.templateName || "report").replace(/\s+/g, "-") + "-" + new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      downloadReportAsCsv(data, baseName);
      showSuccess("Report downloaded as CSV.");
      return;
    }
    if (format === "pdf") {
      if (didLoadReport) {
        // Wait for report content and charts to render before capturing
        requestAnimationFrame(() => {
          setTimeout(() => runPdfExport(baseName), 400);
        });
      } else {
        runPdfExport(baseName);
      }
      return;
    }
    showSuccess(`Export as ${format.toUpperCase()} uses the same data; use CSV or PDF for now.`);
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

  // Chart data: from last generated report trends or from initial fetch
  const performanceData =
    trendsChartData.length > 0
      ? trendsChartData
      : [
          { name: "—", value: 0, revenue: 0, orders: 0 },
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
                <p className="text-sm text-muted-foreground">Saved Reports</p>
                <p className="text-2xl font-bold">{savedReportsList.length}</p>
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
                <p className="text-2xl font-bold">
                  {savedReportsList.filter((r) => new Date(r.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
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
                <p className="text-2xl font-bold">
                  {savedReportsList.filter((r) => {
                    const d = new Date(r.createdAt);
                    const n = new Date();
                    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
                  }).length}
                </p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Report Loaded</p>
                <p className="text-2xl font-bold">{generatedReport ? "Yes" : "—"}</p>
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
              <Select value={includeCharts} onValueChange={(v) => setIncludeCharts(v as "yes" | "no")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes — show chart preview on this page</SelectItem>
                  <SelectItem value="no">No — hide chart preview</SelectItem>
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

      {/* Generated Reports — list of saved reports; click to load content, export uses loaded data */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>Saved reports. Click a report to view it below; use export when a report is loaded.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedReportsList.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No reports yet. Generate a report above to save it here.</p>
          ) : (
            <div className="space-y-3">
              {savedReportsList.map((report) => {
                const params = report.parameters ?? {};
                const timeRange = (params as any).timeRange ?? "—";
                const generatedAt = report.createdAt
                  ? new Date(report.createdAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                  : "—";
                const isSelected = selectedReportId === report.id;
                const isLoading = loadingReportId === report.id;
                return (
                  <div
                    key={report.id}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{report.templateName}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span>Time range: {String(timeRange)}</span>
                        <span>Generated: {generatedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectReport(report.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? "Loading…" : "View"}
                      </Button>
                      {(["csv", "pdf", "excel"] as const).map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportReport(format, report.id, undefined, `${report.templateName.replace(/\s+/g, "-")}-${report.id.slice(0, 8)}`)}
                          title={`Export as ${format.toUpperCase()}`}
                        >
                          {getFormatIcon(format)}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report content for viewing and PDF export — header + all visualizations */}
      {generatedReport && includeCharts === "yes" && (
        <div
          ref={reportContentRef}
          className="report-pdf-content space-y-6 bg-white p-4 rounded-lg border"
          data-report-pdf
        >
          <Card className="print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {generatedReport.templateName ?? "Report"}
              </CardTitle>
              <CardDescription>
                Period: {(generatedReport.parameters as any)?.timeRange ?? "—"}
                {generatedReport.dateRange?.start && generatedReport.dateRange?.end && (
                  <> · {String(generatedReport.dateRange.start).slice(0, 10)} – {String(generatedReport.dateRange.end).slice(0, 10)}</>
                )}
                {" · "}
                Generated: {generatedReport.generatedAt ? new Date(generatedReport.generatedAt).toLocaleString() : "—"}
              </CardDescription>
            </CardHeader>
          </Card>
          <ReportMetricVisualizations report={generatedReport} includeCharts={true} />
        </div>
      )}

      {/* Chart preview when no report yet — single revenue line from initial trends or after generate */}
      {includeCharts === "yes" && !generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Chart Preview</CardTitle>
            <CardDescription>Revenue trend — generate a report to see full metric visualizations</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={performanceData}
              lines={[{ dataKey: "value", name: "Revenue", color: "#3B82F6" }]}
              title="Revenue (last 30 days or after report)"
              height={300}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
