import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconSearch,
  IconEye,
  IconCheck,
  IconX,
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconAlertCircle,
  IconLoader2,
  IconShoppingCart,
  IconCurrency,
  IconUser,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconFileText,
} from "@tabler/icons-react";
import { StatCard } from "@/components/visualizations";

interface InputOrder {
  id: string;
  orderNumber: string;
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  inputName: string;
  inputCategory: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
  transportFee: number;
  totalAmount: number;
  status: "pending" | "accepted" | "processing" | "ready_for_pickup" | "in_transit" | "delivered" | "completed" | "cancelled" | "rejected";
  createdAt: string;
  deliveryDate?: string;
  notes?: string;
  requiresTransport: boolean;
  transportProvider?: string;
  paymentStatus: "pending" | "paid" | "refunded";
}

export default function InputOrders() {
  const [orders, setOrders] = useState<InputOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<InputOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<InputOrder | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleOrders: InputOrder[] = [
        {
          id: "1",
          orderNumber: "INP-ORD-001",
          farmerName: "John Kamau",
          farmerPhone: "+254712345678",
          farmerLocation: "Kangundo, Machakos",
          inputName: "OFSP Vines (Kenya)",
          inputCategory: "Planting Material",
          quantity: 500,
          unit: "cutting",
          pricePerUnit: 30,
          subtotal: 15000,
          transportFee: 500,
          totalAmount: 15500,
          status: "pending",
          createdAt: "2024-01-15T10:30:00Z",
          requiresTransport: true,
          paymentStatus: "pending",
        },
        {
          id: "2",
          orderNumber: "INP-ORD-002",
          farmerName: "Mary Wanjiku",
          farmerPhone: "+254723456789",
          farmerLocation: "Matungulu, Machakos",
          inputName: "NPK Fertilizer",
          inputCategory: "Fertilizer",
          quantity: 50,
          unit: "kg",
          pricePerUnit: 150,
          subtotal: 7500,
          transportFee: 500,
          totalAmount: 8000,
          status: "accepted",
          createdAt: "2024-01-14T14:20:00Z",
          deliveryDate: "2024-01-20",
          requiresTransport: true,
          paymentStatus: "paid",
        },
        {
          id: "3",
          orderNumber: "INP-ORD-003",
          farmerName: "Peter Mwangi",
          farmerPhone: "+254734567890",
          farmerLocation: "Mwala, Machakos",
          inputName: "OFSP Vines (SPK004)",
          inputCategory: "Planting Material",
          quantity: 300,
          unit: "cutting",
          pricePerUnit: 35,
          subtotal: 10500,
          transportFee: 0,
          totalAmount: 10500,
          status: "processing",
          createdAt: "2024-01-13T09:15:00Z",
          requiresTransport: false,
          paymentStatus: "paid",
        },
        {
          id: "4",
          orderNumber: "INP-ORD-004",
          farmerName: "Jane Wambui",
          farmerPhone: "+254745678901",
          farmerLocation: "Kangundo, Machakos",
          inputName: "Organic Compost",
          inputCategory: "Soil Amendment",
          quantity: 100,
          unit: "kg",
          pricePerUnit: 80,
          subtotal: 8000,
          transportFee: 500,
          totalAmount: 8500,
          status: "ready_for_pickup",
          createdAt: "2024-01-12T11:45:00Z",
          deliveryDate: "2024-01-18",
          requiresTransport: true,
          transportProvider: "Transport Co. Ltd",
          paymentStatus: "paid",
        },
        {
          id: "5",
          orderNumber: "INP-ORD-005",
          farmerName: "David Kipchoge",
          farmerPhone: "+254756789012",
          farmerLocation: "Matungulu, Machakos",
          inputName: "Training Manuals",
          inputCategory: "Training Materials",
          quantity: 10,
          unit: "book",
          pricePerUnit: 500,
          subtotal: 5000,
          transportFee: 0,
          totalAmount: 5000,
          status: "delivered",
          createdAt: "2024-01-10T08:30:00Z",
          deliveryDate: "2024-01-15",
          requiresTransport: false,
          paymentStatus: "paid",
        },
        {
          id: "6",
          orderNumber: "INP-ORD-006",
          farmerName: "Sarah Njeri",
          farmerPhone: "+254767890123",
          farmerLocation: "Mwala, Machakos",
          inputName: "OFSP Vines (Kenya)",
          inputCategory: "Planting Material",
          quantity: 200,
          unit: "cutting",
          pricePerUnit: 30,
          subtotal: 6000,
          transportFee: 500,
          totalAmount: 6500,
          status: "completed",
          createdAt: "2024-01-08T16:20:00Z",
          deliveryDate: "2024-01-12",
          requiresTransport: true,
          paymentStatus: "paid",
        },
      ];
      setOrders(sampleOrders);
      setFilteredOrders(sampleOrders);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.inputName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleViewOrder = (order: InputOrder) => {
    setSelectedOrder(order);
    setIsDetailDialogOpen(true);
  };

  const handleAcceptOrder = (orderId: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "accepted" as const } : order
      )
    );
    setIsDetailDialogOpen(false);
  };

  const handleRejectOrder = (orderId: string) => {
    if (confirm("Are you sure you want to reject this order?")) {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "rejected" as const } : order
        )
      );
      setIsDetailDialogOpen(false);
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: InputOrder["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setIsDetailDialogOpen(false);
  };

  const getStatusBadge = (status: InputOrder["status"]) => {
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      accepted: { label: "Accepted", className: "bg-blue-100 text-blue-800" },
      processing: { label: "Processing", className: "bg-purple-100 text-purple-800" },
      ready_for_pickup: { label: "Ready for Pickup", className: "bg-green-100 text-green-800" },
      in_transit: { label: "In Transit", className: "bg-indigo-100 text-indigo-800" },
      delivered: { label: "Delivered", className: "bg-teal-100 text-teal-800" },
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: InputOrder["paymentStatus"]) => {
    const config = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Paid", className: "bg-green-100 text-green-800" },
      refunded: { label: "Refunded", className: "bg-red-100 text-red-800" },
    };
    const paymentConfig = config[status] || config.pending;
    return <Badge className={paymentConfig.className}>{paymentConfig.label}</Badge>;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => ["accepted", "processing", "ready_for_pickup"].includes(o.status)).length,
    completed: orders.filter((o) => ["delivered", "completed"].includes(o.status)).length,
    totalRevenue: orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Input Orders</h1>
        <p className="text-muted-foreground mt-1">
          Manage orders from farmers for your agricultural inputs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.total.toString()}
          description="All time orders"
          icon={<IconShoppingCart className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Pending"
          value={stats.pending.toString()}
          description="Awaiting approval"
          icon={<IconAlertCircle className="h-5 w-5 text-yellow-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Processing"
          value={stats.processing.toString()}
          description="In progress"
          icon={<IconLoader2 className="h-5 w-5 text-blue-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}K`}
          description="From completed orders"
          icon={<IconCurrency className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, farmer name, or input..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Showing {filteredOrders.length} of {orders.length} orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <IconShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Input</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.farmerName}</div>
                          <div className="text-xs text-muted-foreground">{order.farmerLocation}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.inputName}</div>
                          <div className="text-xs text-muted-foreground">{order.inputCategory}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.quantity} {order.unit}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">KES {order.totalAmount.toLocaleString()}</div>
                        {order.transportFee > 0 && (
                          <div className="text-xs text-muted-foreground">
                            +KES {order.transportFee} transport
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details - {selectedOrder.orderNumber}</DialogTitle>
                <DialogDescription>
                  Order placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Order Status</div>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Payment Status</div>
                    <div className="mt-1">{getPaymentStatusBadge(selectedOrder.paymentStatus)}</div>
                  </div>
                </div>

                {/* Farmer Information */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <IconUser className="h-4 w-4" />
                    Farmer Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-24">Name:</span>
                      <span className="font-medium">{selectedOrder.farmerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconPhone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.farmerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.farmerLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <IconPackage className="h-4 w-4" />
                    Order Items
                  </h3>
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{selectedOrder.inputName}</span>
                      <span className="text-muted-foreground">{selectedOrder.inputCategory}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Quantity:</span>
                      <span className="font-medium">
                        {selectedOrder.quantity} {selectedOrder.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per {selectedOrder.unit}:</span>
                      <span className="font-medium">KES {selectedOrder.pricePerUnit.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>KES {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {selectedOrder.transportFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Transport Fee:</span>
                          <span>KES {selectedOrder.transportFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>KES {selectedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transport Information */}
                {selectedOrder.requiresTransport && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <IconTruck className="h-4 w-4" />
                      Transport Information
                    </h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Transport Required:</span>
                        <Badge className="bg-blue-100 text-blue-800">Yes</Badge>
                      </div>
                      {selectedOrder.transportProvider && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Provider: </span>
                          <span className="font-medium">{selectedOrder.transportProvider}</span>
                        </div>
                      )}
                      {selectedOrder.deliveryDate && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <IconCalendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Delivery Date: </span>
                          <span className="font-medium">{selectedOrder.deliveryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <IconFileText className="h-4 w-4" />
                      Notes
                    </h3>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button onClick={() => handleAcceptOrder(selectedOrder.id)} className="flex-1">
                        <IconCheck className="mr-2 h-4 w-4" />
                        Accept Order
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectOrder(selectedOrder.id)}
                        className="flex-1"
                      >
                        <IconX className="mr-2 h-4 w-4" />
                        Reject Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "accepted" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                      className="flex-1"
                    >
                      <IconLoader2 className="mr-2 h-4 w-4" />
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.status === "processing" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "ready_for_pickup")}
                      className="flex-1"
                    >
                      <IconPackage className="mr-2 h-4 w-4" />
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {selectedOrder.status === "ready_for_pickup" && selectedOrder.requiresTransport && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "in_transit")}
                      className="flex-1"
                    >
                      <IconTruck className="mr-2 h-4 w-4" />
                      Mark In Transit
                    </Button>
                  )}
                  {(selectedOrder.status === "in_transit" || selectedOrder.status === "ready_for_pickup") && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                      className="flex-1"
                    >
                      <IconCircleCheck className="mr-2 h-4 w-4" />
                      Mark Delivered
                    </Button>
                  )}
                  {selectedOrder.status === "delivered" && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                      className="flex-1"
                    >
                      <IconCircleCheck className="mr-2 h-4 w-4" />
                      Complete Order
                    </Button>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
