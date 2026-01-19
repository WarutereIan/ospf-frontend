import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  IconSearch,
  IconClock,
  IconUser,
  IconFileText,
  IconDownload,
  IconFilter,
  IconCheck,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/contexts/AuthContext";

interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: "user" | "order" | "transaction" | "produce" | "center" | "report" | "system";
  entityId: string;
  entityName: string;
  details: string;
  ipAddress?: string;
  status: "success" | "failed" | "warning";
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLogs([
        {
          id: "LOG001",
          timestamp: "2024-01-15T10:30:00Z",
          userId: "U001",
          userName: "John Mutua",
          userRole: "farmer",
          action: "create",
          entityType: "order",
          entityId: "ORD123",
          entityName: "Order #ORD123",
          details: "Created new order for 50kg sweet potatoes",
          ipAddress: "192.168.1.100",
          status: "success",
        },
        {
          id: "LOG002",
          timestamp: "2024-01-15T09:15:00Z",
          userId: "U004",
          userName: "Mary Wanjiku",
          userRole: "staff",
          action: "update",
          entityType: "user",
          entityId: "U002",
          entityName: "Sarah Mwangi",
          details: "Updated user role from buyer to officer",
          ipAddress: "192.168.1.50",
          status: "success",
          changes: [
            { field: "role", oldValue: "buyer", newValue: "officer" },
          ],
        },
        {
          id: "LOG003",
          timestamp: "2024-01-15T08:45:00Z",
          userId: "U003",
          userName: "David Kimani",
          userRole: "officer",
          action: "export",
          entityType: "report",
          entityId: "RPT001",
          entityName: "Monthly Sales Report",
          details: "Exported monthly sales report (PDF)",
          ipAddress: "192.168.1.75",
          status: "success",
        },
        {
          id: "LOG004",
          timestamp: "2024-01-15T08:20:00Z",
          userId: "U002",
          userName: "Sarah Mwangi",
          userRole: "buyer",
          action: "delete",
          entityType: "order",
          entityId: "ORD122",
          entityName: "Order #ORD122",
          details: "Attempted to delete order",
          ipAddress: "192.168.1.120",
          status: "failed",
        },
        {
          id: "LOG005",
          timestamp: "2024-01-14T16:30:00Z",
          userId: "U004",
          userName: "Mary Wanjiku",
          userRole: "staff",
          action: "create",
          entityType: "user",
          entityId: "U005",
          entityName: "James Omondi",
          details: "Created new user account",
          ipAddress: "192.168.1.50",
          status: "success",
        },
        {
          id: "LOG006",
          timestamp: "2024-01-14T14:15:00Z",
          userId: "U001",
          userName: "John Mutua",
          userRole: "farmer",
          action: "update",
          entityType: "produce",
          entityId: "PRD001",
          entityName: "Sweet Potatoes - 100kg",
          details: "Updated produce listing price from KES 80/kg to KES 85/kg",
          ipAddress: "192.168.1.100",
          status: "success",
          changes: [
            { field: "price", oldValue: "KES 80/kg", newValue: "KES 85/kg" },
          ],
        },
        {
          id: "LOG007",
          timestamp: "2024-01-14T12:00:00Z",
          userId: "U004",
          userName: "Mary Wanjiku",
          userRole: "staff",
          action: "login",
          entityType: "system",
          entityId: "SYS001",
          entityName: "System Login",
          details: "User logged into system",
          ipAddress: "192.168.1.50",
          status: "success",
        },
        {
          id: "LOG008",
          timestamp: "2024-01-14T11:30:00Z",
          userId: "U003",
          userName: "David Kimani",
          userRole: "officer",
          action: "view",
          entityType: "transaction",
          entityId: "TXN001",
          entityName: "Transaction #TXN001",
          details: "Viewed transaction details",
          ipAddress: "192.168.1.75",
          status: "success",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || log.userRole === roleFilter;
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesRole && matchesAction && matchesStatus;
  });

  const getStatusIcon = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return <IconCheck className="h-4 w-4 text-green-600" />;
      case "failed":
        return <IconX className="h-4 w-4 text-red-600" />;
      case "warning":
        return <IconAlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: ActivityLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: logs.length,
    today: logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    successful: logs.filter((log) => log.status === "success").length,
    failed: logs.filter((log) => log.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Activity Tracking</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor user activities, track system actions, and maintain accountability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <IconDownload className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <IconClock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Activities</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <IconFileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold">{stats.successful}</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <IconX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="aggregation_manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>Complete audit trail of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconClock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{log.userName}</div>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{log.entityName}</div>
                          <Badge variant="outline" className="text-xs">
                            {log.entityType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm">{log.details}</p>
                          {log.changes && log.changes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {log.changes.map((change, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground">
                                  <span className="font-medium">{change.field}:</span>{" "}
                                  <span className="line-through">{change.oldValue}</span> →{" "}
                                  <span className="font-medium">{change.newValue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{log.ipAddress || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge variant="outline" className={getStatusBadge(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No activity logs found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
