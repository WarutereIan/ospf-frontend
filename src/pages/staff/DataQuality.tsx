import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/visualizations";
import {
  IconDatabase,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
} from "@tabler/icons-react";

interface DataQualityMetric {
  category: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  status: "excellent" | "good" | "fair" | "poor";
  issues: string[];
}

interface DataIssue {
  id: string;
  type: "missing" | "invalid" | "duplicate" | "inconsistent";
  entity: string;
  field: string;
  recordId: string;
  severity: "high" | "medium" | "low";
  description: string;
  detectedAt: string;
}

export function DataQuality() {
  const [metrics, setMetrics] = useState<DataQualityMetric[]>([]);
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setMetrics([
        {
          category: "User Data",
          totalRecords: 1500,
          validRecords: 1425,
          invalidRecords: 75,
          completeness: 95,
          accuracy: 98,
          consistency: 97,
          status: "excellent",
          issues: ["Missing email addresses (5%)", "Invalid phone numbers (2%)"],
        },
        {
          category: "Transaction Data",
          totalRecords: 2340,
          validRecords: 2280,
          invalidRecords: 60,
          completeness: 97,
          accuracy: 99,
          consistency: 98,
          status: "excellent",
          issues: ["Missing timestamps (1%)", "Incomplete buyer information (1.5%)"],
        },
        {
          category: "Produce Listings",
          totalRecords: 850,
          validRecords: 765,
          invalidRecords: 85,
          completeness: 90,
          accuracy: 92,
          consistency: 88,
          status: "good",
          issues: ["Missing quality grades (8%)", "Incomplete location data (2%)"],
        },
        {
          category: "Order Data",
          totalRecords: 1200,
          validRecords: 1080,
          invalidRecords: 120,
          completeness: 90,
          accuracy: 95,
          consistency: 93,
          status: "good",
          issues: ["Missing delivery addresses (7%)", "Incomplete payment records (3%)"],
        },
        {
          category: "Stock Records",
          totalRecords: 450,
          validRecords: 405,
          invalidRecords: 45,
          completeness: 90,
          accuracy: 97,
          consistency: 95,
          status: "good",
          issues: ["Missing batch numbers (8%)", "Incomplete quality check data (2%)"],
        },
      ]);

      setIssues([
        {
          id: "ISS001",
          type: "missing",
          entity: "User",
          field: "email",
          recordId: "U001",
          severity: "medium",
          description: "User John Mutua missing email address",
          detectedAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "ISS002",
          type: "invalid",
          entity: "Transaction",
          field: "amount",
          recordId: "TXN123",
          severity: "high",
          description: "Transaction amount is negative (-5000)",
          detectedAt: "2024-01-15T09:30:00Z",
        },
        {
          id: "ISS003",
          type: "duplicate",
          entity: "Produce",
          field: "listing_id",
          recordId: "PRD001",
          severity: "medium",
          description: "Duplicate produce listing detected",
          detectedAt: "2024-01-15T08:15:00Z",
        },
        {
          id: "ISS004",
          type: "inconsistent",
          entity: "Order",
          field: "status",
          recordId: "ORD456",
          severity: "high",
          description: "Order marked as delivered but payment not recorded",
          detectedAt: "2024-01-14T16:20:00Z",
        },
        {
          id: "ISS005",
          type: "missing",
          entity: "Stock",
          field: "batch_number",
          recordId: "STK789",
          severity: "low",
          description: "Stock record missing batch number",
          detectedAt: "2024-01-14T14:00:00Z",
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: DataQualityMetric["status"]) => {
    switch (status) {
      case "excellent":
        return "success";
      case "good":
        return "default";
      case "fair":
        return "warning";
      case "poor":
        return "error";
    }
  };

  const getSeverityColor = (severity: DataIssue["severity"]) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
    }
  };

  const overallQuality =
    metrics.length > 0
      ? Math.round(
          metrics.reduce((sum, m) => sum + (m.completeness + m.accuracy + m.consistency) / 3, 0) /
            metrics.length
        )
      : 0;

  const criticalIssues = issues.filter((i) => i.severity === "high").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Data Quality & Accountability</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor data quality, identify issues, and ensure accountability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Data Quality Score</CardTitle>
          <CardDescription>System-wide data quality assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallQuality}%</span>
              <Badge
                variant="outline"
                className={
                  overallQuality >= 95
                    ? "bg-green-100 text-green-800"
                    : overallQuality >= 85
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {overallQuality >= 95 ? "Excellent" : overallQuality >= 85 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <ProgressBar value={overallQuality} maxValue={100} color="success" size="lg" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">
                  {metrics.reduce((sum, m) => sum + m.totalRecords, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Valid Records</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.reduce((sum, m) => sum + m.validRecords, 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Issues Found</p>
                <p className="text-2xl font-bold text-red-600">{issues.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Metrics by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality by Category</CardTitle>
          <CardDescription>Detailed quality metrics for each data category</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {metrics.map((metric, index) => {
                const avgScore = Math.round((metric.completeness + metric.accuracy + metric.consistency) / 3);
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{metric.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {metric.validRecords.toLocaleString()} / {metric.totalRecords.toLocaleString()} valid
                          records
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          metric.status === "excellent"
                            ? "bg-green-100 text-green-800"
                            : metric.status === "good"
                            ? "bg-blue-100 text-blue-800"
                            : metric.status === "fair"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completeness</span>
                          <span className="font-medium">{metric.completeness}%</span>
                        </div>
                        <ProgressBar value={metric.completeness} maxValue={100} color="default" size="sm" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy</span>
                          <span className="font-medium">{metric.accuracy}%</span>
                        </div>
                        <ProgressBar value={metric.accuracy} maxValue={100} color="default" size="sm" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Consistency</span>
                          <span className="font-medium">{metric.consistency}%</span>
                        </div>
                        <ProgressBar value={metric.consistency} maxValue={100} color="default" size="sm" />
                      </div>
                    </div>
                    {metric.issues.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Known Issues:</p>
                        <div className="flex flex-wrap gap-2">
                          {metric.issues.map((issue, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Issues */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Quality Issues</CardTitle>
              <CardDescription>Identified data quality problems requiring attention</CardDescription>
            </div>
            {criticalIssues > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-800">
                {criticalIssues} Critical
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {issue.type}
                        </Badge>
                        <span className="text-sm font-medium">{issue.entity}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{issue.field}</span>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Record ID: {issue.recordId} • Detected: {new Date(issue.detectedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <IconCheck className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No data quality issues found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
