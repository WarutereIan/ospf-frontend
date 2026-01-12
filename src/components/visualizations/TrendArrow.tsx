import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface TrendArrowProps {
  value: number;
  direction: "up" | "down" | "neutral";
  className?: string;
}

export function TrendArrow({ value, direction, className }: TrendArrowProps) {
  const formattedValue = `${direction === "up" ? "+" : direction === "down" ? "-" : ""}${Math.abs(value)}%`;

  return (
    <div className={cn("flex items-center gap-1 text-sm font-medium", className)}>
      {direction === "up" && (
        <>
          <IconTrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-green-600">{formattedValue}</span>
        </>
      )}
      {direction === "down" && (
        <>
          <IconTrendingDown className="h-4 w-4 text-red-600" />
          <span className="text-red-600">{formattedValue}</span>
        </>
      )}
      {direction === "neutral" && (
        <>
          <IconMinus className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">{formattedValue}</span>
        </>
      )}
    </div>
  );
}
