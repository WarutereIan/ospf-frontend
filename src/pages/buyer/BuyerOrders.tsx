import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  IconSearch,
  IconEye,
  IconStar,
  IconQrcode,
} from "@tabler/icons-react";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { RateFarmer } from "./RateFarmer";
import { useNavigate } from "react-router-dom";
import { BatchTraceabilityDialog } from "@/components/buyer/BatchTraceabilityDialog";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketplaceOrder } from "@/types/marketplace";

export function BuyerOrders() {
  const navigate = useNavigate();
  const { orders, fetchOrders, isLoading, marketplaceFilters, setMarketplaceFilters } = useMarketplace();
  const { user } = useAuth();
  
  const [filteredOrders, setFilteredOrders] = useState<MarketplaceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [traceabilityDialogOpen, setTraceabilityDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | undefined>(undefined);

  // Fetch buyer's orders on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id });
    }
  }, [fetchOrders, user?.id]);

  // Update filters when status filter changes
  useEffect(() => {
    const filters: any = {
      buyerId: user?.id,
      status: statusFilter !== "all" ? statusFilter : undefined,
      searchQuery: searchTerm || undefined,
    };
    setMarketplaceFilters(filters);
    fetchOrders(filters);
  }, [statusFilter, user?.id, setMarketplaceFilters, fetchOrders]);

  // Apply client-side search filter
  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  // Calculate order funnel data
  const orderFunnel = [
    { name: "Placed", count: 50, color: "#3B82F6" },
    { name: "Accepted", count: 45, color: "#22C55E" },
    { name: "Delivered", count: 40, color: "#F59E0B" },
    { name: "Completed", count: 38, color: "#8B5CF6" },
  ];

  // Calculate orders by month
  const ordersByMonth = [
    { name: "Jan", value: 8 },
    { name: "Feb", value: 12 },
    { name: "Mar", value: 10 },
    { name: "Apr", value: 15 },
    { name: "May", value: 18 },
    { name: "Jun", value: 14 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "order_placed":
        return "bg-yellow-100 text-yellow-800";
      case "order_accepted":
        return "bg-blue-100 text-blue-800";
      case "payment_secured":
        return "bg-cyan-100 text-cyan-800";
      case "in_transit":
      case "at_aggregation":
        return "bg-purple-100 text-purple-800";
      case "quality_approved":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "secured":
        return "bg-blue-100 text-blue-800";
      case "confirmed_by_farmer":
        return "bg-green-100 text-green-800";
      case "released":
        return "bg-green-100 text-green-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusLabel = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "pending":
        return "Pending";
      case "secured":
        return "Secured";
      case "confirmed_by_farmer":
        return "Confirmed";
      case "released":
        return "Released";
      case "refunded":
        return "Refunded";
      case "disputed":
        return "Disputed";
      default:
        return paymentStatus.replace(/_/g, " ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your purchases and order status
          </p>
        </div>
      </div>

     

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="order_accepted">Order Accepted</SelectItem>
                <SelectItem value="payment_secured">Payment Secured</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="at_aggregation">At Aggregation</SelectItem>
                <SelectItem value="quality_approved">Quality Approved</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>{filteredOrders.length} order(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/dashboard/buyer/orders/${order.id}`)}
                  >
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus || "pending")}>
                        {getPaymentStatusLabel(order.paymentStatus || "pending")}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.variety}</TableCell>
                    <TableCell>{order.quantity} kg</TableCell>
                    <TableCell className="font-semibold">
                      KES {order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.batchId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBatchId(order.batchId);
                              setTraceabilityDialogOpen(true);
                            }}
                            title="View Batch History"
                          >
                            <IconQrcode className="h-4 w-4" />
                          </Button>
                        )}
                        {order.canRate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setRatingDialogOpen(true);
                            }}
                          >
                            <IconStar className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/buyer/orders/${order.id}`);
                          }}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* Payment Dialog */}
      {selectedOrder && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          orderId={selectedOrder.id}
          amount={selectedOrder.totalAmount}
          farmerName={selectedOrder.farmerName}
        />
      )}

      {/* Rating Dialog */}
      {selectedOrder && (
        <Dialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <RateFarmer
              orderId={selectedOrder.id}
              farmerName={selectedOrder.farmerName}
              farmerId={selectedOrder.farmerId}
              variety={selectedOrder.variety}
              quantity={selectedOrder.quantity}
              onRatingSubmitted={() => {
                setRatingDialogOpen(false);
                // Refresh orders to get updated canRate status
                if (user?.id) {
                  fetchOrders({ buyerId: user.id });
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Batch Traceability Dialog */}
      <BatchTraceabilityDialog
        open={traceabilityDialogOpen}
        onOpenChange={setTraceabilityDialogOpen}
        batchId={selectedBatchId}
      />
    </div>
  );
}

