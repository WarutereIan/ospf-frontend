import { useState, useEffect } from "react";
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

interface Customer {
  id: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string;
  location: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  firstOrderDate: string;
  averageOrderValue: number;
  status: "active" | "inactive" | "new";
  favoriteCategory?: string;
  orderHistory: {
    orderNumber: string;
    inputName: string;
    quantity: number;
    amount: number;
    date: string;
    status: string;
  }[];
}

export default function InputCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const sampleCustomers: Customer[] = [
        {
          id: "1",
          farmerName: "John Kamau",
          farmerPhone: "+254712345678",
          farmerEmail: "john.kamau@example.com",
          location: "Kangundo, Machakos",
          totalOrders: 5,
          totalSpent: 45000,
          lastOrderDate: "2024-01-15T10:30:00Z",
          firstOrderDate: "2023-11-10T08:00:00Z",
          averageOrderValue: 9000,
          status: "active",
          favoriteCategory: "Planting Material",
          orderHistory: [
            {
              orderNumber: "INP-ORD-001",
              inputName: "OFSP Vines (Kenya)",
              quantity: 500,
              amount: 15500,
              date: "2024-01-15T10:30:00Z",
              status: "pending",
            },
            {
              orderNumber: "INP-ORD-012",
              inputName: "NPK Fertilizer",
              quantity: 30,
              amount: 5000,
              date: "2023-12-20T14:15:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-008",
              inputName: "OFSP Vines (SPK004)",
              quantity: 300,
              amount: 11000,
              date: "2023-12-05T09:20:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-005",
              inputName: "Organic Compost",
              quantity: 50,
              amount: 4500,
              date: "2023-11-25T11:00:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-003",
              inputName: "OFSP Vines (Kenya)",
              quantity: 200,
              amount: 6500,
              date: "2023-11-10T08:00:00Z",
              status: "completed",
            },
          ],
        },
        {
          id: "2",
          farmerName: "Mary Wanjiku",
          farmerPhone: "+254723456789",
          farmerEmail: "mary.wanjiku@example.com",
          location: "Matungulu, Machakos",
          totalOrders: 3,
          totalSpent: 24000,
          lastOrderDate: "2024-01-14T14:20:00Z",
          firstOrderDate: "2023-12-01T10:00:00Z",
          averageOrderValue: 8000,
          status: "active",
          favoriteCategory: "Fertilizer",
          orderHistory: [
            {
              orderNumber: "INP-ORD-002",
              inputName: "NPK Fertilizer",
              quantity: 50,
              amount: 8000,
              date: "2024-01-14T14:20:00Z",
              status: "accepted",
            },
            {
              orderNumber: "INP-ORD-010",
              inputName: "NPK Fertilizer",
              quantity: 40,
              amount: 6500,
              date: "2023-12-15T13:30:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-006",
              inputName: "Organic Compost",
              quantity: 60,
              amount: 5500,
              date: "2023-12-01T10:00:00Z",
              status: "completed",
            },
          ],
        },
        {
          id: "3",
          farmerName: "Peter Mwangi",
          farmerPhone: "+254734567890",
          location: "Mwala, Machakos",
          totalOrders: 4,
          totalSpent: 38000,
          lastOrderDate: "2024-01-13T09:15:00Z",
          firstOrderDate: "2023-11-15T09:00:00Z",
          averageOrderValue: 9500,
          status: "active",
          favoriteCategory: "Planting Material",
          orderHistory: [
            {
              orderNumber: "INP-ORD-003",
              inputName: "OFSP Vines (SPK004)",
              quantity: 300,
              amount: 10500,
              date: "2024-01-13T09:15:00Z",
              status: "processing",
            },
            {
              orderNumber: "INP-ORD-009",
              inputName: "OFSP Vines (Kenya)",
              quantity: 400,
              amount: 12500,
              date: "2023-12-10T08:45:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-007",
              inputName: "Training Manuals",
              quantity: 5,
              amount: 2500,
              date: "2023-11-28T12:00:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-004",
              inputName: "OFSP Vines (SPK004)",
              quantity: 250,
              amount: 12500,
              date: "2023-11-15T09:00:00Z",
              status: "completed",
            },
          ],
        },
        {
          id: "4",
          farmerName: "Jane Wambui",
          farmerPhone: "+254745678901",
          farmerEmail: "jane.wambui@example.com",
          location: "Kangundo, Machakos",
          totalOrders: 2,
          totalSpent: 13000,
          lastOrderDate: "2024-01-12T11:45:00Z",
          firstOrderDate: "2023-12-20T10:30:00Z",
          averageOrderValue: 6500,
          status: "new",
          favoriteCategory: "Soil Amendment",
          orderHistory: [
            {
              orderNumber: "INP-ORD-004",
              inputName: "Organic Compost",
              quantity: 100,
              amount: 8500,
              date: "2024-01-12T11:45:00Z",
              status: "ready_for_pickup",
            },
            {
              orderNumber: "INP-ORD-011",
              inputName: "Organic Compost",
              quantity: 50,
              amount: 4500,
              date: "2023-12-20T10:30:00Z",
              status: "completed",
            },
          ],
        },
        {
          id: "5",
          farmerName: "David Kipchoge",
          farmerPhone: "+254756789012",
          location: "Matungulu, Machakos",
          totalOrders: 1,
          totalSpent: 5000,
          lastOrderDate: "2024-01-10T08:30:00Z",
          firstOrderDate: "2024-01-10T08:30:00Z",
          averageOrderValue: 5000,
          status: "new",
          favoriteCategory: "Training Materials",
          orderHistory: [
            {
              orderNumber: "INP-ORD-005",
              inputName: "Training Manuals",
              quantity: 10,
              amount: 5000,
              date: "2024-01-10T08:30:00Z",
              status: "delivered",
            },
          ],
        },
        {
          id: "6",
          farmerName: "Sarah Njeri",
          farmerPhone: "+254767890123",
          location: "Mwala, Machakos",
          totalOrders: 3,
          totalSpent: 19500,
          lastOrderDate: "2024-01-08T16:20:00Z",
          firstOrderDate: "2023-11-20T14:00:00Z",
          averageOrderValue: 6500,
          status: "active",
          favoriteCategory: "Planting Material",
          orderHistory: [
            {
              orderNumber: "INP-ORD-006",
              inputName: "OFSP Vines (Kenya)",
              quantity: 200,
              amount: 6500,
              date: "2024-01-08T16:20:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-013",
              inputName: "OFSP Vines (Kenya)",
              quantity: 150,
              amount: 5000,
              date: "2023-12-12T10:15:00Z",
              status: "completed",
            },
            {
              orderNumber: "INP-ORD-009",
              inputName: "OFSP Vines (SPK004)",
              quantity: 250,
              amount: 8000,
              date: "2023-11-20T14:00:00Z",
              status: "completed",
            },
          ],
        },
      ];
      setCustomers(sampleCustomers);
      setFilteredCustomers(sampleCustomers);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (customer) =>
          customer.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.farmerPhone.includes(searchQuery) ||
          customer.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchQuery, customers]);


  const getStatusBadge = (status: Customer["status"]) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
      new: { label: "New Customer", className: "bg-blue-100 text-blue-800" },
    };
    const statusConfig = config[status] || config.active;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    new: customers.filter((c) => c.status === "new").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.length > 0
      ? customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length
      : 0,
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
          value={stats.total.toString()}
          description="All customers"
          icon={<IconUser className="h-5 w-5 text-primary" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Active Customers"
          value={stats.active.toString()}
          description="Regular buyers"
          icon={<IconTrendingUp className="h-5 w-5 text-green-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="New Customers"
          value={stats.new.toString()}
          description="This month"
          icon={<IconUser className="h-5 w-5 text-blue-600" />}
          isLoading={isLoading}
        />
        <StatCard
          label="Total Revenue"
          value={`KES ${(stats.totalRevenue / 1000).toFixed(0)}K`}
          description={`Avg: KES ${stats.averageOrderValue.toFixed(0)}`}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
            Showing {filteredCustomers.length} of {customers.length} customers
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
