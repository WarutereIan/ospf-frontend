import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  IconTruck,
  IconMapPin,
  IconPackage,
  IconCheck,
  IconAlertCircle,
  IconCalendar,
} from "@tabler/icons-react";
import { useState } from "react";

interface CollectionOrder {
  id: string;
  orderId: string;
  variety: string;
  quantity: number;
  qualityGrade: string;
  aggregationCenter: string;
  status: "ready_for_collection" | "collected" | "pending";
  readyDate: string;
  collectionDate?: string;
  batchId: string;
}

interface CollectionReceivingProps {
  orders: CollectionOrder[];
  onCollect?: (orderId: string, collectionDetails: CollectionDetails) => void;
}

interface CollectionDetails {
  collectionDate: string;
  collectionTime: string;
  collectedBy: string;
  vehicleNumber?: string;
  notes?: string;
}

export function CollectionReceiving({ orders, onCollect }: CollectionReceivingProps) {
  const [selectedOrder, setSelectedOrder] = useState<CollectionOrder | null>(null);
  const [collectionDetails, setCollectionDetails] = useState<CollectionDetails>({
    collectionDate: new Date().toISOString().split("T")[0],
    collectionTime: new Date().toTimeString().slice(0, 5),
    collectedBy: "",
    vehicleNumber: "",
    notes: "",
  });
  const [showCollectionForm, setShowCollectionForm] = useState(false);

  const readyOrders = orders.filter((o) => o.status === "ready_for_collection");
  const collectedOrders = orders.filter((o) => o.status === "collected");

  const handleCollect = () => {
    if (selectedOrder && collectionDetails.collectedBy) {
      if (onCollect) {
        onCollect(selectedOrder.orderId, collectionDetails);
      }
      setShowCollectionForm(false);
      setSelectedOrder(null);
      // Reset form
      setCollectionDetails({
        collectionDate: new Date().toISOString().split("T")[0],
        collectionTime: new Date().toTimeString().slice(0, 5),
        collectedBy: "",
        vehicleNumber: "",
        notes: "",
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setShowCollectionForm(open);
    if (!open) {
      // Reset form when dialog closes
      setSelectedOrder(null);
      setCollectionDetails({
        collectionDate: new Date().toISOString().split("T")[0],
        collectionTime: new Date().toTimeString().slice(0, 5),
        collectedBy: "",
        vehicleNumber: "",
        notes: "",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_for_collection":
        return "bg-green-100 text-green-800 border-green-300";
      case "collected":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready for Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Orders ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {readyOrders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString()} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available for collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectedOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Ready for Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTruck className="h-5 w-5" />
            Orders Ready for Collection
          </CardTitle>
          <CardDescription>
            Collect or receive produce from sub-county aggregation centres
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readyOrders.length > 0 ? (
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <div key={order.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Order #{order.orderId}</h3>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          Ready for Collection
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Variety</p>
                          <p className="font-medium">{order.variety}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity</p>
                          <p className="font-medium">{order.quantity} kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quality Grade</p>
                          <Badge variant="outline">Grade {order.qualityGrade}</Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Batch ID</p>
                          <p className="font-medium text-xs">{order.batchId}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <IconMapPin className="h-4 w-4" />
                        <span>{order.aggregationCenter}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <IconCalendar className="h-4 w-4" />
                        <span>Ready since: {new Date(order.readyDate).toLocaleDateString("en-KE")}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowCollectionForm(true);
                      }}
                      className="ml-4"
                    >
                      <IconCheck className="mr-2 h-4 w-4" />
                      Mark as Collected
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders ready for collection</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Form Dialog */}
      <Dialog open={showCollectionForm} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Mark Order as Collected</DialogTitle>
                <DialogDescription>Order #{selectedOrder.orderId}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Variety</p>
                      <p className="font-semibold">{selectedOrder.variety}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{selectedOrder.quantity} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold">{selectedOrder.aggregationCenter}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Batch ID</p>
                      <p className="font-semibold">{selectedOrder.batchId}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="collectionDate">Collection Date *</Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={collectionDetails.collectionDate}
                        onChange={(e) =>
                          setCollectionDetails({ ...collectionDetails, collectionDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="collectionTime">Collection Time *</Label>
                      <Input
                        id="collectionTime"
                        type="time"
                        value={collectionDetails.collectionTime}
                        onChange={(e) =>
                          setCollectionDetails({ ...collectionDetails, collectionTime: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="collectedBy">Collected By *</Label>
                    <Input
                      id="collectedBy"
                      placeholder="Enter name of person collecting"
                      value={collectionDetails.collectedBy}
                      onChange={(e) =>
                        setCollectionDetails({ ...collectionDetails, collectedBy: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
                    <Input
                      id="vehicleNumber"
                      placeholder="e.g. KCA 123A"
                      value={collectionDetails.vehicleNumber}
                      onChange={(e) =>
                        setCollectionDetails({ ...collectionDetails, vehicleNumber: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Any additional notes..."
                      value={collectionDetails.notes}
                      onChange={(e) =>
                        setCollectionDetails({ ...collectionDetails, notes: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowCollectionForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCollect} disabled={!collectionDetails.collectedBy}>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Confirm Collection
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Collection History */}
      {collectedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Collection History</CardTitle>
            <CardDescription>Recently collected orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {collectedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} kg {order.variety} (Grade {order.qualityGrade})
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        Collected
                      </Badge>
                      {order.collectionDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.collectionDate).toLocaleDateString("en-KE")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

