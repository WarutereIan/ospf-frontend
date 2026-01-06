import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  IconCheck,
  IconX,
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconAlertCircle,
  IconLoader2,
  IconClock,
  IconCash,
  IconMapPin,
  IconClipboardCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconStar,
  IconChartBar,
} from "@tabler/icons-react";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";
import { cn } from "@/lib/utils";

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

// Sample orders with aggregation center info
const sampleOrders: FarmerOrder[] = [
  {
    id: "ORD-001",
    buyerId: "B001",
    buyerName: "John Mwangi",
    buyerPhone: "+254712345678",
    variety: "Kenya",
    quantity: 500,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 75000,
    status: "order_placed",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    aggregationCenter: "Kangundo Aggregation Center",
    centerLocation: "Kangundo",
    deliveryLocation: "Nairobi",
    paymentStatus: "pending",
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-002",
    buyerId: "B002",
    buyerName: "Mary Wanjiku",
    buyerPhone: "+254723456789",
    variety: "SPK004",
    quantity: 300,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 45000,
    status: "at_aggregation",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aggregationCenter: "Kathiani Aggregation Center",
    centerLocation: "Kathiani",
    deliveryLocation: "Mombasa",
    paymentStatus: "in_escrow",
    paymentAmount: 45000,
    estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-003",
    buyerId: "B003",
    buyerName: "Peter Kamau",
    buyerPhone: "+254734567890",
    variety: "Kabode",
    quantity: 200,
    qualityGrade: "B",
    pricePerKg: 120,
    totalAmount: 24000,
    status: "quality_approved",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aggregationCenter: "Masinga Aggregation Center",
    centerLocation: "Masinga",
    deliveryLocation: "Kisumu",
    paymentStatus: "ready_for_release",
    paymentAmount: 24000,
    qualityScore: 88,
    qualityFeedback: "Good quality, slight variation in size",
    estimatedDeliveryDate: new Date(Date.now()).toISOString(),
    photos: ["https://via.placeholder.com/400x300?text=Quality+Check"],
  },
  {
    id: "ORD-004",
    buyerId: "B001",
    buyerName: "John Mwangi",
    buyerPhone: "+254712345678",
    variety: "Kenya",
    quantity: 400,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 60000,
    status: "completed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    aggregationCenter: "Kangundo Aggregation Center",
    centerLocation: "Kangundo",
    deliveryLocation: "Nairobi",
    paymentStatus: "completed",
    paymentAmount: 60000,
    qualityScore: 95,
    qualityFeedback: "Excellent quality - premium grade",
    actualDeliveryDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    daysToDeliver: 2,
  },
  {
    id: "ORD-005",
    buyerId: "B004",
    buyerName: "Sarah Njeri",
    buyerPhone: "+254745678901",
    variety: "SPK004",
    quantity: 150,
    qualityGrade: "C",
    pricePerKg: 90,
    totalAmount: 13500,
    status: "quality_rejected",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    aggregationCenter: "Yatta Aggregation Center",
    centerLocation: "Yatta",
    deliveryLocation: "Nakuru",
    paymentStatus: "disputed",
    paymentAmount: 13500,
    qualityScore: 65,
    qualityFeedback: "Below expected quality - high damage percentage",
  },
];

export function FarmerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<FarmerOrder[]>(sampleOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Calculate metrics
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPending = orders
    .filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "in_escrow")
    .reduce((sum, o) => sum + (o.paymentAmount || 0), 0);

  const averageOrderValue = orders.length > 0
    ? Math.round(orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length)
    : 0;

  const averageQualityScore = orders.filter((o) => o.qualityScore).length > 0
    ? Math.round(
        orders.filter((o) => o.qualityScore).reduce((sum, o) => sum + (o.qualityScore || 0), 0) /
          orders.filter((o) => o.qualityScore).length
      )
    : 0;

  const completionRate = orders.length > 0
    ? Math.round((orders.filter((o) => o.status === "completed").length / orders.length) * 100)
    : 0;

  const rejectionRate = orders.length > 0
    ? Math.round(
        (orders.filter((o) => o.status === "quality_rejected" || o.status === "rejected").length /
          orders.length) *
          100
      )
    : 0;

  const averageDeliveryTime = orders.filter((o) => o.daysToDeliver).length > 0
    ? Math.round(
        orders.filter((o) => o.daysToDeliver).reduce((sum, o) => sum + (o.daysToDeliver || 0), 0) /
          orders.filter((o) => o.daysToDeliver).length
      )
    : 0;

  // Unique centers
  const uniqueCenters = Array.from(new Set(orders.map((o) => o.aggregationCenter))).filter(Boolean);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.variety.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesCenter =
      centerFilter === "all" || order.aggregationCenter === centerFilter;

    return matchesSearch && matchesStatus && matchesCenter;
  });

  const handleViewOrder = (orderId: string) => {
    navigate(`/dashboard/farmer/orders/${orderId}`);
  };

  const handleAcceptOrder = async (orderId: string) => {
    setUpdatingStatus(orderId);
    setTimeout(() => {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "order_accepted" as any } : order
        )
      );
      setUpdatingStatus(null);
    }, 1000);
  };

  const handleRejectOrder = async (orderId: string) => {
    setUpdatingStatus(orderId);
    setTimeout(() => {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: "rejected" as any } : order
        )
      );
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
      case "quality_checked":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "quality_approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "quality_rejected":
        return "bg-red-100 text-red-800 border-red-300";
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
      case "quality_checked":
        return <IconClipboardCheck className="h-4 w-4" />;
      case "quality_approved":
        return <IconCircleCheck className="h-4 w-4" />;
      case "quality_rejected":
        return <IconX className="h-4 w-4" />;
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
          <Link to="/dashboard/farmer">
            <Button variant="ghost" size="sm" className="mb-2">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your OFSP orders across aggregation centers
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "order_placed").length}
            </div>
            <p className="text-xs text-muted-foreground">Needs action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                orders.filter(
                  (o) =>
                    o.status === "order_accepted" ||
                    o.status === "payment_secured" ||
                    o.status === "in_transit" ||
                    o.status === "at_aggregation" ||
                    o.status === "quality_checked" ||
                    o.status === "quality_approved" ||
                    o.status === "out_for_delivery"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === "completed" || o.status === "delivered").length}
            </div>
            <p className="text-xs text-muted-foreground">{completionRate}% rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              KES {(totalRevenue / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{averageQualityScore}%</div>
              <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">Avg score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Centers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCenters.length}</div>
            <p className="text-xs text-muted-foreground">Locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Delivery Performance</CardTitle>
              {averageDeliveryTime <= 2 ? (
                <IconTrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <IconTrendingDown className="h-5 w-5 text-orange-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{averageDeliveryTime} days</div>
            <p className="text-xs text-muted-foreground">Average delivery time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Rejection Rate</CardTitle>
              {rejectionRate < 10 ? (
                <IconCircleCheck className="h-5 w-5 text-green-600" />
              ) : (
                <IconAlertTriangle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{rejectionRate}%</div>
            <p className="text-xs text-muted-foreground">Quality rejections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <IconCash className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold mb-1">KES {(totalPending / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">Awaiting release</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, buyer, variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={centerFilter} onValueChange={(value) => setCenterFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {uniqueCenters.map((center) => (
                  <SelectItem key={center} value={center!}>
                    {center}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="order_placed">Order Placed</SelectItem>
                <SelectItem value="order_accepted">Order Accepted</SelectItem>
                <SelectItem value="at_aggregation">At Aggregation</SelectItem>
                <SelectItem value="quality_approved">Quality Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="quality_rejected">Quality Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>{filteredOrders.length} order(s) found</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <IconChartBar className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Aggregation Center</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Quality Score</TableHead>
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
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{order.buyerName}</p>
                        <p className="text-xs text-muted-foreground">{order.buyerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{order.aggregationCenter}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {order.centerLocation}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.variety}</p>
                        <Badge variant="outline" className="text-xs">
                          Grade {order.qualityGrade}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{order.quantity} kg</TableCell>
                    <TableCell className="font-semibold">
                      KES {order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {order.qualityScore ? (
                        <div className="flex items-center gap-1">
                          <IconStar className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium text-sm">{order.qualityScore}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
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
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.status === "order_placed" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAcceptOrder(order.id)}
                              disabled={updatingStatus === order.id}
                            >
                              {updatingStatus === order.id ? (
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <IconCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectOrder(order.id)}
                              disabled={updatingStatus === order.id}
                            >
                              <IconX className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleViewOrder(order.id)}>
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

    </div>
  );
}
