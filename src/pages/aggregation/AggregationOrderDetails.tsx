import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconMapPin,
  IconUser,
  IconLoader2,
  IconArrowRight,
  IconCircleCheck,
  IconPackage,
  IconQrcode,
} from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { usePayment } from "@/contexts/PaymentContext";
import { useAggregation } from "@/contexts/AggregationContext";
import { startOrderProcessing, markOrderReadyForCollection } from "@/services/marketplaceService";
import { showSuccess, showError } from "@/lib/toast";
import type { MarketplaceOrder } from "@/types/marketplace";

export function AggregationOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, isLoading } = useMarketplace();
  const { payments, fetchPayments } = usePayment();
  const { selectedCenter } = useAggregation();
  
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  // Fetch order details on mount
  useEffect(() => {
    if (id) {
      fetchOrderById(id);
      fetchPayments({ orderId: id });
    }
  }, [id, fetchOrderById, fetchPayments]);

  const order = selectedOrder;
  const payment = payments.find((p) => p.orderId === id);

  const handleStartProcessing = async () => {
    if (!id) return;
    
    setProcessingOrderId(id);
    try {
      const result = await startOrderProcessing(id);
      if (result.error) {
        showError("Failed to Start Processing", result.error);
      } else {
        showSuccess("Processing Started", "Order is now being processed");
        // Refresh order details
        await fetchOrderById(id);
      }
    } catch (error) {
      showError("Failed to Start Processing", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkReadyForCollection = async () => {
    if (!id) return;
    
    setCompletingOrderId(id);
    try {
      const result = await markOrderReadyForCollection(id);
      if (result.error) {
        showError("Failed to Mark Ready", result.error);
      } else {
        showSuccess("Order Ready", "Order is now ready for buyer collection");
        // Refresh order details
        await fetchOrderById(id);
      }
    } catch (error) {
      showError("Failed to Mark Ready", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setCompletingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_to_process":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "ready_for_collection":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ready_to_process":
        return "Ready to Process";
      case "processing":
        return "Processing";
      case "ready_for_collection":
        return "Ready for Collection";
      default:
        return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

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
          <Link to="/dashboard/aggregation/order-processing">
            <Button variant="ghost" size="sm" className="mb-4">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Order Processing
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
        <Link to="/dashboard/aggregation/order-processing">
          <Button variant="ghost" size="sm" className="mb-4">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Order Processing
          </Button>
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Order Details</h1>
            <p className="text-sm text-muted-foreground mt-1">Order #{order.orderNumber}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {order.status === "ready_to_process" && (
              <Button
                onClick={handleStartProcessing}
                disabled={processingOrderId === order.id}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processingOrderId === order.id ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <IconArrowRight className="mr-2 h-4 w-4" />
                    Start Processing
                  </>
                )}
              </Button>
            )}
            {order.status === "processing" && (
              <Button
                onClick={handleMarkReadyForCollection}
                disabled={completingOrderId === order.id}
                className="bg-green-600 hover:bg-green-700"
              >
                {completingOrderId === order.id ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <IconCircleCheck className="mr-2 h-4 w-4" />
                    Mark Ready for Collection
                  </>
                )}
              </Button>
            )}
            <Badge variant="outline" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{order.buyerName}</p>
            </div>
            {order.buyerPhone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p>{order.buyerPhone}</p>
              </div>
            )}
            {order.deliveryLocation && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Location</p>
                <p className="font-medium flex items-center gap-1">
                  <IconMapPin className="h-4 w-4" />
                  {order.deliveryLocation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farmer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="h-5 w-5" />
              Farmer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium">{order.farmerName}</p>
            </div>
            {order.farmerPhone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p>{order.farmerPhone}</p>
              </div>
            )}
            {order.farmerRating && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{order.farmerRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/ 5.0</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Variety</p>
              <p className="font-medium">{order.variety}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
              <p className="font-medium">{order.quantity} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quality Grade</p>
              <Badge variant="outline" className="mt-1">
                Grade {order.qualityGrade}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price per Kg</p>
              <p className="font-medium">KES {order.pricePerKg.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-medium text-lg">KES {order.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch & Traceability */}
      {(order.batchId || order.qrCode) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              Batch & Traceability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.batchId && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Batch ID</p>
                <p className="font-mono font-medium">{order.batchId}</p>
              </div>
            )}
            {order.qrCode && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">QR Code</p>
                <div className="flex items-center gap-2">
                  <IconQrcode className="h-5 w-5 text-muted-foreground" />
                  <p className="font-mono font-medium">{order.qrCode}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment Information */}
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge variant="outline" className="mt-1">
                  {payment.status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Pending"}
                </Badge>
              </div>
              {payment.amount && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Amount</p>
                  <p className="font-medium">KES {payment.amount.toLocaleString()}</p>
                </div>
              )}
              {payment.method && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium">{payment.method}</p>
                </div>
              )}
              {payment.transactionReference && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transaction Reference</p>
                  <p className="font-mono text-sm">{payment.transactionReference}</p>
                </div>
              )}
              {payment.confirmedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Confirmed At</p>
                  <p className="font-medium">{new Date(payment.confirmedAt).toLocaleString()}</p>
                </div>
              )}
              {payment.farmerConfirmedAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Farmer Confirmed At</p>
                  <p className="font-medium">{new Date(payment.farmerConfirmedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collection Status */}
      {(order.stockOutRecorded || order.collected !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Collection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stock Out Recorded</p>
                <Badge variant="outline" className={order.stockOutRecorded ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                  {order.stockOutRecorded ? "Yes" : "No"}
                </Badge>
              </div>
              {order.collected !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Collected by Buyer</p>
                  <Badge variant="outline" className={order.collected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {order.collected ? "Yes" : "No"}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
