import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconMapPin,
  IconClipboardCheck,
  IconCash,
  IconStar,
} from "@tabler/icons-react";
import { OrderTimeline, type OrderStage } from "@/components/orders/OrderTimeline";
import { OrderStatusHistory } from "@/components/orders/OrderStatusHistory";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";

interface FarmerOrder {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerId: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  pricePerKg: number;
  totalAmount: number;
  status:
    | "order_placed"
    | "order_accepted"
    | "payment_secured"
    | "rejected"
    | "in_transit"
    | "at_aggregation"
    | "quality_checked"
    | "quality_approved"
    | "quality_rejected"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "disputed";
  createdAt: string;
  aggregationCenter?: string;
  centerLocation?: string;
  deliveryLocation?: string;
  notes?: string;
  paymentStatus?: EscrowStatusType;
  paymentAmount?: number;
  photos?: string[];
  qualityScore?: number;
  qualityFeedback?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  daysToDeliver?: number;
}

export function FarmerOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<FarmerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTimeout(() => {
      // Mock order data - in real app, fetch by ID
      const mockOrder: FarmerOrder = {
        id: id || "ORD-001",
        buyerId: "B001",
        buyerName: "John Mwangi",
        buyerPhone: "+254712345678",
        variety: "Kenya",
        quantity: 500,
        qualityGrade: "A",
        pricePerKg: 150,
        totalAmount: 75000,
        status: "quality_approved",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        aggregationCenter: "Kangundo Aggregation Center",
        centerLocation: "Kangundo",
        deliveryLocation: "Nairobi",
        paymentStatus: "ready_for_release",
        paymentAmount: 75000,
        qualityScore: 95,
        qualityFeedback: "Excellent quality - premium grade, uniform size",
        estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      };
      setOrder(mockOrder);
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div>
          <Link to="/dashboard/farmer/orders">
            <Button variant="ghost" size="sm" className="mb-4">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">Order Not Found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The order you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link to="/dashboard/farmer/orders">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground mt-1">Order #{order.id}</p>
          </div>
          <Badge
            variant="outline"
            className={
              order.status === "completed" || order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "quality_rejected" || order.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }
          >
            {order.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTimeline
            currentStage={order.status as OrderStage}
            stages={[
              {
                stage: "order_placed",
                timestamp: order.createdAt,
                completed: true,
              },
              {
                stage: "order_accepted",
                timestamp: order.status !== "order_placed" ? new Date(Date.now() - 15 * 60 * 1000).toISOString() : undefined,
                completed: order.status !== "order_placed",
              },
              {
                stage: "at_aggregation",
                timestamp: ["at_aggregation", "quality_checked", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 10 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["at_aggregation", "quality_checked", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "quality_approved",
                timestamp: ["quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 5 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "delivered",
                timestamp: order.status === "delivered" || order.status === "completed"
                  ? order.actualDeliveryDate || new Date().toISOString()
                  : undefined,
                completed: order.status === "delivered" || order.status === "completed",
              },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{order.buyerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone</p>
              <p>{order.buyerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Delivery To</p>
              <p className="font-medium">{order.deliveryLocation}</p>
            </div>
          </CardContent>
        </Card>

        {/* Aggregation Center */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregation Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Center</p>
              <p className="font-medium">{order.aggregationCenter}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Location</p>
              <p className="flex items-center gap-1">
                <IconMapPin className="h-4 w-4" />
                {order.centerLocation}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Variety</p>
              <p className="font-medium">{order.variety}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quality Grade</p>
              <Badge variant="outline">Grade {order.qualityGrade}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
              <p className="font-medium">{order.quantity} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price per kg</p>
              <p className="font-medium">KES {order.pricePerKg}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold">Total Amount</p>
              <p className="text-2xl font-bold">KES {order.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Assessment */}
      {order.qualityScore && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IconStar className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{order.qualityScore}%</span>
                <Badge
                  variant="outline"
                  className={
                    order.status === "quality_approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {order.status === "quality_approved" ? "Approved" : "Rejected"}
                </Badge>
              </div>
              {order.qualityFeedback && (
                <p className="text-sm text-muted-foreground italic">
                  "{order.qualityFeedback}"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Status */}
      {order.paymentStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <EscrowStatus
              status={order.paymentStatus}
              amount={order.paymentAmount || 0}
              orderId={order.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusHistory
            orderId={order.id}
            currentStatus={order.status as any}
            history={[
              {
                id: "1",
                status: "order_placed" as any,
                timestamp: order.createdAt,
                changedBy: { id: order.buyerId, name: order.buyerName, role: "buyer" as const },
              },
              ...(order.status !== "order_placed"
                ? [
                    {
                      id: "2",
                      status: "order_accepted" as any,
                      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                      changedBy: { id: "F001", name: "Farmer", role: "farmer" as const },
                    },
                  ]
                : []),
              ...(["at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                ? [
                    {
                      id: "3",
                      status: "at_aggregation" as any,
                      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                      changedBy: { id: "M001", name: "Center Staff", role: "manager" as const },
                    },
                  ]
                : []),
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
