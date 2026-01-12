import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HorizontalBarChartProps {
  data: Array<{ name: string; value: number; [key: string]: string | number }>;
  dataKey?: string;
  title?: string;
  description?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  formatter?: (value: number) => string;
  sorted?: boolean;
}

export function HorizontalBarChart({
  data,
  dataKey = "value",
  title,
  description,
  color = "#3B82F6",
  height = 300,
  showGrid = true,
  formatter,
  sorted = false,
}: HorizontalBarChartProps) {
  const defaultFormatter = (value: number) => value.toLocaleString();
  const formatValue = formatter || defaultFormatter;

  const chartData = sorted ? [...data].sort((a, b) => (b.value as number) - (a.value as number)) : data;

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
        barCategoryGap="20%"
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
          width={150}
        />
        <Tooltip
          formatter={(value: number) => formatValue(value)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
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
