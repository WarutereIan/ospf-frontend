import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconTruck, IconMapPin, IconPhoto, IconCheck } from "@tabler/icons-react";

interface Delivery {
  id: string;
  type: string;
  from: string;
  to: string;
  distance: number;
  status: "pickup" | "in_transit" | "delivered";
  progress: number;
  eta: string;
  amount: number;
  requester: string;
  weight: number;
  description: string;
  currentLocation?: string;
}

export default function ActiveDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: "1",
      type: "Produce Pickup",
      from: "John Kamau Farm",
      to: "Kangundo Centre",
      distance: 12,
      status: "in_transit",
      progress: 65,
      eta: "15 min",
      amount: 1000,
      requester: "John Kamau",
      weight: 250,
      description: "250kg OFSP Grade A",
      currentLocation: "7.8km from destination",
    },
    {
      id: "2",
      type: "Input Delivery",
      from: "AgriInputs Warehouse",
      to: "Mary Wanjiku Farm",
      distance: 8,
      status: "pickup",
      progress: 10,
      eta: "5 min",
      amount: 500,
      requester: "AgriInputs Co.",
      weight: 50,
      description: "50kg NPK Fertilizer",
      currentLocation: "At pickup location",
    },
  ]);

  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const handleViewDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDetailsDialogOpen(true);
  };

  const handleUploadPhoto = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setPhotoDialogOpen(true);
  };

  const handleCompleteDelivery = (id: string) => {
    setDeliveries(deliveries.map(d =>
      d.id === id ? { ...d, status: "delivered" as const, progress: 100 } : d
    ));
    alert("Delivery marked as complete!");
    setDetailsDialogOpen(false);
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
                    <CardTitle className="text-lg">{delivery.type}</CardTitle>
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

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{delivery.progress}%</span>
                </div>
                <Progress value={delivery.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>📍 {delivery.currentLocation}</span>
                  <span>⏱️ ETA: {delivery.eta}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(delivery)}
                  className="flex-1"
                >
                  <IconMapPin className="mr-2 h-4 w-4" />
                  Track
                </Button>
                {delivery.status !== "delivered" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUploadPhoto(delivery)}
                    >
                      <IconPhoto className="mr-2 h-4 w-4" />
                      Photo
                    </Button>
                    {delivery.status === "in_transit" && delivery.progress > 90 && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteDelivery(delivery.id)}
                      >
                        <IconCheck className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>Track your delivery progress</DialogDescription>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-accent/50">
                <div className="font-medium mb-1">{selectedDelivery.type}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedDelivery.description}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Requester</div>
                  <div className="font-medium">{selectedDelivery.requester}</div>
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
                  <div className="text-sm text-muted-foreground mb-2">Delivery Progress</div>
                  <Progress value={selectedDelivery.progress} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{selectedDelivery.progress}% Complete</span>
                    <span>ETA: {selectedDelivery.eta}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Current Location</div>
                  <div className="font-medium">{selectedDelivery.currentLocation}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Status</div>
                  <Badge className={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>

              {selectedDelivery.status === "in_transit" && selectedDelivery.progress > 90 && (
                <Button
                  onClick={() => handleCompleteDelivery(selectedDelivery.id)}
                  className="w-full"
                >
                  <IconCheck className="mr-2 h-4 w-4" />
                  Mark as Delivered
                </Button>
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
    </div>
  );
}

