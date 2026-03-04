import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconPackage,
  IconCheck,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconClock,
  IconArrowRight,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useAggregation } from "@/contexts/AggregationContext";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import type { MarketplaceOrder } from "@/types/marketplace";
import { startOrderProcessing, markOrderReadyForCollection } from "@/services/marketplaceService";
import { showSuccess, showError } from "@/lib/toast";

export function OrderProcessing() {
  const navigate = useNavigate();
  const { selectedCenter, centers, fetchCenters, setSelectedCenter, isLoading: aggregationLoading } = useAggregation();
  const { orders, fetchOrders, isLoading: ordersLoading } = useMarketplace();
  
  const [filteredOrders, setFilteredOrders] = useState<MarketplaceOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "ready_to_process" | "processing" | "ready_for_collection">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  // Fetch centers on mount
  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  // Auto-select first center if none selected and centers are available
  useEffect(() => {
    if (centers.length > 0 && !selectedCenter) {
      setSelectedCenter(centers[0]);
    }
  }, [centers, selectedCenter, setSelectedCenter]);

  // Fetch orders for selected center
  useEffect(() => {
    if (selectedCenter?.id) {
      fetchOrders({ 
        centerId: selectedCenter.id,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
    }
  }, [selectedCenter?.id, statusFilter, fetchOrders]);

  // Apply client-side search filter
  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm]);

  const handleStartProcessing = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const result = await startOrderProcessing(orderId);
      if (result.error) {
        showError("Failed to Start Processing", result.error);
      } else {
        showSuccess("Processing Started", "Order is now being processed");
        // Refresh orders
        if (selectedCenter?.id) {
          await fetchOrders({ centerId: selectedCenter.id });
        }
      }
    } catch (error) {
      showError("Failed to Start Processing", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkReadyForCollection = async (orderId: string) => {
    setCompletingOrderId(orderId);
    try {
      const result = await markOrderReadyForCollection(orderId);
      if (result.error) {
        showError("Failed to Mark Ready", result.error);
      } else {
        showSuccess("Order Ready", "Order is now ready for buyer collection");
        // Refresh orders
        if (selectedCenter?.id) {
          await fetchOrders({ centerId: selectedCenter.id });
        }
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
        return status;
    }
  };

  const readyToProcessOrders = filteredOrders.filter(o => o.status === "ready_to_process");
  const processingOrders = filteredOrders.filter(o => o.status === "processing");
  const readyForCollectionOrders = filteredOrders.filter(o => o.status === "ready_for_collection");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Order Processing</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage orders at your aggregation center - start processing and mark as ready for collection
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready to Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyToProcessOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders being processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready for Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyForCollectionOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders ready for buyer pickup</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Aggregation Center Selection */}
            <div>
              <Label htmlFor="center-select" className="text-sm font-medium mb-2 block">
                Aggregation Center
              </Label>
              <Select
                value={selectedCenter?.id || ""}
                onValueChange={(value) => {
                  const center = centers.find((c) => c.id === value);
                  setSelectedCenter(center || null);
                }}
              >
                <SelectTrigger id="center-select" className="w-full">
                  <SelectValue>{selectedCenter ? selectedCenter.name : "Select an aggregation center"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {centers.map((center) => (
                    <SelectItem key={center.id} value={center.id}>
                      {center.name} {center.code && `(${center.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Search and Status Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by order number, buyer, farmer, or variety..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue>{statusFilter ? undefined : "Filter by status"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ready_to_process">Ready to Process</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready_for_collection">Ready for Collection</SelectItem>
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
            {filteredOrders.length} order(s) found
            {selectedCenter && ` for ${selectedCenter.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aggregationLoading || ordersLoading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedCenter ? (
            <div className="text-center py-8 text-muted-foreground">
              Please select an aggregation center to view orders
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for {selectedCenter.name}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.buyerName}</TableCell>
                      <TableCell>{order.farmerName}</TableCell>
                      <TableCell>
                        {order.variety} <Badge variant="outline" className="ml-2">Grade {order.qualityGrade}</Badge>
                      </TableCell>
                      <TableCell>{order.quantity} kg</TableCell>
                      <TableCell>KES {order.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "ready_to_process" && (
                            <Button
                              size="sm"
                              onClick={() => handleStartProcessing(order.id)}
                              disabled={processingOrderId === order.id}
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
                              size="sm"
                              onClick={() => handleMarkReadyForCollection(order.id)}
                              disabled={completingOrderId === order.id}
                            >
                              {completingOrderId === order.id ? (
                                <>
                                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Completing...
                                </>
                              ) : (
                                <>
                                  <IconCircleCheck className="mr-2 h-4 w-4" />
                                  Mark Ready
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/dashboard/aggregation/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
