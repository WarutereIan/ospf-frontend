import { Badge } from "@/components/ui/badge";
import {
  IconPackage,
  IconCircleCheck,
  IconCreditCard,
  IconTruck,
  IconMapPin,
  IconClipboardCheck,
  IconTruckDelivery,
  IconCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type OrderStage =
  | "order_placed"
  | "order_accepted"
  | "payment_secured"
  | "payment_confirmed_by_farmer"
  | "in_transit"
  | "at_aggregation"
  | "quality_approved"
  | "out_for_delivery"
  | "delivered"
  | "completed";

interface OrderTimelineProps {
  currentStage: OrderStage;
  stages: Array<{
    stage: OrderStage;
    timestamp?: string;
    completed: boolean;
  }>;
}

const stageConfig: Record<
  OrderStage,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  order_placed: {
    label: "Order Placed",
    icon: IconPackage,
    description: "Buyer created order",
  },
  order_accepted: {
    label: "Order Accepted",
    icon: IconCircleCheck,
    description: "Farmer accepted order",
  },
  payment_secured: {
    label: "Payment Secured",
    icon: IconCreditCard,
    description: "Buyer confirmed payment",
  },
  payment_confirmed_by_farmer: {
    label: "Payment Confirmed",
    icon: IconUserCheck,
    description: "Farmer confirmed payment receipt",
  },
  in_transit: {
    label: "In Transit",
    icon: IconTruck,
    description: "Farmer delivering to center",
  },
  at_aggregation: {
    label: "At Aggregation Center",
    icon: IconMapPin,
    description: "Produce delivered to center",
  },
  quality_approved: {
    label: "Quality Approved",
    icon: IconClipboardCheck,
    description: "QC passed, stock logged",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: IconTruckDelivery,
    description: "Buyer collecting/dispatching",
  },
  delivered: {
    label: "Delivered",
    icon: IconCheck,
    description: "Buyer confirmed receipt",
  },
  completed: {
    label: "Completed",
    icon: IconCheck,
    description: "Payment released, order closed",
  },
};

const stageOrder: OrderStage[] = [
  "order_placed",
  "order_accepted",
  "payment_secured",
  "payment_confirmed_by_farmer",
  "in_transit",
  "at_aggregation",
  "quality_approved",
  "out_for_delivery",
  "delivered",
  "completed",
];

export function OrderTimeline({ currentStage, stages }: OrderTimelineProps) {
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Order Timeline</h3>
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        {/* Stages */}
        <div className="space-y-6">
          {stageOrder.map((stage, index) => {
            const stageData = stageConfig[stage];
            const stageInfo = stages.find((s) => s.stage === stage);
            // Use stageInfo.completed if available, otherwise fall back to index-based completion
            const isCompleted = stageInfo?.completed !== undefined 
              ? stageInfo.completed 
              : index <= currentIndex;
            const isCurrent = stage === currentStage;
            const Icon = stageData.icon;

            return (
              <div key={stage} className="relative flex items-start gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-muted text-muted-foreground",
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4
                        className={cn(
                          "font-medium",
                          isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {stageData.label}
                      </h4>
                      <p className="text-sm text-muted-foreground">{stageData.description}</p>
                    </div>
                    <div className="text-right">
                      {isCompleted && stageInfo?.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(stageInfo.timestamp).toLocaleString()}
                        </p>
                      )}
                      {isCurrent && (
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          Current
                        </Badge>
                      )}
                      {isCompleted && !isCurrent && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <IconCheck className="mr-1 h-3 w-3" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

