import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Steps } from "antd";
import type { StepsProps } from "antd";
import type { ReactNode } from "react";

interface PipelineStage {
  name: string;
  count: number;
  icon?: ReactNode;
  color?: string;
}

interface OrderPipelineProps {
  stages: PipelineStage[];
  title?: string;
  description?: string;
  className?: string;
  currentStep?: number;
}

export function OrderPipeline({
  stages,
  title,
  description,
  className,
  currentStep,
}: OrderPipelineProps) {
  // Convert stages to Ant Design Steps format
  const stepItems: StepsProps["items"] = stages.map((stage, index) => ({
    title: (
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground">{stage.name}</span>
        <span className="text-sm font-bold">{stage.count}</span>
      </div>
    ),
    icon: stage.icon ? (
      <div className="flex items-center justify-center">{stage.icon}</div>
    ) : undefined,
    status:
      currentStep !== undefined
        ? index < currentStep
          ? "finish"
          : index === currentStep
          ? "process"
          : "wait"
        : undefined,
  }));

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <Steps
          items={stepItems}
          direction="horizontal"
          size="small"
          labelPlacement="vertical"
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
