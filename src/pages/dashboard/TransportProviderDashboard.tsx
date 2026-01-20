import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTruck, IconMapPin, IconClock, IconCurrency, IconChecklist, IconTrendingUp } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  StatCard,
  SimpleBarChart,
  StarRating,
} from "@/components/visualizations";
import { useTransport } from "@/contexts/TransportContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
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
  
  const { 
    trends,
    fetchTrends,
    isLoading: analyticsLoading 
  } = useAnalytics();

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
      fetchActiveDeliveries();
      fetchStats();
      fetchTrends({ timeRange: "week" });
    }
  }, [user?.id, fetchRequests, fetchActiveDeliveries, fetchStats, fetchTrends]);

  const isLoading = transportLoading || analyticsLoading;

  // Calculate stats from context data
  const stats = useMemo(() => {
    const pendingRequests = requests.filter(r => r.status === "pending");
    const today = new Date().toISOString().split("T")[0];
    const completedToday = requests.filter(r => 
      (r.status === "delivered" || r.status === "completed") && 
      r.createdAt.startsWith(today)
    ).length;

    // Calculate earnings from completed requests
    const completedRequests = requests.filter(r => r.status === "delivered" || r.status === "completed");
    const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
    
    // Weekly earnings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEarnings = completedRequests
      .filter(r => new Date(r.createdAt) >= weekAgo)
      .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

    return {
      activeDeliveries: transportActiveDeliveries.length,
      pendingRequests: pendingRequests.length,
      completedToday,
      totalEarnings: Math.round(totalEarnings),
      weeklyEarnings: Math.round(weeklyEarnings),
      rating: 4.8, // TODO: Get from profile/ratings
      reviews: 156, // TODO: Get from profile/ratings
    };
  }, [requests, transportActiveDeliveries]);

  // Weekly earnings from trends
  const weeklyEarnings = useMemo(() => {
    if (trends.length === 0) return [];
    return trends.slice(-5).map(t => ({
      day: new Date(t.date).toLocaleDateString("en-US", { weekday: "short" }),
      amount: t.revenue || 0,
    }));
  }, [trends]);

  // Active deliveries from context
  const activeDeliveries = useMemo(() => {
    return transportActiveDeliveries.slice(0, 3).map(delivery => ({
      id: delivery.id,
      type: delivery.type === "produce_delivery" ? "Produce Delivery" : 
            delivery.type === "input_delivery" ? "Input Delivery" : "Produce Pickup",
      from: delivery.pickupLocation || "Unknown",
      to: delivery.deliveryLocation || "Unknown",
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
        type: request.type === "produce_pickup" ? "Produce Pickup" : 
              request.type === "input_delivery" ? "Input Delivery" : "Produce Delivery",
        from: request.pickupLocation || "Unknown",
        to: request.deliveryLocation || "Unknown",
        distance: `${request.distance || 0} km`,
        scheduledTime: request.scheduledPickupTime ? 
          new Date(request.scheduledPickupTime).toLocaleString() : "N/A",
        amount: `KES ${(request.estimatedCost || 0).toLocaleString()}`,
        weight: `${request.weight || 0} kg`,
      }));
  }, [requests]);

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
          Manage deliveries and track your earnings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Earnings</CardTitle>
            <CardDescription>Earnings from today's deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-32 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-center py-6">
                <p className="text-4xl font-bold">KES {stats.totalEarnings.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-2">from {stats.completedToday} trips</p>
              </div>
            )}
          </CardContent>
        </Card>
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
                  <span>● 2 In Transit</span>
                  <span>◐ 3 Pickup</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Earnings Chart */}
      <SimpleBarChart
        data={weeklyEarnings.map((w) => ({ name: w.day, value: w.amount }))}
        title="Earnings This Week"
        description="Daily earnings breakdown"
        formatter={(value) => `KES ${value.toLocaleString()}`}
        color="#22C55E"
        height={300}
      />

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
                    <div className="font-medium">{delivery.type}</div>
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
                  <div className="font-medium">{request.type}</div>
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

