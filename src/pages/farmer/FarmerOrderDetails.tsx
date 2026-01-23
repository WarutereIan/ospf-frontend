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
import { FarmerPaymentConfirmationDialog } from "@/components/payments/FarmerPaymentConfirmationDialog";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { usePayment } from "@/contexts/PaymentContext";
import type { MarketplaceOrder } from "@/types/marketplace";

export function FarmerOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, isLoading } = useMarketplace();
  const { payments, fetchPayments } = usePayment();
  
  const [paymentConfirmationOpen, setPaymentConfirmationOpen] = useState(false);

  // Fetch order details on mount
  useEffect(() => {
    if (id) {
      fetchOrderById(id);
      fetchPayments({ orderId: id });
    }
  }, [id, fetchOrderById, fetchPayments]);

  const order = selectedOrder;
  const payment = payments.find((p) => p.orderId === id);
  
  // Determine if farmer needs to confirm payment
  // Payment should be "secured" (buyer confirmed) but not yet "confirmed_by_farmer"
  const needsFarmerConfirmation = payment && 
    (payment.status?.toLowerCase() === "secured" || payment.status === "SECURED") &&
    payment.status?.toLowerCase() !== "confirmed_by_farmer" &&
    payment.status !== "CONFIRMED_BY_FARMER" &&
    (order?.status === "payment_secured" || order?.status === "order_accepted" || order?.status === "order_placed");

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
          <div className="flex items-center gap-2">
            {needsFarmerConfirmation && (
              <Button
                onClick={() => setPaymentConfirmationOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <IconClipboardCheck className="mr-2 h-4 w-4" />
                Confirm Payment Received
              </Button>
            )}
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
                stage: "payment_secured",
                timestamp: payment?.confirmedAt || (["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 12 * 60 * 1000).toISOString()
                  : undefined),
                completed: payment && (payment.status?.toLowerCase() === "secured" || payment.status === "SECURED" || payment.status?.toLowerCase() === "confirmed_by_farmer" || payment.status === "CONFIRMED_BY_FARMER") || ["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "payment_confirmed_by_farmer",
                timestamp: payment?.farmerConfirmedAt || (payment && (
                  payment.status?.toLowerCase() === "confirmed_by_farmer" || 
                  payment.status === "CONFIRMED_BY_FARMER" ||
                  payment.farmerConfirmedBy !== undefined
                )
                  ? (payment.confirmedAt || new Date().toISOString())
                  : undefined),
                completed: payment && (
                  payment.status?.toLowerCase() === "confirmed_by_farmer" || 
                  payment.status === "CONFIRMED_BY_FARMER" ||
                  payment.farmerConfirmedAt !== undefined ||
                  payment.farmerConfirmedBy !== undefined
                ) || ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "in_transit",
                timestamp: ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 8 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "at_aggregation",
                timestamp: ["at_aggregation", "quality_checked", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 5 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["at_aggregation", "quality_checked", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "quality_approved",
                timestamp: ["quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 2 * 60 * 1000).toISOString()
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
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <EscrowStatus
              status={(payment.status || '').toLowerCase() as EscrowStatusType}
              amount={payment.amount || order.totalAmount}
              orderId={order.id}
              createdAt={payment.confirmedAt}
              releasedAt={payment.releasedAt}
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
              ...(payment && payment.confirmedAt
                ? [
                    {
                      id: "3",
                      status: "payment_secured" as any,
                      timestamp: payment.confirmedAt,
                      changedBy: { id: order.buyerId, name: order.buyerName, role: "buyer" as const },
                      notes: "Buyer confirmed payment",
                      metadata: {
                        amount: `KES ${(payment.amount || order.totalAmount).toLocaleString()}`,
                        method: payment.method || "N/A",
                      },
                    },
                  ]
                : []),
              ...(payment && (
                payment.farmerConfirmedAt || 
                payment.farmerConfirmedBy ||
                payment.status?.toLowerCase() === "confirmed_by_farmer" ||
                payment.status === "CONFIRMED_BY_FARMER"
              )
                ? [
                    {
                      id: "4",
                      status: "payment_confirmed_by_farmer" as any,
                      timestamp: payment.farmerConfirmedAt || payment.confirmedAt || new Date().toISOString(),
                      changedBy: { id: "F001", name: "You", role: "farmer" as const },
                      notes: payment.farmerConfirmationNotes || "Farmer confirmed payment receipt",
                    },
                  ]
                : []),
              ...(["at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                ? [
                    {
                      id: "5",
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

      {/* Farmer Payment Confirmation Dialog */}
      {payment && (
        <FarmerPaymentConfirmationDialog
          open={paymentConfirmationOpen}
          onOpenChange={setPaymentConfirmationOpen}
          orderId={order.id}
          orderNumber={order.orderNumber || order.id}
          paymentAmount={payment.amount || order.totalAmount}
          paymentMethod={payment.method}
          transactionReference={payment.transactionReference || undefined}
          paymentEvidence={payment.paymentEvidence || undefined}
          onPaymentConfirmed={() => {
            // Refresh order and payment data
            if (id) {
              fetchOrderById(id);
              fetchPayments({ orderId: id });
            }
          }}
        />
      )}
    </div>
  );
}
