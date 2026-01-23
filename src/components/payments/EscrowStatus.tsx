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
  | "secured"
  | "confirmed_by_farmer"
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
    description: "Order created, payment not yet confirmed",
    icon: IconClock,
    color: "text-yellow-800",
    bgColor: "bg-yellow-100 border-yellow-300",
    moneyLocation: "N/A",
    nextAction: "Buyer confirms payment",
  },
  processing: {
    label: "Processing",
    description: "Payment confirmation in progress",
    icon: IconLoader2,
    color: "text-blue-800",
    bgColor: "bg-blue-100 border-blue-300",
    moneyLocation: "Pending confirmation",
    nextAction: "Wait for confirmation",
  },
  secured: {
    label: "Payment Secured",
    description: "Buyer confirmed payment made",
    icon: IconCreditCard,
    color: "text-blue-800",
    bgColor: "bg-blue-100 border-blue-300",
    moneyLocation: "Awaiting farmer confirmation",
    nextAction: "Farmer confirms receipt",
  },
  confirmed_by_farmer: {
    label: "Confirmed by Farmer",
    description: "Farmer confirmed payment receipt",
    icon: IconCircleCheck,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "Payment confirmed",
    nextAction: "Order processing continues",
  },
  released: {
    label: "Released",
    description: "Payment released to farmer",
    icon: IconCircleCheck,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "Farmer's account",
    nextAction: "Transaction completed",
  },
  completed: {
    label: "Completed",
    description: "Payment transaction completed",
    icon: IconCircleCheck,
    color: "text-green-800",
    bgColor: "bg-green-100 border-green-300",
    moneyLocation: "Farmer's account",
    nextAction: "Transaction closed",
  },
  disputed: {
    label: "Disputed",
    description: "Payment issue flagged",
    icon: IconAlertTriangle,
    color: "text-red-800",
    bgColor: "bg-red-100 border-red-300",
    moneyLocation: "Under review",
    nextAction: "Staff review required",
  },
  refunded: {
    label: "Refunded",
    description: "Payment refunded to buyer",
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
  // Normalize status to lowercase (backend may return uppercase)
  const normalizedStatus = (status || '').toLowerCase() as EscrowStatus;
  const config = statusConfig[normalizedStatus];
  
  // Handle unknown status gracefully
  if (!config) {
    console.warn(`Unknown payment status: ${status} (normalized: ${normalizedStatus})`);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Order #{orderId}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="outline">Unknown Status: {status}</Badge>
        </CardContent>
      </Card>
    );
  }
  
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
            <span className="font-semibold">Total Amount</span>
            <span className="text-xl font-bold">KES {amount.toLocaleString()}</span>
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
        {status === "secured" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💰 Payment confirmation recorded. Waiting for farmer to confirm receipt before order processing continues.
            </p>
          </div>
        )}

        {status === "confirmed_by_farmer" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✅ Farmer has confirmed payment receipt. Order processing can now continue.
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

