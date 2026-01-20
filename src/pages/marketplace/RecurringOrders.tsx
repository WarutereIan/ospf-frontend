import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconLoader2,
  IconRefresh,
  IconCalendar,
} from "@tabler/icons-react";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useAuth } from "@/contexts/AuthContext";
import type { RecurringOrder } from "@/types/marketplace";

export function RecurringOrders() {
  const { recurringOrders, fetchRecurringOrders, createRecurringOrder, updateRecurringOrder, cancelRecurringOrder, isLoading } = useMarketplace();
  const { user } = useAuth();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<RecurringOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch recurring orders on mount
  useEffect(() => {
    if (user?.id) {
      fetchRecurringOrders();
    }
  }, [user?.id, fetchRecurringOrders]);

  const orders = recurringOrders;

  const handleCreateOrder = () => {
    setEditingOrder(null);
    setDialogOpen(true);
  };

  const handleEditOrder = (order: RecurringOrder) => {
    setEditingOrder(order);
    setDialogOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this recurring order?")) {
      try {
        await cancelRecurringOrder(orderId);
        await fetchRecurringOrders();
      } catch (error) {
        console.error("Failed to cancel recurring order:", error);
        alert("Failed to cancel recurring order. Please try again.");
      }
    }
  };

  const handleToggleStatus = async (orderId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await updateRecurringOrder(orderId, { status: newStatus as "active" | "paused" });
      await fetchRecurringOrders();
    } catch (error) {
      console.error("Failed to update recurring order status:", error);
      alert("Failed to update recurring order status. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Bi-weekly";
      case "monthly":
        return "Monthly";
      default:
        return frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Recurring Orders</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage standing orders for consistent supply
          </p>
        </div>
        <Button onClick={handleCreateOrder}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Recurring Order
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Recurring Orders</CardTitle>
          <CardDescription>{orders.length} recurring order(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Variety</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Delivery</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.farmerName}</TableCell>
                      <TableCell>{order.variety}</TableCell>
                      <TableCell>{order.quantity} kg</TableCell>
                      <TableCell>{getFrequencyLabel(order.frequency)}</TableCell>
                      <TableCell>
                        {new Date(order.nextDeliveryDate || order.nextDelivery || "").toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{
                                width: `${(order.completedDeliveries / order.totalDeliveries) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {order.completedDeliveries || 0}/{order.totalDeliveries || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(order.id, order.status)}
                          >
                            {order.status === "active" ? (
                              <IconX className="h-4 w-4" />
                            ) : (
                              <IconCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditOrder(order)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No recurring orders</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create a recurring order to ensure consistent supply
              </p>
              <Button onClick={handleCreateOrder} className="mt-4">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Recurring Order
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? "Edit Recurring Order" : "Create Recurring Order"}
            </DialogTitle>
            <DialogDescription>
              Set up a standing order for regular deliveries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmer">Farmer</Label>
                <Input id="farmer" placeholder="Search farmer..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variety">Variety</Label>
                <Select>
                  <SelectTrigger id="variety">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kenya">Kenya</SelectItem>
                    <SelectItem value="spk004">SPK004</SelectItem>
                    <SelectItem value="kabode">Kabode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity per delivery (kg)</Label>
                <Input id="quantity" type="number" placeholder="0" min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autoRenew" />
              <Label htmlFor="autoRenew" className="cursor-pointer">
                Auto-renew after completion
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsSubmitting(true)} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  {editingOrder ? "Update" : "Create"} Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

