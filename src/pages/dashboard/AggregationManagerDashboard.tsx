import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconPackage,
  IconTrendingUp,
  IconTrendingDown,
  IconAlertTriangle,
  IconClipboardCheck,
  IconUsers,
  IconBuilding,
  IconBuildingCommunity,
  IconMapPin,
} from "@tabler/icons-react";

interface ManagerStats {
  currentStock: number;
  stockInToday: number;
  stockOutToday: number;
  qualityChecksToday: number;
  pendingChecks: number;
  capacityUtilization: number;
}

interface StockActivity {
  id: string;
  type: "in" | "out";
  farmerName?: string;
  buyerName?: string;
  quantity: number;
  qualityGrade: string;
  timestamp: string;
  status: "pending" | "completed";
}

export function AggregationManagerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ManagerStats>({
    currentStock: 0,
    stockInToday: 0,
    stockOutToday: 0,
    qualityChecksToday: 0,
    pendingChecks: 0,
    capacityUtilization: 0,
  });
  const [recentActivity, setRecentActivity] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const centerName = "Kangundo Main Aggregation Center"; // TODO: Get from context
  const centerType = "main"; // TODO: Get from context - "main" or "satellite"
  const centerSubCounty = "Kangundo"; // TODO: Get from context
  const centerWard = centerType === "satellite" ? "Kangundo East" : undefined; // TODO: Get from context

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        currentStock: 5000,
        stockInToday: 1200,
        stockOutToday: 800,
        qualityChecksToday: 15,
        pendingChecks: 3,
        capacityUtilization: 65,
      });
      setRecentActivity([
        {
          id: "STK-001",
          type: "in",
          farmerName: "James Mutua",
          quantity: 500,
          qualityGrade: "A",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
        {
          id: "STK-002",
          type: "out",
          buyerName: "John Mwangi",
          quantity: 300,
          qualityGrade: "A",
          timestamp: new Date().toISOString(),
          status: "completed",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {centerType === "main" ? (
              <IconBuilding className="h-6 w-6 text-blue-600" />
            ) : (
              <IconBuildingCommunity className="h-6 w-6 text-purple-600" />
            )}
            <Badge
              variant="outline"
              className={
                centerType === "main"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }
            >
              {centerType === "main" ? "Main Center - Subcounty Level" : "Satellite Center - Ward Level"}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{centerName}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <IconMapPin className="h-4 w-4" />
            <span>
              {centerSubCounty} Subcounty
              {centerWard && ` - ${centerWard} Ward`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stock management and quality control
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate("/dashboard/stock-in")}>
            <IconTrendingUp className="mr-2 h-4 w-4" />
            Stock In
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard/stock-out")}>
            <IconTrendingDown className="mr-2 h-4 w-4" />
            Stock Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Stock"
          value={`${stats.currentStock} kg`}
          description={`${stats.capacityUtilization}% capacity`}
          icon={<IconPackage className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Stock In Today"
          value={`${stats.stockInToday} kg`}
          description="Received today"
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Stock Out Today"
          value={`${stats.stockOutToday} kg`}
          description="Dispatched today"
          icon={<IconTrendingDown className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Quality Checks"
          value={stats.qualityChecksToday.toString()}
          description={`${stats.pendingChecks} pending`}
          icon={<IconClipboardCheck className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Stock Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Stock Activity</CardTitle>
            <CardDescription>Stock in/out transactions today</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-3 rounded-lg">
                        {activity.type === "in" ? (
                          <IconTrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <IconTrendingDown className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.type === "in" ? "Stock In" : "Stock Out"} - {activity.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type === "in" ? activity.farmerName : activity.buyerName} •{" "}
                          {activity.quantity} kg • Grade {activity.qualityGrade}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          activity.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {activity.status}
                      </Badge>
                      {activity.type === "in" && activity.status === "pending" && (
                        <Link to={`/dashboard/quality-check/${activity.id}`}>
                          <Button size="sm">Quality Check</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconPackage className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No stock activity today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard/stock-in" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrendingUp className="mr-2 h-4 w-4" />
                  Stock In
                </Button>
              </Link>
              <Link to="/dashboard/stock-out" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconTrendingDown className="mr-2 h-4 w-4" />
                  Stock Out
                </Button>
              </Link>
              <Link to="/dashboard/quality-checks" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconClipboardCheck className="mr-2 h-4 w-4" />
                  Quality Checks
                </Button>
              </Link>
              <Link to="/dashboard/inventory" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconPackage className="mr-2 h-4 w-4" />
                  Inventory Report
                </Button>
              </Link>
              <Link to="/dashboard/farmers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconUsers className="mr-2 h-4 w-4" />
                  Farmer Coordination
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Actions</CardTitle>
              <CardDescription>Requires attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Quality Checks</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingChecks} pending</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {stats.pendingChecks}
                  </Badge>
                </div>
                {stats.capacityUtilization > 80 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Capacity Alert</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.capacityUtilization}% full
                      </p>
                    </div>
                    <IconAlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                )}
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

