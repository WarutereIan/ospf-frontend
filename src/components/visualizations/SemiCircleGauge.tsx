import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";

interface SemiCircleGaugeProps {
  value: number;
  maxValue?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function SemiCircleGauge({
  value,
  maxValue = 100,
  label,
  size = 150,
  strokeWidth = 12,
  color = "#22C55E",
  className,
}: SemiCircleGaugeProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div style={{ width: size, height: size / 2 }} className="relative">
        <div className="absolute inset-0" style={{ transform: "rotate(180deg)" }}>
          <CircularProgressbar
            value={percentage}
            styles={buildStyles({
              pathColor: color,
              trailColor: "#E5E7EB",
              strokeLinecap: "round",
              rotation: 0.5,
            })}
            strokeWidth={strokeWidth}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {Math.round(value)}%
            </div>
          </div>
        </div>
      </div>
      {label && <p className="mt-2 text-sm text-muted-foreground text-center">{label}</p>}
    </div>
  );
}
