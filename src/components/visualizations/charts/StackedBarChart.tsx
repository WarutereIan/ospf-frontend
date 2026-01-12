import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StackedBarData {
  name: string;
  [key: string]: string | number;
}

interface StackedBarChartProps {
  data: StackedBarData[];
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  title?: string;
  description?: string;
  height?: number;
  layout?: "horizontal" | "vertical";
  showGrid?: boolean;
  formatter?: (value: number) => string;
}

export function StackedBarChart({
  data,
  bars,
  title,
  description,
  height = 300,
  layout = "vertical",
  showGrid = true,
  formatter,
}: StackedBarChartProps) {
  const defaultFormatter = (value: number) => value.toLocaleString();
  const formatValue = formatter || defaultFormatter;

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      {layout === "horizontal" ? (
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            width={100}
          />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
            }}
          />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              stackId="1"
              fill={bar.color || "#3B82F6"}
            />
          ))}
        </BarChart>
      ) : (
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
          <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
          <Tooltip
            formatter={(value: number) => formatValue(value)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "6px",
            }}
          />
          <Legend />
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              stackId="1"
              fill={bar.color || "#3B82F6"}
            />
          ))}
        </BarChart>
      )}
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
