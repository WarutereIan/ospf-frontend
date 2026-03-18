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
  IconDownload,
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
import { getCounties, getSubCounties, getWards, getVillages } from "@/services/locationsService";
import type { County, SubCounty as SubCountyType, Ward as WardType, Village as VillageType } from "@/types/locations";

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

  // Cascading location state for create dialog
  const [counties, setCounties] = useState<County[]>([]);
  const [subCounties, setSubCounties] = useState<SubCountyType[]>([]);
  const [wards, setWards] = useState<WardType[]>([]);
  const [villages, setVillages] = useState<VillageType[]>([]);

  // Cascading location state for manage dialog
  const [mCounties, setMCounties] = useState<County[]>([]);
  const [mSubCounties, setMSubCounties] = useState<SubCountyType[]>([]);
  const [mWards, setMWards] = useState<WardType[]>([]);
  const [mVillages, setMVillages] = useState<VillageType[]>([]);

  // Cascading location state for officer (create + manage)
  const [oSubCounties, setOSubCounties] = useState<SubCountyType[]>([]);
  const [oWards, setOWards] = useState<WardType[]>([]);
  const [moSubCounties, setMoSubCounties] = useState<SubCountyType[]>([]);
  const [moWards, setMoWards] = useState<WardType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "farmer" as UserRole,
    farmerGroupId: "",
    aggregationCenterId: "",
    // Location fields for farmer / lead_farmer
    countyId: "",
    subCountyId: "",
    wardId: "",
    villageId: "",
    assignedVillageIds: [] as string[],
    // County staff fields (store IDs for cascading, resolved to names on save)
    officerCountyId: "",
    officerSubCountyId: "",
    officerWardId: "",
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
    // Location fields for farmer / lead_farmer
    countyId: "",
    subCountyId: "",
    wardId: "",
    villageId: "",
    assignedVillageIds: [] as string[],
    // County staff fields
    officerCountyId: "",
    officerSubCountyId: "",
    officerWardId: "",
    hasAllAccess: false,
  });

  const [sortColumn, setSortColumn] = useState<UsersSortColumn | null>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isBulkDeactivating, setIsBulkDeactivating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkResettingPasswords, setIsBulkResettingPasswords] = useState(false);

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

  // Load counties on mount (shared by both create and manage dialogs)
  useEffect(() => {
    getCounties().then((c) => { setCounties(c); setMCounties(c); });
  }, []);

  // Create dialog: cascading subcounties when county changes
  useEffect(() => {
    if (formData.countyId) {
      getSubCounties(formData.countyId).then(setSubCounties);
    } else {
      setSubCounties([]);
    }
    setWards([]);
    setVillages([]);
  }, [formData.countyId]);

  // Create dialog: cascading wards when subcounty changes
  useEffect(() => {
    if (formData.subCountyId) {
      getWards(formData.subCountyId).then(setWards);
    } else {
      setWards([]);
    }
    setVillages([]);
  }, [formData.subCountyId]);

  // Create dialog: cascading villages when ward changes
  useEffect(() => {
    if (formData.wardId) {
      getVillages(formData.wardId).then(setVillages);
    } else {
      setVillages([]);
    }
  }, [formData.wardId]);

  // Manage dialog: cascading subcounties when county changes
  useEffect(() => {
    if (manageForm.countyId) {
      getSubCounties(manageForm.countyId).then(setMSubCounties);
    } else {
      setMSubCounties([]);
    }
    setMWards([]);
    setMVillages([]);
  }, [manageForm.countyId]);

  // Manage dialog: cascading wards when subcounty changes
  useEffect(() => {
    if (manageForm.subCountyId) {
      getWards(manageForm.subCountyId).then(setMWards);
    } else {
      setMWards([]);
    }
    setMVillages([]);
  }, [manageForm.subCountyId]);

  // Manage dialog: cascading villages when ward changes
  useEffect(() => {
    if (manageForm.wardId) {
      getVillages(manageForm.wardId).then(setMVillages);
    } else {
      setMVillages([]);
    }
  }, [manageForm.wardId]);

  // Officer create dialog: cascading subcounties when county changes
  useEffect(() => {
    if (formData.officerCountyId) {
      getSubCounties(formData.officerCountyId).then(setOSubCounties);
    } else {
      setOSubCounties([]);
    }
    setOWards([]);
  }, [formData.officerCountyId]);

  // Officer create dialog: cascading wards when subcounty changes
  useEffect(() => {
    if (formData.officerSubCountyId) {
      getWards(formData.officerSubCountyId).then(setOWards);
    } else {
      setOWards([]);
    }
  }, [formData.officerSubCountyId]);

  // Officer manage dialog: cascading subcounties when county changes
  useEffect(() => {
    if (manageForm.officerCountyId) {
      getSubCounties(manageForm.officerCountyId).then(setMoSubCounties);
    } else {
      setMoSubCounties([]);
    }
    setMoWards([]);
  }, [manageForm.officerCountyId]);

  // Officer manage dialog: cascading wards when subcounty changes
  useEffect(() => {
    if (manageForm.officerSubCountyId) {
      getWards(manageForm.officerSubCountyId).then(setMoWards);
    } else {
      setMoWards([]);
    }
  }, [manageForm.officerSubCountyId]);

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
        // lastLogin
        const aLogin = (a as Profile).lastLogin ?? "";
        const bLogin = (b as Profile).lastLogin ?? "";
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

      // Resolve location names from IDs for display/storage
      const countyName = counties.find((c) => c.id === formData.countyId)?.name;
      const subCountyName = subCounties.find((s) => s.id === formData.subCountyId)?.name;
      const wardName = wards.find((w) => w.id === formData.wardId)?.name;
      const villageName = villages.find((v) => v.id === formData.villageId)?.name;

      // Resolve officer location names
      const officerCountyName = counties.find((c) => c.id === formData.officerCountyId)?.name;
      const officerSubCountyName = oSubCounties.find((s) => s.id === formData.officerSubCountyId)?.name;
      const officerWardName = oWards.find((w) => w.id === formData.officerWardId)?.name;

      await createUser({
        email: formData.email?.trim() ?? "",
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        profile: {
          firstName,
          lastName,
          county: countyName,
          subcounty: subCountyName,
          ward: wardName,
          village: villageName,
          countyId: formData.countyId || undefined,
          subCountyId: formData.subCountyId || undefined,
          wardId: formData.wardId || undefined,
          villageId: formData.villageId || undefined,
          farmerGroupId: formData.farmerGroupId || undefined,
          aggregationCenterId: formData.aggregationCenterId || undefined,
          assignedVillageIds: formData.assignedVillageIds.length > 0 ? formData.assignedVillageIds : undefined,
          assignedCounty: officerCountyName || undefined,
          assignedSubCounty: officerSubCountyName || undefined,
          assignedWard: officerWardName || undefined,
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
        countyId: "",
        subCountyId: "",
        wardId: "",
        villageId: "",
        assignedVillageIds: [],
        officerCountyId: "",
        officerSubCountyId: "",
        officerWardId: "",
        hasAllAccess: false,
      });
      
      // Refresh profiles list
      await fetchProfiles({ role: roleFilter !== "all" ? (roleFilter as any) : undefined });
    } catch (error: any) {
      showError(error.message || "Failed to create user");
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm("Are you sure you want to reset this user's password? A new password will be generated and sent to the user via SMS/email.")) {
      return;
    }

    try {
      await resetUserPassword(userId);
      showSuccess("Password reset successfully. A new password has been sent to the user via SMS/email.");
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

  const handleBulkResetPasswords = async () => {
    if (selectedUserIds.size === 0) return;
    if (!confirm(`Reset passwords for ${selectedUserIds.size} selected user(s)? New passwords will be generated and sent to each user via SMS/email.`)) {
      return;
    }
    setIsBulkResettingPasswords(true);
    let succeeded = 0;
    let failed = 0;
    try {
      for (const id of selectedUserIds) {
        try {
          await resetUserPassword(id);
          succeeded++;
        } catch {
          failed++;
        }
      }
      if (succeeded > 0) {
        showSuccess(
          succeeded === selectedUserIds.size
            ? `All ${succeeded} passwords reset. New passwords sent via SMS/email.`
            : `Reset ${succeeded} password(s). ${failed} failed. New passwords sent via SMS/email.`
        );
      }
      if (failed > 0 && succeeded === 0) {
        showError("Failed to reset passwords for selected users.");
      }
      setSelectedUserIds(new Set());
    } catch {
      showError("Bulk password reset failed.");
    } finally {
      setIsBulkResettingPasswords(false);
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
    // Reverse-lookup officer county/subcounty IDs from stored name strings
    const officerCounty = mCounties.find(
      (c) => c.name.toLowerCase() === (u.assignedCounty ?? "").toLowerCase()
    );
    setManageForm({
      name,
      email: u.email ?? "",
      phone: u.phone ?? "",
      role: role || "farmer",
      status: status || "active",
      farmerGroupId: u.farmerGroupId ?? "",
      aggregationCenterId: u.aggregationCenterId ?? "",
      countyId: u.countyId ?? "",
      subCountyId: u.subCountyId ?? "",
      wardId: u.wardId ?? "",
      villageId: u.villageId ?? "",
      assignedVillageIds: u.assignedVillageIds ?? [],
      officerCountyId: officerCounty?.id ?? "",
      officerSubCountyId: "",
      officerWardId: "",
      hasAllAccess: Boolean(u.hasAllAccess),
    });

    // Load subcounties for the officer county, then find the matching one
    if (officerCounty?.id) {
      getSubCounties(officerCounty.id).then((subs) => {
        setMoSubCounties(subs);
        const officerSub = subs.find(
          (s) => s.name.toLowerCase() === (u.assignedSubCounty ?? "").toLowerCase()
        );
        if (officerSub) {
          setManageForm((prev) => ({ ...prev, officerSubCountyId: officerSub.id }));
          getWards(officerSub.id).then((w) => {
            setMoWards(w);
            const officerWard = w.find(
              (wd) => wd.name.toLowerCase() === (u.assignedWard ?? "").toLowerCase()
            );
            if (officerWard) {
              setManageForm((prev) => ({ ...prev, officerWardId: officerWard.id }));
            }
          });
        }
      });
    }

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

      // Resolve location names from IDs for farmer/lead_farmer
      const mCountyName = mCounties.find((c) => c.id === manageForm.countyId)?.name;
      const mSubCountyName = mSubCounties.find((s) => s.id === manageForm.subCountyId)?.name;
      const mWardName = mWards.find((w) => w.id === manageForm.wardId)?.name;
      const mVillageName = mVillages.find((v) => v.id === manageForm.villageId)?.name;

      // Update profile fields (name + role-specific assignments)
      await updateProfile(selectedUser.id, {
        firstName,
        lastName,
        // Persist farmer/lead_farmer location + group
        ...((manageForm.role === "farmer" || manageForm.role === "lead_farmer") && {
          county: mCountyName,
          subCounty: mSubCountyName,
          ward: mWardName,
          village: mVillageName,
          countyId: manageForm.countyId || undefined,
          subCountyId: manageForm.subCountyId || undefined,
          wardId: manageForm.wardId || undefined,
          villageId: manageForm.villageId || undefined,
          farmerGroupId: manageForm.farmerGroupId || undefined,
          assignedVillageIds: manageForm.assignedVillageIds.length > 0 ? manageForm.assignedVillageIds : [],
        }),
        // Persist county staff assignments when applicable
        ...((manageForm.role === "county_officer" || manageForm.role === "staff") && {
          assignedCounty: mCounties.find((c) => c.id === manageForm.officerCountyId)?.name || undefined,
          assignedSubCounty: moSubCounties.find((s) => s.id === manageForm.officerSubCountyId)?.name || undefined,
          assignedWard: moWards.find((w) => w.id === manageForm.officerWardId)?.name || undefined,
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

  const downloadBulkResultCsv = () => {
    if (!bulkResult?.details?.length) return;
    const header = "Row,Name,Phone,Status,Message";
    const rows = bulkResult.details.map((d) => {
      const escapeCsv = (v: string) => `"${v.replace(/"/g, '""')}"`;
      return `${d.row},${escapeCsv(d.name)},${escapeCsv(d.phone)},${d.status},${escapeCsv(d.message)}`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bulk-upload-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** Download CSV template for bulk farmer upload (headers + example rows). */
  const downloadBulkFarmersTemplate = () => {
    const header = "first_name,last_name,gender,phone,password,email,county,subcounty,ward,village";
    const exampleRows = [
      "John,Kamau,Male,+254712345678,SecurePass123!,john.kamau@example.com,Machakos,Kangundo,Mutonga,",
      "Mary,Wanjiku,Female,+254723456789,,mary.w@example.com,Machakos,Kathiani,Kathiani Central,",
      ",,,,,,,,,,",
    ];
    const csv = [header, ...exampleRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-farmers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
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
                variant="outline"
                size="sm"
                onClick={handleBulkResetPasswords}
                disabled={isBulkDeactivating || isBulkDeleting || isBulkResettingPasswords}
              >
                {isBulkResettingPasswords ? "Resetting…" : "Reset passwords"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeactivate}
                disabled={isBulkDeactivating || isBulkDeleting || isBulkResettingPasswords}
              >
                {isBulkDeactivating ? "Deactivating…" : "Deactivate selected"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeactivating || isBulkDeleting || isBulkResettingPasswords}
              >
                {isBulkDeleting ? "Deleting…" : "Delete selected"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds(new Set())} disabled={isBulkDeactivating || isBulkDeleting || isBulkResettingPasswords}>
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
                    <TableCell>
                      {(user as Profile).lastLogin
                        ? new Date((user as Profile).lastLogin!).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
                        : "N/A"}
                    </TableCell>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  farmerGroupId: "",
                  aggregationCenterId: "",
                  countyId: "",
                  subCountyId: "",
                  wardId: "",
                  villageId: "",
                  assignedVillageIds: [],
                  officerCountyId: "",
                  officerSubCountyId: "",
                  officerWardId: "",
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

            {/* Location Assignment (for farmers / lead farmers) */}
            {(formData.role === "farmer" || formData.role === "lead_farmer") && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Location</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* County */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">County</label>
                    <Select
                      value={formData.countyId}
                      onValueChange={(value) => setFormData({ ...formData, countyId: value, subCountyId: "", wardId: "", villageId: "", assignedVillageIds: [] })}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">Select county</span>;
                            return counties.find((c) => c.id === value)?.name ?? "Select county";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sub-County */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Sub-County</label>
                    <Select
                      value={formData.subCountyId}
                      onValueChange={(value) => setFormData({ ...formData, subCountyId: value, wardId: "", villageId: "", assignedVillageIds: [] })}
                      disabled={!formData.countyId}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">{formData.countyId ? "Select sub-county" : "Select county first"}</span>;
                            return subCounties.find((s) => s.id === value)?.name ?? "Select sub-county";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {subCounties.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Ward */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ward</label>
                    <Select
                      value={formData.wardId}
                      onValueChange={(value) => setFormData({ ...formData, wardId: value, villageId: "", assignedVillageIds: [] })}
                      disabled={!formData.subCountyId}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">{formData.subCountyId ? "Select ward" : "Select sub-county first"}</span>;
                            return wards.find((w) => w.id === value)?.name ?? "Select ward";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Village (single for farmer) */}
                  {formData.role === "farmer" && (
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Village</label>
                      <Select
                        value={formData.villageId}
                        onValueChange={(value) => setFormData({ ...formData, villageId: value })}
                        disabled={!formData.wardId}
                      >
                        <SelectTrigger className="max-w-[220px]">
                          <SelectValue>
                            {(value) => {
                              if (!value) return <span className="text-muted-foreground">{formData.wardId ? "Select village" : "Select ward first"}</span>;
                              return villages.find((v) => v.id === value)?.name ?? "Select village";
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {villages.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Multiple villages for lead farmer */}
                {formData.role === "lead_farmer" && formData.wardId && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      Assigned Villages ({formData.assignedVillageIds.length} selected)
                    </label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                      {villages.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-1">No villages in this ward</p>
                      ) : (
                        villages.map((v) => (
                          <label key={v.id} className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer">
                            <Checkbox
                              checked={formData.assignedVillageIds.includes(v.id)}
                              onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  assignedVillageIds: checked
                                    ? [...prev.assignedVillageIds, v.id]
                                    : prev.assignedVillageIds.filter((id) => id !== v.id),
                                }));
                              }}
                            />
                            <span className="text-sm">{v.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Farmer Group (optional, secondary) */}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Farmer Group (Optional)</label>
                  <Select
                    value={formData.farmerGroupId}
                    onValueChange={(value) => setFormData({ ...formData, farmerGroupId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {(value) => {
                          if (!value) return <span className="text-muted-foreground">Select farmer group (optional)</span>;
                          const group = farmerGroups.find((g) => g.id === value);
                          return group ? `${group.name} (${group.code})` : value;
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

            {/* Assigned Area (for county officers and staff) */}
            {(formData.role === "county_officer" || formData.role === "staff") && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Assigned Area</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">County</label>
                    <Select
                      value={formData.officerCountyId}
                      onValueChange={(value) => setFormData({ ...formData, officerCountyId: value, officerSubCountyId: "", officerWardId: "" })}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">Select county</span>;
                            return counties.find((c) => c.id === value)?.name ?? "Select county";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {counties.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Sub-County</label>
                    <Select
                      value={formData.officerSubCountyId}
                      onValueChange={(value) => setFormData({ ...formData, officerSubCountyId: value, officerWardId: "" })}
                      disabled={!formData.officerCountyId}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">{formData.officerCountyId ? "Select sub-county" : "Select county first"}</span>;
                            return oSubCounties.find((s) => s.id === value)?.name ?? "Select sub-county";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {oSubCounties.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ward (Optional)</label>
                    <Select
                      value={formData.officerWardId}
                      onValueChange={(value) => setFormData({ ...formData, officerWardId: value })}
                      disabled={!formData.officerSubCountyId}
                    >
                      <SelectTrigger className="max-w-[220px]">
                        <SelectValue>
                          {(value) => {
                            if (!value) return <span className="text-muted-foreground">{formData.officerSubCountyId ? "Select ward (optional)" : "Select sub-county first"}</span>;
                            return oWards.find((w) => w.id === value)?.name ?? "Select ward";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {oWards.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAllAccess"
                    checked={formData.hasAllAccess}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasAllAccess: !!checked })}
                  />
                  <label htmlFor="hasAllAccess" className="text-sm">
                    Grant all access to all counties and subcounties
                  </label>
                </div>
              </div>
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
              Required: <strong>phone</strong> and either <strong>name</strong> or <strong>first_name</strong> / <strong>last_name</strong>. Optional:{" "}
              <strong>gender</strong> (male/female or m/f; normalized to Male/Female), <strong>password</strong> (min 8 characters), <strong>email</strong>,{" "}
              <strong>county</strong>, <strong>subcounty</strong>, <strong>ward</strong>, <strong>village</strong>. Aliases:{" "}
              <code className="text-xs bg-muted px-1 rounded">full_name</code>, <code className="text-xs bg-muted px-1 rounded">phone_number</code>,{" "}
              <code className="text-xs bg-muted px-1 rounded">sex</code>, <code className="text-xs bg-muted px-1 rounded">pwd</code>.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={downloadBulkFarmersTemplate} className="w-full sm:w-auto">
              <IconDownload className="mr-2 h-4 w-4" />
              Download CSV template
            </Button>
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
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Result</p>
                  {(bulkResult.details ?? []).length > 0 && (
                    <Button type="button" variant="outline" size="sm" onClick={downloadBulkResultCsv}>
                      <IconDownload className="mr-2 h-4 w-4" />
                      Download results CSV
                    </Button>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">Created: {bulkResult.created ?? 0}</span>
                  <span className="text-red-600 font-medium">Failed: {bulkResult.failed ?? 0}</span>
                  <span className="text-muted-foreground">Total: {(bulkResult.created ?? 0) + (bulkResult.failed ?? 0)}</span>
                </div>
                {(bulkResult.details ?? []).length > 0 && (
                  <div className="mt-2 max-h-52 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs py-1 px-2">Row</TableHead>
                          <TableHead className="text-xs py-1 px-2">Name</TableHead>
                          <TableHead className="text-xs py-1 px-2">Phone</TableHead>
                          <TableHead className="text-xs py-1 px-2">Status</TableHead>
                          <TableHead className="text-xs py-1 px-2">Message</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(bulkResult.details ?? []).map((d, i) => (
                          <TableRow key={i} className={d.status === "failed" ? "bg-red-50" : "bg-green-50"}>
                            <TableCell className="text-xs py-1 px-2">{d.row}</TableCell>
                            <TableCell className="text-xs py-1 px-2">{d.name || "-"}</TableCell>
                            <TableCell className="text-xs py-1 px-2">{d.phone || "-"}</TableCell>
                            <TableCell className="text-xs py-1 px-2">
                              <Badge variant={d.status === "created" ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                                {d.status === "created" ? "Created" : "Failed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs py-1 px-2 max-w-[200px] truncate" title={d.message}>{d.message}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

              {/* Assignments based on role */}
              <div className="space-y-4">
                {(manageForm.role === "farmer" || manageForm.role === "lead_farmer") && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Location</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* County */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">County</label>
                        <Select
                          value={manageForm.countyId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, countyId: value, subCountyId: "", wardId: "", villageId: "", assignedVillageIds: [] }))
                          }
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">Select county</span>;
                                return mCounties.find((c) => c.id === value)?.name ?? "Select county";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {mCounties.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sub-County */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sub-County</label>
                        <Select
                          value={manageForm.subCountyId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, subCountyId: value, wardId: "", villageId: "", assignedVillageIds: [] }))
                          }
                          disabled={!manageForm.countyId}
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">{manageForm.countyId ? "Select sub-county" : "Select county first"}</span>;
                                return mSubCounties.find((s) => s.id === value)?.name ?? "Select sub-county";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {mSubCounties.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ward */}
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Ward</label>
                        <Select
                          value={manageForm.wardId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, wardId: value, villageId: "", assignedVillageIds: [] }))
                          }
                          disabled={!manageForm.subCountyId}
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">{manageForm.subCountyId ? "Select ward" : "Select sub-county first"}</span>;
                                return mWards.find((w) => w.id === value)?.name ?? "Select ward";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {mWards.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Village (single for farmer) */}
                      {manageForm.role === "farmer" && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Village</label>
                          <Select
                            value={manageForm.villageId}
                            onValueChange={(value) =>
                              setManageForm((prev) => ({ ...prev, villageId: value }))
                            }
                            disabled={!manageForm.wardId}
                          >
                            <SelectTrigger className="max-w-[220px]">
                              <SelectValue>
                                {(value) => {
                                  if (!value) return <span className="text-muted-foreground">{manageForm.wardId ? "Select village" : "Select ward first"}</span>;
                                  return mVillages.find((v) => v.id === value)?.name ?? "Select village";
                                }}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {mVillages.map((v) => (
                                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Multiple villages for lead farmer */}
                    {manageForm.role === "lead_farmer" && manageForm.wardId && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          Assigned Villages ({manageForm.assignedVillageIds.length} selected)
                        </label>
                        <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                          {mVillages.length === 0 ? (
                            <p className="text-xs text-muted-foreground p-1">No villages in this ward</p>
                          ) : (
                            mVillages.map((v) => (
                              <label key={v.id} className="flex items-center gap-2 p-1 hover:bg-muted rounded cursor-pointer">
                                <Checkbox
                                  checked={manageForm.assignedVillageIds.includes(v.id)}
                                  onCheckedChange={(checked) => {
                                    setManageForm((prev) => ({
                                      ...prev,
                                      assignedVillageIds: checked
                                        ? [...prev.assignedVillageIds, v.id]
                                        : prev.assignedVillageIds.filter((id) => id !== v.id),
                                    }));
                                  }}
                                />
                                <span className="text-sm">{v.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Farmer Group (optional) */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Farmer Group (Optional)</label>
                      <Select
                        value={manageForm.farmerGroupId}
                        onValueChange={(value) =>
                          setManageForm((prev) => ({ ...prev, farmerGroupId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(value) => {
                              if (!value) return <span className="text-muted-foreground">Select farmer group (optional)</span>;
                              const group = farmerGroups.find((g) => g.id === value);
                              return group ? `${group.name} (${group.code})` : value;
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
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Assigned Area</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">County</label>
                        <Select
                          value={manageForm.officerCountyId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, officerCountyId: value, officerSubCountyId: "", officerWardId: "" }))
                          }
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">Select county</span>;
                                return mCounties.find((c) => c.id === value)?.name ?? "Select county";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {mCounties.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Sub-County</label>
                        <Select
                          value={manageForm.officerSubCountyId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, officerSubCountyId: value, officerWardId: "" }))
                          }
                          disabled={!manageForm.officerCountyId}
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">{manageForm.officerCountyId ? "Select sub-county" : "Select county first"}</span>;
                                return moSubCounties.find((s) => s.id === value)?.name ?? "Select sub-county";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {moSubCounties.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Ward (Optional)</label>
                        <Select
                          value={manageForm.officerWardId}
                          onValueChange={(value) =>
                            setManageForm((prev) => ({ ...prev, officerWardId: value }))
                          }
                          disabled={!manageForm.officerSubCountyId}
                        >
                          <SelectTrigger className="max-w-[220px]">
                            <SelectValue>
                              {(value) => {
                                if (!value) return <span className="text-muted-foreground">{manageForm.officerSubCountyId ? "Select ward (optional)" : "Select sub-county first"}</span>;
                                return moWards.find((w) => w.id === value)?.name ?? "Select ward";
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {moWards.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={manageForm.hasAllAccess}
                        onCheckedChange={(checked) =>
                          setManageForm((prev) => ({ ...prev, hasAllAccess: !!checked }))
                        }
                      />
                      <span className="text-sm">Grant all access to all counties and subcounties</span>
                    </div>
                  </div>
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
