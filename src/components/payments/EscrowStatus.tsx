import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCreditCard,
  IconLoader2,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconCircleX,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type EscrowStatus =
  | "pending"
  | "processing"
  | "in_escrow"
  | "quality_check"
  | "ready_for_release"
  | "released"
  | "completed"
  | "disputed"
  | "refunded";

interface EscrowStatusProps {
  status: EscrowStatus;
  amount: number;
  orderId: string;
  createdAt?: string;
  releasedAt?: string;
  onRefresh?: () => void;
}

const statusConfig: Record<
  EscrowStatus,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    moneyLocation: string;
    nextAction: string;
  }
> = {
  pending: {
    label: "Pending",
    description: "Order created, no payment initiated",
    icon: IconClock,
    color: "text-yellow-800",
    bgColor: "bg-yellow-100 border-yellow-300",
    moneyLocation: "N/A",
    nextAction: "Buyer initiates payment",
  },
  processing: {
    label: "Processing",
    description: "Payment in progress",
    icon: IconLoader2,
    color: "text-blue-800",
    bgColor: "bg-blue-100 border-blue-300",
    moneyLocation: "Payment gateway",
    nextAction: "Wait for confirmation",
  },
  in_escrow: {
    label: "In Escrow",
    description: "Payment held securely",
    icon: IconCreditCard,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "Escrow account",
    nextAction: "Farmer delivers produce",
  },
  quality_check: {
    label: "Quality Check",
    description: "At aggregation center",
    icon: IconAlertTriangle,
    color: "text-orange-800",
    bgColor: "bg-orange-100 border-orange-300",
    moneyLocation: "Escrow account",
    nextAction: "Quality verification",
  },
  ready_for_release: {
    label: "Ready for Release",
    description: "QC passed, awaiting confirmation",
    icon: IconCircleCheck,
    color: "text-blue-800",
    bgColor: "bg-blue-100 border-blue-300",
    moneyLocation: "Escrow account",
    nextAction: "Buyer confirms receipt",
  },
  released: {
    label: "Released",
    description: "Payment sent to farmer",
    icon: IconCircleCheck,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "In transit to farmer",
    nextAction: "Farmer receives M-PESA",
  },
  completed: {
    label: "Completed",
    description: "Farmer received payment",
    icon: IconCircleCheck,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "Farmer's account",
    nextAction: "Transaction closed",
  },
  disputed: {
    label: "Disputed",
    description: "Issue flagged",
    icon: IconAlertTriangle,
    color: "text-red-800",
    bgColor: "bg-red-100 border-red-300",
    moneyLocation: "Escrow account (frozen)",
    nextAction: "Concern staff review",
  },
  refunded: {
    label: "Refunded",
    description: "Cancelled/rejected",
    icon: IconCircleX,
    color: "text-gray-800",
    bgColor: "bg-gray-100 border-gray-300",
    moneyLocation: "Returned to buyer",
    nextAction: "Refund processed",
  },
};

export function EscrowStatus({
  status,
  amount,
  orderId,
  createdAt,
  releasedAt,
  onRefresh,
}: EscrowStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Order #{orderId}</CardDescription>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <IconRefresh className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-lg", config.bgColor)}>
            <Icon className={cn("h-6 w-6", config.color)} />
          </div>
          <div className="flex-1">
            <Badge variant="outline" className={cn("mb-1", config.bgColor, config.color)}>
              {config.label}
            </Badge>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Order Amount</span>
            <span className="font-semibold">KES {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Platform Fee (2%)</span>
            <span className="font-semibold">KES {(amount * 0.02).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t mt-2">
            <span className="font-semibold">Total in Escrow</span>
            <span className="text-xl font-bold">KES {(amount * 1.02).toLocaleString()}</span>
          </div>
        </div>

        {/* Status Details */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Money Location:</span>
            <span className="font-medium">{config.moneyLocation}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next Action:</span>
            <span className="font-medium">{config.nextAction}</span>
          </div>
          {createdAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Date:</span>
              <span className="font-medium">{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          )}
          {releasedAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Released Date:</span>
              <span className="font-medium">{new Date(releasedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Status-specific messages */}
        {status === "in_escrow" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💰 Your payment is securely held in escrow. It will be released to the farmer once delivery is
              confirmed and quality check passes.
            </p>
          </div>
        )}

        {status === "ready_for_release" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✅ Quality check passed! Payment will be released to the farmer automatically in 24 hours if no
              dispute is raised.
            </p>
          </div>
        )}

        {status === "disputed" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              ⚠️ This order has been flagged for review. Concern staff will investigate and resolve the dispute.
              Payment is frozen until resolution.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

