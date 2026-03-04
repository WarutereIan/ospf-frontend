import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketplaceOrder } from "@/types/marketplace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconArrowLeft,
  IconSearch,
  IconEye,
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconAlertCircle,
  IconShoppingCart,
  IconCurrency,
  IconBuilding,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import {
  StatCard,
  OrderPipeline,
} from "@/components/visualizations";

export function FarmerOrders() {
  const navigate = useNavigate();
  const { orders, fetchOrders, updateOrderStatus, isLoading, orderFilters, setOrderFilters } = useMarketplace();
  const { user } = useAuth();
  
  const [filteredOrders, setFilteredOrders] = useState<MarketplaceOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch farmer's orders on mount and when filters change
  useEffect(() => {
    if (user?.id) {
      const filters: any = {
        farmerId: user.id,
        status: statusFilter !== "all" ? statusFilter : undefined,
        searchQuery: searchTerm || undefined,
      };
      fetchOrders(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, user?.id]);

  // Apply client-side search filter
  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const handleViewOrder = (orderId: string, e?: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if (e) {
      e.stopPropagation();
    }
    navigate(`/dashboard/farmer/orders/${orderId}`);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: MarketplaceOrder["status"]) => {
    setUpdatingStatus(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      showSuccess(
        "Order status updated successfully",
        `Order status has been updated to ${newStatus.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}`
      );
      // Refresh orders
      if (user?.id) {
        await fetchOrders({ farmerId: user.id });
      }
      setUpdatingStatus(null);
    } catch (error) {
      console.error("Failed to update order status:", error);
      showError("Failed to update order status", formatApiError(error));
      setUpdatingStatus(null);
    }
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

      {/* Status Count Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Pending"
          value={orders.filter((o) => o.status === "order_placed").length.toString()}
          description="Awaiting action"
          icon={<IconAlertCircle className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Active"
          value={
            orders.filter(
              (o) =>
                o.status === "order_accepted" ||
                o.status === "payment_secured" ||
                o.status === "in_transit" ||
                o.status === "at_aggregation" ||
                o.status === "quality_approved" ||
                o.status === "out_for_delivery"
            ).length.toString()
          }
          description="In progress"
          icon={<IconTruck className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Complete"
          value={orders.filter((o) => o.status === "completed" || o.status === "delivered").length.toString()}
          description="Finished orders"
          icon={<IconCircleCheck className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label="Total"
          value={`KES ${(orders.reduce((sum, o) => sum + o.totalAmount, 0) / 1000).toFixed(0)}K`}
          description={`${orders.length} orders`}
          icon={<IconPackage className="h-5 w-5 text-primary" />}
        />
      </div>

     

      {/* Filters and Order List */}
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
          <CardDescription>Filterable list of all your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or buyer name..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="order_placed">Pending</SelectItem>
                <SelectItem value="order_accepted">Accepted</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow 
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.buyerName}</TableCell>
                      <TableCell>
                        {order.variety} <Badge variant="outline" className="ml-2">Grade {order.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell>{order.quantity} kg</TableCell>
                      <TableCell>KES {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{formatStatus(order.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => handleViewOrder(order.id, e)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center">
                        <IconPackage className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-lg font-medium text-muted-foreground">No orders found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters
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

    </div>
  );
}

