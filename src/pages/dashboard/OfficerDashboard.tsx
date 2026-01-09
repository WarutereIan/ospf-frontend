import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconTrendingUp,
  IconFileText,
  IconChartBar,
  IconMapPin,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";

interface OfficerStats {
  totalFarmers: number;
  activeFarmers: number;
  totalOrders: number;
  totalRevenue: number;
  aggregationCenters: number;
  pendingAdvisories: number;
}

interface FarmerActivity {
  id: string;
  name: string;
  subCounty: string;
  totalSales: number;
  orderCount: number;
  lastActivity: string;
  status: "active" | "inactive";
}

export function OfficerDashboard() {
  const [stats, setStats] = useState<OfficerStats>({
    totalFarmers: 0,
    activeFarmers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    aggregationCenters: 4,
    pendingAdvisories: 0,
  });
  const [recentActivity, setRecentActivity] = useState<FarmerActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        totalFarmers: 150,
        activeFarmers: 120,
        totalOrders: 450,
        totalRevenue: 6750000,
        aggregationCenters: 4,
        pendingAdvisories: 3,
      });
      setRecentActivity([
        {
          id: "F001",
          name: "James Mutua",
          subCounty: "Kangundo",
          totalSales: 5000,
          orderCount: 45,
          lastActivity: new Date().toISOString(),
          status: "active",
        },
        {
          id: "F002",
          name: "Mary Wanjiku",
          subCounty: "Kathiani",
          totalSales: 4500,
          orderCount: 38,
          lastActivity: new Date().toISOString(),
          status: "active",
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
          <h1 className="text-2xl sm:text-3xl font-bold">County Officer Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor farmer activities and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <IconDownload className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link to="/dashboard/advisory">
            <Button size="sm">
              <IconAlertCircle className="mr-2 h-4 w-4" />
              Send Advisory
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Farmers"
          value={stats.totalFarmers.toString()}
          description={`${stats.activeFarmers} active`}
          icon={<IconUsers className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          description="All-time orders"
          icon={<IconTrendingUp className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={`KES ${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          description="Farmer earnings"
          icon={<IconChartBar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Aggregation Centers"
          value={stats.aggregationCenters.toString()}
          description="Active centers"
          icon={<IconMapPin className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Farmer Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Farmer Activity</CardTitle>
            <CardDescription>Recent farmer activities and performance</CardDescription>
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
                {recentActivity.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-background p-3 rounded-lg">
                        <IconUsers className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{farmer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farmer.subCounty} • {farmer.totalSales} kg sold • {farmer.orderCount} orders
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last active: {new Date(farmer.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          farmer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {farmer.status}
                      </Badge>
                      <Link to={`/dashboard/farmers/${farmer.id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No farmer activity data</p>
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
              <Link to="/dashboard/farmers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconUsers className="mr-2 h-4 w-4" />
                  View All Farmers
                </Button>
              </Link>
              <Link to="/dashboard/reports" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconFileText className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </Link>
              <Link to="/dashboard/centers" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconMapPin className="mr-2 h-4 w-4" />
                  Manage Centers
                </Button>
              </Link>
              <Link to="/dashboard/advisory" className="w-full">
                <Button variant="outline" className="w-full justify-start">
                  <IconAlertCircle className="mr-2 h-4 w-4" />
                  Send Advisory
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
                    <p className="text-sm font-medium">Advisories</p>
                    <p className="text-xs text-muted-foreground">{stats.pendingAdvisories} pending</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {stats.pendingAdvisories}
                  </Badge>
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

