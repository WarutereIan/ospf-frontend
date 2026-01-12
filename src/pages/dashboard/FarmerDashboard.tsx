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
import {
  StatCard,
  CircularProgress,
  ProgressBar,
  SimpleBarChart,
  StarRating,
} from "@/components/visualizations";

interface FarmerStats {
  totalRevenue: number;
  orderCount: number;
  activeListings: number;
  pendingOrders: number;
  completedOrders: number;
  avgOrderValue: number;
  peerRank: number;
  totalFarmers: number;
  earningsThisMonth: number;
  earningsLastMonth: number;
  quantityDelivered: number;
  quantityLastMonth: number;
  qualityScore: number;
  rankingPercentile: number;
}

interface MonthlyEarnings {
  month: string;
  amount: number;
}

interface QualityHistory {
  month: string;
  rating: number;
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
    earningsThisMonth: 0,
    earningsLastMonth: 0,
    quantityDelivered: 0,
    quantityLastMonth: 0,
    qualityScore: 0,
    rankingPercentile: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [qualityHistory, setQualityHistory] = useState<QualityHistory[]>([]);
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
        earningsThisMonth: 45000,
        earningsLastMonth: 40000,
        quantityDelivered: 850,
        quantityLastMonth: 780,
        qualityScore: 92,
        rankingPercentile: 15,
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
      // Last 6 months earnings data
      setMonthlyEarnings([
        { month: "Jul", amount: 28000 },
        { month: "Aug", amount: 32000 },
        { month: "Sep", amount: 35000 },
        { month: "Oct", amount: 38000 },
        { month: "Nov", amount: 40000 },
        { month: "Dec", amount: 45000 },
      ]);
      // Quality history (last 3 months)
      setQualityHistory([
        { month: "Oct", rating: 4.0 },
        { month: "Nov", rating: 5.0 },
        { month: "Dec", rating: 4.5 },
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

      {/* Stats Cards - Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Earnings This Month"
          value={`KES ${stats.earningsThisMonth.toLocaleString()}`}
          description="Monthly earnings"
          trend={{
            value: stats.earningsLastMonth > 0
              ? ((stats.earningsThisMonth - stats.earningsLastMonth) / stats.earningsLastMonth) * 100
              : 0,
            direction: stats.earningsThisMonth >= stats.earningsLastMonth ? "up" : "down",
          }}
          icon={<IconCurrency className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Quantity Delivered"
          value={`${stats.quantityDelivered} kg`}
          description="This month"
          trend={{
            value: stats.quantityLastMonth > 0
              ? ((stats.quantityDelivered - stats.quantityLastMonth) / stats.quantityLastMonth) * 100
              : 0,
            direction: stats.quantityDelivered >= stats.quantityLastMonth ? "up" : "down",
          }}
          icon={<IconPackage className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="flex flex-col items-center">
                <CircularProgress
                  value={stats.qualityScore}
                  maxValue={100}
                  text={`${stats.qualityScore}`}
                  size={100}
                  color={stats.qualityScore >= 90 ? "#22C55E" : stats.qualityScore >= 75 ? "#F59E0B" : "#EF4444"}
                />
                <p className="text-sm text-muted-foreground mt-2">Quality Score</p>
                <Badge variant="outline" className="mt-1">
                  Grade {stats.qualityScore >= 90 ? "A" : stats.qualityScore >= 75 ? "B" : "C"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-24 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ranking</p>
                <p className="text-2xl font-bold">Top {stats.rankingPercentile}%</p>
                <ProgressBar
                  value={100 - stats.rankingPercentile}
                  maxValue={100}
                  color="success"
                  size="md"
                />
                <p className="text-xs text-muted-foreground">Position in distribution</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={monthlyEarnings.map((e) => ({ name: e.month, value: e.amount }))}
          title="Earnings Trend (6 months)"
          description="Monthly earnings comparison"
          formatter={(value) => `KES ${value.toLocaleString()}`}
          color="#22C55E"
          height={250}
        />
        <Card>
          <CardHeader>
            <CardTitle>Quality History</CardTitle>
            <CardDescription>Monthly quality ratings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                {qualityHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.month}</span>
                    <StarRating rating={item.rating} maxRating={5} size="sm" showValue={false} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
