import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTruck, IconMapPin, IconCurrency } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  StarRating,
} from "@/components/visualizations";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";

export default function TransportProviderDashboard() {
  const { user } = useAuth();
  const { 
    requests,
    activeDeliveries: transportActiveDeliveries,
    stats: transportStats,
    fetchRequests,
    fetchActiveDeliveries,
    fetchStats,
    isLoading: transportLoading 
  } = useTransport();

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
      fetchActiveDeliveries();
      fetchStats();
    }
  }, [user?.id, fetchRequests, fetchActiveDeliveries, fetchStats]);

  const isLoading = transportLoading;

  // Calculate stats from context data
  const stats = useMemo(() => {
    const pendingRequests = requests.filter(r => r.status === "pending");
    
    // Calculate delivery status counts
    const statusStr = (s: string) => s?.toLowerCase() ?? "";
    const rawStatus = (d: (typeof transportActiveDeliveries)[0]) => d.status as string;
    const inTransitCount = transportActiveDeliveries.filter(
      d => statusStr(d.status) === "in_transit" || rawStatus(d) === "IN_TRANSIT_PICKUP" || rawStatus(d) === "IN_TRANSIT_DELIVERY"
    ).length;
    const pickupCount = transportActiveDeliveries.filter(
      d => statusStr(d.status) === "accepted" || rawStatus(d) === "ACCEPTED" || (d as { collectionStatus?: string }).collectionStatus === "pending"
    ).length;

    return {
      activeDeliveries: transportActiveDeliveries.length,
      pendingRequests: pendingRequests.length,
      inTransitCount,
      pickupCount,
      rating: 4.8, // TODO: Get from profile/ratings
      reviews: 156, // TODO: Get from profile/ratings
    };
  }, [requests, transportActiveDeliveries]);


  // Active deliveries from context
  const activeDeliveries = useMemo(() => {
    return transportActiveDeliveries.slice(0, 3).map(delivery => ({
      id: delivery.id,
      type: delivery.type, // Keep original type for badge rendering
      from: delivery.pickupLocation || delivery.from || "Unknown",
      to: delivery.deliveryLocation || delivery.to || "Unknown",
      distance: `${delivery.distance || 0} km`,
      status: delivery.status === "in_transit" ? "in_transit" : 
              delivery.status === "delivered" ? "delivered" : "in_transit",
      eta: delivery.estimatedArrival || "N/A",
      amount: `KES ${(delivery.estimatedCost || 0).toLocaleString()}`,
    }));
  }, [transportActiveDeliveries]);

  // Pending requests from context
  const pendingRequests = useMemo(() => {
    return requests
      .filter(r => r.status === "pending")
      .slice(0, 2)
      .map(request => ({
        id: request.id,
        type: request.type, // Keep original type for badge rendering
        from: request.pickupLocation || request.from || "Unknown",
        to: request.deliveryLocation || request.to || "Unknown",
        distance: `${request.distance || 0} km`,
        scheduledTime: request.scheduledPickupTime ? 
          new Date(request.scheduledPickupTime).toLocaleString() : "N/A",
        amount: `KES ${(request.estimatedCost || 0).toLocaleString()}`,
        weight: `${request.weight || 0} kg`,
      }));
  }, [requests]);

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
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_transit":
        return "bg-info text-info-foreground";
      case "pickup":
        return "bg-warning text-warning-foreground";
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
        <h1 className="text-3xl font-bold text-foreground">Transport Provider Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage deliveries and track your transport requests
        </p>
      </div>

      {/* Rating Display */}
      <Card>
        <CardHeader>
          <CardTitle>My Rating</CardTitle>
          <CardDescription>Customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 bg-muted animate-pulse rounded" />
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <StarRating rating={stats.rating} maxRating={5} size="lg" showValue={true} />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {stats.reviews} reviews
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your transport business</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/dashboard/transport-requests">
            <Button>
              <IconTruck className="mr-2 h-4 w-4" />
              View Requests
            </Button>
          </Link>
          <Link to="/dashboard/deliveries">
            <Button variant="outline">
              <IconMapPin className="mr-2 h-4 w-4" />
              Track Deliveries
            </Button>
          </Link>
          <Link to="/dashboard/earnings">
            <Button variant="outline">
              <IconCurrency className="mr-2 h-4 w-4" />
              View Earnings
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Active Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>Currently in progress</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-32 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-center py-6">
                <p className="text-4xl font-bold">{stats.activeDeliveries}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>● {stats.inTransitCount} In Transit</span>
                  <span>◐ {stats.pickupCount} Pickup</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Deliveries</CardTitle>
            <CardDescription>Deliveries currently in progress</CardDescription>
          </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(delivery.type)}
                    <Badge className={getStatusColor(delivery.status)}>
                      {delivery.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>From: {delivery.from}</div>
                    <div>To: {delivery.to}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>📍 {delivery.distance}</span>
                    <span>⏱️ ETA: {delivery.eta}</span>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold">{delivery.amount}</div>
                </div>
                <Button size="sm" variant="outline">
                  Track
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/dashboard/deliveries">
              <Button variant="link" className="w-full">
                View All Active Deliveries →
              </Button>
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Transport Requests</CardTitle>
          <CardDescription>New requests awaiting your response</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(request.type)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>From: {request.from}</div>
                    <div>To: {request.to}</div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>📍 {request.distance}</span>
                    <span>⏰ {request.scheduledTime}</span>
                    <span>⚖️ {request.weight}</span>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold">{request.amount}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/dashboard/transport-requests">
              <Button variant="link" className="w-full">
                View All Requests →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

