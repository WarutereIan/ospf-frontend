import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconSeeding, IconShoppingCart, IconPackage, IconTrendingUp, IconUsers, IconCurrency } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function InputProviderDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalInputs: 24,
    activeOrders: 8,
    totalRevenue: "KES 245,000",
    customers: 156,
    pendingOrders: 3,
    lowStock: 5,
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inputs</CardTitle>
            <IconSeeding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInputs}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IconCurrency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue}</div>
            <p className="text-xs text-success">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Active farmers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <IconPackage className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+18%</div>
            <p className="text-xs text-muted-foreground">Sales this quarter</p>
          </CardContent>
        </Card>
      </div>

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
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alerts</CardTitle>
          <CardDescription>Items that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lowStockInputs.map((input, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-warning/5">
                <div className="flex-1">
                  <div className="font-medium">{input.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Current: {input.current} {input.unit} | Minimum: {input.minimum} {input.unit}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Restock
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/dashboard/input-inventory">
              <Button variant="link" className="w-full">
                Manage All Inventory →
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

