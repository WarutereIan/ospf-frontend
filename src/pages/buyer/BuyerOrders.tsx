import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconEye,
  IconPackage,
  IconDownload,
  IconStar,
  IconMapPin,
  IconTruck,
  IconClipboardCheck,
  IconCash,
  IconClock,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconCircleCheck,
  IconChartBar,
  IconUser,
} from "@tabler/icons-react";
import { EscrowStatus, type EscrowStatus as EscrowStatusType } from "@/components/payments/EscrowStatus";
import { RateFarmer } from "./RateFarmer";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BuyerOrder {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerRating?: number;
  aggregationCenter: string;
  centerLocation: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  pricePerKg: number;
  totalAmount: number;
  status:
    | "order_placed"
    | "order_accepted"
    | "payment_secured"
    | "in_transit"
    | "at_aggregation"
    | "quality_checked"
    | "quality_approved"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "rejected"
    | "disputed";
  createdAt: string;
  deliveryLocation?: string;
  paymentStatus?: EscrowStatusType;
  paymentAmount?: number;
  photos?: string[];
  canRate: boolean;
  qualityScore?: number;
  qualityFeedback?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  farmerDeliveryHistory?: number; // Number of successful past deliveries
  farmerQualityAverage?: number; // Farmer's average quality score
}

const sampleOrders: BuyerOrder[] = [
  {
    id: "ORD-001",
    farmerId: "F001",
    farmerName: "James Mutua",
    farmerPhone: "+254712345678",
    farmerRating: 4.8,
    aggregationCenter: "Kangundo Aggregation Center",
    centerLocation: "Kangundo",
    variety: "Kenya",
    quantity: 500,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 75000,
    status: "quality_approved",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: "Nairobi",
    paymentStatus: "ready_for_release",
    paymentAmount: 75000,
    canRate: false,
    qualityScore: 95,
    qualityFeedback: "Excellent quality - premium grade, uniform size",
    estimatedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    farmerDeliveryHistory: 25,
    farmerQualityAverage: 92,
  },
  {
    id: "ORD-002",
    farmerId: "F002",
    farmerName: "Mary Wanjiku",
    farmerPhone: "+254723456789",
    farmerRating: 4.5,
    aggregationCenter: "Kathiani Aggregation Center",
    centerLocation: "Kathiani",
    variety: "SPK004",
    quantity: 300,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 45000,
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: "Mombasa",
    paymentStatus: "completed",
    paymentAmount: 45000,
    canRate: true,
    qualityScore: 88,
    qualityFeedback: "Good quality, slight variation in size",
    actualDeliveryDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    farmerDeliveryHistory: 18,
    farmerQualityAverage: 87,
  },
  {
    id: "ORD-003",
    farmerId: "F003",
    farmerName: "Peter Kamau",
    farmerPhone: "+254734567890",
    farmerRating: 4.2,
    aggregationCenter: "Masinga Aggregation Center",
    centerLocation: "Masinga",
    variety: "Kabode",
    quantity: 200,
    qualityGrade: "B",
    pricePerKg: 120,
    totalAmount: 24000,
    status: "at_aggregation",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: "Kisumu",
    paymentStatus: "in_escrow",
    paymentAmount: 24000,
    canRate: false,
    estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    farmerDeliveryHistory: 12,
    farmerQualityAverage: 78,
  },
  {
    id: "ORD-004",
    farmerId: "F001",
    farmerName: "James Mutua",
    farmerPhone: "+254712345678",
    farmerRating: 4.8,
    aggregationCenter: "Kangundo Aggregation Center",
    centerLocation: "Kangundo",
    variety: "Kenya",
    quantity: 400,
    qualityGrade: "A",
    pricePerKg: 150,
    totalAmount: 60000,
    status: "order_placed",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    deliveryLocation: "Nairobi",
    paymentStatus: "pending",
    canRate: false,
    estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    farmerDeliveryHistory: 25,
    farmerQualityAverage: 92,
  },
];

export function BuyerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<BuyerOrder[]>(sampleOrders);
  const [filteredOrders, setFilteredOrders] = useState<BuyerOrder[]>(sampleOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [farmerFilter, setFarmerFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<BuyerOrder | null>(null);

  // Calculate metrics
  const totalSpent = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalPending = orders
    .filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "in_escrow")
    .reduce((sum, o) => sum + (o.paymentAmount || 0), 0);

  const averageQualityReceived = orders.filter((o) => o.qualityScore).length > 0
    ? Math.round(
        orders.filter((o) => o.qualityScore).reduce((sum, o) => sum + (o.qualityScore || 0), 0) /
          orders.filter((o) => o.qualityScore).length
      )
    : 0;

  const pendingRatings = orders.filter((o) => o.canRate).length;

  const uniqueFarmers = Array.from(new Set(orders.map((o) => o.farmerId)));
  const uniqueCenters = Array.from(new Set(orders.map((o) => o.aggregationCenter)));

  const completionRate = orders.length > 0
    ? Math.round((orders.filter((o) => o.status === "completed").length / orders.length) * 100)
    : 0;

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (farmerFilter !== "all") {
      filtered = filtered.filter((o) => o.farmerId === farmerFilter);
    }

    if (centerFilter !== "all") {
      filtered = filtered.filter((o) => o.aggregationCenter === centerFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, farmerFilter, centerFilter]);

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
      case "quality_checked":
        return "bg-orange-100 text-orange-800";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track your purchases with complete farmer traceability
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter((o) => !["completed", "rejected", "disputed"].includes(o.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              KES {(totalSpent / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{averageQualityReceived}%</div>
              <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Unique Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueFarmers.length}</div>
            <p className="text-xs text-muted-foreground">Suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Pending Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingRatings}</div>
            <p className="text-xs text-muted-foreground">To rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              {completionRate >= 90 ? (
                <IconTrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <IconTrendingDown className="h-5 w-5 text-orange-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">Successfully completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Centers</CardTitle>
              <IconMapPin className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{uniqueCenters.length}</div>
            <p className="text-xs text-muted-foreground">Aggregation centers</p>
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
            <p className="text-xs text-muted-foreground">In escrow</p>
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
                placeholder="Search by order ID, farmer name, or variety..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={farmerFilter} onValueChange={(value) => setFarmerFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Farmers</SelectItem>
                {uniqueFarmers.map((farmerId) => {
                  const farmer = orders.find((o) => o.farmerId === farmerId);
                  return (
                    <SelectItem key={farmerId} value={farmerId}>
                      {farmer?.farmerName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={centerFilter} onValueChange={(value) => setCenterFilter(value || "all")}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {uniqueCenters.map((center) => (
                  <SelectItem key={center} value={center}>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>{filteredOrders.length} order(s) found</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <IconChartBar className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Farmer (Origin)</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Variety</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Quality</TableHead>
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
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <IconUser className="h-3 w-3 text-primary" />
                          <span className="font-medium">{order.farmerName}</span>
                        </div>
                        {order.farmerRating && (
                          <div className="flex items-center gap-1">
                            <IconStar className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs">{order.farmerRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({order.farmerDeliveryHistory} orders)
                            </span>
                          </div>
                        )}
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
                        <p className="font-medium text-sm">{order.variety}</p>
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
                        <span className="text-sm text-muted-foreground">Pending</span>
                      )}
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
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {order.canRate && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrderForRating(order);
                              setRatingDialogOpen(true);
                            }}
                          >
                            <IconStar className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/dashboard/buyer/orders/${order.id}`)}
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

      {/* Rating Dialog */}
      {selectedOrderForRating && ratingDialogOpen && (
        <RateFarmer
          farmerId={selectedOrderForRating.farmerId}
          farmerName={selectedOrderForRating.farmerName}
          orderId={selectedOrderForRating.id}
          variety={selectedOrderForRating.variety}
          quantity={selectedOrderForRating.quantity}
          onRatingSubmitted={() => {
            setRatingDialogOpen(false);
            setSelectedOrderForRating(null);
          }}
        />
      )}
    </div>
  );
}
