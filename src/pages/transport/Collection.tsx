import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconTruck,
  IconClock,
  IconWeight,
  IconCheck,
  IconPackage,
  IconCalendar,
  IconUser,
  IconPhoto,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import type { TransportRequest } from "@/types/transport";

export default function Collection() {
  const { requests, activeDeliveries, fetchRequests, fetchActiveDeliveries, updateRequestStatus, isLoading } = useTransport();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchRequests({ providerId: user.id });
      fetchActiveDeliveries();
    }
  }, [user?.id, fetchRequests, fetchActiveDeliveries]);

  // Get accepted requests that need collection
  const baseCollections = requests.filter(req => 
    req.status === "accepted" || req.status === "in_transit"
  );

  // Local state to track collection updates
  const [collectionUpdates, setCollectionUpdates] = useState<Record<string, Partial<TransportRequest>>>({});
  
  // Merge base collections with local updates
  const collections = baseCollections.map(req => ({
    ...req,
    ...collectionUpdates[req.id],
  }));

  const [selectedCollection, setSelectedCollection] = useState<TransportRequest | null>(null);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState({
    collectionDate: new Date().toISOString().split("T")[0],
    collectionTime: new Date().toTimeString().slice(0, 5),
    collectedBy: "",
    collectionNotes: "",
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCollections = collections.filter(
    (col) => filterStatus === "all" || col.collectionStatus === filterStatus
  );

  const handleMarkCollection = (collection: TransportRequest) => {
    // Prevent opening dialog if collection cannot be marked
    if (!canMarkCollected(collection)) {
      const reason = getCollectionBlockReason(collection);
      alert(reason || "Collection cannot be marked at this time.");
      return;
    }
    setSelectedCollection(collection);
    setCollectionForm({
      collectionDate: new Date().toISOString().split("T")[0],
      collectionTime: new Date().toTimeString().slice(0, 5),
      collectedBy: "",
      collectionNotes: "",
    });
    setCollectionDialogOpen(true);
  };

  const handleSubmitCollection = async () => {
    if (!selectedCollection || !collectionForm.collectedBy) {
      alert("Please fill in all required fields");
      return;
    }

    // Double-check stockout requirement for order deliveries
    if (!canMarkCollected(selectedCollection)) {
      const reason = getCollectionBlockReason(selectedCollection);
      alert(reason || "Collection cannot be marked. Stockout process must be completed first.");
      return;
    }

    try {
      // Update local state with collection details
      setCollectionUpdates(prev => ({
        ...prev,
        [selectedCollection.id]: {
          collectionStatus: "collected" as const,
          collectionDate: collectionForm.collectionDate,
          collectionTime: collectionForm.collectionTime,
          collectedBy: collectionForm.collectedBy,
          collectionNotes: collectionForm.collectionNotes,
          collectedAt: new Date().toISOString(),
        }
      }));

      // Update request status to in_transit (will be mapped to IN_TRANSIT_PICKUP for order deliveries)
      // Pass the transport type so the service can determine the correct backend status
      await updateRequestStatus(selectedCollection.id, "in_transit");

      setCollectionDialogOpen(false);
      setSelectedCollection(null);
      alert("Collection marked successfully! You can now proceed with delivery.");
      
      // Refresh requests to get updated data
      await fetchRequests();
    } catch (error) {
      console.error("Failed to mark collection:", error);
      alert("Failed to mark collection. Please try again.");
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

  const getCollectionStatusBadge = (status?: string) => {
    switch (status) {
      case "collected":
        return <Badge className="bg-success text-success-foreground">Collected</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
    }
  };

  // Check if collection can be marked for a given request
  const canMarkCollected = (collection: TransportRequest): boolean => {
    // For order deliveries, stockout must be completed
    if (collection.type === "order_delivery") {
      return collection.orderStockOutRecorded === true;
    }
    // For other types, allow if status is accepted
    return collection.status === "accepted";
  };

  // Get reason why collection cannot be marked
  const getCollectionBlockReason = (collection: TransportRequest): string | null => {
    if (collection.type === "order_delivery" && !collection.orderStockOutRecorded) {
      return "Stockout process must be completed before collection";
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Collection Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Mark collections when accepting delivery requests and before starting deliveries
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collections.length}</div>
            <p className="text-xs text-muted-foreground">Accepted requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collections.filter((c) => c.status === "accepted").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collections.filter((c) => c.status === "in_transit").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collections.filter((c) => c.status === "in_transit").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently delivering</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Label htmlFor="status-filter" className="text-sm sm:text-base">Filter by Collection Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                <SelectItem value="pending">Pending Collection</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs sm:text-sm text-muted-foreground sm:ml-auto">
              Showing {filteredCollections.length} collection{filteredCollections.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Table - Desktop View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Collection Requests</CardTitle>
          <CardDescription>
            Mark items as collected when you accept a request and before starting delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <div className="min-w-full">
              <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order Number</TableHead>
                  <TableHead className="w-[110px]">Type</TableHead>
                  <TableHead className="w-[140px]">Requester</TableHead>
                  <TableHead className="w-[170px]">Route</TableHead>
                  <TableHead className="w-[140px]">Details</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">Collection Info</TableHead>
                  <TableHead className="text-right w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell className="font-medium font-mono text-xs">
                      {collection.orderNumber || collection.requestId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{getTypeBadge(collection.type)}</TableCell>
                    <TableCell className="text-xs max-w-[140px]">
                      <div className="truncate" title={collection.requesterName}>{collection.requesterName}</div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[170px]">
                      <div className="font-medium truncate" title={collection.from}>{collection.from}</div>
                      <div className="text-muted-foreground truncate" title={collection.to}>→ {collection.to}</div>
                    </TableCell>
                    <TableCell className="text-xs max-w-[140px]">
                      <div className="truncate" title={collection.description}>{collection.description}</div>
                      <div className="text-muted-foreground">
                        <IconWeight className="h-3 w-3 inline mr-1" />
                        {collection.weight} kg
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{getCollectionStatusBadge(collection.status)}</TableCell>
                    <TableCell className="text-xs max-w-[140px]">
                      {collection.status === "in_transit" && collection.pickupAt ? (
                        <div>
                          <div className="text-muted-foreground truncate">
                            <IconCalendar className="h-3 w-3 inline mr-1" />
                            {collection.pickupAt.split("T")[0]}
                          </div>
                          <div className="text-muted-foreground truncate">
                            <IconClock className="h-3 w-3 inline mr-1" />
                            {collection.pickupAt.split("T")[1]?.slice(0, 5)}
                          </div>
                          {collection.driverName && (
                            <div className="text-muted-foreground truncate" title={collection.driverName}>
                              <IconUser className="h-3 w-3 inline mr-1" />
                              {collection.driverName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not collected</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {collection.status === "accepted" && (
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleMarkCollection(collection)}
                            disabled={!canMarkCollected(collection)}
                            className="text-xs"
                            title={getCollectionBlockReason(collection) || undefined}
                          >
                            <IconCheck className="mr-1 h-3 w-3" />
                            Mark Collected
                          </Button>
                          {!canMarkCollected(collection) && (
                            <span className="text-xs text-muted-foreground text-right max-w-[120px]">
                              {getCollectionBlockReason(collection)}
                            </span>
                          )}
                        </div>
                      )}
                      {collection.status === "in_transit" && (
                        <Badge className="bg-success text-success-foreground text-xs">
                          Ready
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Cards - Mobile View */}
      <div className="md:hidden space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Collection Requests</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Mark items as collected when you accept a request and before starting delivery
          </p>
        </div>
        {filteredCollections.map((collection) => (
          <Card key={collection.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-base font-mono">
                      {collection.orderNumber || collection.requestId}
                    </CardTitle>
                    {getTypeBadge(collection.type)}
                  </div>
                  <CardDescription className="text-sm">{collection.requester}</CardDescription>
                </div>
                {getCollectionStatusBadge(collection.collectionStatus)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Route</div>
                <div className="text-sm">
                  <div className="font-medium">{collection.from}</div>
                  <div className="text-muted-foreground">→ {collection.to}</div>
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Details</div>
                <div className="text-sm">
                  <div>{collection.description}</div>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconWeight className="h-3 w-3" />
                      {collection.weight} kg
                    </span>
                  </div>
                </div>
              </div>
              {collection.collectionStatus === "collected" && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">Collection Info</div>
                  <div className="text-sm space-y-1">
                    <div className="text-muted-foreground flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      {collection.collectionDate}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {collection.collectionTime}
                    </div>
                    {collection.collectedBy && (
                      <div className="text-muted-foreground flex items-center gap-1">
                        <IconUser className="h-3 w-3" />
                        {collection.collectedBy}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-2">
                {collection.status === "accepted" && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => handleMarkCollection(collection)}
                      disabled={!canMarkCollected(collection)}
                      className="w-full"
                      title={getCollectionBlockReason(collection) || undefined}
                    >
                      <IconCheck className="mr-2 h-4 w-4" />
                      Mark Collected
                    </Button>
                    {!canMarkCollected(collection) && (
                      <p className="text-xs text-muted-foreground text-center">
                        {getCollectionBlockReason(collection)}
                      </p>
                    )}
                  </div>
                )}
                {collection.status === "in_transit" && (
                  <Badge className="bg-success text-success-foreground w-full justify-center py-2">
                    Ready for Delivery
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collection Dialog */}
      <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Mark Collection</DialogTitle>
            <DialogDescription>
              Record collection details before starting delivery
            </DialogDescription>
          </DialogHeader>
          {selectedCollection && (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Request Details */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">Order Number:</span>
                      <span className="text-sm font-mono break-all">
                        {selectedCollection.orderNumber || selectedCollection.requestId}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">Type:</span>
                      <div>{getTypeBadge(selectedCollection.type)}</div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">From:</span>
                      <span className="text-sm break-words text-right sm:text-left">{selectedCollection.from}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">To:</span>
                      <span className="text-sm break-words text-right sm:text-left">{selectedCollection.to}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">Description:</span>
                      <span className="text-sm break-words text-right sm:text-left">{selectedCollection.description}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <span className="text-sm font-medium">Weight:</span>
                      <span className="text-sm">{selectedCollection.weight} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Collection Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="collectionDate">Collection Date *</Label>
                    <Input
                      id="collectionDate"
                      type="date"
                      value={collectionForm.collectionDate}
                      onChange={(e) =>
                        setCollectionForm({ ...collectionForm, collectionDate: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collectionTime">Collection Time *</Label>
                    <Input
                      id="collectionTime"
                      type="time"
                      value={collectionForm.collectionTime}
                      onChange={(e) =>
                        setCollectionForm({ ...collectionForm, collectionTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectedBy">Collected By *</Label>
                  <Input
                    id="collectedBy"
                    placeholder="Enter your name or driver name"
                    value={collectionForm.collectedBy}
                    onChange={(e) =>
                      setCollectionForm({ ...collectionForm, collectedBy: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="collectionNotes">Collection Notes (Optional)</Label>
                  <Textarea
                    id="collectionNotes"
                    placeholder="Add any notes about the collection (e.g., condition of items, quantity verified, etc.)"
                    value={collectionForm.collectionNotes}
                    onChange={(e) =>
                      setCollectionForm({ ...collectionForm, collectionNotes: e.target.value })
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <IconPackage className="h-4 w-4 inline mr-2" />
                    <strong>Note:</strong> Once marked as collected, you can proceed with the delivery.
                    Make sure all items are verified before marking as collected.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 border-t border-border flex-shrink-0">
            <Button variant="outline" onClick={() => setCollectionDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmitCollection} disabled={!collectionForm.collectedBy} className="w-full sm:w-auto">
              <IconCheck className="mr-2 h-4 w-4" />
              Mark as Collected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
