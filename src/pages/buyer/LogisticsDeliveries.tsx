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

interface DeliveryBatch {
  id: string;
  batchId: string;
  status: "in_transit" | "received" | "inspecting" | "approved";
  destination: string;
  destinationRegion: string;
  estimatedArrival?: string;
  estimatedArrivalTime?: string;
  weight: number; // in kg
  productType: string;
  driver?: {
    name: string;
    vehicleNumber: string;
  };
  timeline: DeliveryTimelineStage[];
  supplier?: string;
  origin?: string;
  arrivalDate?: string;
  qualityCheckStatus?: string;
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
  avgDelay: number; // in minutes (negative means early)
}

interface LogisticsCoordinator {
  name: string;
  phone: string;
}

export function LogisticsDeliveries() {
  const [batches, setBatches] = useState<DeliveryBatch[]>([]);
  const [metrics, setMetrics] = useState<LogisticsMetrics>({
    incomingToday: 0,
    activeTrucks: 0,
    avgDelay: 0,
  });
  const [coordinator, setCoordinator] = useState<LogisticsCoordinator | null>(null);
  const [showMapView, setShowMapView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setBatches([
        {
          id: "1",
          batchId: "DLV-8902",
          status: "in_transit",
          destination: "Kangundo Main Aggregation Center",
          destinationRegion: "Kangundo",
          estimatedArrival: "Today",
          estimatedArrivalTime: "4:00 PM",
          weight: 1200,
          productType: "Fresh Root",
          driver: {
            name: "John K.",
            vehicleNumber: "KCA 450B",
          },
          timeline: [
            {
              stage: "Dispatched",
              location: "Kathiani",
              timestamp: "08:00 AM",
              status: "completed",
            },
            {
              stage: "Masinga",
              location: "Masinga",
              timestamp: "11:30 AM",
              status: "completed",
            },
            {
              stage: "Yatta",
              location: "Yatta",
              timestamp: "Current",
              status: "current",
            },
            {
              stage: "Kangundo",
              location: "Kangundo",
              timestamp: "Est. 16:00",
              status: "upcoming",
            },
          ],
        },
        {
          id: "2",
          batchId: "DLV-8901",
          status: "received",
          destination: "James Mutua",
          destinationRegion: "Kangundo",
          weight: 500,
          productType: "Fresh Root",
          arrivalDate: "Yesterday",
        },
        {
          id: "3",
          batchId: "DLV-8890",
          status: "inspecting",
          destination: "Mary Wanjiku",
          destinationRegion: "Kathiani",
          weight: 2100,
          productType: "Fresh Root",
          qualityCheckStatus: "In Progress",
        },
        {
          id: "4",
          batchId: "DLV-8889",
          status: "in_transit",
          destination: "Yatta Main Aggregation Center",
          destinationRegion: "Yatta",
          estimatedArrival: "Tomorrow",
          estimatedArrivalTime: "10:00 AM",
          weight: 800,
          productType: "Fresh Root",
          driver: {
            name: "Peter M.",
            vehicleNumber: "KCA 320C",
          },
          timeline: [
            {
              stage: "Dispatched",
              location: "Masinga",
              timestamp: "09:00 AM",
              status: "completed",
            },
            {
              stage: "Kathiani",
              location: "Kathiani",
              timestamp: "Current",
              status: "current",
            },
            {
              stage: "Yatta",
              location: "Yatta",
              timestamp: "Est. 10:00",
              status: "upcoming",
            },
          ],
        },
      ]);

      setMetrics({
        incomingToday: 1200,
        activeTrucks: 3,
        avgDelay: -15, // 15 minutes early
      });

      setCoordinator({
        name: "Sarah Ochieng",
        phone: "+254 712 345 678",
      });

      setIsLoading(false);
    }, 1000);
  }, []);

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
                            <h3 className="text-lg font-bold text-stone-900">Batch #{batch.batchId}</h3>
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

                      {/* Timeline for In Transit */}
                      {batch.status === "in_transit" && batch.timeline && (
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
                                      <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm ring-2 ring-orange-200" />
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
                      {batch.status === "in_transit" && batch.driver && (
                        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-2">
                            <IconUser className="h-4 w-4 text-stone-400" />
                            <div>
                              <p className="text-sm font-medium text-stone-900">{batch.driver.name}</p>
                              <p className="text-xs text-stone-500">
                                Driver • {batch.driver.vehicleNumber}
                              </p>
                            </div>
                          </div>
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
                      {batch.status === "in_transit" && batch.driver && (
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-stone-200 hover:border-orange-500 hover:text-orange-500"
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
              <div>
                <p className="text-sm text-stone-300 mb-1">Avg. Delay</p>
                <p
                  className={`text-2xl font-bold ${
                    metrics.avgDelay < 0 ? "text-green-400" : metrics.avgDelay > 0 ? "text-red-400" : "text-white"
                  }`}
                >
                  {metrics.avgDelay > 0 ? "+" : ""}
                  {metrics.avgDelay} min
                </p>
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
            <div className="h-96 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
              <div className="text-center space-y-2">
                <IconMap className="h-12 w-12 text-stone-400 mx-auto" />
                <p className="text-stone-500">Map view will be integrated here</p>
                <p className="text-sm text-stone-400">Showing real-time truck locations and routes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

