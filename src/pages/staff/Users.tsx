import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconSearch,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import type { UserRole } from "@/contexts/AuthContext";

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "farmer" as UserRole,
  });

  useEffect(() => {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      setUsers([
        {
          id: "U001",
          name: "John Mutua",
          email: "john@example.com",
          phone: "+254712345678",
          role: "farmer",
          status: "active",
          createdAt: "2023-06-01",
          lastLogin: "2024-01-15",
        },
        {
          id: "U002",
          name: "Sarah Mwangi",
          email: "sarah@example.com",
          phone: "+254723456789",
          role: "buyer",
          status: "active",
          createdAt: "2023-07-15",
          lastLogin: "2024-01-14",
        },
        {
          id: "U003",
          name: "David Kimani",
          phone: "+254734567890",
          role: "officer",
          status: "active",
          createdAt: "2023-05-10",
          lastLogin: "2024-01-15",
        },
        {
          id: "U004",
          name: "Mary Wanjiku",
          email: "mary@example.com",
          phone: "+254745678901",
          role: "staff",
          status: "active",
          createdAt: "2023-04-20",
          lastLogin: "2024-01-15",
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    // TODO: Implement user creation
    const newUser: User = {
      id: `U${String(users.length + 1).padStart(3, "0")}`,
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      role: formData.role,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers([...users, newUser]);
    setIsDialogOpen(false);
    setFormData({ name: "", email: "", phone: "", role: "farmer" });
  };

  const handleResetPassword = (userId: string) => {
    // TODO: Implement password reset
    alert(`Password reset initiated for user ${userId}`);
  };

  const handleDeactivate = (userId: string) => {
    // TODO: Implement deactivation
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u)));
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "farmer":
        return "bg-green-100 text-green-800";
      case "buyer":
        return "bg-blue-100 text-blue-800";
      case "officer":
        return "bg-purple-100 text-purple-800";
      case "staff":
        return "bg-orange-100 text-orange-800";
      case "aggregation_manager":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create, edit, assign roles, and reset passwords
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="officer">Officer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="aggregation_manager">Aggregation Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Complete list of system users</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <IconMail className="h-3 w-3" />
                            {user.email}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm">
                          <IconPhone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : user.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.lastLogin || "Never"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                          title="Reset Password"
                        >
                          <IconShield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivate(user.id)}
                          title="Deactivate"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (Optional)</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                placeholder="+254 7XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="officer">Officer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="aggregation_manager">Aggregation Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={!formData.name || !formData.phone}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
