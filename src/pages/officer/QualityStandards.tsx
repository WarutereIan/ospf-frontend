import { useState, useEffect } from "react";
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
  const [dateRange, setDateRange] = useState<string>("month");
  const [subCountyFilter, setSubCountyFilter] = useState<string>("all");
  const [centerFilter, setCenterFilter] = useState<string>("all");
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [centerQuality, setCenterQuality] = useState<CenterQuality[]>([]);
  const [standardsCompliance, setStandardsCompliance] = useState<StandardCompliance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setIsLoading(true);
    setTimeout(() => {
      // Quality metrics over time
      setQualityMetrics([
        { period: "Jan", gradeA: 75, gradeB: 20, gradeC: 5, rejectionRate: 2.5, complianceScore: 92 },
        { period: "Feb", gradeA: 78, gradeB: 18, gradeC: 4, rejectionRate: 2.1, complianceScore: 94 },
        { period: "Mar", gradeA: 80, gradeB: 17, gradeC: 3, rejectionRate: 1.8, complianceScore: 95 },
        { period: "Apr", gradeA: 82, gradeB: 15, gradeC: 3, rejectionRate: 1.5, complianceScore: 96 },
        { period: "May", gradeA: 85, gradeB: 12, gradeC: 3, rejectionRate: 1.2, complianceScore: 97 },
        { period: "Jun", gradeA: 83, gradeB: 14, gradeC: 3, rejectionRate: 1.4, complianceScore: 96 },
      ]);

      // Center quality performance
      setCenterQuality([
        {
          centerId: "AC001",
          centerName: "Kangundo Main",
          location: "Kangundo",
          gradeADistribution: 85,
          gradeBDistribution: 12,
          gradeCDistribution: 3,
          rejectionRate: 1.2,
          complianceScore: 97,
          totalChecks: 450,
          lastCheckDate: new Date().toISOString(),
        },
        {
          centerId: "AC002",
          centerName: "Kathiani Main",
          location: "Kathiani",
          gradeADistribution: 80,
          gradeBDistribution: 16,
          gradeCDistribution: 4,
          rejectionRate: 1.8,
          complianceScore: 95,
          totalChecks: 320,
          lastCheckDate: new Date().toISOString(),
        },
        {
          centerId: "AC003",
          centerName: "Masinga Main",
          location: "Masinga",
          gradeADistribution: 78,
          gradeBDistribution: 18,
          gradeCDistribution: 4,
          rejectionRate: 2.1,
          complianceScore: 94,
          totalChecks: 280,
          lastCheckDate: new Date().toISOString(),
        },
        {
          centerId: "AC004",
          centerName: "Yatta Main",
          location: "Yatta",
          gradeADistribution: 82,
          gradeBDistribution: 15,
          gradeCDistribution: 3,
          rejectionRate: 1.5,
          complianceScore: 96,
          totalChecks: 240,
          lastCheckDate: new Date().toISOString(),
        },
      ]);

      // Standards compliance
      setStandardsCompliance([
        {
          standard: "Size Standard",
          category: "size",
          requirement: "Tubers: 100-300g per piece",
          complianceRate: 95,
          violations: 25,
          status: "compliant",
        },
        {
          standard: "Color Standard",
          category: "color",
          requirement: "Deep orange flesh, no discoloration",
          complianceRate: 92,
          violations: 40,
          status: "compliant",
        },
        {
          standard: "Damage Standard",
          category: "damage",
          requirement: "Max 5% surface damage",
          complianceRate: 88,
          violations: 60,
          status: "warning",
        },
        {
          standard: "Storage Standard",
          category: "storage",
          requirement: "Temperature: 15-20°C, Humidity: 60-70%",
          complianceRate: 85,
          violations: 75,
          status: "warning",
        },
        {
          standard: "Packaging Standard",
          category: "packaging",
          requirement: "Clean, food-grade packaging",
          complianceRate: 98,
          violations: 10,
          status: "compliant",
        },
      ]);

      setIsLoading(false);
    }, 1000);
  }, [dateRange, subCountyFilter, centerFilter]);

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

  const overallCompliance = standardsCompliance.reduce((sum, s) => sum + s.complianceRate, 0) / standardsCompliance.length || 0;
  const avgRejectionRate = centerQuality.reduce((sum, c) => sum + c.rejectionRate, 0) / centerQuality.length || 0;
  const avgGradeA = centerQuality.reduce((sum, c) => sum + c.gradeADistribution, 0) / centerQuality.length || 0;

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
                  <SelectItem value="kangundo">Kangundo</SelectItem>
                  <SelectItem value="kathiani">Kathiani</SelectItem>
                  <SelectItem value="masinga">Masinga</SelectItem>
                  <SelectItem value="yatta">Yatta</SelectItem>
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
              {centerQuality.reduce((sum, c) => sum + c.totalChecks, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total checks performed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={qualityMetrics.map((m) => ({
            name: m.period,
            gradeA: m.gradeA,
            gradeB: m.gradeB,
            gradeC: m.gradeC,
            complianceScore: m.complianceScore,
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
        <PieChart
          data={[
            { name: "Grade A", value: avgGradeA },
            { name: "Grade B", value: 100 - avgGradeA - (100 - avgGradeA) * 0.2 },
            { name: "Grade C", value: (100 - avgGradeA) * 0.2 },
          ]}
          title="Current Quality Distribution"
          description="Overall grade distribution"
          height={300}
          showLegend={true}
        />
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
              {standardsCompliance.map((standard) => (
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
              ))}
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
              {centerQuality.map((center) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
