import { useEffect, useMemo } from "react";
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
  IconRefresh,
} from "@tabler/icons-react";
import {
  StatCard,
  CircularProgress,
  ProgressBar,
  SimpleBarChart,
  StarRating,
} from "@/components/visualizations";
import { AgronomicPracticesGuide } from "@/components/farmer/AgronomicPracticesGuide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconBook } from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const { 
    orders, 
    listings,
    fetchOrders,
    fetchListings,
    isLoading: marketplaceLoading 
  } = useMarketplace();
  
  const { 
    selectedRatingSummary,
    fetchRatingSummary,
    isLoading: profileLoading 
  } = useProfile();
  
  const { 
    leaderboards,
    trends,
    farmerAnalytics,
    marketInfo,
    fetchLeaderboard,
    fetchTrends,
    fetchFarmerAnalytics,
    fetchMarketInfo,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useAnalytics();

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchOrders({ farmerId: user.id });
      fetchListings({ farmerId: user.id });
      fetchRatingSummary(user.id);
      fetchLeaderboard("revenue", "monthly");
      fetchTrends({ timeRange: "month" });
      fetchFarmerAnalytics({ timeRange: "month" });
      fetchMarketInfo({ timeRange: "month" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const isLoading = marketplaceLoading || profileLoading || analyticsLoading;

  // Filter farmer's orders and listings
  const farmerOrders = useMemo(() => {
    return orders.filter(order => order.farmerId === user?.id || order.sellerId === user?.id);
  }, [orders, user?.id]);

  const farmerListings = useMemo(() => {
    return listings.filter(listing => listing.farmerId === user?.id);
  }, [listings, user?.id]);

  // Calculate stats from context data and analytics
  const stats = useMemo<FarmerStats>(() => {
    const completedOrders = farmerOrders.filter(o => o.status === "completed" || o.status === "delivered");
    const pendingOrders = farmerOrders.filter(o => o.status === "order_placed" || o.status === "order_accepted" || o.status === "in_transit");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalQuantity = completedOrders.reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Calculate earnings from trends data (most accurate) or fallback to orders
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    // Get current month revenue from trends
    const currentMonthTrends = trends.filter(t => {
      try {
        const trendDate = new Date(t.date);
        return trendDate.getMonth() === thisMonth && trendDate.getFullYear() === thisYear;
      } catch {
        return false;
      }
    });
    const earningsThisMonth = currentMonthTrends.length > 0
      ? currentMonthTrends.reduce((sum, t) => sum + (t.revenue || 0), 0)
      : completedOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Get last month revenue from trends
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthTrends = trends.filter(t => {
      try {
        const trendDate = new Date(t.date);
        return trendDate.getMonth() === lastMonth && trendDate.getFullYear() === lastMonthYear;
      } catch {
        return false;
      }
    });
    const earningsLastMonth = lastMonthTrends.length > 0
      ? lastMonthTrends.reduce((sum, t) => sum + (t.revenue || 0), 0)
      : completedOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Quantity delivered from analytics or calculated
    const quantityDelivered = farmerAnalytics?.quantityDelivered ?? completedOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + (o.totalQuantity || 0), 0);

    const quantityLastMonth = farmerAnalytics?.quantityDeliveredPrevious ?? (() => {
      const now = new Date();
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return completedOrders
        .filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, o) => sum + (o.totalQuantity || 0), 0);
    })();

    // Quality score from analytics (preferred) or rating summary
    const qualityScore = farmerAnalytics?.qualityScore !== undefined
      ? farmerAnalytics.qualityScore
      : selectedRatingSummary?.averageRating 
        ? selectedRatingSummary.averageRating * 20 // Convert 5-star to percentage
        : 0;

    // Ranking percentile from analytics (preferred) or calculated from leaderboard
    const rankingPercentile = farmerAnalytics?.peerRanking?.percentile !== undefined
      ? Math.round(farmerAnalytics.peerRanking.percentile)
      : (() => {
          const leaderboard = leaderboards.find(l => l.metric === "revenue");
          const farmerEntry = leaderboard?.entries.find(e => e.userId === user?.id);
          const peerRank = farmerEntry?.rank || 0;
          const totalFarmers = leaderboard?.entries.length || farmerAnalytics?.peerRanking?.totalFarmers || 0;
          // Percentile = (totalFarmers - rank) / totalFarmers * 100
          return totalFarmers > 0 ? Math.round(((totalFarmers - peerRank) / totalFarmers) * 100) : 0;
        })();

    const peerRank = farmerAnalytics?.peerRanking?.rank || (() => {
      const leaderboard = leaderboards.find(l => l.metric === "revenue");
      const farmerEntry = leaderboard?.entries.find(e => e.userId === user?.id);
      return farmerEntry?.rank || 0;
    })();

    const totalFarmers = farmerAnalytics?.peerRanking?.totalFarmers || (() => {
      const leaderboard = leaderboards.find(l => l.metric === "revenue");
      return leaderboard?.entries.length || 0;
    })();

    // Completion rate from analytics if available
    const completionRate = farmerAnalytics?.completionRate !== undefined
      ? farmerAnalytics.completionRate
      : (farmerOrders.length > 0 ? (completedOrders.length / farmerOrders.length) * 100 : 0);

    return {
      totalRevenue,
      orderCount: farmerOrders.length,
      activeListings: farmerListings.filter(l => l.status === "active").length,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      avgOrderValue: Math.round(avgOrderValue),
      peerRank,
      totalFarmers,
      earningsThisMonth: Math.round(earningsThisMonth),
      earningsLastMonth: Math.round(earningsLastMonth),
      quantityDelivered: Math.round(quantityDelivered),
      quantityLastMonth: Math.round(quantityLastMonth),
      qualityScore: Math.round(qualityScore),
      rankingPercentile,
    };
  }, [farmerOrders, farmerListings, selectedRatingSummary, leaderboards, user?.id, farmerAnalytics]);

  // Recent orders
  const recentOrders = useMemo<RecentOrder[]>(() => {
    return farmerOrders
      .slice(-5)
      .reverse()
      .map(order => ({
        id: order.id,
        buyerName: order.buyerName || "Unknown",
        quantity: order.totalQuantity || 0,
        totalAmount: order.totalAmount || 0,
        status: order.status,
        createdAt: order.createdAt,
        variety: order.items?.[0]?.variety || "Unknown",
        qualityGrade: order.items?.[0]?.grade || "N/A",
      }));
  }, [farmerOrders]);

  // Monthly earnings from trends
  const monthlyEarnings = useMemo<MonthlyEarnings[]>(() => {
    if (trends.length === 0) return [];
    return trends.slice(-6).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      amount: t.revenue || 0,
    }));
  }, [trends]);

  // Quality history from rating summary or trends
  const qualityHistory = useMemo<QualityHistory[]>(() => {
    if (trends.length === 0) return [];
    return trends.slice(-3).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      rating: t.qualityScore ? t.qualityScore / 20 : 0, // Convert percentage to 5-star
    }));
  }, [trends]);

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (user?.id) {
                fetchOrders({ farmerId: user.id });
                fetchListings({ farmerId: user.id });
                fetchRatingSummary(user.id);
                fetchLeaderboard("revenue", "monthly");
                fetchTrends({ timeRange: "month" });
                fetchFarmerAnalytics({ timeRange: "month" });
                fetchMarketInfo({ timeRange: "month" });
              }
            }}
            disabled={isLoading}
          >
            <IconRefresh className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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

      {/* Error State */}
      {analyticsError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">{analyticsError}</p>
          </CardContent>
        </Card>
      )}

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
              <Dialog>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="w-full justify-start">
                      <IconBook className="mr-2 h-4 w-4" />
                      Farming Guide
                    </Button>
                  }
                />
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Agronomic Practices Guide</DialogTitle>
                    <DialogDescription>
                      Learn recommended practices for growing high-quality OFSP
                    </DialogDescription>
                  </DialogHeader>
                  <AgronomicPracticesGuide />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Market Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Market Summary</CardTitle>
              <CardDescription>Current OFSP prices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : marketInfo?.prices && marketInfo.prices.length > 0 ? (
                <div className="space-y-3">
                  {marketInfo.prices.slice(0, 3).map((price: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">
                        {price.grade} {price.variety && `(${price.variety})`}
                        {price.location && ` - ${price.location}`}
                      </span>
                      <span className="font-semibold">
                        KES {Math.round(price.averagePrice || price.price || 0).toLocaleString()}/kg
                      </span>
                    </div>
                  ))}
                  {marketInfo.prices.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No market price data available
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No market price data available
                  </p>
                </div>
              )}
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
                {farmerAnalytics?.completionRate !== undefined
                  ? Math.round(farmerAnalytics.completionRate)
                  : stats.orderCount > 0
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
