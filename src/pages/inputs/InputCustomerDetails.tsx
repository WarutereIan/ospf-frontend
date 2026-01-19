import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export default function InputCustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real app, fetch customer by ID
    setTimeout(() => {
      // Mock customer data - match the data from InputCustomers.tsx
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

      const foundCustomer = sampleCustomers.find((c) => c.id === id);
      setCustomer(foundCustomer || null);
      setIsLoading(false);
    }, 500);
  }, [id]);

  const getStatusBadge = (status: Customer["status"]) => {
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
            <div className="text-3xl font-bold">KES {(customer.totalSpent / 1000).toFixed(0)}K</div>
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
            <div className="text-3xl font-bold">KES {customer.averageOrderValue.toLocaleString()}</div>
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
                    <TableCell>KES {order.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString()}
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
