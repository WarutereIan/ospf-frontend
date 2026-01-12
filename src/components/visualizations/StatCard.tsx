import { Card, CardContent } from "@/components/ui/card";
import { TrendArrow } from "./TrendArrow";

interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatCard({ label, value, description, trend, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            {description && <div className="h-3 w-40 bg-muted animate-pulse rounded" />}
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {trend && <TrendArrow value={trend.value} direction={trend.direction} />}
              </div>
              {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            {icon && <div className="rounded-full p-3 bg-primary/10">{icon}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
