import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconShoppingBag,
  IconPackage,
  IconTrendingUp,
  IconStar,
  IconArrowRight,
  IconSearch,
} from "@tabler/icons-react";

interface BuyerStats {
  totalPurchases: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  ratedFarmers: number;
}

interface RecentOrder {
  id: string;
  farmerName: string;
  variety: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  canRate: boolean;
}

export function BuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats>({
    totalPurchases: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    ratedFarmers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        totalPurchases: 12,
        activeOrders: 2,
        completedOrders: 8,
        totalSpent: 450000,
        avgOrderValue: 37500,
        ratedFarmers: 6,
      });
      setRecentOrders([
        {
          id: "ORD-001",
          farmerName: "James Mutua",
          variety: "Kenya",
          quantity: 500,
          totalAmount: 75000,
          status: "in_transit",
          createdAt: new Date().toISOString(),
          canRate: false,
        },
        {
          id: "ORD-002",
          farmerName: "Mary Wanjiku",
          variety: "SPK004",
          quantity: 300,
          totalAmount: 36000,
          status: "delivered",
          createdAt: new Date().toISOString(),
          canRate: true,
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
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Buyer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your OFSP purchases and track orders
          </p>
        </div>
        <Link to="/marketplace">
          <Button size="sm">
            <IconSearch className="mr-2 h-4 w-4" />
            Browse Produce
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Purchases"
          value={stats.totalPurchases.toString()}
          description={`${stats.completedOrders} completed`}
          icon={<IconShoppingBag className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Orders"
          value={stats.activeOrders.toString()}
          description="In progress"
          icon={<IconPackage className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Spent"
          value={`KES ${stats.totalSpent.toLocaleString()}`}
          description="All-time purchases"
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Rated Farmers"
          value={stats.ratedFarmers.toString()}
          description="Farmers reviewed"
          icon={<IconStar className="h-5 w-5 text-primary" />}
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
              {stats.activeOrders > 0
                ? `You have ${stats.activeOrders} active orders.`
                : "No active orders."}
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
                          {order.farmerName} • {order.quantity} kg • {order.variety}
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
                      <div className="flex gap-2">
                        <Link to={`/dashboard/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            <IconArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                        {order.canRate && (
                          <Button size="sm" variant="outline">
                            <IconStar className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by browsing the marketplace
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link to="/dashboard/buyer/orders" className="w-full">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/marketplace" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconSearch className="mr-2 h-4 w-4" />
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/dashboard/buyer/orders" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconPackage className="mr-2 h-4 w-4" />
                  My Orders
                </Button>
              </Link>
              <Link to="/dashboard/buyer/ratings" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconStar className="mr-2 h-4 w-4" />
                  Rate Farmers
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Purchase Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Orders</span>
                  <span className="font-semibold">{stats.totalPurchases}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Spent</span>
                  <span className="font-semibold">KES {stats.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Order Value</span>
                  <span className="font-semibold">KES {stats.avgOrderValue.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
