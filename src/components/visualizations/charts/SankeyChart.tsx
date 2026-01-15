import { Sankey as RechartsSankey, Tooltip, ResponsiveContainer, Layer, Rectangle, Text } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SankeyNode {
  name: string;
  value: number;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  description?: string;
  height?: number;
}

export function SankeyChart({
  nodes,
  links,
  title,
  description,
  height = 300,
}: SankeyChartProps) {
  // Convert nodes to Recharts format (with index-based links)
  const sankeyNodes = nodes.map((node, index) => ({
    name: node.name,
    value: node.value,
    color: node.color || "#3B82F6",
    index,
  }));

  // Create a map of node names to indices
  const nodeIndexMap = sankeyNodes.reduce((acc, node, index) => {
    acc[node.name] = index;
    return acc;
  }, {} as Record<string, number>);

  // Convert links to Recharts format (using indices)
  const sankeyLinks = links.map((link) => ({
    source: nodeIndexMap[link.source],
    target: nodeIndexMap[link.target],
    value: link.value,
  }));

  const sankeyData = {
    nodes: sankeyNodes,
    links: sankeyLinks,
  };

  // Custom node component
  const CustomNode = ({ x, y, width, height, index, payload }: any) => {
    const node = sankeyNodes[index];
    const isOut = x + width + 6 > 400; // Adjust based on chart width
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill={node.color || "#3B82F6"}
          fillOpacity={0.8}
        />
        <Text
          x={isOut ? x - 6 : x + width + 6}
          y={y + height / 2}
          textAnchor={isOut ? "end" : "start"}
          verticalAnchor="middle"
          fontSize={12}
          fill="#374151"
          fontWeight="500"
        >
          {payload.name}
        </Text>
        <Text
          x={isOut ? x - 6 : x + width + 6}
          y={y + height / 2 + 14}
          textAnchor={isOut ? "end" : "start"}
          verticalAnchor="middle"
          fontSize={10}
          fill="#6B7280"
          fillOpacity={0.7}
        >
          {payload.value.toLocaleString()}
        </Text>
      </Layer>
    );
  };

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsSankey
        data={sankeyData}
        node={<CustomNode />}
        nodePadding={50}
        nodeWidth={15}
        link={{ stroke: "#77c878", strokeOpacity: 0.6 }}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <Tooltip />
      </RechartsSankey>
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

