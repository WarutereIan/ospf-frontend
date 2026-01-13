import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  label?: string;
  showValue?: boolean;
  color?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg" | "mini";
  className?: string;
}

const colorMap = {
  default: "#3B82F6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#06B6D4",
};

const sizeMap = {
  sm: 6,
  md: 8,
  lg: 12,
  mini: 4,
};

export function ProgressBar({
  value,
  maxValue = 100,
  label,
  showValue = false,
  color = "default",
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const remaining = 100 - percentage;

  // Data for stacked bar chart: [completed, remaining]
  const data = [
    {
      name: "progress",
      completed: percentage,
      remaining: remaining,
    },
  ];

  const barHeight = sizeMap[size];
  const barColor = colorMap[color];

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-foreground">
              {value} / {maxValue}
            </span>
          )}
        </div>
      )}
      <div style={{ height: `${barHeight}px` }} className="w-full rounded-full overflow-hidden bg-muted">
        <ResponsiveContainer width="100%" height={barHeight}>
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={0}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis type="category" dataKey="name" hide width={0} />
            <Bar dataKey="completed" stackId="progress" radius={[0, barHeight / 2, barHeight / 2, 0]}>
              <Cell fill={barColor} />
            </Bar>
            <Bar dataKey="remaining" stackId="progress" radius={[barHeight / 2, 0, 0, barHeight / 2]}>
              <Cell fill="#E5E7EB" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {showValue && !label && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
