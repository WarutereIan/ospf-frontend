import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SlopeData {
  category: string;
  before: number;
  after: number;
}

interface SlopeChartProps {
  data: SlopeData[];
  title?: string;
  description?: string;
  height?: number;
  beforeLabel?: string;
  afterLabel?: string;
  formatter?: (value: number) => string;
}

export function SlopeChart({
  data,
  title,
  description,
  height = 300,
  beforeLabel = "Before",
  afterLabel = "After",
  formatter,
}: SlopeChartProps) {
  const defaultFormatter = (value: number) => `${value}%`;
  const formatValue = formatter || defaultFormatter;

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#6B7280" />
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
        <Line
          type="monotone"
          dataKey="before"
          name={beforeLabel}
          stroke="#94A3B8"
          strokeWidth={2}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
        <Line
          type="monotone"
          dataKey="after"
          name={afterLabel}
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 5 }}
          activeDot={{ r: 7 }}
        />
      </RechartsLineChart>
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

