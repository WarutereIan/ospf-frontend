import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { IconShoppingBag, IconChartBar, IconUsers, IconPackage } from "@tabler/icons-react";

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">OFSP Digital Marketplace</h1>
        <p className="text-xl text-muted-foreground">
          Connecting OFSP farmers with buyers in Machakos County
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShoppingBag className="h-5 w-5 text-primary" />
              Marketplace
            </CardTitle>
            <CardDescription>Browse and purchase OFSP produce</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/marketplace" className="w-full">
              <Button className="w-full">Browse Products</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5 text-primary" />
              Dashboard
            </CardTitle>
            <CardDescription>View your analytics and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/farmer" className="w-full">
              <Button variant="outline" className="w-full">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5 text-primary" />
              Orders
            </CardTitle>
            <CardDescription>Manage your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/orders" className="w-full">
              <Button variant="outline" className="w-full">View Orders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-primary" />
              Community
            </CardTitle>
            <CardDescription>Connect with other farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/leaderboard" className="w-full">
              <Button variant="outline" className="w-full">View Leaderboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About OFSP Marketplace</CardTitle>
          <CardDescription>
            A digital platform for Orange-Fleshed Sweet Potato value chain in Machakos County
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This platform connects OFSP farmers with buyers, enabling transparent and efficient
            market linkages. Features include real-time order tracking, quality grading, and
            peer monitoring.
          </p>
          <div className="flex gap-2">
            <Link to="/marketplace">
              <Button>Get Started</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Register as Farmer</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

