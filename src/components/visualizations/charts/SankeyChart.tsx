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
  // Helper to render empty state
  const renderEmptyState = (message: string = "No data available") => (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Value Chain Flow"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div 
          className="flex items-center justify-center text-muted-foreground"
          style={{ height: height || 300 }}
        >
          {message}
        </div>
      </CardContent>
    </Card>
  );

  // Guard: Check if we have valid input
  if (!nodes || nodes.length === 0 || !links || links.length === 0) {
    return renderEmptyState("No data available");
  }

  // Validate and sanitize nodes - ensure all values are valid positive numbers
  // Sankey requires positive values to calculate dimensions
  const validNodes = nodes
    .filter((node) => {
      if (!node || typeof node.name !== 'string') return false;
      const value = Number(node.value);
      return !isNaN(value) && isFinite(value);
    })
    .map((node, index) => ({
      name: node.name,
      value: Math.max(Number(node.value) || 0, 0), // Ensure non-negative
      color: node.color || "#3B82F6",
      index,
    }));

  // If no valid nodes, return empty chart
  if (validNodes.length < 2) {
    return renderEmptyState("Insufficient data for chart");
  }

  // Create a map of node names to indices
  const nodeIndexMap = validNodes.reduce((acc, node, index) => {
    acc[node.name] = index;
    return acc;
  }, {} as Record<string, number>);

  // Convert links to Recharts format - ensure positive values for Sankey to work
  const sankeyLinks = links
    .filter((link) => {
      if (!link || typeof link.source !== 'string' || typeof link.target !== 'string') return false;
      const sourceIndex = nodeIndexMap[link.source];
      const targetIndex = nodeIndexMap[link.target];
      const value = Number(link.value);
      return (
        sourceIndex !== undefined &&
        targetIndex !== undefined &&
        !isNaN(value) &&
        isFinite(value)
      );
    })
    .map((link) => {
      const value = Number(link.value) || 0;
      return {
        source: nodeIndexMap[link.source],
        target: nodeIndexMap[link.target],
        // Sankey REQUIRES positive values > 0 for links to render without NaN
        // If value is 0, use a small minimum to prevent NaN in SVG paths
        value: Math.max(value, 1),
      };
    });

  // Check if we have valid links
  if (sankeyLinks.length === 0) {
    return renderEmptyState("No connections to display");
  }

  // Check if total link value is meaningful (all zeros would be converted to 1s but still show something)
  const totalLinkValue = links.reduce((sum, link) => sum + (Number(link.value) || 0), 0);
  
  const sankeyData = {
    nodes: validNodes,
    links: sankeyLinks,
  };

  // Custom node component with safe rendering
  const CustomNode = ({ x, y, width, height: nodeHeight, index, payload }: any) => {
    const node = validNodes[index];
    
    // Skip rendering if node doesn't exist or coordinates are invalid
    if (!node) return null;
    
    // Validate all numeric values
    const safeX = Number(x);
    const safeY = Number(y);
    const safeWidth = Number(width);
    const safeHeight = Number(nodeHeight);
    
    if (
      isNaN(safeX) || isNaN(safeY) || isNaN(safeWidth) || isNaN(safeHeight) ||
      !isFinite(safeX) || !isFinite(safeY) || !isFinite(safeWidth) || !isFinite(safeHeight) ||
      safeWidth <= 0 || safeHeight <= 0
    ) {
      return null;
    }

    const isOut = safeX + safeWidth + 6 > 400;
    const displayValue = payload?.value !== undefined ? Number(payload.value).toLocaleString() : '0';
    
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle
          x={safeX}
          y={safeY}
          width={safeWidth}
          height={safeHeight}
          fill={node.color || "#3B82F6"}
          fillOpacity={0.8}
        />
        <Text
          x={isOut ? safeX - 6 : safeX + safeWidth + 6}
          y={safeY + safeHeight / 2}
          textAnchor={isOut ? "end" : "start"}
          verticalAnchor="middle"
          fontSize={12}
          fill="#374151"
          fontWeight="500"
        >
          {payload?.name || node.name}
        </Text>
        <Text
          x={isOut ? safeX - 6 : safeX + safeWidth + 6}
          y={safeY + safeHeight / 2 + 14}
          textAnchor={isOut ? "end" : "start"}
          verticalAnchor="middle"
          fontSize={10}
          fill="#6B7280"
          fillOpacity={0.7}
        >
          {displayValue}
        </Text>
      </Layer>
    );
  };

  // Custom link component to prevent NaN errors
  const CustomLink = (props: any) => {
    const { sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth } = props;
    
    // Validate all values
    const values = [sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth];
    const hasInvalidValue = values.some(v => isNaN(Number(v)) || !isFinite(Number(v)));
    
    if (hasInvalidValue || linkWidth <= 0) {
      return null;
    }

    const path = `
      M${sourceX},${sourceY}
      C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
    `;

    return (
      <path
        d={path}
        fill="none"
        stroke="#77c878"
        strokeWidth={Math.max(linkWidth, 1)}
        strokeOpacity={0.6}
      />
    );
  };

  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsSankey
        data={sankeyData}
        node={<CustomNode />}
        link={<CustomLink />}
        nodePadding={50}
        nodeWidth={15}
        margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
      >
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString(), 'Value']}
        />
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
