import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IconTruck, IconMapPin, IconClock, IconWeight, IconCurrency } from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import type { TransportRequest } from "@/types/transport";

export default function TransportRequests() {
  const { requests, fetchRequests, acceptRequest, rejectRequest, isLoading } = useTransport();
  const { user } = useAuth();
  
  const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Fetch requests on mount
  // For "pending" status, show all unassigned requests (no providerId filter)
  // For other statuses, show requests assigned to this provider
  useEffect(() => {
    if (user?.id) {
      const filters: any = {
        status: filterStatus !== "all" ? filterStatus as any : undefined,
      };
      
      // Only filter by providerId if not viewing pending requests
      // Pending requests should show all unassigned requests (providerId is null)
      if (filterStatus !== "all" && filterStatus !== "pending") {
        filters.providerId = user.id;
      }
      // For pending requests, we want to see all requests without a providerId
      // The backend should handle this - we'll pass status=PENDING and no providerId
      
      fetchRequests(filters);
    }
  }, [user?.id, filterStatus, fetchRequests]);

  const filteredRequests = requests.filter(
    (req) => filterStatus === "all" || req.status === filterStatus
  );

  const handleViewDetails = (request: TransportRequest) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      if (!user?.id) {
        alert("User ID not found. Please log in again.");
        return;
      }
      await acceptRequest(id, user.id);
      setDetailsDialogOpen(false);
      alert("Request accepted! Please mark the collection in the Collection page before starting delivery.");
      // Refresh requests
      await fetchRequests({ providerId: user.id });
    } catch (error) {
      console.error("Failed to accept request:", error);
      alert("Failed to accept request. Please try again.");
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await rejectRequest(id);
      setDetailsDialogOpen(false);
      // Refresh requests
      if (user?.id) {
        await fetchRequests({ providerId: user.id });
      }
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request. Please try again.");
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transport Requests</h1>
        <p className="text-muted-foreground mt-1">
          View and manage transport requests from farmers, centres, and input providers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="status-filter">Filter by Status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Requests</CardTitle>
          <CardDescription>Transport requests awaiting your response</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{getTypeBadge(request.type)}</TableCell>
                  <TableCell>
                    {request.requesterName ||
                     (typeof request.requester === "string"
                       ? request.requester
                       : (request.requester as { profile?: { name?: string }; email?: string } | undefined)?.profile?.name ||
                         (request.requester as { profile?: { name?: string }; email?: string } | undefined)?.email ||
                         "Unknown")}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm truncate max-w-[200px]" title={request.to}>
                      {request.to}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{request.description}</div>
                      <div className="text-muted-foreground">⚖️ {request.weight} kg</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(request)}
                      >
                        View
                      </Button>
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transport Request Details</DialogTitle>
            <DialogDescription>Review the complete request information</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Request Type</Label>
                  {getTypeBadge(selectedRequest.type)}
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Status</Label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Requested By</Label>
                <div className="font-medium">
                  {selectedRequest.requesterName ||
                   (typeof selectedRequest.requester === "string"
                     ? selectedRequest.requester
                     : (selectedRequest.requester as { profile?: { name?: string }; email?: string } | undefined)?.profile?.name ||
                       (selectedRequest.requester as { profile?: { name?: string }; email?: string } | undefined)?.email ||
                       "Unknown")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <IconMapPin className="h-4 w-4" />
                    Pickup Location
                  </Label>
                  <div className="font-medium">{selectedRequest.from}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <IconMapPin className="h-4 w-4" />
                    Delivery Location
                  </Label>
                  <div className="font-medium">{selectedRequest.to}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <IconWeight className="h-4 w-4" />
                    Weight
                  </Label>
                  <div className="font-medium">{selectedRequest.weight} kg</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <IconClock className="h-4 w-4" />
                  Scheduled Time
                </Label>
                <div className="font-medium">
                  {new Date(selectedRequest.scheduledTime).toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <div className="p-3 border rounded-lg bg-accent/50">
                  {selectedRequest.description}
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleAcceptRequest(selectedRequest.id)}
                    className="flex-1"
                  >
                    <IconTruck className="mr-2 h-4 w-4" />
                    Accept Request
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

