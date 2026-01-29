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
import {
  IconSearch,
  IconUsers,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getFarmerGroups,
  createFarmerGroup,
  updateFarmerGroup,
  deleteFarmerGroup,
  type FarmerGroup,
  type CreateFarmerGroupData,
} from "@/services/farmerGroupService";
import { VALID_SUBCOUNTIES } from "@/constants/locations";
import { showSuccess, showError } from "@/lib/toast";

export function FarmerGroups() {
  const [groups, setGroups] = useState<FarmerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [subCountyFilter, setSubCountyFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<FarmerGroup | null>(null);
  const [formData, setFormData] = useState<CreateFarmerGroupData>({
    name: "",
    description: "",
    county: "",
    subCounty: "",
    ward: "",
    isActive: true,
  });

  // Get unique counties and subcounties for filters
  const counties = Array.from(new Set(groups.map(g => g.county))).sort();
  const subCounties = Array.from(
    new Set(
      groups
        .filter(g => countyFilter === "all" || g.county === countyFilter)
        .map(g => g.subCounty)
    )
  ).sort();

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const fetchedGroups = await getFarmerGroups({
        county: countyFilter !== "all" ? countyFilter : undefined,
        subCounty: subCountyFilter !== "all" ? subCountyFilter : undefined,
        search: searchQuery || undefined,
      });
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching farmer groups:", error);
      showError("Failed to load farmer groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [countyFilter, subCountyFilter]);

  const handleCreateGroup = async () => {
    try {
      if (!formData.name || !formData.county || !formData.subCounty) {
        showError("Please fill in all required fields");
        return;
      }

      await createFarmerGroup(formData);
      showSuccess("Farmer group created successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        county: "",
        subCounty: "",
        ward: "",
        isActive: true,
      });
      await fetchGroups();
    } catch (error: any) {
      showError(error.message || "Failed to create farmer group");
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    try {
      await updateFarmerGroup(selectedGroup.id, formData);
      showSuccess("Farmer group updated successfully");
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      await fetchGroups();
    } catch (error: any) {
      showError(error.message || "Failed to update farmer group");
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Are you sure you want to delete this farmer group?")) {
      return;
    }

    try {
      await deleteFarmerGroup(id);
      showSuccess("Farmer group deleted successfully");
      await fetchGroups();
    } catch (error: any) {
      showError(error.message || "Failed to delete farmer group");
    }
  };

  const openEditDialog = (group: FarmerGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      county: group.county,
      subCounty: group.subCounty,
      ward: group.ward || "",
      isActive: group.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Farmer Groups</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage farmer groups by location
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <Select value={countyFilter} onValueChange={setCountyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue>{countyFilter === "all" ? "All Counties" : undefined}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subCountyFilter} onValueChange={setSubCountyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue>{subCountyFilter === "all" ? "All Subcounties" : undefined}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcounties</SelectItem>
                {subCounties.map((subCounty) => (
                  <SelectItem key={subCounty} value={subCounty}>
                    {subCounty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Farmer Groups ({filteredGroups.length})</CardTitle>
          <CardDescription>Manage farmer groups and their members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{group.code}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <IconMapPin className="h-3 w-3" />
                        {group.county}, {group.subCounty}
                        {group.ward && `, ${group.ward}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{group.memberCount || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={group.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {group.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(group)}
                          title="Edit Group"
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          title="Delete Group"
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
              <p className="text-muted-foreground">No farmer groups found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Group Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Farmer Group</DialogTitle>
            <DialogDescription>Create a new farmer group assigned to a location</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name *</label>
              <Input
                placeholder="e.g., Kangundo Farmers Cooperative"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">County *</label>
              <Input
                placeholder="e.g., Machakos"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcounty *</label>
              <Select
                value={formData.subCounty}
                onValueChange={(value) => setFormData({ ...formData, subCounty: value })}
              >
                <SelectTrigger>
                  <SelectValue>{formData.subCounty ? undefined : "Select subcounty"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {VALID_SUBCOUNTIES.map((subCounty) => (
                    <SelectItem key={subCounty} value={subCounty}>
                      {subCounty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward (Optional)</label>
              <Input
                placeholder="e.g., Kangundo North"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Ward assignment is optional</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup} disabled={!formData.name || !formData.county || !formData.subCounty}>
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Farmer Group</DialogTitle>
            <DialogDescription>Update farmer group information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">County *</label>
              <Input
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcounty *</label>
              <Select
                value={formData.subCounty}
                onValueChange={(value) => setFormData({ ...formData, subCounty: value })}
              >
                <SelectTrigger>
                  <SelectValue>{formData.subCounty ? undefined : "Select subcounty"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {VALID_SUBCOUNTIES.map((subCounty) => (
                    <SelectItem key={subCounty} value={subCounty}>
                      {subCounty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward (Optional)</label>
              <Input
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Ward assignment is optional</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="editIsActive" className="text-sm font-medium">
                Active
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup} disabled={!formData.name || !formData.county || !formData.subCounty}>
              Update Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
