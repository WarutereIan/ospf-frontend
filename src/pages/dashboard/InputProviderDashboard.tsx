import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconSeeding, IconShoppingCart, IconPackage, IconTrendingUp, IconUsers, IconCurrency } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import {
  StatCard,
  HorizontalBarChart,
  SimpleBarChart,
  AlertCard,
} from "@/components/visualizations";
import { useInput } from "@/contexts/InputContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function InputProviderDashboard() {
  const { user } = useAuth();
  const { 
    inputs, 
    inputOrders,
    customers,
    fetchInputs, 
    fetchInputOrders,
    fetchCustomers,
    isLoading: inputLoading 
  } = useInput();
  
  const { 
    trends,
    inputProviderAnalytics,
    fetchTrends,
    fetchInputProviderAnalytics,
    isLoading: analyticsLoading 
  } = useAnalytics();

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      fetchInputs();
      fetchInputOrders();
      fetchCustomers();
      fetchTrends({ timeRange: "month" });
      fetchInputProviderAnalytics({ timeRange: "month" });
    }
  }, [user?.id, fetchInputs, fetchInputOrders, fetchCustomers, fetchTrends, fetchInputProviderAnalytics]);

  const isLoading = inputLoading || analyticsLoading;

  // Calculate stats from context data
  const stats = useMemo(() => {
    const activeOrders = inputOrders.filter(o => 
      o.status === "pending" || o.status === "processing" || o.status === "accepted"
    );
    const completedOrders = inputOrders.filter(o => o.status === "completed" || o.status === "delivered");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    // Current month revenue
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const revenueThisMonth = completedOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Last month revenue
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const revenueLastMonth = completedOrders
      .filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // New customers this month
    const newCustomers = customers.filter(c => {
      if (!c.createdAt) return false;
      const customerDate = new Date(c.createdAt);
      return customerDate.getMonth() === thisMonth && customerDate.getFullYear() === thisYear;
    }).length;

    // Low stock products
    const lowStock = inputs.filter(p => (p.stock || 0) < (p.minimumStock || 0)).length;

    return {
      totalInputs: inputs.length,
      activeOrders: activeOrders.length,
      totalRevenue: revenueThisMonth,
      revenueLastMonth,
      customers: customers.length,
      newCustomers,
      pendingOrders: inputOrders.filter(o => o.status === "pending").length,
      lowStock,
    };
  }, [inputs, inputOrders, customers]);

  // Sales by category from products
  const salesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    inputs.forEach(product => {
      const category = product.category || "Other";
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + 1);
    });
    
    const total = inputs.length;
    if (total === 0) return [];
    
    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [inputs]);

  // Monthly sales from trends
  const monthlySales = useMemo(() => {
    if (trends.length === 0) return [];
    return trends.slice(-6).map(t => ({
      month: new Date(t.date).toLocaleDateString("en-US", { month: "short" }),
      amount: t.revenue || 0,
    }));
  }, [trends]);

  // Inventory status
  const inventoryStatus = useMemo(() => {
    const inStock = inputs.filter(p => (p.stock || 0) >= (p.minimumStock || 0)).length;
    const lowStock = inputs.filter(p => {
      const stock = p.stock || 0;
      const min = p.minimumStock || 0;
      return stock > 0 && stock < min;
    }).length;
    const outOfStock = inputs.filter(p => (p.stock || 0) === 0).length;

    return { inStock, lowStock, outOfStock };
  }, [inputs]);

  // Recent orders from context
  const recentOrders = useMemo(() => {
    return inputOrders
      .slice(-3)
      .reverse()
      .map(order => ({
        id: order.id,
        farmer: order.customerName || "Unknown",
        input: order.items?.[0]?.productName || "Unknown",
        quantity: `${order.items?.[0]?.quantity || 0} ${order.items?.[0]?.unit || ""}`,
        amount: `KES ${(order.totalAmount || 0).toLocaleString()}`,
        status: order.status,
      }));
  }, [inputOrders]);

  // Low stock inputs from products
  const lowStockInputs = useMemo(() => {
    return inputs
      .filter(p => {
        const stock = p.stock || 0;
        const min = p.minimumStock || 0;
        return stock < min;
      })
      .slice(0, 3)
      .map(p => ({
        name: p.name,
        current: p.stock || 0,
        minimum: p.minimumStock || 0,
        unit: p.unit || "units",
      }));
  }, [inputs]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Input Provider Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your agricultural inputs and track sales
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Revenue This Month"
          value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}K`}
          description="Monthly revenue"
          trend={{
            value: stats.revenueLastMonth > 0
              ? ((stats.totalRevenue - stats.revenueLastMonth) / stats.revenueLastMonth) * 100
              : 0,
            direction: "up",
          }}
          icon={<IconCurrency className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Orders Active"
          value={stats.activeOrders.toString()}
          description={`${stats.pendingOrders} pending`}
          icon={<IconShoppingCart className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Products Listed"
          value={stats.totalInputs.toString()}
          description={`${stats.lowStock} low stock`}
          icon={<IconSeeding className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Customers"
          value={stats.customers.toString()}
          description={`+${stats.newCustomers} new`}
          icon={<IconUsers className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorizontalBarChart
          data={salesByCategory}
          title="Sales by Category"
          description="Revenue breakdown by product category"
          color="#3B82F6"
          height={300}
        />
        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-48 bg-muted animate-pulse rounded" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">In Stock</span>
                  </div>
                  <span className="text-lg font-bold">{inventoryStatus.inStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Low Stock</span>
                  </div>
                  <span className="text-lg font-bold">{inventoryStatus.lowStock}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                  <span className="text-lg font-bold">{inventoryStatus.outOfStock}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend */}
      <SimpleBarChart
        data={monthlySales.map((m) => ({ name: m.month, value: m.amount }))}
        title="Sales Trend (6 Months)"
        description="Monthly revenue over time"
        formatter={(value) => `KES ${value.toLocaleString()}`}
        color="#22C55E"
        height={300}
      />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your input business</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/dashboard/inputs">
            <Button>
              <IconSeeding className="mr-2 h-4 w-4" />
              Add New Input
            </Button>
          </Link>
          <Link to="/dashboard/input-orders">
            <Button variant="outline">
              <IconShoppingCart className="mr-2 h-4 w-4" />
              View Orders
            </Button>
          </Link>
          <Link to="/dashboard/input-inventory">
            <Button variant="outline">
              <IconPackage className="mr-2 h-4 w-4" />
              Manage Inventory
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{order.farmer}</div>
                  <div className="text-sm text-muted-foreground">
                    {order.input} - {order.quantity}
                  </div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold">{order.amount}</div>
                  <div
                    className={`text-xs font-medium ${
                      order.status === "completed"
                        ? "text-success"
                        : order.status === "processing"
                        ? "text-info"
                        : "text-warning"
                    }`}
                  >
                    {order.status}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/dashboard/input-orders">
              <Button variant="link" className="w-full">
                View All Orders →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <div className="space-y-3">
        {lowStockInputs.map((input, index) => (
          <AlertCard
            key={index}
            type={input.current === 0 ? "error" : "warning"}
            title={input.current === 0 ? `${input.name}: OUT OF STOCK` : `${input.name}: Low Stock`}
            message={`Current: ${input.current} ${input.unit} | Minimum: ${input.minimum} ${input.unit}`}
            action={
              <Button size="sm" variant="outline">
                Restock
              </Button>
            }
          />
        ))}
      </div>
    </div>
  );
}

