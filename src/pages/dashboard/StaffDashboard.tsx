import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconUsers,
  IconSettings,
  IconChartBar,
  IconFileText,
  IconDatabase,
  IconShield,
} from "@tabler/icons-react";

interface StaffStats {
  totalUsers: number;
  totalFarmers: number;
  totalBuyers: number;
  totalOrders: number;
  platformRevenue: number;
  systemHealth: "healthy" | "warning" | "critical";
}

export function StaffDashboard() {
  const [stats, setStats] = useState<StaffStats>({
    totalUsers: 0,
    totalFarmers: 0,
    totalBuyers: 0,
    totalOrders: 0,
    platformRevenue: 0,
    systemHealth: "healthy",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setStats({
        totalUsers: 200,
        totalFarmers: 150,
        totalBuyers: 50,
        totalOrders: 500,
        platformRevenue: 135000,
        systemHealth: "healthy",
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Full platform access and system management
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/staff/users">
            <Button size="sm" variant="outline">
              <IconUsers className="mr-2 h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link to="/dashboard/staff/settings">
            <Button size="sm">
              <IconSettings className="mr-2 h-4 w-4" />
              System Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toString()}
          description={`${stats.totalFarmers} farmers, ${stats.totalBuyers} buyers`}
          icon={<IconUsers className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          description="All-time orders"
          icon={<IconChartBar className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Platform Revenue"
          value={`KES ${stats.platformRevenue.toLocaleString()}`}
          description="2% transaction fees"
          icon={<IconDatabase className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="System Health"
          value={stats.systemHealth}
          description="All systems operational"
          icon={<IconShield className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Functions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Administrative Functions</CardTitle>
            <CardDescription>Platform management and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/dashboard/staff/users">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconUsers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">User Management</p>
                        <p className="text-xs text-muted-foreground">Manage all users</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/dashboard/staff/analytics">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconChartBar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Analytics & Reports</p>
                        <p className="text-xs text-muted-foreground">View platform analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/dashboard/staff/settings">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconSettings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">System Settings</p>
                        <p className="text-xs text-muted-foreground">Configure platform</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/dashboard/data-export">
                <Card className="hover:bg-muted transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconFileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Data Export</p>
                        <p className="text-xs text-muted-foreground">Export platform data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/dashboard/staff/users" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <IconUsers className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </Link>
            <Link to="/dashboard/staff/analytics" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <IconChartBar className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/dashboard/staff/reports" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <IconFileText className="mr-2 h-4 w-4" />
                Reports
              </Button>
            </Link>
            <Link to="/dashboard/staff/settings" className="w-full">
              <Button variant="outline" className="w-full justify-start">
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
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
