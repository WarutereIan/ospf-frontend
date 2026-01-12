import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FunnelStage {
  name: string;
  count: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  description?: string;
  className?: string;
}

export function FunnelChart({ stages, title, description, className }: FunnelChartProps) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  const maxWidth = 100; // Maximum width percentage

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const width = (stage.count / maxCount) * maxWidth;
            const color = stage.color || "#3B82F6";
            const leftOffset = (maxWidth - width) / 2;

            return (
              <div key={stage.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{stage.name}</span>
                  <span className="text-sm font-bold">{stage.count}</span>
                </div>
                <div className="relative h-8">
                  <div
                    className="absolute rounded-md transition-all duration-300"
                    style={{
                      left: `${leftOffset}%`,
                      width: `${width}%`,
                      height: "100%",
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
