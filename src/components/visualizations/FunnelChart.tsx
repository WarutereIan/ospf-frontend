import { FunnelChart as RechartsFunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelStage {
  name: string;
  count: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  title?: string;
  description?: string;
  className?: string;
  height?: number;
}

const DEFAULT_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

export function FunnelChart({ stages, title, description, className, height = 300 }: FunnelChartProps) {
  // Convert stages to Recharts format
  const data = stages.map((stage) => ({
    name: stage.name,
    value: stage.count,
    color: stage.color,
  }));

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnelChart>
        <Tooltip
          formatter={(value: number) => value.toLocaleString()}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "6px",
          }}
        />
        <Funnel dataKey="value" data={data} isAnimationActive>
          <LabelList
            position="right"
            fill="#374151"
            stroke="none"
            dataKey="name"
            fontSize={12}
            fontWeight="500"
          />
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );

  if (title) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{chart}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{chart}</div>;
}
