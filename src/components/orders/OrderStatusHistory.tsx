import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconUser,
  IconClock,
  IconCheckCircle,
  IconXCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
// Using native Date methods instead of date-fns

export type OrderStatus =
  | "order_placed"
  | "order_accepted"
  | "payment_secured"
  | "rejected"
  | "in_transit"
  | "at_aggregation"
  | "quality_approved"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "disputed";

interface StatusHistoryEntry {
  id: string;
  status: OrderStatus;
  changedBy: {
    id: string;
    name: string;
    role: "farmer" | "buyer" | "manager" | "system";
  };
  timestamp: string;
  notes?: string;
  metadata?: Record<string, any>;
}

interface OrderStatusHistoryProps {
  orderId: string;
  history: StatusHistoryEntry[];
  currentStatus: OrderStatus;
}

const statusLabels: Record<OrderStatus, string> = {
  order_placed: "Order Placed",
  order_accepted: "Order Accepted",
  payment_secured: "Payment Secured",
  rejected: "Order Rejected",
  in_transit: "In Transit",
  at_aggregation: "At Aggregation Center",
  quality_approved: "Quality Approved",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  disputed: "Disputed",
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "order_placed":
    case "order_accepted":
    case "payment_secured":
    case "quality_approved":
    case "delivered":
    case "completed":
      return IconCheckCircle;
    case "rejected":
      return IconXCircle;
    case "disputed":
      return IconAlertTriangle;
    default:
      return IconClock;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "order_placed":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "order_accepted":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "payment_secured":
      return "bg-cyan-100 text-cyan-800 border-cyan-300";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-300";
    case "in_transit":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "at_aggregation":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "quality_approved":
      return "bg-green-100 text-green-800 border-green-300";
    case "out_for_delivery":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "delivered":
    case "completed":
      return "bg-green-100 text-green-800 border-green-300";
    case "disputed":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "farmer":
      return "bg-green-100 text-green-800";
    case "buyer":
      return "bg-blue-100 text-blue-800";
    case "manager":
      return "bg-purple-100 text-purple-800";
    case "system":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function OrderStatusHistory({ orderId, history, currentStatus }: OrderStatusHistoryProps) {
  // Sort history by timestamp (newest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status History</CardTitle>
        <CardDescription>Complete audit trail for Order #{orderId}</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedHistory.length > 0 ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {/* History Entries */}
            <div className="space-y-6">
              {sortedHistory.map((entry, index) => {
                const Icon = getStatusIcon(entry.status);
                const isLatest = index === 0;

                return (
                  <div key={entry.id} className="relative flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background ${
                        isLatest
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={getStatusColor(entry.status)}>
                              {statusLabels[entry.status]}
                            </Badge>
                            {isLatest && (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <IconUser className="h-4 w-4" />
                            <span>{entry.changedBy.name}</span>
                            <Badge variant="outline" className={getRoleColor(entry.changedBy.role)}>
                              {entry.changedBy.role}
                            </Badge>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                          )}
                          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {Object.entries(entry.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>{new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                          <div>{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <IconClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No status history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

