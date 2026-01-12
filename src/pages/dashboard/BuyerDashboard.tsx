import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconShoppingBag,
  IconPackage,
  IconTrendingUp,
  IconStar,
  IconArrowRight,
  IconSearch,
} from "@tabler/icons-react";
import {
  StatCard,
  PieChart,
  HorizontalBarChart,
  AreaChart,
} from "@/components/visualizations";

interface BuyerStats {
  totalPurchases: number;
  activeOrders: number;
  completedOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  ratedFarmers: number;
  spendThisMonth: number;
  spendLastMonth: number;
  quantityReceived: number;
  quantityLastMonth: number;
  suppliers: number;
  newSuppliers: number;
}

interface SpendByVariety {
  name: string;
  value: number;
}

interface OrderStatusData {
  name: string;
  value: number;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

interface RecentOrder {
  id: string;
  farmerName: string;
  variety: string;
  quantity: number;
  qualityGrade?: string;
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
    spendThisMonth: 0,
    spendLastMonth: 0,
    quantityReceived: 0,
    quantityLastMonth: 0,
    suppliers: 0,
    newSuppliers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [spendByVariety, setSpendByVariety] = useState<SpendByVariety[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
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
        spendThisMonth: 450000,
        spendLastMonth: 380000,
        quantityReceived: 3500,
        quantityLastMonth: 2800,
        suppliers: 15,
        newSuppliers: 2,
      });
      setRecentOrders([
        {
          id: "ORD-045",
          farmerName: "James Mutua",
          variety: "Kenya",
          quantity: 500,
          qualityGrade: "A",
          totalAmount: 75000,
          status: "delivered",
          createdAt: new Date().toISOString(),
          canRate: true,
        },
        {
          id: "ORD-044",
          farmerName: "Mary W.",
          variety: "SPK004",
          quantity: 200,
          qualityGrade: "",
          totalAmount: 24000,
          status: "in_transit",
          createdAt: new Date().toISOString(),
          canRate: false,
        },
      ]);
      // Spend by variety data
      setSpendByVariety([
        { name: "Kenya", value: 247500 },
        { name: "SPK004", value: 135000 },
        { name: "Kabode", value: 67500 },
      ]);
      // Order status data
      setOrderStatus([
        { name: "Completed", value: 38 },
        { name: "In Transit", value: 3 },
        { name: "Processing", value: 2 },
        { name: "Pending", value: 1 },
      ]);
      // Monthly spending (12 months)
      setMonthlySpending([
        { month: "Jan", amount: 320000 },
        { month: "Feb", amount: 350000 },
        { month: "Mar", amount: 380000 },
        { month: "Apr", amount: 400000 },
        { month: "May", amount: 420000 },
        { month: "Jun", amount: 410000 },
        { month: "Jul", amount: 430000 },
        { month: "Aug", amount: 440000 },
        { month: "Sep", amount: 420000 },
        { month: "Oct", amount: 400000 },
        { month: "Nov", amount: 380000 },
        { month: "Dec", amount: 450000 },
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
          label="Spend This Month"
          value={`KES ${(stats.spendThisMonth / 1000).toFixed(0)}K`}
          description="Monthly spending"
          trend={{
            value: stats.spendLastMonth > 0
              ? ((stats.spendThisMonth - stats.spendLastMonth) / stats.spendLastMonth) * 100
              : 0,
            direction: stats.spendThisMonth >= stats.spendLastMonth ? "up" : "down",
          }}
          icon={<IconShoppingBag className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Orders Active"
          value={stats.activeOrders.toString()}
          description="3 pending"
          icon={<IconPackage className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Quantity Received"
          value={`${stats.quantityReceived.toLocaleString()} kg`}
          description="This month"
          trend={{
            value: stats.quantityLastMonth > 0
              ? ((stats.quantityReceived - stats.quantityLastMonth) / stats.quantityLastMonth) * 100
              : 0,
            direction: stats.quantityReceived >= stats.quantityLastMonth ? "up" : "down",
          }}
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Suppliers"
          value={stats.suppliers.toString()}
          description={`+${stats.newSuppliers} new`}
          icon={<IconStar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          data={spendByVariety}
          title="Spend by Variety"
          description="Breakdown of spending by OFSP variety"
          formatter={(value) => `KES ${value.toLocaleString()}`}
          height={300}
          innerRadius={60}
          showLegend={true}
        />
        <HorizontalBarChart
          data={orderStatus}
          title="Order Status"
          description="Distribution of orders by status"
          color="#3B82F6"
          height={300}
        />
      </div>

      {/* Spending Trend */}
      <AreaChart
        data={monthlySpending.map((m) => ({ name: m.month, amount: m.amount }))}
        areas={[
          {
            dataKey: "amount",
            name: "Spending",
            color: "#3B82F6",
            gradient: true,
          },
        ]}
        title="Spending Trend (12 months)"
        description="Monthly spending over time"
        formatter={(value) => `KES ${value.toLocaleString()}`}
        height={300}
      />

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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const statusIcon =
                        order.status === "delivered" || order.status === "completed"
                          ? "●"
                          : order.status === "in_transit"
                          ? "◐"
                          : "○";
                      const statusLabel =
                        order.status === "delivered" || order.status === "completed"
                          ? "Delivered"
                          : order.status === "in_transit"
                          ? "In Transit"
                          : order.status.replace(/_/g, " ");

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.farmerName}</TableCell>
                          <TableCell>
                            {order.quantity} kg {order.variety} {order.qualityGrade || ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {statusIcon} {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
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

