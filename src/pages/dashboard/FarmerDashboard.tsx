import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCurrency,
  IconPackage,
  IconTrendingUp,
  IconPlus,
  IconArrowRight,
  IconTrophy,
  IconChartBar,
} from "@tabler/icons-react";

interface FarmerStats {
  totalRevenue: number;
  orderCount: number;
  activeListings: number;
  pendingOrders: number;
  completedOrders: number;
  avgOrderValue: number;
  peerRank: number;
  totalFarmers: number;
}

interface RecentOrder {
  id: string;
  buyerName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  variety: string;
  qualityGrade: string;
}

export function FarmerDashboard() {
  const [stats, setStats] = useState<FarmerStats>({
    totalRevenue: 0,
    orderCount: 0,
    activeListings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    avgOrderValue: 0,
    peerRank: 0,
    totalFarmers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // Simulating data fetch
    setTimeout(() => {
      setStats({
        totalRevenue: 125000,
        orderCount: 24,
        activeListings: 8,
        pendingOrders: 3,
        completedOrders: 18,
        avgOrderValue: 5208,
        peerRank: 12,
        totalFarmers: 150,
      });
      setRecentOrders([
        {
          id: "ORD-001",
          buyerName: "John Mwangi",
          quantity: 500,
          totalAmount: 75000,
          status: "pending",
          createdAt: new Date().toISOString(),
          variety: "Kenya",
          qualityGrade: "A",
        },
        {
          id: "ORD-002",
          buyerName: "Mary Wanjiku",
          quantity: 300,
          totalAmount: 45000,
          status: "accepted",
          createdAt: new Date().toISOString(),
          variety: "SPK004",
          qualityGrade: "A",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "in_transit":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Farmer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Welcome back! Here's your OFSP farming overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/produce/new">
            <Button size="sm">
              <IconPlus className="mr-2 h-4 w-4" />
              Post Produce
            </Button>
          </Link>
          <Link to="/dashboard/leaderboard">
            <Button size="sm" variant="outline">
              <IconTrophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`KES ${stats.totalRevenue.toLocaleString()}`}
          description="All-time earnings"
          icon={<IconCurrency className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats.orderCount.toString()}
          description={`${stats.completedOrders} completed, ${stats.pendingOrders} pending`}
          icon={<IconPackage className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Listings"
          value={stats.activeListings.toString()}
          description="Produce currently listed"
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Peer Ranking"
          value={`#${stats.peerRank}`}
          description={`Out of ${stats.totalFarmers} farmers`}
          icon={<IconTrophy className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              {stats.pendingOrders > 0
                ? `You have ${stats.pendingOrders} pending orders requiring attention.`
                : "No pending orders."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-3 rounded-lg">
                        <IconPackage className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.buyerName} • {order.quantity} kg • {order.variety} (Grade {order.qualityGrade})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">KES {order.totalAmount.toLocaleString()}</p>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <Link to={`/dashboard/orders/${order.id}`}>
                        <Button size="sm" variant="outline">
                          <IconArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by posting your produce to receive orders
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/orders" className="w-full">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Quick Actions & Market Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard/produce" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconPackage className="mr-2 h-4 w-4" />
                  Manage Produce
                </Button>
              </Link>
              <Link to="/dashboard/orders" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrendingUp className="mr-2 h-4 w-4" />
                  View Orders
                </Button>
              </Link>
              <Link to="/dashboard/leaderboard" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrophy className="mr-2 h-4 w-4" />
                  Peer Leaderboard
                </Button>
              </Link>
              <Link to="/dashboard/market-info" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconChartBar className="mr-2 h-4 w-4" />
                  Market Prices
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Current OFSP prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Grade A (Kenya)</span>
                  <span className="font-semibold">KES 150/kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Grade B (SPK004)</span>
                  <span className="font-semibold">KES 120/kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Grade C (Kabode)</span>
                  <span className="font-semibold">KES 100/kg</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link to="/dashboard/market-info" className="w-full">
                <Button variant="outline" className="w-full">View Full Market Info</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Your farming performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Order Value</p>
              <p className="text-2xl font-bold">KES {stats.avgOrderValue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">
                {stats.orderCount > 0
                  ? Math.round((stats.completedOrders / stats.orderCount) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.completedOrders} of {stats.orderCount} orders
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Listings</p>
              <p className="text-2xl font-bold">{stats.activeListings}</p>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ label, value, description, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-40 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10">{icon}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
