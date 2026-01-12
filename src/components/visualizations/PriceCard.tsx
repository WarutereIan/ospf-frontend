import { Card, CardContent } from "@/components/ui/card";
import { TrendArrow } from "./TrendArrow";
import { cn } from "@/lib/utils";

interface PriceCardProps {
  variety: string;
  price: number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  priceRange?: {
    min: number;
    max: number;
    current: number;
  };
  level?: "high" | "medium" | "low";
  className?: string;
}

const levelConfig = {
  high: {
    label: "High",
    color: "bg-green-500",
    fillPercent: 100,
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-500",
    fillPercent: 66,
  },
  low: {
    label: "Low",
    color: "bg-gray-400",
    fillPercent: 33,
  },
};

export function PriceCard({
  variety,
  price,
  trend,
  priceRange,
  level = "medium",
  className,
}: PriceCardProps) {
  const config = levelConfig[level];

  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{variety}</span>
            {trend && <TrendArrow value={trend.value} direction={trend.direction} />}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-2xl font-bold">KES {price}/kg</span>
            {priceRange && (
              <div className="flex-1 max-w-[200px]">
                <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("absolute left-0 top-0 h-full rounded-full", config.color)}
                    style={{ width: `${config.fillPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  ({config.label})
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
