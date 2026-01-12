import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconArrowLeft,
  IconSearch,
  IconEye,
  IconCheck,
  IconX,
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { OrderTimeline, type OrderStage } from "@/components/orders/OrderTimeline";
import { OrderStatusHistory } from "@/components/orders/OrderStatusHistory";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";

interface FarmerOrder {
  id: string;
  buyerName: string;
  buyerPhone: string;
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
    | "quality_approved"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "disputed";
  createdAt: string;
  deliveryLocation?: string;
  notes?: string;
  paymentStatus?: EscrowStatusType;
  paymentAmount?: number;
  photos?: string[];
}

// Sample orders - will be replaced with API calls
const sampleOrders: FarmerOrder[] = [
  {
    id: "ORD-001",
    buyerName: "John Mwangi",
    buyerPhone: "+254712345678",
    variety: "Kenya",
    quantity: 500,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 75000,
    status: "order_placed",
    createdAt: new Date().toISOString(),
    deliveryLocation: "Kangundo Main Aggregation Center (Main - Kangundo Subcounty)",
    paymentStatus: "pending",
  },
  {
    id: "ORD-002",
    buyerName: "Mary Wanjiku",
    buyerPhone: "+254723456789",
    variety: "SPK004",
    quantity: 300,
    qualityGrade: "A",
    pricePerKg: 120,
    totalAmount: 36000,
    status: "order_accepted",
    createdAt: new Date().toISOString(),
    deliveryLocation: "Tala Satellite Center (Satellite - Tala Ward, Kangundo)",
    paymentStatus: "in_escrow",
    paymentAmount: 36000,
  },
  {
    id: "ORD-003",
    buyerName: "Peter Kamau",
    buyerPhone: "+254734567890",
    variety: "Kabode",
    quantity: 200,
    qualityGrade: "B",
    pricePerKg: 100,
    totalAmount: 20000,
    status: "quality_approved",
    createdAt: new Date().toISOString(),
    deliveryLocation: "Yatta Main Aggregation Center (Main - Yatta Subcounty)",
    paymentStatus: "ready_for_release",
    paymentAmount: 20000,
    photos: [
      "https://via.placeholder.com/400x300?text=Quality+Check+Photo+1",
      "https://via.placeholder.com/400x300?text=Quality+Check+Photo+2",
    ],
  },
];

export function FarmerOrders() {
  const [orders, setOrders] = useState<FarmerOrder[]>(sampleOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<FarmerOrder | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const filteredOrders =
    statusFilter === "all"
      ? orders.filter(
          (order) =>
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.buyerName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : orders.filter(
          (order) =>
            order.status === statusFilter &&
            (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()))
        );

  const handleViewOrder = (order: FarmerOrder) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
      setUpdatingStatus(null);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "order_placed":
        return <IconAlertCircle className="h-4 w-4" />;
      case "order_accepted":
        return <IconCircleCheck className="h-4 w-4" />;
      case "payment_secured":
        return <IconPackage className="h-4 w-4" />;
      case "in_transit":
        return <IconTruck className="h-4 w-4" />;
      case "at_aggregation":
        return <IconPackage className="h-4 w-4" />;
      case "quality_approved":
        return <IconCircleCheck className="h-4 w-4" />;
      case "out_for_delivery":
        return <IconTruck className="h-4 w-4" />;
      case "delivered":
      case "completed":
        return <IconCircleCheck className="h-4 w-4" />;
      case "disputed":
        return <IconAlertCircle className="h-4 w-4" />;
      default:
        return <IconPackage className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your OFSP orders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All-time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "order_placed").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                orders.filter(
                  (o) =>
                    o.status === "order_accepted" ||
                    o.status === "payment_secured" ||
                    o.status === "in_transit" ||
                    o.status === "at_aggregation" ||
                    o.status === "quality_approved" ||
                    o.status === "out_for_delivery"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "completed" || o.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="order_accepted">Order Accepted</SelectItem>
                <SelectItem value="payment_secured">Payment Secured</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="at_aggregation">At Aggregation</SelectItem>
                <SelectItem value="quality_approved">Quality Approved</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.buyerName}</p>
                          <p className="text-xs text-muted-foreground">{order.buyerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.variety} (Grade {order.qualityGrade})
                      </TableCell>
                      <TableCell>{order.quantity} kg</TableCell>
                      <TableCell className="font-semibold">
                        KES {order.totalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {formatStatus(order.status)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewOrder(order)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <IconPackage className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium text-muted-foreground">
                          No orders found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Once buyers place orders, they will appear here
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Timeline */}
              <OrderTimeline
                currentStage={selectedOrder.status as OrderStage}
                stages={[
                  {
                    stage: "order_placed",
                    timestamp: selectedOrder.createdAt,
                    completed: true,
                  },
                  {
                    stage: "order_accepted",
                    timestamp:
                      selectedOrder.status !== "order_placed"
                        ? new Date(Date.now() - 15 * 60 * 1000).toISOString()
                        : undefined,
                    completed: selectedOrder.status !== "order_placed",
                  },
                  {
                    stage: "payment_secured",
                    timestamp:
                      ["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                        selectedOrder.status
                      )
                        ? new Date(Date.now() - 10 * 60 * 1000).toISOString()
                        : undefined,
                    completed: ["payment_secured", "in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                      selectedOrder.status
                    ),
                  },
                  {
                    stage: "in_transit",
                    timestamp:
                      ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                        selectedOrder.status
                      )
                        ? new Date(Date.now() - 5 * 60 * 1000).toISOString()
                        : undefined,
                    completed: ["in_transit", "at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                      selectedOrder.status
                    ),
                  },
                  {
                    stage: "at_aggregation",
                    timestamp:
                      ["at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                        selectedOrder.status
                      )
                        ? new Date(Date.now() - 2 * 60 * 1000).toISOString()
                        : undefined,
                    completed: ["at_aggregation", "quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                      selectedOrder.status
                    ),
                  },
                  {
                    stage: "quality_approved",
                    timestamp:
                      ["quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                        selectedOrder.status
                      )
                        ? new Date(Date.now() - 1 * 60 * 1000).toISOString()
                        : undefined,
                    completed: ["quality_approved", "out_for_delivery", "delivered", "completed"].includes(
                      selectedOrder.status
                    ),
                  },
                  {
                    stage: "out_for_delivery",
                    timestamp:
                      ["out_for_delivery", "delivered", "completed"].includes(selectedOrder.status)
                        ? new Date(Date.now() - 30 * 1000).toISOString()
                        : undefined,
                    completed: ["out_for_delivery", "delivered", "completed"].includes(selectedOrder.status),
                  },
                  {
                    stage: "delivered",
                    timestamp:
                      ["delivered", "completed"].includes(selectedOrder.status)
                        ? new Date().toISOString()
                        : undefined,
                    completed: ["delivered", "completed"].includes(selectedOrder.status),
                  },
                  {
                    stage: "completed",
                    timestamp: selectedOrder.status === "completed" ? new Date().toISOString() : undefined,
                    completed: selectedOrder.status === "completed",
                  },
                ]}
              />

              {/* Order Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Order Status</h3>
                  <Badge variant="outline" className={getStatusColor(selectedOrder.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Order Date</h3>
                  <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Buyer Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Buyer Information</h3>
                <div className="border rounded-md p-4 space-y-1">
                  <p className="font-medium">{selectedOrder.buyerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.buyerPhone}</p>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Order Details</h3>
                <div className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Variety</span>
                    <span className="font-medium">{selectedOrder.variety}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quality Grade</span>
                    <Badge variant="outline">Grade {selectedOrder.qualityGrade}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <span className="font-medium">{selectedOrder.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price per kg</span>
                    <span className="font-medium">KES {selectedOrder.pricePerKg}/kg</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">
                      KES {selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              {selectedOrder.deliveryLocation && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Delivery Location</h3>
                  <div className="border rounded-md p-4">
                    <p className="text-sm">{selectedOrder.deliveryLocation}</p>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              {selectedOrder.paymentStatus && selectedOrder.paymentAmount && (
                <EscrowStatus
                  status={selectedOrder.paymentStatus}
                  amount={selectedOrder.paymentAmount}
                  orderId={selectedOrder.id}
                  createdAt={selectedOrder.createdAt}
                />
              )}

              {/* Status History */}
              <OrderStatusHistory
                orderId={selectedOrder.id}
                currentStatus={selectedOrder.status}
                history={[
                  {
                    id: "hist-1",
                    status: "order_placed" as const,
                    changedBy: {
                      id: "buyer-1",
                      name: selectedOrder.buyerName,
                      role: "buyer" as const,
                    },
                    timestamp: selectedOrder.createdAt,
                    notes: "Order placed by buyer",
                  },
                  ...(selectedOrder.status !== "order_placed"
                    ? [
                  {
                    id: "hist-2",
                    status: "order_accepted" as const,
                    changedBy: {
                      id: "farmer-1",
                      name: "You",
                      role: "farmer" as const,
                    },
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    notes: "Order accepted",
                  },
                      ]
                    : []),
                  ...(selectedOrder.paymentStatus && selectedOrder.paymentStatus !== "pending"
                    ? [
                        {
                          id: "hist-3",
                          status: "payment_secured" as const,
                          changedBy: {
                            id: "system-1",
                            name: "System",
                            role: "system" as const,
                          },
                          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                          notes: "Payment secured in escrow",
                          metadata: {
                            amount: `KES ${selectedOrder.paymentAmount?.toLocaleString()}`,
                            method: "M-PESA",
                          },
                        },
                      ]
                    : []),
                ]}
              />

              {/* Photo Documentation */}
              {selectedOrder.photos && selectedOrder.photos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedOrder.photos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={photo}
                          alt={`Order photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedOrder.status === "order_placed" && (
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedOrder.id, "rejected")}
                    disabled={updatingStatus === selectedOrder.id}
                    className="w-full sm:w-auto"
                  >
                    {updatingStatus === selectedOrder.id ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconX className="mr-2 h-4 w-4" />
                    )}
                    Reject Order
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "accepted")}
                    disabled={updatingStatus === selectedOrder.id}
                    className="w-full sm:w-auto"
                  >
                    {updatingStatus === selectedOrder.id ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck className="mr-2 h-4 w-4" />
                    )}
                    Accept Order
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

