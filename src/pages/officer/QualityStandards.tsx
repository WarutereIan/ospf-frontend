import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconClipboardCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconDownload,
  IconChartBar,
  IconMapPin,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, PieChart, HorizontalBarChart } from "@/components/visualizations";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { getInventoryBatches } from "@/services/aggregationService";
import type { InventoryItem } from "@/types/aggregation";

interface QualityMetric {
  period: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  rejectionRate: number;
  complianceScore: number;
}

interface CenterQuality {
  centerId: string;
  centerName: string;
  location: string;
  gradeADistribution: number;
  gradeBDistribution: number;
  gradeCDistribution: number;
  rejectionRate: number;
  complianceScore: number;
  totalChecks: number;
  lastCheckDate: string;
}

interface StandardCompliance {
  standard: string;
  category: "size" | "color" | "damage" | "storage" | "packaging";
  requirement: string;
  complianceRate: number;
  violations: number;
  status: "compliant" | "warning" | "non_compliant";
}

export function QualityStandards() {
  const { qualityChecks, fetchQualityChecks, centers, fetchCenters, isLoading } = useAggregation();
  const { user } = useAuth();
  const { profiles, fetchProfiles } = useProfile();
  const [inventoryBatches, setInventoryBatches] = useState<(InventoryItem & { stockTransaction: any })[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  
  const [dateRange, setDateRange] = useState<string>("month");
  const [subCountyFilter, setSubCountyFilter] = useState<string>("all");
  const [centerFilter, setCenterFilter] = useState<string>("all");

  // Get officer's jurisdiction
  const officerProfile = useMemo(() => {
    return profiles.find(p => p.userId === user?.id);
  }, [profiles, user?.id]);

  // Get date range boundaries
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

  // Fetch data on mount
  useEffect(() => {
    fetchCenters();
    if (user?.id) {
      fetchProfiles({ role: "county_officer" });
    }
  }, [fetchCenters, fetchProfiles, user?.id]);

  // Fetch quality checks and inventory batches with filters when filters change
  useEffect(() => {
    const filters: any = {};
    
    // Date range filtering
    filters.dateFrom = dateRangeBounds.start.toISOString();
    filters.dateTo = dateRangeBounds.end.toISOString();
    
    // Jurisdiction filtering
    const profSubCounty = (officerProfile as { subCounty?: string } | undefined)?.subCounty;
    if (profSubCounty) {
      filters.subCounty = profSubCounty;
    }
    
    // Sub-county filter
    if (subCountyFilter !== "all") {
      filters.subCounty = subCountyFilter;
    }
    
    // Center type filter
    if (centerFilter === "main") {
      filters.centerType = "main";
    } else if (centerFilter === "satellite") {
      filters.centerType = "satellite";
    }
    
    fetchQualityChecks(filters);
    
    // Fetch inventory batches for compliance checking
    setInventoryLoading(true);
    getInventoryBatches(filters)
      .then(data => {
        setInventoryBatches(data);
      })
      .catch(err => {
        console.error('Error fetching inventory batches:', err);
      })
      .finally(() => {
        setInventoryLoading(false);
      });
  }, [fetchQualityChecks, dateRangeBounds, officerProfile, subCountyFilter, centerFilter]);

  // Build compliance data using ONLY inventory batches (stock in flows)
  // We derive grading/quality metrics from the associated stock transactions
  const complianceData = useMemo(() => {
    const data: Array<{
      id: string;
      batchId?: string;
      qualityGrade: string;
      weightRange?: string;
      colorIntensity?: number;
      damageScore?: number;
      freshness?: string;
      qualityScore?: number;
      checkedAt?: Date | string;
      createdAt?: Date | string;
      centerId: string;
    }> = [];

    // Debug: Log inventory batches to understand the data structure
    console.log('[Compliance Debug] Total inventory batches:', inventoryBatches.length);
    const batchesWithStockTx = inventoryBatches.filter(b => b.stockTransaction);
    console.log('[Compliance Debug] Batches with stock transaction:', batchesWithStockTx.length);
    if (inventoryBatches.length > 0) {
      console.log('[Compliance Debug] Sample inventory batch:', inventoryBatches[0]);
      if (inventoryBatches[0]?.stockTransaction) {
        console.log('[Compliance Debug] Sample stock transaction:', inventoryBatches[0].stockTransaction);
      }
    }

    // Use inventory batches (from stock transactions) as the sole source of compliance data
    inventoryBatches.forEach(batch => {
      const st = batch.stockTransaction;
      if (!st) return;

      const physicalCondition = st.physicalCondition as string | undefined;
      const freshness = st.freshness as string | undefined;
      const colorIntensity = typeof st.colorIntensity === "number" ? st.colorIntensity : undefined;

      // Derive a damage score (0-10, higher = better condition) from physical condition
      let damageScore: number | undefined;
      if (physicalCondition) {
        switch (physicalCondition) {
          case "excellent":
            damageScore = 10;
            break;
          case "good":
            damageScore = 8;
            break;
          case "fair":
            damageScore = 6;
            break;
          case "poor":
            damageScore = 3;
            break;
          default:
            damageScore = undefined;
        }
      }

      // Derive an overall quality score (0-100) similar to the quality check screen logic
      let qualityScore: number | undefined;
      if (typeof colorIntensity === "number") {
        let score = colorIntensity * 10; // base score from color (1-10 → 0-100)

        // Adjust based on physical condition
        if (physicalCondition === "poor") score -= 30;
        else if (physicalCondition === "fair") score -= 15;
        else if (physicalCondition === "good") score -= 5;

        // Adjust based on freshness
        if (freshness === "aging") score -= 25;
        else if (freshness === "moderate") score -= 10;

        score = Math.max(0, Math.min(100, score));
        qualityScore = score;
      }

      data.push({
        id: `batch-${batch.batchId || batch.id}`,
        batchId: batch.batchId,
        qualityGrade: batch.qualityGrade,
        weightRange: st.weightRange || undefined,
        colorIntensity,
        damageScore,
        freshness,
        qualityScore,
        checkedAt: batch.stockInDate,
        createdAt: st.createdAt,
        centerId: batch.centerId,
      });
    });

    return data;
  }, [inventoryBatches]);

  // Get unique sub-counties from centers
  const subCounties = useMemo(() => {
    const uniqueSubCounties = new Set<string>();
    centers.forEach(center => {
      if (center.subCounty) {
        uniqueSubCounties.add(center.subCounty);
      }
    });
    return Array.from(uniqueSubCounties).sort();
  }, [centers]);

  // Calculate quality metrics over time periods
  const qualityMetrics: QualityMetric[] = useMemo(() => {
    const periods: QualityMetric[] = [];
    const periodCount = dateRange === "week" ? 7 : dateRange === "month" ? 4 : dateRange === "quarter" ? 3 : 12;
    const periodType = dateRange === "week" ? "day" : dateRange === "year" ? "month" : "week";

    for (let i = periodCount - 1; i >= 0; i--) {
      const periodEnd = new Date(dateRangeBounds.end);
      const periodStart = new Date(dateRangeBounds.end);
      
      if (periodType === "day") {
        periodStart.setDate(periodStart.getDate() - i);
        periodEnd.setDate(periodEnd.getDate() - i + 1);
      } else if (periodType === "week") {
        periodStart.setDate(periodStart.getDate() - (i * 7));
        periodEnd.setDate(periodEnd.getDate() - ((i - 1) * 7));
      } else if (periodType === "month") {
        periodStart.setMonth(periodStart.getMonth() - i);
        periodEnd.setMonth(periodEnd.getMonth() - i + 1);
      }

      const periodChecks = complianceData.filter(item => {
        const checkDate = new Date(item.checkedAt || item.createdAt || 0);
        return checkDate >= periodStart && checkDate < periodEnd;
      });

      const total = periodChecks.length;
      const gradeA = periodChecks.filter(item => item.qualityGrade === "A").length;
      const gradeB = periodChecks.filter(item => item.qualityGrade === "B").length;
      const gradeC = periodChecks.filter(item => item.qualityGrade === "C").length;
      // Use derived quality score to approximate rejection
      const qualityScoreChecks = periodChecks.filter(item => typeof item.qualityScore === "number");
      const rejected = qualityScoreChecks.filter(item => (item.qualityScore || 0) < 70).length;
      const avgQualityScore = qualityScoreChecks.length > 0
        ? qualityScoreChecks.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / qualityScoreChecks.length
        : 0;

      periods.push({
        period: periodType === "day" 
          ? periodStart.toLocaleDateString("en-US", { weekday: "short" })
          : periodType === "month"
          ? periodStart.toLocaleDateString("en-US", { month: "short" })
          : `Week ${periodCount - i}`,
        gradeA: total > 0 ? (gradeA / total) * 100 : 0,
        gradeB: total > 0 ? (gradeB / total) * 100 : 0,
        gradeC: total > 0 ? (gradeC / total) * 100 : 0,
        rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
        complianceScore: avgQualityScore,
      });
    }

    return periods;
  }, [complianceData, dateRangeBounds, dateRange]);

  // Calculate center quality performance
  const centerQuality: CenterQuality[] = useMemo(() => {
    const centerMap = new Map<string, typeof complianceData>();
    
    complianceData.forEach(item => {
      const existing = centerMap.get(item.centerId) || [];
      existing.push(item);
      centerMap.set(item.centerId, existing);
    });

    return Array.from(centerMap.entries()).map(([centerId, checks]) => {
      const center = centers.find(c => c.id === centerId);
      const total = checks.length;
      const gradeA = checks.filter(item => item.qualityGrade === "A").length;
      const gradeB = checks.filter(item => item.qualityGrade === "B").length;
      const gradeC = checks.filter(item => item.qualityGrade === "C").length;
      // For compliance data, we don't have approved/status, so we'll use quality score or grade
      const rejected = checks.filter(item => item.qualityScore !== undefined && item.qualityScore < 70).length;
      const qualityScoreChecks = checks.filter(item => item.qualityScore !== undefined);
      const avgQualityScore = qualityScoreChecks.length > 0
        ? qualityScoreChecks.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / qualityScoreChecks.length
        : 0;
      
      const lastCheck = checks.sort((a, b) => 
        new Date(b.checkedAt || b.createdAt || 0).getTime() - 
        new Date(a.checkedAt || a.createdAt || 0).getTime()
      )[0];

      return {
        centerId,
        centerName: center?.name || "Unknown",
        location: center?.subCounty || center?.location || "Unknown",
        gradeADistribution: total > 0 ? (gradeA / total) * 100 : 0,
        gradeBDistribution: total > 0 ? (gradeB / total) * 100 : 0,
        gradeCDistribution: total > 0 ? (gradeC / total) * 100 : 0,
        rejectionRate: total > 0 ? (rejected / total) * 100 : 0,
        complianceScore: avgQualityScore,
        totalChecks: total,
        lastCheckDate: lastCheck 
          ? new Date(lastCheck.checkedAt || lastCheck.createdAt || 0).toLocaleDateString()
          : "N/A",
      };
    }).sort((a, b) => b.totalChecks - a.totalChecks);
  }, [complianceData, centers]);

  // Calculate standards compliance using inventory batches with stock transaction data
  const standardsCompliance: StandardCompliance[] = useMemo(() => {
    const standards: StandardCompliance[] = [];
    const total = complianceData.length;

    // Debug: Log compliance data to understand what we're working with
    console.log('[Compliance Debug] Total compliance data items:', total);
    console.log('[Compliance Debug] Sample data:', complianceData.slice(0, 3));
    console.log('[Compliance Debug] Items with weightRange:', complianceData.filter(item => item.weightRange).length);
    console.log('[Compliance Debug] Items with colorIntensity:', complianceData.filter(item => item.colorIntensity !== undefined).length);
    console.log('[Compliance Debug] Items with damageScore:', complianceData.filter(item => item.damageScore !== undefined).length);
    console.log('[Compliance Debug] Items with freshness:', complianceData.filter(item => item.freshness).length);
    console.log('[Compliance Debug] Items with qualityScore:', complianceData.filter(item => item.qualityScore !== undefined).length);

    if (total === 0) return standards;

    // Size Standard (weightRange)
    // Compliant: large or extra_large weight range
    const sizeChecks = complianceData.filter(item => item.weightRange);
    const sizeCompliant = sizeChecks.filter(item => 
      item.weightRange === "large" || item.weightRange === "extra_large"
    ).length;
    const sizeComplianceRate = sizeChecks.length > 0 ? (sizeCompliant / sizeChecks.length) * 100 : 0;
    standards.push({
      standard: "Size Standard",
      category: "size",
      requirement: "Large or Extra Large weight range",
      complianceRate: Math.round(sizeComplianceRate * 10) / 10,
      violations: sizeChecks.length - sizeCompliant,
      status: sizeComplianceRate >= 95 ? "compliant" : sizeComplianceRate >= 85 ? "warning" : "non_compliant",
    });

    // Color Standard (colorIntensity)
    // Compliant: color intensity >= 7 (out of 10)
    const colorChecks = complianceData.filter(item => item.colorIntensity !== undefined);
    const colorCompliant = colorChecks.filter(item => item.colorIntensity! >= 7).length;
    const colorComplianceRate = colorChecks.length > 0 ? (colorCompliant / colorChecks.length) * 100 : 0;
    standards.push({
      standard: "Color Intensity",
      category: "color",
      requirement: "Color intensity score ≥ 7/10",
      complianceRate: Math.round(colorComplianceRate * 10) / 10,
      violations: colorChecks.length - colorCompliant,
      status: colorComplianceRate >= 95 ? "compliant" : colorComplianceRate >= 85 ? "warning" : "non_compliant",
    });

    // Physical Condition Standard (damageScore)
    // Compliant: damage score >= 8 (derived from physicalCondition: excellent=10, good=8, fair=6, poor=3)
    const damageChecks = complianceData.filter(item => item.damageScore !== undefined);
    const damageCompliant = damageChecks.filter(item => item.damageScore! >= 8).length;
    const damageComplianceRate = damageChecks.length > 0 ? (damageCompliant / damageChecks.length) * 100 : 0;
    standards.push({
      standard: "Physical Condition",
      category: "damage",
      requirement: "Good or Excellent condition (score ≥ 8/10)",
      complianceRate: Math.round(damageComplianceRate * 10) / 10,
      violations: damageChecks.length - damageCompliant,
      status: damageComplianceRate >= 95 ? "compliant" : damageComplianceRate >= 85 ? "warning" : "non_compliant",
    });

    // Freshness Standard (freshness)
    // Compliant: very_fresh or fresh
    const freshnessChecks = complianceData.filter(item => item.freshness);
    const freshnessCompliant = freshnessChecks.filter(item => 
      item.freshness === "very_fresh" || item.freshness === "fresh"
    ).length;
    const freshnessComplianceRate = freshnessChecks.length > 0 ? (freshnessCompliant / freshnessChecks.length) * 100 : 0;
    standards.push({
      standard: "Freshness",
      category: "storage",
      requirement: "Very Fresh or Fresh condition",
      complianceRate: Math.round(freshnessComplianceRate * 10) / 10,
      violations: freshnessChecks.length - freshnessCompliant,
      status: freshnessComplianceRate >= 95 ? "compliant" : freshnessComplianceRate >= 85 ? "warning" : "non_compliant",
    });

    // Overall Quality Score Standard (derived from color, physical condition, freshness)
    // Compliant: quality score >= 80 (out of 100)
    const qualityScoreChecks = complianceData.filter(item => item.qualityScore !== undefined);
    const qualityScoreCompliant = qualityScoreChecks.filter(item => item.qualityScore! >= 80).length;
    // Fix: Use qualityScoreChecks.length as denominator, not total
    const qualityScoreComplianceRate = qualityScoreChecks.length > 0 
      ? (qualityScoreCompliant / qualityScoreChecks.length) * 100 
      : 0;
    standards.push({
      standard: "Overall Quality Score",
      category: "storage",
      requirement: "Quality score ≥ 80/100",
      complianceRate: Math.round(qualityScoreComplianceRate * 10) / 10,
      violations: qualityScoreChecks.length - qualityScoreCompliant,
      status: qualityScoreComplianceRate >= 95 ? "compliant" : qualityScoreComplianceRate >= 85 ? "warning" : "non_compliant",
    });

    return standards;
  }, [complianceData]);

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case "non_compliant":
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      default:
        return null;
    }
  };

  const handleExport = () => {
    // TODO: Implement export
    alert("Exporting quality standards report...");
  };

  const overallCompliance = standardsCompliance.length > 0
    ? standardsCompliance.reduce((sum, s) => sum + s.complianceRate, 0) / standardsCompliance.length
    : 0;
  const avgRejectionRate = centerQuality.length > 0
    ? centerQuality.reduce((sum, c) => sum + c.rejectionRate, 0) / centerQuality.length
    : 0;
  const avgGradeA = centerQuality.length > 0
    ? centerQuality.reduce((sum, c) => sum + c.gradeADistribution, 0) / centerQuality.length
    : 0;
  const totalQualityChecks = centerQuality.reduce((sum, c) => sum + c.totalChecks, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Quality Standards & Compliance</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor quality assurance and compliance with agricultural standards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
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
            <div className="flex-1">
              <Label>Sub-County</Label>
              <Select value={subCountyFilter} onValueChange={setSubCountyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sub-Counties</SelectItem>
                {subCounties.map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Aggregation Center</Label>
              <Select value={centerFilter} onValueChange={setCenterFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Centers</SelectItem>
                  <SelectItem value="main">Main Centers Only</SelectItem>
                  <SelectItem value="satellite">Satellite Centers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallCompliance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <IconTrendingUp className="h-3 w-3 inline mr-1" />
              +2.5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Grade A</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGradeA.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Premium quality produce</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRejectionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <IconTrendingDown className="h-3 w-3 inline mr-1" />
              -0.3% improvement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalQualityChecks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total checks performed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ) : qualityMetrics.length > 0 ? (
          <LineChart
            data={qualityMetrics.map((m) => ({
              name: m.period,
              gradeA: Math.round(m.gradeA * 10) / 10,
              gradeB: Math.round(m.gradeB * 10) / 10,
              gradeC: Math.round(m.gradeC * 10) / 10,
              complianceScore: Math.round(m.complianceScore * 10) / 10,
            }))}
            lines={[
              { dataKey: "gradeA", name: "Grade A", color: "#22C55E" },
              { dataKey: "gradeB", name: "Grade B", color: "#F59E0B" },
              { dataKey: "gradeC", name: "Grade C", color: "#EF4444" },
              { dataKey: "complianceScore", name: "Compliance Score", color: "#3B82F6" },
            ]}
            title="Quality Distribution Trends"
            description="Grade distribution and compliance over time"
            height={300}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No quality data available for the selected period
              </div>
            </CardContent>
          </Card>
        )}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            </CardContent>
          </Card>
        ) : centerQuality.length > 0 ? (
          <PieChart
            data={[
              { name: "Grade A", value: Math.round(avgGradeA * 10) / 10 },
              { name: "Grade B", value: Math.round((centerQuality.reduce((sum, c) => sum + c.gradeBDistribution, 0) / centerQuality.length || 0) * 10) / 10 },
              { name: "Grade C", value: Math.round((centerQuality.reduce((sum, c) => sum + c.gradeCDistribution, 0) / centerQuality.length || 0) * 10) / 10 },
            ]}
            title="Current Quality Distribution"
            description="Overall grade distribution"
            height={300}
            showLegend={true}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No quality data available
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Standards Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Standards Compliance</CardTitle>
          <CardDescription>Compliance rates for each quality standard</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Standard</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Compliance Rate</TableHead>
                <TableHead>Violations</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standardsCompliance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No quality checks data available for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                standardsCompliance.map((standard) => (
                <TableRow key={standard.standard}>
                  <TableCell className="font-medium">{standard.standard}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{standard.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{standard.requirement}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{standard.complianceRate}%</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            standard.complianceRate >= 95
                              ? "bg-green-500"
                              : standard.complianceRate >= 85
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${standard.complianceRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{standard.violations}</span>
                  </TableCell>
                  <TableCell>{getComplianceStatusBadge(standard.status)}</TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Center Quality Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Center Quality Performance</CardTitle>
          <CardDescription>Quality metrics by aggregation center</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Center</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Grade A</TableHead>
                <TableHead>Grade B</TableHead>
                <TableHead>Grade C</TableHead>
                <TableHead>Rejection Rate</TableHead>
                <TableHead>Compliance Score</TableHead>
                <TableHead>Total Checks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {centerQuality.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No quality data available for the selected filters
                  </TableCell>
                </TableRow>
              ) : (
                centerQuality.map((center) => (
                <TableRow key={center.centerId}>
                  <TableCell className="font-medium">{center.centerName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{center.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">{center.gradeADistribution}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-yellow-100 text-yellow-800">{center.gradeBDistribution}%</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-orange-100 text-orange-800">{center.gradeCDistribution}%</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={center.rejectionRate > 2 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                      {center.rejectionRate}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{center.complianceScore}%</span>
                      {center.complianceScore >= 95 ? (
                        <IconCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{center.totalChecks}</TableCell>
                </TableRow>
              ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
