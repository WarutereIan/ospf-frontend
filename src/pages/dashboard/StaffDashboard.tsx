import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconSettings,
  IconChartBar,
  IconFileText,
  IconDatabase,
  IconShield,
} from "@tabler/icons-react";
import {
  StatCard,
  ProgressBar,
  LineChart,
  Sparkline,
  SlopeChart,
  SankeyChart,
  GeographicMap,
} from "@/components/visualizations";

interface ProgramIndicator {
  name: string;
  current: number;
  target: number;
  unit?: string;
}

interface BeneficiaryGrowth {
  month: string;
  farmers: number;
}

interface SparklineData {
  label: string;
  value: number;
  data: Array<{ name: string; value: number }>;
  color?: string;
}

interface OutcomeData {
  category: string;
  before: number;
  after: number;
}

export function StaffDashboard() {
  const [programIndicators, setProgramIndicators] = useState<ProgramIndicator[]>([]);
  const [beneficiaryGrowth, setBeneficiaryGrowth] = useState<BeneficiaryGrowth[]>([]);
  const [sparklineData, setSparklineData] = useState<SparklineData[]>([]);
  const [outcomeData, setOutcomeData] = useState<OutcomeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      // Program indicators
      setProgramIndicators([
        { name: "Beneficiaries", current: 1500, target: 2000, unit: "farmers" },
        { name: "Volume (tonnes)", current: 85, target: 100, unit: "tons" },
        { name: "Quality (Gr A)", current: 92, target: 80, unit: "%" },
        { name: "Income increase", current: 60, target: 50, unit: "%" },
      ]);

      // Beneficiary growth (cumulative)
      setBeneficiaryGrowth([
        { month: "Jan", farmers: 800 },
        { month: "Feb", farmers: 900 },
        { month: "Mar", farmers: 1000 },
        { month: "Apr", farmers: 1100 },
        { month: "May", farmers: 1200 },
        { month: "Jun", farmers: 1300 },
        { month: "Jul", farmers: 1400 },
        { month: "Aug", farmers: 1500 },
      ]);

      // Sparkline data for indicators
      setSparklineData([
        {
          label: "Farmers",
          value: 1500,
          data: [
            { name: "1", value: 800 },
            { name: "2", value: 900 },
            { name: "3", value: 1000 },
            { name: "4", value: 1100 },
            { name: "5", value: 1200 },
            { name: "6", value: 1300 },
            { name: "7", value: 1400 },
            { name: "8", value: 1500 },
          ],
          color: "#3B82F6",
        },
        {
          label: "Quality",
          value: 82,
          data: [
            { name: "1", value: 75 },
            { name: "2", value: 78 },
            { name: "3", value: 80 },
            { name: "4", value: 81 },
            { name: "5", value: 82 },
            { name: "6", value: 82 },
            { name: "7", value: 82 },
            { name: "8", value: 82 },
          ],
          color: "#22C55E",
        },
        {
          label: "Centres",
          value: 8,
          data: [
            { name: "1", value: 4 },
            { name: "2", value: 5 },
            { name: "3", value: 6 },
            { name: "4", value: 7 },
            { name: "5", value: 7 },
            { name: "6", value: 8 },
            { name: "7", value: 8 },
            { name: "8", value: 8 },
          ],
          color: "#8B5CF6",
        },
        {
          label: "Volume",
          value: 45,
          data: [
            { name: "1", value: 20 },
            { name: "2", value: 25 },
            { name: "3", value: 30 },
            { name: "4", value: 35 },
            { name: "5", value: 40 },
            { name: "6", value: 42 },
            { name: "7", value: 44 },
            { name: "8", value: 45 },
          ],
          color: "#F59E0B",
        },
        {
          label: "Income",
          value: 25,
          data: [
            { name: "1", value: 10 },
            { name: "2", value: 15 },
            { name: "3", value: 18 },
            { name: "4", value: 20 },
            { name: "5", value: 22 },
            { name: "6", value: 23 },
            { name: "7", value: 24 },
            { name: "8", value: 25 },
          ],
          color: "#10B981",
        },
        {
          label: "Trans.",
          value: 2340,
          data: [
            { name: "1", value: 1000 },
            { name: "2", value: 1200 },
            { name: "3", value: 1500 },
            { name: "4", value: 1800 },
            { name: "5", value: 2000 },
            { name: "6", value: 2200 },
            { name: "7", value: 2300 },
            { name: "8", value: 2340 },
          ],
          color: "#EF4444",
        },
      ]);

      // Outcome comparison data
      setOutcomeData([
        { category: "Income", before: 45, after: 65 },
        { category: "Quality", before: 32, after: 82 },
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Project Staff Dashboard (M&E)</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitoring and evaluation of program indicators and outcomes
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/reports">
            <Button size="sm" variant="outline">
              <IconFileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link to="/dashboard/settings">
            <Button size="sm">
              <IconSettings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Program Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Program Indicators</CardTitle>
          <CardDescription>Progress towards program targets</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {programIndicators.map((indicator, index) => {
                const percentage = (indicator.current / indicator.target) * 100;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{indicator.name}</span>
                      <span className="text-muted-foreground">
                        {indicator.current.toLocaleString()}
                        {indicator.unit ? ` ${indicator.unit}` : ""} of{" "}
                        {indicator.target.toLocaleString()}
                        {indicator.unit ? ` ${indicator.unit}` : ""} target
                      </span>
                    </div>
                    <ProgressBar
                      value={percentage}
                      maxValue={100}
                      color={percentage >= 100 ? "success" : percentage >= 75 ? "warning" : "default"}
                      size="lg"
                      showValue={false}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {percentage.toFixed(0)}% of target
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficiary Growth & Geographic Reach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart
          data={beneficiaryGrowth.map((b) => ({ name: b.month, farmers: b.farmers }))}
          lines={[
            {
              dataKey: "farmers",
              name: "Total Beneficiaries",
              color: "#22C55E",
            },
          ]}
          title="Beneficiary Growth"
          description="Cumulative farmer registration over time"
          height={300}
        />

        <GeographicMap
          title="Geographic Reach"
          description="Visual map of aggregation centers in Machakos County"
          height={300}
          activeCoverage={65}
          targetCoverage={35}
        />
      </div>

      {/* Indicator Sparklines */}
      <Card>
        <CardHeader>
          <CardTitle>Indicator Sparklines</CardTitle>
          <CardDescription>All KPIs at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sparklineData.map((sparkline, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {sparkline.label}
                    </span>
                    <span className="text-lg font-bold">
                      {sparkline.value.toLocaleString()}
                      {sparkline.label === "Quality" || sparkline.label === "Income"
                        ? "%"
                        : sparkline.label === "Volume"
                        ? "t"
                        : ""}
                    </span>
                  </div>
                  <div className="h-12">
                    <Sparkline data={sparkline.data} color={sparkline.color} height={48} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outcome Comparison & Value Chain Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SlopeChart
          data={outcomeData}
          title="Outcome Comparison"
          description="Before and after program implementation"
          height={300}
          beforeLabel="Before"
          afterLabel="After"
          formatter={(value) => `${value}%`}
        />

        <SankeyChart
          nodes={[
            { name: "Farmers", value: 1500, color: "#3B82F6" },
            { name: "Centres", value: 45, color: "#22C55E" },
            { name: "Buyers", value: 25, color: "#F59E0B" },
          ]}
          links={[
            { source: "Farmers", target: "Centres", value: 45 },
            { source: "Centres", target: "Buyers", value: 25 },
          ]}
          title="Value Chain Flow"
          description="Flow of produce from farmers through centers to buyers"
          height={300}
        />
      </div>
    </div>
  );
}
