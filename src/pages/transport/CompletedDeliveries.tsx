import { useState } from "react";
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

interface CompletedDelivery {
  id: string;
  requestId: string;
  type: "produce_pickup" | "produce_delivery" | "input_delivery";
  requester: string;
  from: string;
  to: string;
  distance: number;
  weight: number;
  description: string;
  amount: number;
  completedDate: string;
  completedTime: string;
  collectionDate?: string;
  collectionTime?: string;
  deliveryDuration?: string;
  rating?: number;
  paymentStatus: "pending" | "paid" | "processing";
  photos?: string[];
  notes?: string;
}

export default function CompletedDeliveries() {
  const [deliveries, setDeliveries] = useState<CompletedDelivery[]>([
    {
      id: "1",
      requestId: "REQ-001",
      type: "produce_pickup",
      requester: "John Kamau (Farmer)",
      from: "Kangundo Farm",
      to: "Tala Satellite Aggregation Center",
      distance: 5,
      weight: 250,
      description: "250kg of OFSP (Grade A)",
      amount: 500,
      completedDate: "2024-01-14",
      completedTime: "14:30",
      collectionDate: "2024-01-14",
      collectionTime: "14:00",
      deliveryDuration: "30 min",
      rating: 5,
      paymentStatus: "paid",
      notes: "Delivery completed successfully. All items verified.",
    },
    {
      id: "2",
      requestId: "REQ-002",
      type: "input_delivery",
      requester: "AgriInputs Co.",
      from: "AgriInputs Warehouse",
      to: "Mary Wanjiku Farm",
      distance: 8,
      weight: 50,
      description: "50kg NPK Fertilizer",
      amount: 500,
      completedDate: "2024-01-13",
      completedTime: "16:00",
      collectionDate: "2024-01-13",
      collectionTime: "15:30",
      deliveryDuration: "30 min",
      rating: 4,
      paymentStatus: "paid",
      notes: "On-time delivery. Customer satisfied.",
    },
    {
      id: "3",
      requestId: "REQ-003",
      type: "produce_delivery",
      requester: "Kathiani Main Centre",
      from: "Kathiani Main Aggregation Center",
      to: "Nairobi Wholesale Market",
      distance: 50,
      weight: 1000,
      description: "1 ton of Grade A OFSP",
      amount: 4000,
      completedDate: "2024-01-12",
      completedTime: "10:00",
      collectionDate: "2024-01-12",
      collectionTime: "06:00",
      deliveryDuration: "4 hours",
      rating: 5,
      paymentStatus: "processing",
      notes: "Long distance delivery completed successfully.",
    },
    {
      id: "4",
      requestId: "REQ-004",
      type: "produce_delivery",
      requester: "Kilala Buyer (Restaurant)",
      from: "Kilala Satellite Aggregation Center",
      to: "Tala Town Restaurant",
      distance: 3,
      weight: 50,
      description: "50kg of Grade B OFSP for restaurant",
      amount: 300,
      completedDate: "2024-01-11",
      completedTime: "12:00",
      collectionDate: "2024-01-11",
      collectionTime: "11:00",
      deliveryDuration: "1 hour",
      rating: 4,
      paymentStatus: "paid",
    },
    {
      id: "5",
      requestId: "REQ-005",
      type: "produce_pickup",
      requester: "Peter Kariuki (Farmer)",
      from: "Masinga Farm",
      to: "Masinga Main Aggregation Center",
      distance: 4,
      weight: 300,
      description: "300kg of SPK004 (Grade A)",
      amount: 600,
      completedDate: "2024-01-10",
      completedTime: "15:00",
      collectionDate: "2024-01-10",
      collectionTime: "14:30",
      deliveryDuration: "30 min",
      rating: 5,
      paymentStatus: "paid",
    },
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<CompletedDelivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [filterDateRange, setFilterDateRange] = useState<string>("all");

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || delivery.type === filterType;
    const matchesPayment = filterPayment === "all" || delivery.paymentStatus === filterPayment;
    
    let matchesDate = true;
    if (filterDateRange === "today") {
      const today = new Date().toISOString().split("T")[0];
      matchesDate = delivery.completedDate === today;
    } else if (filterDateRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = new Date(delivery.completedDate) >= weekAgo;
    } else if (filterDateRange === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = new Date(delivery.completedDate) >= monthAgo;
    }

    return matchesSearch && matchesType && matchesPayment && matchesDate;
  });

  const handleViewDetails = (delivery: CompletedDelivery) => {
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

  const totalEarnings = deliveries
    .filter((d) => d.paymentStatus === "paid")
    .reduce((sum, d) => sum + d.amount, 0);

  const pendingEarnings = deliveries
    .filter((d) => d.paymentStatus === "pending" || d.paymentStatus === "processing")
    .reduce((sum, d) => sum + d.amount, 0);

  const averageRating =
    deliveries.filter((d) => d.rating).length > 0
      ? deliveries
          .filter((d) => d.rating)
          .reduce((sum, d) => sum + (d.rating || 0), 0) /
        deliveries.filter((d) => d.rating).length
      : 0;

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
                    <TableCell className="font-medium font-mono">{delivery.requestId}</TableCell>
                    <TableCell>{getTypeBadge(delivery.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{delivery.requester}</div>
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
                        <div className="font-medium">{formatDate(delivery.completedDate)}</div>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {delivery.completedTime}
                        </div>
                        {delivery.deliveryDuration && (
                          <div className="text-xs text-muted-foreground">
                            Duration: {delivery.deliveryDuration}
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
                    <TableCell>{getPaymentStatusBadge(delivery.paymentStatus)}</TableCell>
                    <TableCell>
                      {delivery.rating ? (
                        <div className="flex items-center gap-1">
                          <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{delivery.rating}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No rating</span>
                      )}
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
                      {getPaymentStatusBadge(selectedDelivery.paymentStatus)}
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
                    {selectedDelivery.collectionDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Collected: {formatDate(selectedDelivery.collectionDate)} at{" "}
                        {selectedDelivery.collectionTime}
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
                    <div className="mt-2 text-xs text-muted-foreground">
                      Delivered: {formatDate(selectedDelivery.completedDate)} at{" "}
                      {selectedDelivery.completedTime}
                    </div>
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
                      {selectedDelivery.deliveryDuration || "N/A"}
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
                  <div className="font-medium">{selectedDelivery.requester}</div>
                </CardContent>
              </Card>

              {/* Rating */}
              {selectedDelivery.rating && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <IconStar className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      Customer Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="text-3xl font-bold">{selectedDelivery.rating}</div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <IconStar
                            key={i}
                            className={`h-5 w-5 ${
                              i < selectedDelivery.rating!
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
