import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  IconKey,
  IconCheck,
  IconX,
  IconUpload,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { useAggregation } from "@/contexts/AggregationContext";
import type { UserRole } from "@/contexts/AuthContext";
import type { Profile, ProfileStatus } from "@/types/profile";
import { showSuccess, showError } from "@/lib/toast";
import { getFarmerGroups, type FarmerGroup } from "@/services/farmerGroupService";
import { bulkCreateFarmers, type BulkCreateFarmersResult } from "@/services/userService";
import { VALID_SUBCOUNTIES } from "@/constants/locations";

type UsersSortColumn = "role" | "status" | "createdAt" | "lastLogin";
type SortDirection = "asc" | "desc";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "read" | "write" | "delete" | "admin";
}

export function Users() {
  const { 
    profiles, 
    fetchProfiles, 
    isLoading,
    createUser,
    updateUser,
    updateUserStatus,
    updateUserRole,
    resetUserPassword,
    deleteUser,
    updateProfile,
  } = useProfile();
  const { user: currentUser } = useAuth();
  const { centers, fetchCenters } = useAggregation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [selectedBulkFile, setSelectedBulkFile] = useState<File | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkCreateFarmersResult | null>(null);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isManageUserDialogOpen, setIsManageUserDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [farmerGroups, setFarmerGroups] = useState<FarmerGroup[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer" as UserRole,
    farmerGroupId: "",
    aggregationCenterId: "",
    assignedCounty: "",
    assignedSubCounty: "",
    hasAllAccess: false,
  });

  const [manageForm, setManageForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "farmer" as UserRole,
    status: "active" as ProfileStatus,
    farmerGroupId: "",
    aggregationCenterId: "",
    assignedCounty: "",
    assignedSubCounty: "",
    hasAllAccess: false,
  });

  const [sortColumn, setSortColumn] = useState<UsersSortColumn | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkDeactivating, setIsBulkDeactivating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Fetch users, centers, and farmer groups on mount
  useEffect(() => {
    fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    fetchCenters();
    const loadFarmerGroups = async () => {
      const groups = await getFarmerGroups();
      setFarmerGroups(groups);
    };
    loadFarmerGroups();
  }, [fetchProfiles, fetchCenters, roleFilter]);

  const availablePermissions: Permission[] = [
    { id: "users.read", name: "View Users", description: "View user list and details", category: "read" },
    { id: "users.write", name: "Manage Users", description: "Create, edit, and delete users", category: "write" },
    { id: "reports.read", name: "View Reports", description: "Access and view reports", category: "read" },
    { id: "reports.export", name: "Export Reports", description: "Download and export reports", category: "write" },
    { id: "transactions.view", name: "View Transactions", description: "View transaction details", category: "read" },
    { id: "transactions.manage", name: "Manage Transactions", description: "Edit and manage transactions", category: "write" },
    { id: "analytics.view", name: "View Analytics", description: "Access analytics dashboard", category: "read" },
    { id: "settings.manage", name: "Manage Settings", description: "Modify system settings", category: "admin" },
    { id: "roles.manage", name: "Manage Roles", description: "Assign and modify user roles", category: "admin" },
    { id: "data.export", name: "Export Data", description: "Export system data", category: "write" },
  ];

  // Local state for user updates
  const [userUpdates, setUserUpdates] = useState<Record<string, Partial<Profile>>>({});

  // Merge profiles with local updates
  const usersWithUpdates = profiles.map(user => ({
    ...user,
    ...userUpdates[user.id],
  }));

  // Filter users based on search
  const filteredUsers = usersWithUpdates.filter((user) => {
    const matchesSearch =
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.phone && user.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort filtered users by role, status, createdAt, or lastLogin
  const sortedUsers = (() => {
    if (!sortColumn) return filteredUsers;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filteredUsers].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      if (sortColumn === "role") {
        aVal = a.role ?? "";
        bVal = b.role ?? "";
      } else if (sortColumn === "status") {
        aVal = a.status ?? "";
        bVal = b.status ?? "";
      } else if (sortColumn === "createdAt") {
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else {
        // lastLogin - use lastLoginAt if present (backend may add later)
        const aLogin = (a as Profile & { lastLoginAt?: string }).lastLoginAt ?? "";
        const bLogin = (b as Profile & { lastLoginAt?: string }).lastLoginAt ?? "";
        aVal = aLogin ? new Date(aLogin).getTime() : 0;
        bVal = bLogin ? new Date(bLogin).getTime() : 0;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return dir * (aVal.localeCompare(bVal, undefined, { sensitivity: "base" }));
      }
      return dir * (aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
    });
  })();

  const handleSort = (column: UsersSortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortableHead = ({ column, children }: { column: UsersSortColumn; children: React.ReactNode }) => (
    <TableHead>
      <button
        type="button"
        className="flex items-center gap-1 font-medium hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded px-1 -mx-1"
        onClick={() => handleSort(column)}
      >
        {children}
        {sortColumn === column ? (
          sortDirection === "asc" ? (
            <IconChevronUp className="h-4 w-4" />
          ) : (
            <IconChevronDown className="h-4 w-4" />
          )
        ) : (
          <IconSelector className="h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  );

  const handleCreateUser = async () => {
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!firstName || !formData.phone) {
        showError("Please fill in name and phone");
        return;
      }

      if (!formData.password || formData.password.length < 8) {
        showError("Password is required and must be at least 8 characters");
        return;
      }

      // Validate aggregation center assignment for aggregation managers
      if (formData.role === "aggregation_manager" && !formData.aggregationCenterId) {
        showError("Aggregation center assignment is mandatory for aggregation managers");
        return;
      }

      await createUser({
        email: formData.email?.trim() ?? "",
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        profile: {
          firstName,
          lastName,
          farmerGroupId: formData.farmerGroupId || undefined,
          aggregationCenterId: formData.aggregationCenterId || undefined,
          assignedCounty: formData.assignedCounty || undefined,
          assignedSubCounty: formData.assignedSubCounty || undefined,
          hasAllAccess: formData.hasAllAccess,
        },
      });

      showSuccess("User created successfully");
      setIsDialogOpen(false);
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        password: "",
        role: "farmer",
        farmerGroupId: "",
        aggregationCenterId: "",
        assignedCounty: "",
        assignedSubCounty: "",
        hasAllAccess: false,
      });
      
      // Refresh profiles list
      await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    } catch (error: any) {
      showError(error.message || "Failed to create user");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's password? A temporary password will be generated.")) {
      return;
    }

    try {
      // Generate a temporary password
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
      await resetUserPassword(userId, tempPassword);
      showSuccess(`Password reset successfully. Temporary password: ${tempPassword}`);
    } catch (error: any) {
      showError(error.message || "Failed to reset password");
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      await updateUserStatus(userId, "inactive");
      showSuccess("User deactivated successfully");
      
      // Update local state
      setUserUpdates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], status: "inactive" as ProfileStatus },
      }));
      
      // Refresh profiles list
      await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    } catch (error: any) {
      showError(error.message || "Failed to deactivate user");
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === sortedUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(sortedUsers.map((u) => u.id)));
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`Deactivate ${selectedUserIds.size} selected user(s)? This will set their status to inactive.`)) {
      return;
    }
    setIsBulkDeactivating(true);
    let succeeded = 0;
    let failed = 0;
    try {
      for (const id of selectedUserIds) {
        try {
          await updateUserStatus(id, "inactive");
          succeeded++;
          setUserUpdates((prev) => ({ ...prev, [id]: { ...prev[id], status: "inactive" as ProfileStatus } }));
        } catch {
          failed++;
        }
      }
      if (succeeded > 0) {
        showSuccess(succeeded === selectedUserIds.size ? "All selected users deactivated." : `Deactivated ${succeeded} user(s).${failed ? ` ${failed} failed.` : ""}`);
      }
      if (failed > 0 && succeeded === 0) {
        showError("Failed to deactivate selected users.");
      }
      setSelectedUserIds(new Set());
      await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    } catch (e) {
      showError("Bulk deactivate failed.");
    } finally {
      setIsBulkDeactivating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.size === 0) return;
    const toDelete = [...selectedUserIds];
    if (currentUser?.id && toDelete.includes(currentUser.id)) {
      showError("Cannot delete your own account. Remove yourself from the selection.");
      return;
    }
    if (!confirm(`Permanently delete ${toDelete.length} selected user(s)? This cannot be undone.`)) {
      return;
    }
    setIsBulkDeleting(true);
    let succeeded = 0;
    let failed = 0;
    const errors: string[] = [];
    try {
      for (const id of toDelete) {
        if (currentUser?.id === id) continue;
        try {
          await deleteUser(id);
          succeeded++;
        } catch (e: any) {
          failed++;
          const msg = e?.message || e?.response?.data?.message || "Unknown error";
          if (!errors.includes(msg)) errors.push(msg);
        }
      }
      if (succeeded > 0) {
        showSuccess(succeeded === toDelete.length ? "Selected users deleted." : `Deleted ${succeeded} user(s).${failed ? ` ${failed} failed.` : ""}`);
      }
      if (failed > 0 && succeeded === 0) {
        showError(errors[0] || "Failed to delete selected users.");
      }
      setSelectedUserIds(new Set());
      await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    } catch (e) {
      showError("Bulk delete failed.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleManagePermissions = (user: Profile) => {
    setSelectedUser(user);
    setIsPermissionsDialogOpen(true);
  };

  const openManageUserDialog = (user: Profile) => {
    setSelectedUser(user);
    const u = user as any;
    const name =
      u.name?.trim() ||
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      "";
    const role = (u.role && String(u.role).toLowerCase()) as UserRole;
    const statusRaw = u.status && String(u.status).toLowerCase();
    const status: ProfileStatus =
      statusRaw === "pending_verification" ? "pending" : (statusRaw as ProfileStatus) || "active";
    setManageForm({
      name,
      email: u.email ?? "",
      phone: u.phone ?? "",
      role: role || "farmer",
      status: status || "active",
      farmerGroupId: u.farmerGroupId ?? "",
      aggregationCenterId: u.aggregationCenterId ?? "",
      assignedCounty: u.assignedCounty ?? u.county ?? "",
      assignedSubCounty: u.assignedSubCounty ?? u.subCounty ?? "",
      hasAllAccess: Boolean(u.hasAllAccess),
    });
    setIsManageUserDialogOpen(true);
  };

  const handleSaveUserManagement = async () => {
    if (!selectedUser) return;

    try {
      // Split name into first and last name
      const nameParts = manageForm.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Update core user fields (email, phone, role, status)
      await updateUser(selectedUser.id, {
        email: manageForm.email || undefined,
        phone: manageForm.phone || undefined,
        role: manageForm.role,
        status: manageForm.status,
      });

      // Update profile fields (name + role-specific assignments)
      await updateProfile(selectedUser.id, {
        firstName,
        lastName,
        // Persist farmer group assignment when applicable
        ...((manageForm.role === "farmer" || manageForm.role === "lead_farmer") && {
          farmerGroupId: manageForm.farmerGroupId || undefined,
        }),
        // Persist county staff assignments when applicable
        ...((manageForm.role === "county_officer" || manageForm.role === "staff") && {
          assignedCounty: manageForm.assignedCounty || undefined,
          assignedSubCounty: manageForm.assignedSubCounty || undefined,
          hasAllAccess: manageForm.hasAllAccess,
        }),
      });

      showSuccess("User updated successfully");
      setIsManageUserDialogOpen(false);
    } catch (error: any) {
      showError(error.message || "Failed to update user");
    }
  };

  const handleSavePermissions = async (userId: string, permissions: string[]) => {
    try {
      // Note: Backend doesn't have a permissions field yet, so we'll just update local state
      // This can be extended when permissions are added to the backend schema
      setUserUpdates(prev => ({
        ...prev,
        [userId]: { ...prev[userId], permissions },
      }));
      showSuccess("Permissions updated successfully");
      setIsPermissionsDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      showError(error.message || "Failed to update permissions");
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedBulkFile) {
      showError("Please select a CSV file");
      return;
    }
    setIsBulkUploading(true);
    setBulkResult(null);
    try {
      const result = await bulkCreateFarmers(selectedBulkFile);
      setBulkResult(result);
      if (result.created > 0) {
        showSuccess(`${result.created} farmer(s) created successfully`);
        await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
      }
      if (result.failed > 0 && result.created === 0) {
        showError(`All rows failed. See errors below.`);
      }
    } catch (error: any) {
      showError(error.message || "Bulk upload failed");
    } finally {
      setIsBulkUploading(false);
    }
  };

  const closeBulkDialog = () => {
    setIsBulkDialogOpen(false);
    setSelectedBulkFile(null);
    setBulkResult(null);
  };

  const formatRoleName = (role: string): string => {
    const roleMap: Record<string, string> = {
      farmer: "Farmer",
      buyer: "Buyer",
      input_provider: "Input Provider",
      transport_provider: "Transport Provider",
      aggregation_manager: "Aggregation Manager",
      county_officer: "Extension Officer",
      officer: "Extension Officer", // Legacy support
      staff: "Staff",
    };
    return roleMap[role] || role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleBadgeColor = (role: UserRole | string) => {
    switch (role) {
      case "farmer":
        return "bg-green-100 text-green-800";
      case "buyer":
        return "bg-blue-100 text-blue-800";
      case "input_provider":
        return "bg-cyan-100 text-cyan-800";
      case "transport_provider":
        return "bg-teal-100 text-teal-800";
      case "aggregation_manager":
        return "bg-indigo-100 text-indigo-800";
      case "county_officer":
        return "bg-purple-100 text-purple-800";
      case "officer": // Legacy support
        return "bg-purple-100 text-purple-800";
      case "staff":
        return "bg-orange-100 text-orange-800";
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBulkDialogOpen(true)}>
            <IconUpload className="mr-2 h-4 w-4" />
            Bulk upload farmers (CSV)
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
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
                <SelectItem value="lead_farmer">Lead Farmer</SelectItem>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="input_provider">Input Provider</SelectItem>
                <SelectItem value="transport_provider">Transport Provider</SelectItem>
                <SelectItem value="aggregation_manager">Aggregation Manager</SelectItem>
                <SelectItem value="county_officer">Extension Officer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
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
          {selectedUserIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50 border">
              <span className="text-sm font-medium">{selectedUserIds.size} selected</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeactivate}
                disabled={isBulkDeactivating || isBulkDeleting}
              >
                {isBulkDeactivating ? "Deactivating…" : "Deactivate selected"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeactivating || isBulkDeleting}
              >
                {isBulkDeleting ? "Deleting…" : "Delete selected"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds(new Set())} disabled={isBulkDeactivating || isBulkDeleting}>
                Clear selection
              </Button>
            </div>
          )}
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
                  <TableHead className="w-10">
                    <Checkbox
                      checked={sortedUsers.length > 0 && selectedUserIds.size === sortedUsers.length}
                      onCheckedChange={() => toggleSelectAll()}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <SortableHead column="role">Role</SortableHead>
                  <SortableHead column="status">Status</SortableHead>
                  <SortableHead column="createdAt">Created</SortableHead>
                  <SortableHead column="lastLogin">Last Login</SortableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer hover:bg-muted/50 ${selectedUserIds.has(user.id) ? "bg-muted/30" : ""}`}
                    onClick={() => openManageUserDialog(user as Profile)}
                  >
                    <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>
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
                        {formatRoleName(user.role)}
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
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>N/A</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManagePermissions(user as Profile);
                          }}
                          title="Manage Permissions"
                        >
                          <IconKey className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetPassword(user.id);
                          }}
                          title="Reset Password"
                        >
                          <IconShield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeactivate(user.id);
                          }}
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
              <label className="text-sm font-medium">Password <span className="text-red-500">*</span></label>
              <Input
                type="password"
                placeholder="Min 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters. User can change it after first login.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ 
                  ...formData, 
                  role: value,
                  // Reset assignment fields when role changes
                  farmerGroupId: "",
                  aggregationCenterId: "",
                  assignedCounty: "",
                  assignedSubCounty: "",
                  hasAllAccess: false,
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="lead_farmer">Lead Farmer</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="input_provider">Input Provider</SelectItem>
                  <SelectItem value="transport_provider">Transport Provider</SelectItem>
                  <SelectItem value="aggregation_manager">Aggregation Manager</SelectItem>
                  <SelectItem value="county_officer">Extension Officer</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Farmer Group Assignment (for farmers) */}
            {(formData.role === "farmer" || formData.role === "lead_farmer") && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Farmer Group (Optional)</label>
                <Select
                  value={formData.farmerGroupId}
                  onValueChange={(value) => setFormData({ ...formData, farmerGroupId: value })}
                >
                  <SelectTrigger className="min-w-[260px]">
                    <SelectValue>
                      {(value) => {
                        if (!value) return "Select farmer group (optional)";
                        const group = farmerGroups.find((g) => g.id === value);
                        return group ? `${group.name} (${group.code})` : "Select farmer group (optional)";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {farmerGroups
                      .filter(group => group.isActive)
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.code})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Aggregation Center Assignment (mandatory for aggregation managers) */}
            {formData.role === "aggregation_manager" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Aggregation Center <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.aggregationCenterId}
                  onValueChange={(value) => setFormData({ ...formData, aggregationCenterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {(value) => {
                        if (!value) return "Select aggregation center (required)";
                        const center = centers.find((c) => c.id === value);
                        if (!center) return "Select aggregation center (required)";
                        const typeLabel = center.centerType === "main" ? "Main" : "Satellite";
                        return `${center.name} (${typeLabel})`;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {centers
                      .filter(center => center.isActive)
                      .map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} ({center.centerType === 'main' ? 'Main' : 'Satellite'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {!formData.aggregationCenterId && (
                  <p className="text-xs text-red-500">Aggregation center is required for aggregation managers</p>
                )}
              </div>
            )}

            {/* County/Subcounty Assignment (for county officers and staff) */}
            {(formData.role === "extension_officer" || formData.role === "staff") && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned County</label>
                  <Input
                    placeholder="e.g., Machakos"
                    value={formData.assignedCounty}
                    onChange={(e) => setFormData({ ...formData, assignedCounty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned Subcounty</label>
                  <Select
                    value={formData.assignedSubCounty}
                    onValueChange={(value) => setFormData({ ...formData, assignedSubCounty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(value) =>
                          value == null || value === ""
                            ? "Select subcounty"
                            : undefined
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {VALID_SUBCOUNTIES.map((subCounty) => (
                        <SelectItem key={subCounty} value={subCounty}>
                          {subCounty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hasAllAccess"
                    checked={formData.hasAllAccess}
                    onChange={(e) => setFormData({ ...formData, hasAllAccess: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="hasAllAccess" className="text-sm font-medium">
                    Grant all access to all counties and subcounties
                  </label>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:items-center">
            {(() => {
              const missing: string[] = [];
              if (!formData.name?.trim()) missing.push("Name");
              if (!formData.phone?.trim()) missing.push("Phone");
              if (!formData.password) missing.push("Password");
              else if (formData.password.length < 8) missing.push("Password (min 8 characters)");
              if (formData.role === "aggregation_manager" && !formData.aggregationCenterId) missing.push("Aggregation center");
              const isDisabled = missing.length > 0;
              return (
                <>
                  {isDisabled && (
                    <p className="text-sm text-muted-foreground w-full sm:w-auto sm:mr-auto">
                      Provide the missing info: {missing.join(", ")}
                    </p>
                  )}
                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateUser} 
                      disabled={isDisabled}
                    >
                      Create User
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk upload farmers (CSV) Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={(open) => !open && closeBulkDialog()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk upload farmers (CSV)</DialogTitle>
            <DialogDescription>
              Upload a CSV file to create multiple farmer users. First row must be a header.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Required: <strong>name</strong>, <strong>phone</strong>. Optional: <strong>password</strong> (min 8 characters; farmers can change it later),{" "}
              <strong>email</strong>, <strong>farmer_group_code</strong>, <strong>county</strong>, <strong>subcounty</strong>,{" "}
              <strong>ward</strong>. Aliases: <code className="text-xs bg-muted px-1 rounded">full_name</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">phone_number</code>, <code className="text-xs bg-muted px-1 rounded">farmer_group</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">pwd</code> (for password).
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">CSV file</label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedBulkFile(file ?? null);
                  setBulkResult(null);
                }}
              />
              {selectedBulkFile && (
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedBulkFile.name}
                </p>
              )}
            </div>
            {bulkResult && (
              <div className="space-y-2 rounded-lg border p-4 bg-muted/30">
                <p className="text-sm font-medium">Result</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">Created: {bulkResult.created}</span>
                  <span className="text-red-600">Failed: {bulkResult.failed}</span>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Row errors:</p>
                    <ul className="text-xs space-y-0.5">
                      {bulkResult.errors.slice(0, 20).map((err, i) => (
                        <li key={i}>
                          Row {err.row}: {err.message}
                        </li>
                      ))}
                      {bulkResult.errors.length > 20 && (
                        <li className="text-muted-foreground">… and {bulkResult.errors.length - 20} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeBulkDialog}>
              {bulkResult ? "Close" : "Cancel"}
            </Button>
            {!bulkResult && (
              <Button
                onClick={handleBulkUpload}
                disabled={!selectedBulkFile || isBulkUploading}
              >
                {isBulkUploading ? "Uploading…" : "Upload"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Management Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Assign and manage permissions for {selectedUser?.role} role
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Current Role: {selectedUser.role}</p>
                <p className="text-xs text-muted-foreground">
                  Permissions can be customized beyond the default role permissions
                </p>
              </div>

              <div className="space-y-4">
                {["read", "write", "delete", "admin"].map((category) => {
                  const categoryPermissions = availablePermissions.filter((p) => p.category === category);
                  if (categoryPermissions.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="font-semibold text-sm capitalize">{category} Permissions</h4>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => {
                          const isGranted = selectedUser.permissions?.includes(permission.id) || false;
                          return (
                            <div
                              key={permission.id}
                              className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {isGranted ? (
                                    <IconCheck className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <IconX className="h-4 w-4 text-gray-400" />
                                  )}
                                  <div>
                                    <p className="font-medium text-sm">{permission.name}</p>
                                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant={isGranted ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const currentPerms = selectedUser.permissions || [];
                                  const newPerms = isGranted
                                    ? currentPerms.filter((p) => p !== permission.id)
                                    : [...currentPerms, permission.id];
                                  setSelectedUser({ ...selectedUser, permissions: newPerms });
                                }}
                              >
                                {isGranted ? "Revoke" : "Grant"}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && handleSavePermissions(selectedUser.id, selectedUser.permissions || [])}
            >
              Save Permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Management Dialog (open on row click) */}
      <Dialog open={isManageUserDialogOpen} onOpenChange={setIsManageUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage User - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              View and manage user role, status, and assignments. You can also perform all existing actions from here.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Core user fields: name, contact, role, status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={manageForm.name}
                    onChange={(e) =>
                      setManageForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={manageForm.email}
                    onChange={(e) =>
                      setManageForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    value={manageForm.phone}
                    onChange={(e) =>
                      setManageForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    value={manageForm.role}
                    onValueChange={(value: UserRole) =>
                      setManageForm((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="lead_farmer">Lead Farmer</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="input_provider">Input Provider</SelectItem>
                      <SelectItem value="transport_provider">Transport Provider</SelectItem>
                      <SelectItem value="aggregation_manager">Aggregation Manager</SelectItem>
                      <SelectItem value="county_officer">Extension Officer</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={manageForm.status}
                    onValueChange={(value: ProfileStatus) =>
                      setManageForm((prev) => ({
                        ...prev,
                        status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assignments (read-only for now, based on role) */}
              <div className="space-y-4">
                {(manageForm.role === "farmer" || manageForm.role === "lead_farmer") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Farmer Group</label>
                    <Select
                      value={manageForm.farmerGroupId}
                      onValueChange={(value) =>
                        setManageForm((prev) => ({ ...prev, farmerGroupId: value }))
                      }
                    >
                      <SelectTrigger className="min-w-[260px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return "Select farmer group (optional)";
                            const group = farmerGroups.find((g) => g.id === value);
                            return group ? `${group.name} (${group.code})` : "Select farmer group (optional)";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {farmerGroups
                          .filter((group) => group.isActive)
                          .map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name} ({group.code})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {manageForm.role === "aggregation_manager" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aggregation Center</label>
                    <Select value={manageForm.aggregationCenterId} disabled>
                      <SelectTrigger>
                        <SelectValue>
                          {(value) => {
                            if (!value) return "No aggregation center assigned";
                            const center = centers.find((c) => c.id === value);
                            if (!center) return "No aggregation center assigned";
                            const typeLabel = center.centerType === "main" ? "Main" : "Satellite";
                            return `${center.name} (${typeLabel})`;
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {centers
                          .filter(center => center.isActive)
                          .map((center) => (
                            <SelectItem key={center.id} value={center.id}>
                              {center.name} ({center.centerType === 'main' ? 'Main' : 'Satellite'})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(manageForm.role === "county_officer" || manageForm.role === "staff") && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assigned County</label>
                      <Input
                        value={manageForm.assignedCounty}
                        onChange={(e) =>
                          setManageForm((prev) => ({ ...prev, assignedCounty: e.target.value }))
                        }
                        placeholder="e.g., Machakos"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assigned Subcounty</label>
                      <Select
                        value={manageForm.assignedSubCounty}
                        onValueChange={(value) =>
                          setManageForm((prev) => ({ ...prev, assignedSubCounty: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(value) => {
                              if (!value) return "Select subcounty";
                              const display = VALID_SUBCOUNTIES.includes(
                                value as (typeof VALID_SUBCOUNTIES)[number]
                              )
                                ? value
                                : value;
                              return display || "Select subcounty";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {VALID_SUBCOUNTIES.map((subCounty) => (
                            <SelectItem key={subCounty} value={subCounty}>
                              {subCounty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={manageForm.hasAllAccess}
                        onChange={(e) =>
                          setManageForm((prev) => ({ ...prev, hasAllAccess: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm">Has all access to all counties and subcounties</span>
                    </div>
                  </>
                )}
              </div>

              {/* Existing actions */}
              <div className="flex flex-wrap gap-3 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleManagePermissions(selectedUser)}
                >
                  <IconKey className="mr-2 h-4 w-4" />
                  Manage Permissions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(selectedUser.id)}
                >
                  <IconShield className="mr-2 h-4 w-4" />
                  Reset Password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeactivate(selectedUser.id)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Deactivate User
                </Button>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsManageUserDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSaveUserManagement}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
