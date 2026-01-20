import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconSearch,
  IconUser,
  IconPhone,
  IconMapPin,
  IconShoppingCart,
  IconCurrency,
  IconTrendingUp,
  IconFileText,
} from "@tabler/icons-react";
import { StatCard } from "@/components/visualizations";
import { useInput } from "@/contexts/InputContext";
import type { InputCustomer } from "@/types/input";

export default function InputCustomers() {
  const {
    filteredCustomers,
    customerStats: stats,
    isLoading,
    customerFilters: filters,
    setCustomerFilters: setFilters,
  } = useInput();

  const handleSearchChange = (searchQuery: string) => {
    setFilters({ ...filters, searchQuery });
  };

  const getStatusBadge = (status: InputCustomer["status"]) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      new: { label: "New Customer", className: "bg-blue-100 text-blue-800" },
    };
    const statusConfig = config[status] || config.active;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your customer base
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={stats?.total.toString() || "0"}
          description="All customers"
          icon={<IconUser className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Customers"
          value={stats?.active.toString() || "0"}
          description="Regular buyers"
          icon={<IconTrendingUp className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="New Customers"
          value={stats?.new.toString() || "0"}
          description="This month"
          icon={<IconUser className="h-5 w-5 text-blue-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={`KES ${stats ? (stats.totalRevenue / 1000).toFixed(0) : "0"}K`}
          description={`Avg: KES ${stats ? stats.averageOrderValue.toFixed(0) : "0"}`}
          icon={<IconCurrency className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
        />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or location..."
              value={filters.searchQuery || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Showing {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <IconUser className="h-8 w-8 animate-pulse text-muted-foreground" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Avg Order Value</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.farmerName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <IconPhone className="h-3 w-3" />
                            {customer.farmerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconMapPin className="h-4 w-4 text-muted-foreground" />
                          {customer.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconShoppingCart className="h-4 w-4 text-muted-foreground" />
                          {customer.totalOrders}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">KES {customer.totalSpent.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">KES {customer.averageOrderValue.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(customer.lastOrderDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/customers/${customer.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                          >
                            <IconFileText className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
