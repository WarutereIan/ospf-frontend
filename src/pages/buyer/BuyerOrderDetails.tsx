import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconMapPin,
  IconClipboardCheck,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { OrderTimeline, type OrderStage } from "@/components/orders/OrderTimeline";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";
import { RateFarmer } from "./RateFarmer";
import { DeliveryTrackingMap } from "@/components/transport/DeliveryTrackingMap";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { usePayment } from "@/contexts/PaymentContext";
import type { MarketplaceOrder } from "@/types/marketplace";

export function BuyerOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, fetchOrderById, isLoading } = useMarketplace();
  const { payments, fetchPayments } = usePayment();
  
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // Fetch order details on mount
  useEffect(() => {
    if (id) {
      fetchOrderById(id);
      fetchPayments({ orderId: id });
    }
  }, [id, fetchOrderById, fetchPayments]);

  const order = selectedOrder;
  const payment = payments.find((p) => p.orderId === id);

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
          <Link to="/dashboard/buyer/orders">
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
        <Link to="/dashboard/buyer/orders">
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
            {order.canRate && (
              <Button
                variant="outline"
                onClick={() => setRatingDialogOpen(true)}
              >
                <IconStar className="mr-2 h-4 w-4" />
                Rate Farmer
              </Button>
            )}
            <Badge
              variant="outline"
              className={
                order.status === "completed" || order.status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.status === "rejected" || order.status === "disputed"
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
                timestamp: ["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 10 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
              },
              {
                stage: "in_transit",
                timestamp: ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status)
                  ? new Date(Date.now() - 5 * 60 * 1000).toISOString()
                  : undefined,
                completed: ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(order.status),
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

      {/* Farmer Origin Information */}
      <Card>
        <CardHeader>
          <CardTitle>Farmer Origin (Complete Traceability)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-primary mb-2">FARMER DETAILS</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{order.farmerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <p className="font-medium">{order.farmerId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p>{order.farmerPhone}</p>
                  </div>
                  {order.farmerRating && (
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1 mt-1">
                        <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{order.farmerRating.toFixed(1)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-primary mb-2">FARMER PERFORMANCE</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Deliveries:</span>
                    <p className="font-medium">{order.farmerDeliveryHistory}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Average Quality:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{order.farmerQualityAverage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Tracking Map - Show for in-transit or out-for-delivery orders */}
      {(order.status === "in_transit" || order.status === "out_for_delivery") && 
       order.farmerCoordinates && order.deliveryCoordinates && (
        <DeliveryTrackingMap
          pickupLocation={{
            name: `${order.farmerName}'s Farm`,
            coordinates: order.farmerCoordinates,
          }}
          deliveryLocation={{
            name: order.aggregationCenter || order.deliveryLocation || "Delivery Location",
            coordinates: order.deliveryCoordinates,
          }}
          currentLocation={
            order.currentCoordinates
              ? {
                  name: "In Transit",
                  coordinates: order.currentCoordinates,
                }
              : undefined
          }
          status={order.status === "out_for_delivery" ? "in_transit" : "in_transit"}
          distance={undefined}
          eta={order.estimatedDeliveryDate ? `Est. ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}` : undefined}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aggregation Center Info */}
        <Card>
          <CardHeader>
            <CardTitle>Aggregation Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.aggregationCenter && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Center</p>
                <p className="font-medium">{order.aggregationCenter}</p>
              </div>
            )}
            {order.centerLocation && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="flex items-center gap-1">
                  <IconMapPin className="h-4 w-4" />
                  {order.centerLocation}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Delivery To</p>
              <p className="font-medium">{order.deliveryLocation}</p>
            </div>
          </CardContent>
        </Card>

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
      </div>

      {/* Quality Assessment */}
      {order.qualityScore && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IconClipboardCheck className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{order.qualityScore}%</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Approved
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
              status={payment.status as EscrowStatusType}
              amount={payment.amount || order.totalAmount}
              orderId={order.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Rating Dialog */}
      {order.canRate && (
        <RateFarmer
          farmerId={order.farmerId}
          farmerName={order.farmerName}
          orderId={order.id}
          variety={order.variety}
          quantity={order.quantity}
          onRatingSubmitted={() => setRatingDialogOpen(false)}
        />
      )}
    </div>
  );
}
