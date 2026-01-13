import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TreemapData {
  name: string;
  value: number;
  color?: string;
}

interface TreemapChartProps {
  data: TreemapData[];
  title?: string;
  description?: string;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

// Custom content component for Treemap
function CustomContent(props: any) {
  const { x, y, width, height, payload } = props;

  if (!payload || width < 50 || height < 30) {
    return null;
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color || "#8884d8"}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
      >
        {payload.name}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={11}
      >
        {payload.value.toLocaleString()} kg
      </text>
    </g>
  );
}

export function TreemapChart({
  data,
  title,
  description,
  height = 300,
  colors = DEFAULT_COLORS,
}: TreemapChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: item.color || colors[index % colors.length],
  }));

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={chartData}
        dataKey="value"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomContent />}
      />
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
