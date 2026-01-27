import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconTruck, IconMapPin, IconPhoto, IconCheck, IconLocation } from "@tabler/icons-react";
import { DeliveryTrackingMap } from "@/components/transport/DeliveryTrackingMap";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Delivery } from "@/types/transport";

export default function ActiveDeliveries() {
  const { activeDeliveries, fetchActiveDeliveries, updateRequestStatus, addTracking, isLoading } = useTransport();
  const { user } = useAuth();
  
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({
    location: "",
    coordinates: "",
    timestamp: "",
  });
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fetch active deliveries on mount
  useEffect(() => {
    if (user?.id) {
      fetchActiveDeliveries();
    }
  }, [user?.id, fetchActiveDeliveries]);

  const deliveries = activeDeliveries;

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const handleUploadPhoto = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setPhotoDialogOpen(true);
  };

  const handleUpdateLocation = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setLocationForm({
      location: delivery.currentLocation || "",
      coordinates: delivery.currentCoordinates 
        ? `${delivery.currentCoordinates[0]},${delivery.currentCoordinates[1]}`
        : "",
      timestamp: "",
    });
    setLocationError(null);
    setIsCapturingLocation(false);
    setLocationDialogOpen(true);
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsCapturingLocation(true);
    setLocationError(null);

    // Capture timestamp when location capture starts
    const captureTimestamp = new Date().toISOString();
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = `${latitude},${longitude}`;
        
        // Try to reverse geocode to get location name
        try {
          // Using OpenStreetMap Nominatim API for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          // Extract location name from response
          const locationName = data.display_name || 
                             data.address?.road || 
                             data.address?.village || 
                             data.address?.town || 
                             data.address?.city ||
                             `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setLocationForm({
            location: locationName,
            coordinates: coordinates,
            timestamp: captureTimestamp,
          });
        } catch (error) {
          // If reverse geocoding fails, use coordinates as location name
          setLocationForm({
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            coordinates: coordinates,
            timestamp: captureTimestamp,
          });
        }
        
        setIsCapturingLocation(false);
      },
      (error) => {
        setIsCapturingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Please try again.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An error occurred while capturing location. Please try again.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitLocation = async () => {
    if (!selectedDelivery || !locationForm.location) {
      alert("Please provide a location name");
      return;
    }

    try {
      // Parse coordinates if provided
      let coordinates: [number, number] | undefined;
      if (locationForm.coordinates) {
        const coords = locationForm.coordinates.split(",").map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          coordinates = [coords[0], coords[1]];
        }
      }

      await addTracking(selectedDelivery.id, {
        status: selectedDelivery.status || "in_transit",
        location: locationForm.location,
        coordinates: coordinates ? `${coordinates[0]},${coordinates[1]}` : undefined,
        timestamp: locationForm.timestamp || new Date().toISOString(),
      });

      alert("Location updated successfully!");
      setLocationDialogOpen(false);
      setSelectedDelivery(null);
      await fetchActiveDeliveries();
    } catch (error) {
      console.error("Failed to update location:", error);
      alert("Failed to update location. Please try again.");
    }
  };

  const handleCompleteDelivery = async (id: string) => {
    try {
      await updateRequestStatus(id, "delivered");
      alert("Delivery marked as complete!");
      setDetailsDialogOpen(false);
      // Refresh active deliveries
      await fetchActiveDeliveries();
    } catch (error) {
      console.error("Failed to complete delivery:", error);
      alert("Failed to complete delivery. Please try again.");
    }
  };

  const getTypeBadge = (type: string) => {
    // Handle both lowercase (frontend) and uppercase (backend) formats
    const normalizedType = type?.toLowerCase();
    switch (normalizedType) {
      case "produce_pickup":
        return <Badge variant="secondary">Produce Pickup</Badge>;
      case "produce_delivery":
        return <Badge className="bg-info text-info-foreground">Produce Delivery</Badge>;
      case "input_delivery":
        return <Badge className="bg-success text-success-foreground">Input Delivery</Badge>;
      case "order_delivery":
        return <Badge className="bg-purple-500 text-white">Order Delivery</Badge>;
      default:
        return <Badge variant="secondary">{type || "Unknown"}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pickup":
        return "bg-warning text-warning-foreground";
      case "in_transit":
        return "bg-info text-info-foreground";
      case "delivered":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Active Deliveries</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage your ongoing deliveries
        </p>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeBadge(delivery.type)}
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>
                    {delivery.description} • {delivery.weight}kg
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">KES {delivery.amount}</div>
                  <div className="text-sm text-muted-foreground">Payment</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Route Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">From</div>
                  <div className="font-medium">{delivery.from}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">To</div>
                  <div className="font-medium">{delivery.to}</div>
                </div>
              </div>

              {/* Current Location */}
              {delivery.currentLocation && (
                <div className="text-sm text-muted-foreground">
                  <span>📍 Current Location: {delivery.currentLocation}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {delivery.status !== "delivered" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateLocation(delivery)}
                      className="flex-1"
                    >
                      <IconLocation className="mr-2 h-4 w-4" />
                      Update Location
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUploadPhoto(delivery)}
                    >
                      <IconPhoto className="mr-2 h-4 w-4" />
                      Photo
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleCompleteDelivery(delivery.id)}
                    >
                      <IconCheck className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </Button>
                  </>
                )}
                {delivery.status === "delivered" && (
                  <Badge className="bg-success text-success-foreground w-full justify-center">
                    Delivered
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {deliveries.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconTruck className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No active deliveries at the moment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>Track your delivery progress</DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="p-4 border rounded-lg bg-accent/50">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeBadge(selectedDelivery.type)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedDelivery.description}
                </div>
              </div>

              {/* Map View */}
              {selectedDelivery.fromCoordinates && selectedDelivery.toCoordinates && (
                <DeliveryTrackingMap
                  pickupLocation={{
                    name: selectedDelivery.from,
                    coordinates: selectedDelivery.fromCoordinates,
                  }}
                  deliveryLocation={{
                    name: selectedDelivery.to,
                    coordinates: selectedDelivery.toCoordinates,
                  }}
                  currentLocation={
                    selectedDelivery.currentCoordinates
                      ? {
                          name: selectedDelivery.currentLocation,
                          coordinates: selectedDelivery.currentCoordinates,
                        }
                      : undefined
                  }
                  status={selectedDelivery.status === "in_transit" || selectedDelivery.status === "delivered" 
                    ? selectedDelivery.status 
                    : "in_transit"}
                  distance={selectedDelivery.distance}
                  eta={selectedDelivery.eta || selectedDelivery.estimatedArrival}
                />
              )}

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Requester</div>
                  <div className="font-medium">{selectedDelivery.requesterName || selectedDelivery.requester}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="font-medium">{selectedDelivery.from}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="font-medium">{selectedDelivery.to}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div className="font-medium">{selectedDelivery.distance} km</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Weight</div>
                    <div className="font-medium">{selectedDelivery.weight} kg</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount</div>
                    <div className="font-medium">KES {selectedDelivery.amount}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Current Location</div>
                  <div className="font-medium">{selectedDelivery.currentLocation || "Not updated"}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Status</div>
                  <Badge className={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              {selectedDelivery.status === "in_transit" && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateLocation(selectedDelivery)}
                    className="flex-1"
                  >
                    <IconLocation className="mr-2 h-4 w-4" />
                    Update Location
                  </Button>
                  <Button
                    onClick={() => handleCompleteDelivery(selectedDelivery.id)}
                    className="flex-1"
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Delivery Photo</DialogTitle>
            <DialogDescription>
              Document the delivery with a photo for verification
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <IconPhoto className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Click to upload or drag and drop
              </p>
              <Button variant="outline">
                Choose File
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPhotoDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => setPhotoDialogOpen(false)} className="flex-1">
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Location Dialog */}
      <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Current Location</DialogTitle>
            <DialogDescription>
              Capture your current location to update the delivery status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!locationForm.location && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <IconLocation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to capture your current location
                  </p>
                  <Button
                    onClick={handleCaptureLocation}
                    disabled={isCapturingLocation}
                    variant="outline"
                  >
                    {isCapturingLocation ? (
                      <>
                        <IconLocation className="mr-2 h-4 w-4 animate-spin" />
                        Capturing Location...
                      </>
                    ) : (
                      <>
                        <IconLocation className="mr-2 h-4 w-4" />
                        Capture Location
                      </>
                    )}
                  </Button>
                </div>
                {locationError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{locationError}</p>
                  </div>
                )}
              </div>
            )}

            {locationForm.location && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={locationForm.location}
                    onChange={(e) =>
                      setLocationForm({ ...locationForm, location: e.target.value })
                    }
                    readOnly={false}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can edit the location name if needed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates</Label>
                  <Input
                    id="coordinates"
                    value={locationForm.coordinates}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically captured from your device
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocationForm({ location: "", coordinates: "" });
                      setLocationError(null);
                    }}
                    className="flex-1"
                  >
                    Capture Again
                  </Button>
                  <Button onClick={handleSubmitLocation} className="flex-1">
                    <IconLocation className="mr-2 h-4 w-4" />
                    Update Location
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setLocationDialogOpen(false);
                  setSelectedDelivery(null);
                  setLocationForm({ location: "", coordinates: "", timestamp: "" });
                  setLocationError(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

