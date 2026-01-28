import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  IconArrowLeft,
  IconUser,
  IconPhone,
  IconMapPin,
  IconShoppingCart,
  IconCurrency,
  IconMail,
  IconLoader2,
} from "@tabler/icons-react";
import { useInput } from "@/contexts/InputContext";
import type { InputCustomer } from "@/types/input";

export default function InputCustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const {
    selectedCustomer: customer,
    isLoading,
    fetchCustomerById,
    fetchCustomerOrderHistory,
  } = useInput();

  useEffect(() => {
    if (id) {
      fetchCustomerById(id);
      fetchCustomerOrderHistory(id);
    }
  }, [id, fetchCustomerById, fetchCustomerOrderHistory]);

  const getStatusBadge = (status: InputCustomer["status"]) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      new: { label: "New Customer", className: "bg-blue-100 text-blue-800" },
    };
    const statusConfig = config[status] || config.active;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-48" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 space-y-6">
        <Link to="/dashboard/customers">
          <Button variant="ghost" className="mb-4">
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Customer not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/customers">
            <Button variant="ghost" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{customer.farmerName}</h1>
            <p className="text-muted-foreground mt-1">
              Customer Details
            </p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <IconUser className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{customer.farmerName}</div>
              </div>
              {getStatusBadge(customer.status)}
            </div>
            <div className="flex items-center gap-3">
              <IconPhone className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{customer.farmerPhone}</div>
              </div>
            </div>
            {customer.farmerEmail && (
              <div className="flex items-center gap-3">
                <IconMail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{customer.farmerEmail}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <IconMapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Location</div>
                <div className="font-medium">{customer.location}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconShoppingCart className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{customer.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {customer.totalSpent ? (customer.totalSpent / 1000).toFixed(0) : "0"}K</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">KES {(customer.averageOrderValue ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Favorite Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.favoriteCategory || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">Most purchased</p>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShoppingCart className="h-5 w-5" />
            Order History
          </CardTitle>
          <CardDescription>
            {customer.orderHistory.length} order{customer.orderHistory.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Input</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orderHistory.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.inputName}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>KES {(order.amount ?? 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {order.date ? new Date(order.date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/dashboard/input-orders`}>
                        <Button size="sm" variant="ghost">
                          View Order
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="w-0.5 h-full bg-border mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="font-medium">First Order</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(customer.firstOrderDate).toLocaleDateString()} - Customer joined
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div className="w-0.5 h-full bg-border mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="font-medium">Latest Order</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(customer.lastOrderDate).toLocaleDateString()} - {customer.orderHistory[0]?.inputName}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <div className="flex-1">
                <div className="font-medium">Customer Since</div>
                <div className="text-sm text-muted-foreground">
                  {Math.floor(
                    (new Date().getTime() - new Date(customer.firstOrderDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
