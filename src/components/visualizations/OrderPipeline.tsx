import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { IconArrowRight } from "@tabler/icons-react";

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
}

export function OrderPipeline({ stages, title, description, className }: OrderPipelineProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {stages.map((stage, index) => {
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.name} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center gap-2 min-w-[100px]">
                  <div className="flex items-center gap-2">
                    {stage.icon && (
                      <div className="text-muted-foreground flex-shrink-0">
                        {stage.icon}
                      </div>
                    )}
                    <span className="text-xs font-medium text-muted-foreground text-center">
                      {stage.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">{stage.count}</span>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex items-center text-muted-foreground mx-1">
                    <IconArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
