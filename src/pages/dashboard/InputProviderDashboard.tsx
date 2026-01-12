import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconSeeding, IconShoppingCart, IconPackage, IconTrendingUp, IconUsers, IconCurrency } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  StatCard,
  HorizontalBarChart,
  SimpleBarChart,
  AlertCard,
} from "@/components/visualizations";

export default function InputProviderDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInputs: 24,
    activeOrders: 8,
    totalRevenue: 245000,
    revenueLastMonth: 207000,
    customers: 156,
    newCustomers: 8,
    pendingOrders: 3,
    lowStock: 5,
  });
  const [salesByCategory, setSalesByCategory] = useState([
    { name: "Planting", value: 45 },
    { name: "Fertilizer", value: 30 },
    { name: "Tools", value: 15 },
    { name: "Other", value: 10 },
  ]);
  const [monthlySales, setMonthlySales] = useState([
    { month: "Jul", amount: 180000 },
    { month: "Aug", amount: 195000 },
    { month: "Sep", amount: 210000 },
    { month: "Oct", amount: 220000 },
    { month: "Nov", amount: 230000 },
    { month: "Dec", amount: 245000 },
  ]);
  const [inventoryStatus, setInventoryStatus] = useState({
    inStock: 19,
    lowStock: 4,
    outOfStock: 1,
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const recentOrders = [
    { id: "1", farmer: "John Kamau", input: "OFSP Vines (Kenya)", quantity: "500 cuttings", amount: "KES 15,000", status: "pending" },
    { id: "2", farmer: "Mary Wanjiku", input: "Fertilizer (NPK)", quantity: "50 kg", amount: "KES 8,500", status: "processing" },
    { id: "3", farmer: "Peter Mwangi", input: "OFSP Vines (SPK004)", quantity: "300 cuttings", amount: "KES 9,500", status: "completed" },
  ];

  const lowStockInputs = [
    { name: "OFSP Vines (Kenya)", current: 150, minimum: 500, unit: "cuttings" },
    { name: "Organic Fertilizer", current: 25, minimum: 100, unit: "kg" },
    { name: "Training Manuals", current: 5, minimum: 20, unit: "books" },
  ];

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

