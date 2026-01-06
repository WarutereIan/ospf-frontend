import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconChartLine,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface GrowthDataPoint {
  period: string; // "Week 1", "Jan 2024", etc.
  value: number;
  peerAverage?: number;
}

interface GrowthChartProps {
  title: string;
  data: GrowthDataPoint[];
  metric: "sales" | "revenue" | "orders" | "rating";
  period: "weekly" | "monthly" | "quarterly";
  onPeriodChange?: (period: "weekly" | "monthly" | "quarterly") => void;
  showPeerComparison?: boolean;
}

export function GrowthChart({
  title,
  data,
  metric,
  period,
  onPeriodChange,
  showPeerComparison = true,
}: GrowthChartProps) {
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.value, d.peerAverage || 0))
  );

  const getMetricLabel = () => {
    switch (metric) {
      case "sales":
        return "Sales (kg)";
      case "revenue":
        return "Revenue (KES)";
      case "orders":
        return "Orders";
      case "rating":
        return "Rating";
      default:
        return "";
    }
  };

  const formatValue = (value: number) => {
    switch (metric) {
      case "revenue":
        return `KES ${value.toLocaleString()}`;
      case "rating":
        return value.toFixed(1);
      default:
        return value.toLocaleString();
    }
  };

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (data.length < 2) return null;
    const first = data[0].value;
    const last = data[data.length - 1].value;
    if (first === 0) return null;
    return ((last - first) / first) * 100;
  };

  const growth = calculateGrowth();
  const isPositive = growth !== null && growth > 0;
  const isNegative = growth !== null && growth < 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconChartLine className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{getMetricLabel()}</CardDescription>
          </div>
          {onPeriodChange && (
            <Select
              value={period}
              onValueChange={(value) =>
                onPeriodChange(value as "weekly" | "monthly" | "quarterly")
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Growth Indicator */}
        {growth !== null && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                isPositive && "bg-green-100 text-green-800",
                isNegative && "bg-red-100 text-red-800",
                !isPositive && !isNegative && "bg-gray-100 text-gray-800"
              )}
            >
              {isPositive ? (
                <IconTrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <IconTrendingDown className="h-3 w-3" />
              ) : (
                <IconMinus className="h-3 w-3" />
              )}
              {isPositive ? "+" : ""}
              {growth.toFixed(1)}% growth
            </Badge>
            <span className="text-sm text-muted-foreground">
              {period === "weekly" && "this week"}
              {period === "monthly" && "this month"}
              {period === "quarterly" && "this quarter"}
            </span>
          </div>
        )}

        {/* Chart Visualization */}
        <div className="space-y-4">
          {data.map((point, index) => {
            const barHeight = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
            const peerBarHeight =
              showPeerComparison && point.peerAverage && maxValue > 0
                ? (point.peerAverage / maxValue) * 100
                : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-end justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-end gap-1 h-32">
                      {/* Peer Average Bar (if shown) */}
                      {showPeerComparison && point.peerAverage !== undefined && (
                        <div
                          className="flex-1 bg-muted rounded-t"
                          style={{ height: `${peerBarHeight}%` }}
                          title={`Peer Average: ${formatValue(point.peerAverage)}`}
                        />
                      )}
                      {/* Your Value Bar */}
                      <div
                        className={cn(
                          "flex-1 rounded-t transition-all",
                          showPeerComparison && point.peerAverage !== undefined
                            ? "bg-primary"
                            : "bg-primary"
                        )}
                        style={{ height: `${barHeight}%` }}
                        title={`Your ${getMetricLabel()}: ${formatValue(point.value)}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{formatValue(point.value)}</span>
                      {showPeerComparison && point.peerAverage !== undefined && (
                        <span className="text-muted-foreground">
                          Avg: {formatValue(point.peerAverage)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">{point.period}</p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {showPeerComparison && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Your Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-muted rounded" />
              <span>Peer Average</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
