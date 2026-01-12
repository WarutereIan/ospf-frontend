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

const colorClasses = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
  mini: "h-1",
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
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full transition-all duration-300 rounded-full", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && !label && (
        <div className="mt-1 text-xs text-muted-foreground text-right">{percentage.toFixed(0)}%</div>
      )}
    </div>
  );
}
