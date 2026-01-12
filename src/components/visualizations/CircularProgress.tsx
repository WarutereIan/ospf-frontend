import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  text?: string;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function CircularProgress({
  value,
  maxValue = 100,
  text,
  label,
  size = 120,
  strokeWidth = 8,
  color = "#22C55E",
  className,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const displayText = text !== undefined ? text : `${Math.round(value)}`;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div style={{ width: size, height: size }}>
        <CircularProgressbar
          value={percentage}
          text={displayText}
          styles={buildStyles({
            pathColor: color,
            textColor: "#1F2937",
            trailColor: "#E5E7EB",
            textSize: size > 100 ? "24px" : "16px",
            strokeLinecap: "round",
          })}
          strokeWidth={strokeWidth}
        />
      </div>
      {label && <p className="mt-2 text-sm text-muted-foreground text-center">{label}</p>}
    </div>
  );
}
