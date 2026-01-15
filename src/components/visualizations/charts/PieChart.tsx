import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PieData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieData[];
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  innerRadius?: number;
  formatter?: (value: number) => string;
  colors?: string[];
}

const DEFAULT_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export function PieChart({
  data,
  title,
  description,
  height = 300,
  showLegend = true,
  showLabels = true,
  innerRadius = 0,
  formatter,
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  const defaultFormatter = (value: number) => value.toLocaleString();
  const formatValue = formatter || defaultFormatter;

  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length],
  }));

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          outerRadius={80}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatValue(value)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
          }}
        />
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return chart;
}
