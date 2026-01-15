import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgingDay {
  day: number;
  status: "fresh" | "aging" | "critical";
}

interface BatchAging {
  batchId: string;
  days: AgingDay[];
}

interface AgingHeatmapProps {
  batches: BatchAging[];
  title?: string;
  description?: string;
  className?: string;
}

const getStatusColor = (status: "fresh" | "aging" | "critical") => {
  switch (status) {
    case "fresh":
      return "bg-green-500";
    case "aging":
      return "bg-yellow-500";
    case "critical":
      return "bg-red-500";
  }
};

const getStatusEmoji = (status: "fresh" | "aging" | "critical") => {
  switch (status) {
    case "fresh":
      return "🟢";
    case "aging":
      return "🟡";
    case "critical":
      return "🔴";
  }
};

export function AgingHeatmap({
  batches,
  title,
  description,
  className,
}: AgingHeatmapProps) {
  const days = ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7+"];

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm font-medium text-muted-foreground">Batch</div>
              {days.map((day) => (
                <div key={day} className="text-xs text-center text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {batches.map((batch) => (
                <div key={batch.batchId} className="grid grid-cols-8 gap-2 items-center">
                  <div className="text-sm font-medium">{batch.batchId}</div>
                  {days.map((_, dayIndex) => {
                    const dayData = batch.days.find((d) => {
                      if (dayIndex < 6) {
                        return d.day === dayIndex + 1;
                      } else {
                        return d.day >= 7;
                      }
                    });
                    const status = dayData?.status || null;

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "h-8 rounded flex items-center justify-center text-xs",
                          status
                            ? `${getStatusColor(status)} text-white`
                            : "bg-gray-100 text-gray-400"
                        )}
                        title={status ? `${days[dayIndex]}: ${status}` : `${days[dayIndex]}: N/A`}
                      >
                        {status ? getStatusEmoji(status) : "-"}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

