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
import { useStaff } from "@/contexts/StaffContext";

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
  const { filteredDataQualityIssues, fetchDataQualityIssues, resolveIssue, isLoading } = useStaff();
  
  const [metrics, setMetrics] = useState<DataQualityMetric[]>([]);

  // Fetch data quality issues on mount
  useEffect(() => {
    fetchDataQualityIssues();
  }, [fetchDataQualityIssues]);

  // Calculate metrics from issues
  const issues = filteredDataQualityIssues;
  
  // TODO: Calculate metrics from issues data - this is a placeholder
  useEffect(() => {
    // Calculate metrics based on issues
    if (issues.length > 0) {
      // Group issues by entityType to create metrics
      const entityTypes = Array.from(new Set(issues.map(i => i.entityType)));
      const calculatedMetrics: DataQualityMetric[] = entityTypes.map((entityType: string) => {
        const entityIssues = issues.filter(i => i.entityType === entityType);
        const totalRecords = entityIssues.length * 10; // Placeholder calculation
        const invalidRecords = entityIssues.length;
        const validRecords = totalRecords - invalidRecords;
        const completeness = totalRecords > 0 ? Math.round((validRecords / totalRecords) * 100) : 100;
        
        return {
          category: entityType,
          totalRecords,
          validRecords,
          invalidRecords,
          completeness,
          accuracy: 95, // Placeholder
          consistency: 90, // Placeholder
          status: completeness >= 95 ? "excellent" : completeness >= 85 ? "good" : completeness >= 70 ? "fair" : "poor",
          issues: entityIssues.map(i => i.description),
        };
      });
      setMetrics(calculatedMetrics);
    }
  }, [issues]);

  // Mock data removed - using context data

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
                        <Badge variant="outline" className={getSeverityColor(issue.severity === "critical" ? "high" : issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {issue.type}
                        </Badge>
                        <span className="text-sm font-medium">{issue.entity || issue.entityType}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{issue.field}</span>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {issue.recordId && `Record ID: ${issue.recordId} • `}Detected: {new Date(issue.detectedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        if (confirm(`Resolve issue: ${issue.description}?`)) {
                          try {
                            await resolveIssue(issue.id, "Resolved by staff");
                          } catch (error) {
                            console.error("Failed to resolve issue:", error);
                            alert("Failed to resolve issue. Please try again.");
                          }
                        }
                      }}
                    >
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
