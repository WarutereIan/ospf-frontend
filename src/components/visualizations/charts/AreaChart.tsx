import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AreaData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartProps {
  data: AreaData[];
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
    gradient?: boolean;
  }>;
  title?: string;
  description?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatter?: (value: number) => string;
  stacked?: boolean;
}

export function AreaChart({
  data,
  areas,
  title,
  description,
  height = 300,
  showGrid = true,
  showLegend = false,
  formatter,
  stacked = false,
}: AreaChartProps) {
  const defaultFormatter = (value: number) => value.toLocaleString();
  const formatValue = formatter || defaultFormatter;

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color || "#3B82F6"} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color || "#3B82F6"} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
        />
        <Tooltip
          formatter={(value: number) => formatValue(value)}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
          }}
        />
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color || "#3B82F6"}
            fill={area.gradient ? `url(#gradient-${area.dataKey})` : area.color || "#3B82F6"}
            fillOpacity={area.gradient ? 1 : 0.6}
            stackId={stacked ? "1" : undefined}
          />
        ))}
      </RechartsAreaChart>
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
