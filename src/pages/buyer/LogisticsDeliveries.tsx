import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconTruck,
  IconMapPin,
  IconCheck,
  IconLoader2,
  IconPhone,
  IconMap,
  IconUser,
  IconPackage,
  IconX,
} from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import type { MarketplaceOrder } from "@/types/marketplace";
import type { TransportRequest, DeliveryTrackingUpdate } from "@/types/transport";
import { DeliveryRatingModal } from "./DeliveryRatingModal";

interface DeliveryBatch {
  id: string;
  batchId: string;
  orderNumber?: string;
  orderId?: string; // Add orderId to access order details
  status: "in_transit" | "received" | "inspecting" | "approved";
  destination: string;
  destinationRegion: string;
  estimatedArrival?: string;
  estimatedArrivalTime?: string;
  weight: number; // in kg
  productType: string;
  driver?: {
    name: string;
    phone?: string;
    vehicleNumber?: string;
  };
  timeline: DeliveryTimelineStage[];
  supplier?: string;
  origin?: string;
  originCoordinates?: [number, number]; // [lat, lng]
  destinationCoordinates?: [number, number]; // [lat, lng]
  currentCoordinates?: [number, number]; // [lat, lng]
  arrivalDate?: string;
  qualityCheckStatus?: string;
  transportRequest: TransportRequest; // Keep reference to original transport request
  trackingUpdates: DeliveryTrackingUpdate[]; // All tracking updates for map view
  order?: MarketplaceOrder; // Keep reference to order for fulfillment type check
}

interface DeliveryTimelineStage {
  stage: string;
  location: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming";
}


export function LogisticsDeliveries() {
  const { orders, fetchOrders, isLoading: ordersLoading, confirmDeliveryByBuyer } = useMarketplace();
  const { requests, fetchRequests, isLoading: requestsLoading } = useTransport();
  const { user } = useAuth();
  
  const [showMapView, setShowMapView] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryBatch | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingDeliveryConfirmation, setPendingDeliveryConfirmation] = useState<{
    orderId: string;
    farmerId: string;
    farmerName: string;
    driverId?: string;
    driverName?: string;
  } | null>(null);

  // Fetch buyer's orders and transport requests
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id });
      // Fetch transport requests where buyer is the requester (for order deliveries)
      // Pass requesterId to filter requests for this buyer
      fetchRequests({ requesterId: user.id });
    }
  }, [user?.id, fetchOrders, fetchRequests]);

  // Debug: Log all fetched requests to understand what we're getting
  useEffect(() => {
    if (user?.id) {
      console.log('LogisticsDeliveries Debug:', {
        buyerId: user.id,
        totalRequests: requests.length,
        requests: requests.map(req => ({
          id: req.id,
          type: req.type,
          status: req.status,
          orderId: req.orderId,
          requesterId: req.requesterId,
          orderNumber: req.orderNumber,
          requesterMatchesBuyer: req.requesterId === user.id,
          isOrderDelivery: req.type === "order_delivery",
          isActiveStatus: req.status === "in_transit" || req.status === "delivered" || req.status === "accepted",
        })),
      });
    }
  }, [requests, user?.id]);

  // Convert transport requests to delivery batches format
  // Filter for ORDER_DELIVERY type (or PRODUCE_DELIVERY with orderId - legacy support) and in-transit/delivered/accepted statuses
  const orderDeliveryRequests = requests.filter(
    (req) => {
      // Include ORDER_DELIVERY type, or PRODUCE_DELIVERY with orderId (legacy - these are effectively order deliveries)
      const isOrderDelivery = req.type === "order_delivery" 
      const isActiveStatus = req.status === "in_transit" || req.status === "delivered" ;
      
      // Debug log for order delivery requests
      if (isOrderDelivery) {
        console.log('Order delivery request:', {
          id: req.id,
          orderId: req.orderId,
          status: req.status,
          type: req.type,
          requesterId: req.requesterId,
          buyerId: user?.id,
          matchesFilter: isActiveStatus,
          //isLegacyProduceDelivery: req.type === "produce_delivery" && !!req.orderId,
        });
      }
      
      return isOrderDelivery && isActiveStatus;
    }
  );

  // Get related orders for additional info
  const ordersMap = new Map(orders.map(order => [order.id, order]));

  // Build timeline from tracking updates and transport request status
  const buildTimeline = (request: TransportRequest, order?: MarketplaceOrder): DeliveryTimelineStage[] => {
    const timeline: DeliveryTimelineStage[] = [];
    
    // Start with order collection if it's an order delivery
    if (request.orderId && order) {
      timeline.push({
        stage: "Order Placed",
        location: order.farmerName || "Farmer",
        timestamp: new Date(order.createdAt).toLocaleString(),
        status: "completed",
      });

      // If order has stockout recorded, add collection stage
      if (order.stockOutRecorded) {
        timeline.push({
          stage: "Collected",
          location: request.from || "Aggregation Center",
          timestamp: request.collectedAt 
            ? new Date(request.collectedAt).toLocaleString()
            : request.collectionDate 
              ? `${request.collectionDate} ${request.collectionTime || ""}`
              : "Collected",
          status: "completed",
        });
      }
    }

    // Add tracking updates from transport provider
    const trackingUpdates = (request as any).trackingUpdates || [];
    if (trackingUpdates && trackingUpdates.length > 0) {
      // Sort tracking updates by timestamp (oldest first)
      const sortedUpdates = [...trackingUpdates].sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeA - timeB;
      });

      sortedUpdates.forEach((update, index) => {
        const isLast = index === sortedUpdates.length - 1;
        const isInTransit = request.status === "in_transit";
        
        timeline.push({
          stage: update.location || "Location Update",
          location: update.location || "Unknown Location",
          timestamp: update.createdAt 
            ? new Date(update.createdAt).toLocaleString()
            : update.timestamp
              ? new Date(update.timestamp).toLocaleString()
              : undefined,
          status: isLast && isInTransit ? "current" : "completed",
        });
      });
    } else if (request.status === "in_transit") {
      // If no tracking updates but in transit, only show if we have a current location
      // Don't show destination as "in transit" if there are no location updates
      if (request.currentLocation && request.currentLocation !== request.to) {
        timeline.push({
          stage: "In Transit",
          location: request.currentLocation,
          timestamp: "Current",
          status: "current",
        });
      }
    }

    // Add delivered stage if delivered
    if (request.status === "delivered" || request.status === "completed") {
      timeline.push({
        stage: "Delivered",
        location: request.to || "Destination",
        timestamp: request.deliveredAt 
          ? new Date(request.deliveredAt).toLocaleString()
          : "Completed",
        status: "completed",
      });
    }

    return timeline;
  };

  const batches: DeliveryBatch[] = orderDeliveryRequests.map((request) => {
    // Try to get order from transport request first (included from backend), 
    // then fall back to ordersMap if not available
    // The backend includes the order relation in transport requests (line 77 in transport.service.ts)
    const orderFromRequest = (request as any).order;
    const orderFromMap = request.orderId ? ordersMap.get(request.orderId) : undefined;
    
    // Use order from request if available (most up-to-date), otherwise use from map
    // Transform the order if it comes from the transport request (backend format)
    let order: MarketplaceOrder | undefined;
    if (orderFromRequest) {
      // Transform backend order format to frontend format
      // Backend uses UPPER_CASE for status, frontend uses lowercase
      const statusMap: Record<string, string> = {
        'ORDER_PLACED': 'order_placed',
        'ORDER_ACCEPTED': 'order_accepted',
        'PAYMENT_SECURED': 'payment_secured',
        'READY_TO_PROCESS': 'ready_to_process',
        'PROCESSING': 'processing',
        'READY_FOR_COLLECTION': 'ready_for_collection',
        'RELEASED': 'released',
        'COLLECTED': 'collected',
        'IN_TRANSIT': 'in_transit',
        'AT_AGGREGATION': 'at_aggregation',
        'QUALITY_CHECKED': 'quality_checked',
        'QUALITY_APPROVED': 'quality_approved',
        'QUALITY_REJECTED': 'quality_rejected',
        'OUT_FOR_DELIVERY': 'out_for_delivery',
        'DELIVERED': 'delivered',
        'COMPLETED': 'completed',
        'REJECTED': 'rejected',
        'DISPUTED': 'disputed',
        'CANCELLED': 'cancelled',
      };
      order = {
        ...orderFromRequest,
        status: statusMap[orderFromRequest.status] || orderFromRequest.status?.toLowerCase() || orderFromRequest.status,
        fulfillmentType: orderFromRequest.fulfillmentType?.toLowerCase() || orderFromRequest.fulfillmentType,
      } as MarketplaceOrder;
    } else {
      order = orderFromMap;
    }
    
    const timeline = buildTimeline(request, order);
    
    // Get latest tracking update for current location
    const trackingUpdates = (request as any).trackingUpdates || [];
    const latestUpdate = trackingUpdates && trackingUpdates.length > 0
      ? trackingUpdates[trackingUpdates.length - 1]
      : null;

    return {
      id: request.id,
      batchId: request.orderNumber || request.requestId || request.id,
      orderNumber: request.orderNumber,
      orderId: request.orderId, // Include orderId
      status: request.status === "delivered" || request.status === "completed" 
        ? "received" 
        : request.status === "in_transit"
          ? "in_transit"
          : "in_transit" as "in_transit" | "received" | "inspecting" | "approved",
      destination: request.to || request.deliveryLocation || "N/A",
      destinationRegion: request.deliveryCounty || "N/A",
      estimatedArrival: request.estimatedArrival
        ? new Date(request.estimatedArrival).toLocaleDateString()
        : undefined,
      estimatedArrivalTime: request.estimatedArrival
        ? new Date(request.estimatedArrival).toLocaleTimeString()
        : undefined,
      weight: request.weight || 0,
      productType: request.description || "Order Delivery",
      driver: request.driverName ? {
        name: request.driverName,
        phone: request.driverPhone,
        vehicleNumber: request.vehicleId || "N/A",
      } : undefined,
      timeline,
      origin: request.from || request.pickupLocation,
      originCoordinates: request.fromCoordinates,
      destinationCoordinates: request.toCoordinates,
      currentCoordinates: latestUpdate?.coordinates || request.currentCoordinates,
      arrivalDate: request.deliveredAt 
        ? new Date(request.deliveredAt).toLocaleDateString()
        : undefined,
      qualityCheckStatus: order?.qualityScore ? `Score: ${order.qualityScore}%` : undefined,
      transportRequest: request,
      trackingUpdates: trackingUpdates || [],
      order, // Include order for fulfillment type check
    };
  });

  const isLoading = ordersLoading || requestsLoading;

  const getStatusColor = (status: DeliveryBatch["status"]) => {
    switch (status) {
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "received":
        return "bg-green-100 text-green-800 border-green-200";
      case "inspecting":
        return "bg-stone-100 text-stone-800 border-stone-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-stone-100 text-stone-800 border-stone-200";
    }
  };

  const getStatusLabel = (status: DeliveryBatch["status"]) => {
    switch (status) {
      case "in_transit":
        return "IN TRANSIT";
      case "received":
        return "Received";
      case "inspecting":
        return "Inspecting";
      case "approved":
        return "Approved";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: DeliveryBatch["status"]) => {
    switch (status) {
      case "in_transit":
        return <IconTruck className="h-5 w-5 text-orange-500" />;
      case "received":
        return <IconCheck className="h-5 w-5 text-green-600" />;
      case "inspecting":
        return <IconLoader2 className="h-5 w-5 text-stone-500 animate-spin" />;
      case "approved":
        return <IconCheck className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg} kg`;
  };

  return (
    <>
      <style>{`
        .logistics-map-container .leaflet-container,
        .logistics-map-container .leaflet-pane,
        .logistics-map-container .leaflet-map-pane,
        .logistics-map-container .leaflet-tile-pane,
        .logistics-map-container .leaflet-overlay-pane,
        .logistics-map-container .leaflet-shadow-pane,
        .logistics-map-container .leaflet-marker-pane,
        .logistics-map-container .leaflet-tooltip-pane,
        .logistics-map-container .leaflet-popup-pane,
        .logistics-map-container .leaflet-control-container {
          z-index: 0 !important;
        }
      `}</style>
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Logistics & Deliveries</h1>
          <p className="text-stone-500 mt-1">Real-time tracking of inbound OFSP shipments.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-stone-200 hover:border-orange-500 hover:text-orange-500"
          onClick={() => setShowMapView(!showMapView)}
        >
          <IconMap className="h-4 w-4 mr-2" />
          Map View
        </Button>
      </div>

      <div className="space-y-4">
        {/* Main Content - Delivery Table */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="h-64 bg-stone-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ) : batches.length === 0 ? (
            <Card className="bg-white border-stone-200">
              <CardContent className="p-12 text-center">
                <IconPackage className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                <p className="text-stone-500">No active deliveries found</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
                <CardDescription>{batches.length} delivery{batches.length !== 1 ? 's' : ''} found</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Weight</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow
                          key={batch.id}
                          className="cursor-pointer hover:bg-stone-50"
                          onClick={() => setSelectedDelivery(batch)}
                        >
                          <TableCell className="font-medium">
                            {batch.orderNumber || batch.batchId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(batch.status)}>
                              <span className="flex items-center gap-1.5">
                                {getStatusIcon(batch.status)}
                                {getStatusLabel(batch.status)}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-stone-900">{batch.destination}</p>
                              <p className="text-xs text-stone-500">{batch.destinationRegion}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-stone-900">{formatWeight(batch.weight)}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {batch.orderId && 
                               batch.order?.fulfillmentType === "request_transport" && 
                               batch.order?.status === "delivered" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (batch.orderId && batch.order) {
                                      // Get driver info from transport request
                                      const driverId = (batch.transportRequest as any)?.driverId;
                                      const driverName = batch.driver?.name || batch.transportRequest.driverName;
                                      
                                      setPendingDeliveryConfirmation({
                                        orderId: batch.orderId,
                                        farmerId: batch.order.farmerId,
                                        farmerName: batch.order.farmerName || "Farmer",
                                        driverId,
                                        driverName,
                                      });
                                      setShowRatingModal(true);
                                    }
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <IconCheck className="h-4 w-4 mr-1" />
                                  Confirm Delivery
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDelivery(batch);
                                }}
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
              </CardContent>
            </Card>
          )}

          {/* Detailed Delivery Modal */}
          <Dialog open={!!selectedDelivery} onOpenChange={(open) => !open && setSelectedDelivery(null)}>
            {selectedDelivery && (
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedDelivery.orderNumber ? `Order #${selectedDelivery.orderNumber}` : `Batch #${selectedDelivery.batchId}`}
                  </DialogTitle>
                  <p className="text-sm text-stone-500 mt-1">
                    {selectedDelivery.destination} • {selectedDelivery.destinationRegion}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(selectedDelivery.status)}>
                    <span className="flex items-center gap-1.5">
                      {getStatusIcon(selectedDelivery.status)}
                      {getStatusLabel(selectedDelivery.status)}
                    </span>
                  </Badge>
                  {selectedDelivery.estimatedArrival && (
                    <div className="text-sm text-stone-600">
                      Est. Arrival: {selectedDelivery.estimatedArrival}
                      {selectedDelivery.estimatedArrivalTime && `, ${selectedDelivery.estimatedArrivalTime}`}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                {selectedDelivery.timeline && selectedDelivery.timeline.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      {/* Timeline Line */}
                      <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-orange-200" />
                      <div className="space-y-4">
                        {selectedDelivery.timeline.map((stage, index) => (
                          <div key={index} className="relative flex items-start gap-3 pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute left-0 top-1">
                              {stage.status === "completed" ? (
                                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm flex items-center justify-center">
                                  <IconCheck className="h-2.5 w-2.5 text-white" />
                                </div>
                              ) : stage.status === "current" ? (
                                <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm ring-2 ring-orange-200 animate-pulse" />
                              ) : (
                                <div className="w-4 h-4 rounded-full bg-white border-2 border-stone-300">
                                  {stage.status === "upcoming" && (
                                    <IconMapPin className="h-2.5 w-2.5 text-stone-400 m-0.5" />
                                  )}
                                </div>
                              )}
                            </div>
                            {/* Stage Info */}
                            <div className="flex-1 pt-0.5">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-medium text-stone-900">{stage.stage}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span>{stage.location}</span>
                                {stage.timestamp && (
                                  <>
                                    <span>•</span>
                                    <span className="font-medium text-stone-600">{stage.timestamp}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Driver & Payload for In Transit */}
                {selectedDelivery.status === "in_transit" && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    {selectedDelivery.driver ? (
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-stone-400" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">{selectedDelivery.driver.name}</p>
                          <p className="text-xs text-stone-500">
                            Driver {selectedDelivery.driver.vehicleNumber ? `• ${selectedDelivery.driver.vehicleNumber}` : ""}
                            {selectedDelivery.driver.phone ? ` • ${selectedDelivery.driver.phone}` : ""}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <IconUser className="h-4 w-4 text-stone-400" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">Driver Assigned</p>
                          <p className="text-xs text-stone-500">Contact info pending</p>
                        </div>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-xs text-stone-500">PAYLOAD</p>
                      <p className="text-sm font-medium text-stone-900">
                        {formatWeight(selectedDelivery.weight)} • {selectedDelivery.productType}
                      </p>
                    </div>
                  </div>
                )}

                {/* Completed/Received Info */}
                {selectedDelivery.status === "received" && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <p className="text-xs text-stone-500">WEIGHT</p>
                      <p className="text-sm font-medium text-stone-900">{formatWeight(selectedDelivery.weight)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">ARRIVED</p>
                      <p className="text-sm font-medium text-stone-900">
                        {selectedDelivery.arrivalDate || "Recently"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Inspecting Info */}
                {selectedDelivery.status === "inspecting" && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <p className="text-xs text-stone-500">WEIGHT</p>
                      <p className="text-sm font-medium text-stone-900">{formatWeight(selectedDelivery.weight)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">QUALITY CHECK</p>
                      <p className="text-sm font-medium text-stone-900">
                        {selectedDelivery.qualityCheckStatus || "In Progress"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  {selectedDelivery.orderId && 
                   selectedDelivery.order?.fulfillmentType === "request_transport" && 
                   selectedDelivery.order?.status === "delivered" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        if (selectedDelivery.orderId && selectedDelivery.order) {
                          // Get driver info from transport request
                          const driverId = (selectedDelivery.transportRequest as any)?.driverId;
                          const driverName = selectedDelivery.driver?.name || selectedDelivery.transportRequest.driverName;
                          
                          setPendingDeliveryConfirmation({
                            orderId: selectedDelivery.orderId,
                            farmerId: selectedDelivery.order.farmerId,
                            farmerName: selectedDelivery.order.farmerName || "Farmer",
                            driverId,
                            driverName,
                          });
                          setShowRatingModal(true);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <IconCheck className="h-4 w-4 mr-2" />
                      Confirm Delivery
                    </Button>
                  )}
                  {selectedDelivery.status === "in_transit" && selectedDelivery.driver && selectedDelivery.driver.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-stone-200 hover:border-orange-500 hover:text-orange-500"
                      onClick={() => {
                        window.location.href = `tel:${selectedDelivery.driver!.phone!.replace(/\s/g, "")}`;
                      }}
                    >
                      <IconPhone className="h-4 w-4 mr-2" />
                      Contact Driver
                    </Button>
                  )}
                </div>

                {/* Map Visualization */}
                {selectedDelivery.originCoordinates && selectedDelivery.destinationCoordinates && (
                  <div className="pt-4 border-t border-stone-100">
                    <h4 className="text-sm font-semibold text-stone-900 mb-3">Delivery Route</h4>
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-stone-200 relative z-0 logistics-map-container">
                      <MapContainer
                        {...({
                          center: selectedDelivery.currentCoordinates || selectedDelivery.originCoordinates || [-1.5167, 37.2667],
                          zoom: 10,
                          style: { height: "100%", width: "100%", zIndex: 0 },
                          scrollWheelZoom: true,
                        } as any)}
                      >
                        <TileLayer
                          {...({
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                          } as any)}
                        />
                        {/* Pickup marker */}
                        {selectedDelivery.originCoordinates && (
                          <Marker position={selectedDelivery.originCoordinates as LatLngExpression}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">Pickup</p>
                                <p>{selectedDelivery.origin}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        {/* All tracking update markers */}
                        {selectedDelivery.trackingUpdates.length > 0 && (() => {
                          const sortedUpdates = [...selectedDelivery.trackingUpdates].sort((a, b) => {
                            const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
                            const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
                            return timeA - timeB;
                          });
                          return sortedUpdates.map((update, idx) => {
                            if (!update.coordinates) return null;
                            const markerProps: any = {
                              position: update.coordinates as LatLngExpression,
                              icon: L.divIcon({
                                className: "custom-tracking-marker",
                                html: `<div style="
                                  background-color: #f97316;
                                  width: 20px;
                                  height: 20px;
                                  border-radius: 50%;
                                  border: 2px solid white;
                                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                "></div>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                              }),
                            };
                            return (
                            <Marker 
                              key={update.id || idx} 
                              {...markerProps}
                            >
                                <Popup>
                                  <div className="text-sm">
                                    <p className="font-semibold">Update #{idx + 1}</p>
                                    <p>{update.location}</p>
                                    {update.createdAt && (
                                      <p className="text-xs text-stone-500">
                                        {new Date(update.createdAt).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                </Popup>
                              </Marker>
                            );
                          });
                        })()}
                        {/* Destination marker */}
                        {selectedDelivery.destinationCoordinates && (
                          <Marker position={selectedDelivery.destinationCoordinates as LatLngExpression}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">Delivery</p>
                                <p>{selectedDelivery.destination}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        {/* Route polyline */}
                        {(() => {
                          const routePoints: LatLngExpression[] = [];
                          if (selectedDelivery.originCoordinates) {
                            routePoints.push(selectedDelivery.originCoordinates as LatLngExpression);
                          }
                          const sortedUpdates = [...selectedDelivery.trackingUpdates].sort((a, b) => {
                            const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
                            const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
                            return timeA - timeB;
                          });
                          sortedUpdates.forEach(update => {
                            if (update.coordinates) {
                              routePoints.push(update.coordinates as LatLngExpression);
                            }
                          });
                          if (selectedDelivery.destinationCoordinates) {
                            routePoints.push(selectedDelivery.destinationCoordinates as LatLngExpression);
                          }
                          return routePoints.length > 1 ? (
                            <Polyline
                              {...({
                                positions: routePoints,
                                pathOptions: {
                                  color: "#f97316",
                                  weight: 3,
                                  opacity: 0.7,
                                },
                              } as any)}
                            />
                          ) : null;
                        })()}
                      </MapContainer>
                    </div>
                    {/* Show tracking updates list */}
                    {selectedDelivery.trackingUpdates.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-stone-700 mb-2">Location Updates:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {[...selectedDelivery.trackingUpdates].sort((a, b) => {
                            const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
                            const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
                            return timeA - timeB;
                          }).map((update, idx) => (
                            <div key={update.id || idx} className="text-xs text-stone-600 flex items-center gap-2">
                              <IconMapPin className="h-3 w-3 text-orange-500" />
                              <span className="font-medium">{update.location}</span>
                              {update.createdAt && (
                                <span className="text-stone-400">
                                  • {new Date(update.createdAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>

      {/* Map View Modal/Overlay */}
      {showMapView && (
        <Card className="bg-white border-stone-200 mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-stone-900">Delivery Map View</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMapView(false)}
                className="text-stone-500"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {batches
              .filter((batch) => {
                // Show deliveries that are in transit or have tracking updates
                const isInTransit = batch.status === "in_transit";
                const hasTrackingUpdates = batch.trackingUpdates && batch.trackingUpdates.length > 0;
                // Need at least origin or destination coordinates, or tracking update coordinates
                const hasOriginCoords = !!batch.originCoordinates;
                const hasDestCoords = !!batch.destinationCoordinates;
                const hasTrackingCoords = hasTrackingUpdates && batch.trackingUpdates.some(update => update.coordinates);
                const hasCoordinates = hasOriginCoords || hasDestCoords || hasTrackingCoords;
                
                const shouldShow = (isInTransit || hasTrackingUpdates) && hasCoordinates;
                
                // Debug logging for map view filtering
                if (batch.orderId) {
                  console.log(`[MAP_VIEW] Batch ${batch.orderNumber || batch.id}:`, {
                    status: batch.status,
                    isInTransit,
                    hasTrackingUpdates,
                    trackingUpdatesCount: batch.trackingUpdates?.length || 0,
                    hasOriginCoords,
                    hasDestCoords,
                    hasTrackingCoords,
                    hasCoordinates,
                    shouldShow,
                    trackingUpdates: batch.trackingUpdates?.map(u => ({
                      location: u.location,
                      hasCoordinates: !!u.coordinates,
                      coordinates: u.coordinates,
                    })),
                  });
                }
                
                return shouldShow;
              })
              .map((batch) => {
                // Build route with all tracking points
                const routePoints: LatLngExpression[] = [];
                
                // Add all tracking update coordinates in chronological order (these are the most accurate)
                const sortedUpdates = [...batch.trackingUpdates].sort((a, b) => {
                  const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
                  const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
                  return timeA - timeB;
                });
                
                // Start with origin if available
                if (batch.originCoordinates) {
                  routePoints.push(batch.originCoordinates as LatLngExpression);
                } else if (sortedUpdates.length > 0 && sortedUpdates[0].coordinates) {
                  // Use first tracking update as origin if origin coordinates not available
                  routePoints.push(sortedUpdates[0].coordinates as LatLngExpression);
                }
                
                // Add all tracking update coordinates
                sortedUpdates.forEach(update => {
                  if (update.coordinates) {
                    const coords = update.coordinates as LatLngExpression;
                    // Avoid duplicate consecutive points
                    const lastPoint = routePoints[routePoints.length - 1];
                    if (!lastPoint || 
                        (Array.isArray(lastPoint) && Array.isArray(coords) &&
                         (lastPoint[0] !== coords[0] || lastPoint[1] !== coords[1]))) {
                      routePoints.push(coords);
                    }
                  }
                });
                
                // Add destination
                if (batch.destinationCoordinates) {
                  const destCoords = batch.destinationCoordinates as LatLngExpression;
                  const lastPoint = routePoints[routePoints.length - 1];
                  // Avoid duplicate if destination is same as last tracking point
                  if (!lastPoint || 
                      (Array.isArray(lastPoint) && Array.isArray(destCoords) &&
                       (lastPoint[0] !== destCoords[0] || lastPoint[1] !== destCoords[1]))) {
                    routePoints.push(destCoords);
                  }
                } else if (sortedUpdates.length > 0 && sortedUpdates[sortedUpdates.length - 1].coordinates) {
                  // Use last tracking update as destination if destination coordinates not available
                  const lastUpdate = sortedUpdates[sortedUpdates.length - 1];
                  if (lastUpdate.coordinates) {
                    routePoints.push(lastUpdate.coordinates as LatLngExpression);
                  }
                }

                return (
                  <div key={batch.id} className="mb-6">
                    <div className="mb-2">
                      <h4 className="text-sm font-semibold text-stone-900">
                        Order #{batch.orderNumber || batch.batchId}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {batch.trackingUpdates.length} location update{batch.trackingUpdates.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {/* Custom Map with all tracking updates */}
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-stone-200 mb-4 relative z-0 logistics-map-container">
                      <MapContainer
                        {...({
                          center: batch.currentCoordinates || 
                                  (sortedUpdates.length > 0 && sortedUpdates[sortedUpdates.length - 1].coordinates 
                                    ? sortedUpdates[sortedUpdates.length - 1].coordinates as LatLngExpression
                                    : batch.originCoordinates) || 
                                  batch.destinationCoordinates || 
                                  [-1.5167, 37.2667],
                          zoom: routePoints.length > 1 ? 8 : 10,
                          style: { height: "100%", width: "100%", zIndex: 0 },
                          scrollWheelZoom: true,
                        } as any)}
                      >
                        <TileLayer
                          {...({
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                            url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                          } as any)}
                        />
                        {/* Pickup marker */}
                        {batch.originCoordinates && (
                          <Marker position={batch.originCoordinates as LatLngExpression}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">Pickup</p>
                                <p>{batch.origin}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        {/* All tracking update markers */}
                        {sortedUpdates.map((update, idx) => {
                          if (!update.coordinates) return null;
                          const markerProps: any = {
                            position: update.coordinates as LatLngExpression,
                            icon: L.divIcon({
                              className: "custom-tracking-marker",
                              html: `<div style="
                                background-color: #f97316;
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                              "></div>`,
                              iconSize: [20, 20],
                              iconAnchor: [10, 10],
                            }),
                          };
                          return (
                            <Marker 
                              key={update.id || idx} 
                              {...markerProps}
                            >
                              <Popup>
                                <div className="text-sm">
                                  <p className="font-semibold">Update #{idx + 1}</p>
                                  <p>{update.location}</p>
                                  {update.createdAt && (
                                    <p className="text-xs text-stone-500">
                                      {new Date(update.createdAt).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              </Popup>
                            </Marker>
                          );
                        })}
                        {/* Destination marker */}
                        {batch.destinationCoordinates && (
                          <Marker position={batch.destinationCoordinates as LatLngExpression}>
                            <Popup>
                              <div className="text-sm">
                                <p className="font-semibold">Delivery</p>
                                <p>{batch.destination}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )}
                        {/* Route polyline */}
                        {routePoints.length > 1 && (
                          <Polyline
                            {...({
                              positions: routePoints,
                              pathOptions: {
                                color: "#f97316",
                                weight: 3,
                                opacity: 0.7,
                              },
                            } as any)}
                          />
                        )}
                      </MapContainer>
                    </div>
                    {/* Show tracking updates list */}
                    {batch.trackingUpdates.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-stone-700 mb-2">Location Updates:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {sortedUpdates.map((update, idx) => (
                            <div key={update.id || idx} className="text-xs text-stone-600 flex items-center gap-2">
                              <IconMapPin className="h-3 w-3 text-orange-500" />
                              <span className="font-medium">{update.location}</span>
                              {update.createdAt && (
                                <span className="text-stone-400">
                                  • {new Date(update.createdAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            {batches.filter((batch) => {
              const isInTransit = batch.status === "in_transit";
              const hasTrackingUpdates = batch.trackingUpdates && batch.trackingUpdates.length > 0;
              const hasCoordinates = batch.originCoordinates || batch.destinationCoordinates || 
                (hasTrackingUpdates && batch.trackingUpdates.some(update => update.coordinates));
              return (isInTransit || hasTrackingUpdates) && hasCoordinates;
            }).length === 0 && (
              <div className="h-96 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                <div className="text-center space-y-2">
                  <IconMap className="h-12 w-12 text-stone-400 mx-auto" />
                  <p className="text-stone-500">No active deliveries to track on map</p>
                  <p className="text-sm text-stone-400">Active in-transit deliveries will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rating Modal */}
      {pendingDeliveryConfirmation && (
        <DeliveryRatingModal
          open={showRatingModal}
          onOpenChange={setShowRatingModal}
          orderId={pendingDeliveryConfirmation.orderId}
          farmerId={pendingDeliveryConfirmation.farmerId}
          farmerName={pendingDeliveryConfirmation.farmerName}
          driverId={pendingDeliveryConfirmation.driverId}
          driverName={pendingDeliveryConfirmation.driverName}
          onRatingsSubmitted={async () => {
            // After ratings are submitted, confirm the delivery
            if (pendingDeliveryConfirmation.orderId) {
              try {
                await confirmDeliveryByBuyer(pendingDeliveryConfirmation.orderId);
                await fetchOrders({ buyerId: user?.id });
                await fetchRequests({ requesterId: user?.id });
                setSelectedDelivery(null); // Close details modal if open
                setPendingDeliveryConfirmation(null);
              } catch (error) {
                console.error("Failed to confirm delivery:", error);
                alert("Failed to confirm delivery. Please try again.");
              }
            }
          }}
        />
      )}
      </div>
    </>
  );
}

