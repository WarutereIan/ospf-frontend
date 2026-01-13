import { LineChart as RechartsLineChart, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface SparklineProps {
  data: Array<{ name: string; value: number }>;
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "#3B82F6", height = 40 }: SparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
