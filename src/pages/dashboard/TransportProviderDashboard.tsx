import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconTruck, IconMapPin, IconClock, IconCurrency, IconChecklist, IconTrendingUp } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function TransportProviderDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    activeDeliveries: 5,
    pendingRequests: 12,
    completedToday: 8,
    totalEarnings: "KES 48,500",
    weeklyEarnings: "KES 185,000",
    rating: 4.8,
  };

  const activeDeliveries = [
    {
      id: "1",
      type: "Produce Delivery",
      from: "John Kamau (Farmer)",
      to: "Kangundo Aggregation Centre",
      distance: "12 km",
      status: "in_transit",
      eta: "25 min",
      amount: "KES 800",
    },
    {
      id: "2",
      type: "Input Delivery",
      from: "AgriInputs Co.",
      to: "Mary Wanjiku (Farmer)",
      distance: "8 km",
      status: "pickup",
      eta: "10 min",
      amount: "KES 500",
    },
    {
      id: "3",
      type: "Market Delivery",
      from: "Yatta Aggregation Centre",
      to: "Nairobi Wholesale Market",
      distance: "45 km",
      status: "in_transit",
      eta: "1 hr 15 min",
      amount: "KES 3,500",
    },
  ];

  const pendingRequests = [
    {
      id: "1",
      type: "Produce Pickup",
      from: "Peter Mwangi",
      to: "Kathiani Centre",
      distance: "15 km",
      scheduledTime: "Today, 2:00 PM",
      amount: "KES 1,000",
      weight: "250 kg",
    },
    {
      id: "2",
      type: "Input Delivery",
      from: "FarmSupplies Ltd",
      to: "Grace Njeri",
      distance: "6 km",
      scheduledTime: "Today, 3:30 PM",
      amount: "KES 450",
      weight: "30 kg",
    },
  ];

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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <IconTruck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting acceptance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <IconChecklist className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-success">+3 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <IconCurrency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">From {stats.completedToday} deliveries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyEarnings}</div>
            <p className="text-xs text-success">+22% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rating} ⭐</div>
            <p className="text-xs text-muted-foreground">Based on 156 reviews</p>
          </CardContent>
        </Card>
      </div>

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

