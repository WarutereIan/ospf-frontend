import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: string;
  count: number;
  color?: "green" | "yellow" | "blue" | "red" | "gray";
  className?: string;
}

const colorClasses = {
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  blue: "bg-blue-500",
  red: "bg-red-500",
  gray: "bg-gray-500",
};

export function StatusIndicator({ status, count, color = "gray", className }: StatusIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-3 h-3 rounded-full", colorClasses[color])} />
      <span className="text-sm text-muted-foreground">{count}</span>
      <span className="text-sm font-medium">{status}</span>
    </div>
  );
}
