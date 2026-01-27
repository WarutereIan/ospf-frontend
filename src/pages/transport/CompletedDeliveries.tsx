import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTruck,
  IconMapPin,
  IconPhoto,
  IconCheck,
  IconCalendar,
  IconCurrency,
  IconWeight,
  IconClock,
  IconSearch,
  IconDownload,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import type { TransportRequest } from "@/types/transport";

export default function CompletedDeliveries() {
  const { requests, fetchRequests, isLoading } = useTransport();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) fetchRequests({ providerId: user.id });
  }, [user?.id, fetchRequests]);

  // Get completed deliveries (filtered by status)
  const deliveries = requests.filter(req => req.status === "delivered" || req.status === "completed");

  const [selectedDelivery, setSelectedDelivery] = useState<TransportRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || delivery.type === filterType;
    // Note: TransportRequest doesn't have paymentStatus field - filter removed
    const matchesPayment = filterPayment === "all"; // Always true since we don't have payment status
    
    let matchesDate = true;
    if (filterDateRange === "today" && delivery.deliveredAt) {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = delivery.deliveredAt.split("T")[0] === today;
    } else if (filterDateRange === "week" && delivery.deliveredAt) {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(delivery.deliveredAt) >= weekAgo;
    } else if (filterDateRange === "month" && delivery.deliveredAt) {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(delivery.deliveredAt) >= monthAgo;
    }

    return matchesSearch && matchesType && matchesPayment && matchesDate;
  });

  const handleViewDetails = (delivery: TransportRequest) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "produce_pickup":
        return <Badge variant="secondary">Produce Pickup</Badge>;
      case "produce_delivery":
        return <Badge className="bg-info text-info-foreground">Produce Delivery</Badge>;
      case "input_delivery":
        return <Badge className="bg-success text-success-foreground">Input Delivery</Badge>;
      case "order_delivery":
        return <Badge className="bg-purple-500 text-white">Order Delivery</Badge>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "processing":
        return <Badge className="bg-warning text-warning-foreground">Processing</Badge>;
      case "pending":
        return <Badge className="bg-muted text-muted-foreground">Pending</Badge>;
      default:
        return null;
    }
  };

  // Note: TransportRequest doesn't have paymentStatus or rating fields
  const totalEarnings = deliveries.reduce((sum, d) => sum + d.amount, 0);
  const pendingEarnings = 0; // Not available in TransportRequest type
  const averageRating = 0; // Not available in TransportRequest type

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Completed Deliveries</h1>
        <p className="text-muted-foreground mt-1">
          View your completed delivery history and earnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveries.length}</div>
            <p className="text-xs text-muted-foreground">All time deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Paid deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {pendingEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <IconStar className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">
              {deliveries.filter((d) => d.rating).length} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by request ID, requester, or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="produce_pickup">Produce Pickup</SelectItem>
                <SelectItem value="produce_delivery">Produce Delivery</SelectItem>
                <SelectItem value="input_delivery">Input Delivery</SelectItem>
                <SelectItem value="order_delivery">Order Delivery</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredDeliveries.length} of {deliveries.length} completed deliveries
          </div>
        </CardContent>
      </Card>

      {/* Deliveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Deliveries</CardTitle>
          <CardDescription>Your delivery history and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-medium font-mono">{delivery.id}</TableCell>
                    <TableCell>{getTypeBadge(delivery.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{delivery.requesterName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{delivery.from}</div>
                        <div className="text-muted-foreground">→ {delivery.to}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {delivery.distance} km
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{delivery.deliveredAt ? formatDate(delivery.deliveredAt) : "N/A"}</div>
                        {delivery.deliveredAt && (
                          <div className="text-muted-foreground flex items-center gap-1">
                            <IconClock className="h-3 w-3" />
                            {new Date(delivery.deliveredAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold">KES {delivery.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <IconWeight className="h-3 w-3" />
                        {delivery.weight} kg
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">N/A</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">N/A</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(delivery)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <IconTruck className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No completed deliveries found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>Complete information about this delivery</DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-6">
              {/* Delivery Summary */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono font-bold text-lg mb-1">
                        {selectedDelivery.requestId}
                      </div>
                      {getTypeBadge(selectedDelivery.type)}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        KES {selectedDelivery.amount.toLocaleString()}
                      </div>
                      <Badge variant="outline">N/A</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDelivery.description}
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pickup Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedDelivery.from}</span>
                    </div>
                    {selectedDelivery.pickupAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Collected: {formatDate(selectedDelivery.pickupAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Delivery Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{selectedDelivery.to}</span>
                    </div>
                    {selectedDelivery.deliveredAt && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Delivered: {formatDate(selectedDelivery.deliveredAt)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Distance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedDelivery.distance} km</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Weight</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedDelivery.weight} kg</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {selectedDelivery.pickupAt && selectedDelivery.deliveredAt
                        ? `${Math.round((new Date(selectedDelivery.deliveredAt).getTime() - new Date(selectedDelivery.pickupAt).getTime()) / (1000 * 60))} min`
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Requester Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconUser className="h-4 w-4" />
                    Requester Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="font-medium">{selectedDelivery.requesterName}</div>
                </CardContent>
              </Card>

              {/* Rating - Not available in TransportRequest type */}

              {/* Notes */}
              {selectedDelivery.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Delivery Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedDelivery.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Photos */}
              {selectedDelivery.photos && selectedDelivery.photos.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <IconPhoto className="h-4 w-4" />
                      Delivery Photos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDelivery.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Delivery photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
