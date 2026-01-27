import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconTruck,
  IconMapPin,
  IconCheck,
  IconLoader2,
  IconPhone,
  IconMap,
  IconUser,
  IconPackage,
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

interface DeliveryBatch {
  id: string;
  batchId: string;
  orderNumber?: string;
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
}

interface DeliveryTimelineStage {
  stage: string;
  location: string;
  timestamp?: string;
  status: "completed" | "current" | "upcoming";
}

interface LogisticsMetrics {
  incomingToday: number; // in kg
  activeTrucks: number;
}

interface LogisticsCoordinator {
  name: string;
  phone: string;
}

export function LogisticsDeliveries() {
  const { orders, fetchOrders, isLoading: ordersLoading } = useMarketplace();
  const { requests, fetchRequests, isLoading: requestsLoading } = useTransport();
  const { user } = useAuth();
  
  const [showMapView, setShowMapView] = useState(false);

  // Fetch buyer's orders and transport requests
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ buyerId: user.id });
      // Fetch transport requests where buyer is the requester (for order deliveries)
      fetchRequests({ requesterId: user.id });
    }
  }, [user?.id, fetchOrders, fetchRequests]);

  // Convert transport requests to delivery batches format
  // Filter for ORDER_DELIVERY type and in-transit/delivered statuses
  const orderDeliveryRequests = requests.filter(
    (req) => req.type === "order_delivery" && 
    (req.status === "in_transit" || req.status === "delivered" || req.status === "accepted")
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
    if (request.trackingUpdates && request.trackingUpdates.length > 0) {
      // Sort tracking updates by timestamp (oldest first)
      const sortedUpdates = [...request.trackingUpdates].sort((a, b) => {
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
      // If no tracking updates but in transit, show current status
      timeline.push({
        stage: "In Transit",
        location: request.currentLocation || request.to || "En Route",
        timestamp: "Current",
        status: "current",
      });
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
    const order = request.orderId ? ordersMap.get(request.orderId) : undefined;
    const timeline = buildTimeline(request, order);
    
    // Get latest tracking update for current location
    const latestUpdate = request.trackingUpdates && request.trackingUpdates.length > 0
      ? request.trackingUpdates[request.trackingUpdates.length - 1]
      : null;

    return {
      id: request.id,
      batchId: request.orderNumber || request.requestId || request.id,
      orderNumber: request.orderNumber,
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
      trackingUpdates: request.trackingUpdates || [],
    };
  });

  // Calculate metrics
  const metrics: LogisticsMetrics = {
    incomingToday: batches
      .filter((b) => b.status === "in_transit" || b.status === "inspecting")
      .reduce((sum, b) => sum + b.weight, 0),
    activeTrucks: batches.filter((b) => b.status === "in_transit").length,
  };

  const isLoading = ordersLoading || requestsLoading;

  // Mock coordinator - TODO: Get from transport context
  const coordinator: LogisticsCoordinator | null = null;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Delivery Batches */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white border-stone-200 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-32 bg-stone-100 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            batches.map((batch) => (
              <Card
                key={batch.id}
                className={`bg-white border-stone-200 ${
                  batch.status === "in_transit" ? "border-l-4 border-l-orange-500" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(batch.status)}</div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-stone-900">
                              {batch.orderNumber ? `Order #${batch.orderNumber}` : `Batch #${batch.batchId}`}
                            </h3>
                            <Badge variant="outline" className={getStatusColor(batch.status)}>
                              {getStatusLabel(batch.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-stone-600">
                            {batch.destination} • {batch.destinationRegion}
                          </p>
                        </div>
                        {batch.estimatedArrival && (
                          <div className="text-right">
                            <p className="text-xs text-stone-500">Est. Arrival</p>
                            <p className="text-sm font-semibold text-stone-900">
                              {batch.estimatedArrival}
                              {batch.estimatedArrivalTime && `, ${batch.estimatedArrivalTime}`}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Timeline - Show for all statuses */}
                      {batch.timeline && batch.timeline.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-orange-200" />
                            <div className="space-y-4">
                              {batch.timeline.map((stage, index) => (
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
                      {batch.status === "in_transit" && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          {batch.driver ? (
                            <div className="flex items-center gap-2">
                              <IconUser className="h-4 w-4 text-stone-400" />
                              <div>
                                <p className="text-sm font-medium text-stone-900">{batch.driver.name}</p>
                                <p className="text-xs text-stone-500">
                                  Driver {batch.driver.vehicleNumber ? `• ${batch.driver.vehicleNumber}` : ""}
                                  {batch.driver.phone ? ` • ${batch.driver.phone}` : ""}
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
                              {formatWeight(batch.weight)} • {batch.productType}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Completed/Received Info */}
                      {batch.status === "received" && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div>
                            <p className="text-xs text-stone-500">WEIGHT</p>
                            <p className="text-sm font-medium text-stone-900">{formatWeight(batch.weight)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-stone-500">ARRIVED</p>
                            <p className="text-sm font-medium text-stone-900">
                              {batch.arrivalDate || "Recently"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Inspecting Info */}
                      {batch.status === "inspecting" && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div>
                            <p className="text-xs text-stone-500">WEIGHT</p>
                            <p className="text-sm font-medium text-stone-900">{formatWeight(batch.weight)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-stone-500">QUALITY CHECK</p>
                            <p className="text-sm font-medium text-stone-900">
                              {batch.qualityCheckStatus || "In Progress"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {batch.status === "in_transit" && batch.driver && batch.driver.phone && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-stone-200 hover:border-orange-500 hover:text-orange-500"
                            onClick={() => {
                              window.location.href = `tel:${batch.driver!.phone!.replace(/\s/g, "")}`;
                            }}
                          >
                            <IconPhone className="h-4 w-4 mr-2" />
                            Contact Driver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Logistics Overview */}
          <Card className="bg-stone-900 border-stone-800">
            <CardHeader>
              <CardTitle className="text-white">Logistics Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-stone-300 mb-1">Incoming (Today)</p>
                <p className="text-2xl font-bold text-white">{formatWeight(metrics.incomingToday)}</p>
              </div>
              <div>
                <p className="text-sm text-stone-300 mb-1">Active Trucks</p>
                <p className="text-2xl font-bold text-white">{metrics.activeTrucks}</p>
              </div>
            </CardContent>
          </Card>

          {/* Logistics Coordinator */}
          {coordinator && (
            <Card className="bg-white border-stone-200">
              <CardHeader>
                <CardTitle className="text-stone-900">Logistics Coordinator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconPhone className="h-5 w-5 text-stone-400" />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{coordinator.name}</p>
                    <p className="text-xs text-stone-500">{coordinator.phone}</p>
                  </div>
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => {
                    window.location.href = `tel:${coordinator.phone.replace(/\s/g, "")}`;
                  }}
                >
                  <IconPhone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
              </CardContent>
            </Card>
          )}
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
              .filter((batch) => batch.status === "in_transit" && batch.originCoordinates && batch.destinationCoordinates)
              .map((batch) => {
                // Build route with all tracking points
                const routePoints: LatLngExpression[] = [];
                if (batch.originCoordinates) {
                  routePoints.push(batch.originCoordinates as LatLngExpression);
                }
                
                // Add all tracking update coordinates in chronological order
                const sortedUpdates = [...batch.trackingUpdates].sort((a, b) => {
                  const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
                  const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
                  return timeA - timeB;
                });
                
                sortedUpdates.forEach(update => {
                  if (update.coordinates) {
                    routePoints.push(update.coordinates as LatLngExpression);
                  }
                });
                
                // Add destination
                if (batch.destinationCoordinates) {
                  routePoints.push(batch.destinationCoordinates as LatLngExpression);
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
                    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-stone-200 mb-4">
                      <MapContainer
                        {...({
                          center: batch.currentCoordinates || batch.originCoordinates || [-1.5167, 37.2667],
                          zoom: 10,
                          style: { height: "100%", width: "100%" },
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
                          return (
                            <Marker 
                              key={update.id || idx} 
                              position={update.coordinates as LatLngExpression}
                              icon={L.divIcon({
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
                              })}
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
                            positions={routePoints}
                            color="#f97316"
                            weight={3}
                            opacity={0.7}
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
            {batches.filter((batch) => batch.status === "in_transit" && batch.originCoordinates && batch.destinationCoordinates).length === 0 && (
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
    </div>
  );
}

