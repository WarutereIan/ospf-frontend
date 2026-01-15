import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconTruck,
  IconBuilding,
  IconCheck,
  IconClock,
  IconPackage,
  IconUser,
} from "@tabler/icons-react";

interface TraceabilityStep {
  stage: string;
  location: string;
  timestamp: string;
  actor: string;
  status: "completed" | "pending" | "current";
  notes?: string;
}

interface TraceabilityViewProps {
  orderId: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  steps: TraceabilityStep[];
  className?: string;
}

export function TraceabilityView({
  orderId,
  variety,
  quantity,
  qualityGrade,
  steps,
  className,
}: TraceabilityViewProps) {
  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "harvest":
        return <IconPackage className="h-5 w-5" />;
      case "on-farm sorting":
        return <IconCheck className="h-5 w-5" />;
      case "loading":
        return <IconTruck className="h-5 w-5" />;
      case "in transit":
        return <IconTruck className="h-5 w-5" />;
      case "at aggregation":
        return <IconBuilding className="h-5 w-5" />;
      case "quality check":
        return <IconCheck className="h-5 w-5" />;
      case "delivery":
        return <IconTruck className="h-5 w-5" />;
      default:
        return <IconClock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMapPin className="h-5 w-5" />
          Produce Traceability
        </CardTitle>
        <CardDescription>
          Track your produce journey from farm to buyer. Order ID: {orderId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Variety</p>
              <p className="font-semibold">{variety}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="font-semibold">{quantity} kg</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quality Grade</p>
              <Badge variant="outline">Grade {qualityGrade}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Order ID</p>
              <p className="font-semibold text-sm">{orderId}</p>
            </div>
          </div>

          {/* Traceability Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      step.status === "completed"
                        ? "bg-green-100 border-green-300 text-green-800"
                        : step.status === "current"
                        ? "bg-blue-100 border-blue-300 text-blue-800"
                        : "bg-gray-100 border-gray-300 text-gray-500"
                    }`}
                  >
                    {getStageIcon(step.stage)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{step.stage}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <IconMapPin className="h-3 w-3" />
                          {step.location}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Actor:</span>
                        <span className="font-medium">{step.actor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">
                          {new Date(step.timestamp).toLocaleString("en-KE", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {step.notes && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <span className="text-muted-foreground">Note: </span>
                        {step.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2">Traceability Summary</h4>
            <p className="text-sm text-muted-foreground">
              This produce has been tracked through {steps.filter((s) => s.status === "completed").length} of{" "}
              {steps.length} stages. Full traceability ensures quality and transparency throughout the supply chain.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

