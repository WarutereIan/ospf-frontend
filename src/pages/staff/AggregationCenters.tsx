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
  IconBuilding,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconPackage,
  IconUsers,
} from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAggregation } from "@/contexts/AggregationContext";
import { useProfile } from "@/contexts/ProfileContext";
import type { AggregationCenter } from "@/types/aggregation";
import { createAggregationCenter, updateAggregationCenter } from "@/services/aggregationService";
import { getCounties, getSubCounties, getWards } from "@/services/locationsService";
import { showSuccess, showError } from "@/lib/toast";
import type { County, SubCounty as SubCountyType, Ward as WardType } from "@/types/locations";

/** Form state uses coordinates as "lat,lng" string for the Input. */
type AggregationCenterFormState = Omit<Partial<AggregationCenter>, "coordinates"> & { coordinates?: string };

function parseCoordinates(s: string | undefined): [number, number] | undefined {
  if (!s?.trim()) return undefined;
  const parts = s.split(",").map((p) => parseFloat(p.trim()));
  return parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1]) ? [parts[0], parts[1]] : undefined;
}

export function AggregationCenters() {
  const { centers, fetchCenters, isLoading } = useAggregation();
  const { profiles, fetchProfiles } = useProfile();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<AggregationCenter | null>(null);
  const [formData, setFormData] = useState<AggregationCenterFormState>({
    name: "",
    location: "",
    county: "",
    subCounty: "",
    ward: "",
    coordinates: "",
    centerType: "main",
    mainCenterId: "",
    totalCapacity: 0,
    managerId: "",
    status: "operational",
    isActive: true,
  });

  const [counties, setCounties] = useState<County[]>([]);
  const [subCounties, setSubCounties] = useState<SubCountyType[]>([]);
  const [wards, setWards] = useState<WardType[]>([]);

  // Get aggregation managers for dropdown (case-insensitive role check for API compatibility)
  const aggregationManagers = profiles.filter(
    (p) => String(p.role ?? "").toLowerCase() === "aggregation_manager"
  );

  // Get main centers for satellite center selection
  const mainCenters = centers.filter(c => c.centerType === "main");

  // Fetch centers, managers, and counties on mount
  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  useEffect(() => {
    fetchProfiles({ role: "aggregation_manager" });
  }, [fetchProfiles]);

  useEffect(() => {
    getCounties().then(setCounties).catch(() => setCounties([]));
  }, []);

  // Load subcounties when county changes
  const selectedCounty = counties.find(c => c.name === formData.county);
  useEffect(() => {
    if (selectedCounty?.id) {
      getSubCounties(selectedCounty.id).then(setSubCounties).catch(() => setSubCounties([]));
      setWards([]);
    } else {
      setSubCounties([]);
      setWards([]);
    }
  }, [selectedCounty?.id]);

  // Load wards when subcounty changes
  const selectedSubCounty = subCounties.find(sc => sc.name === formData.subCounty);
  useEffect(() => {
    if (selectedSubCounty?.id) {
      getWards(selectedSubCounty.id).then(setWards).catch(() => setWards([]));
    } else {
      setWards([]);
    }
  }, [selectedSubCounty?.id]);

  const handleCreateCenter = async () => {
    try {
      if (!formData.name || !formData.location || !formData.county || !formData.totalCapacity || !formData.managerId) {
        showError("Please fill in all required fields");
        return;
      }

      if (formData.centerType === "satellite" && !formData.mainCenterId) {
        showError("Main center is required for satellite centers");
        return;
      }

      const payload = parseCoordinates(formData.coordinates)
        ? { ...formData, coordinates: parseCoordinates(formData.coordinates) }
        : { ...formData, coordinates: undefined };
      const result = await createAggregationCenter(payload as Partial<AggregationCenter>);
      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess("Aggregation center created successfully");
      setIsDialogOpen(false);
      resetForm();
      await fetchCenters();
    } catch (error: any) {
      showError(error.message || "Failed to create aggregation center");
    }
  };

  const handleUpdateCenter = async () => {
    if (!selectedCenter) return;

    try {
      const payload = parseCoordinates(formData.coordinates)
        ? { ...formData, coordinates: parseCoordinates(formData.coordinates) }
        : { ...formData, coordinates: undefined };
      const result = await updateAggregationCenter(selectedCenter.id, payload as Partial<AggregationCenter>);
      if (result.error) {
        showError(result.error);
        return;
      }

      showSuccess("Aggregation center updated successfully");
      setIsEditDialogOpen(false);
      setSelectedCenter(null);
      resetForm();
      await fetchCenters();
    } catch (error: any) {
      showError(error.message || "Failed to update aggregation center");
    }
  };

  const openEditDialog = (center: AggregationCenter) => {
    setSelectedCenter(center);
    const coords =
      Array.isArray(center.coordinates) && center.coordinates.length === 2
        ? `${center.coordinates[0]},${center.coordinates[1]}`
        : "";
    setFormData({
      name: center.name,
      location: center.location,
      county: center.county,
      subCounty: center.subCounty || "",
      ward: center.ward || "",
      coordinates: coords,
      centerType: center.centerType,
      mainCenterId: center.mainCenterId || "",
      totalCapacity: center.totalCapacity ?? center.capacity ?? 0,
      managerId: center.managerId || "",
      status: center.status,
      isActive: center.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      county: "",
      subCounty: "",
      ward: "",
      coordinates: "",
      centerType: "main",
      mainCenterId: "",
      totalCapacity: 0,
      managerId: "",
      status: "operational",
      isActive: true,
    });
  };

  const filteredCenters = centers.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || center.centerType === typeFilter;
    const matchesStatus = statusFilter === "all" || center.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Aggregation Centers</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create and manage aggregation centers
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Center
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="main">Main</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Aggregation Centers ({filteredCenters.length})</CardTitle>
          <CardDescription>Manage aggregation centers and their configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredCenters.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCenters.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell className="font-medium">{center.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{center.code ?? center.id.slice(0, 8)}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {center.centerType === "main" ? "Main" : "Satellite"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <IconMapPin className="h-3 w-3" />
                        {center.county}
                        {center.subCounty && `, ${center.subCounty}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <IconPackage className="h-3 w-3" />
                        {(center.currentStock || 0).toLocaleString()} / {(center.capacity || 0).toLocaleString()} kg
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(center.status || "operational")}>
                        {center.status || "operational"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(center)}
                        title="Edit Center"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <IconBuilding className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No aggregation centers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Center Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Aggregation Center</DialogTitle>
            <DialogDescription>Create a new aggregation center with location and capacity details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Center Name *</label>
              <Input
                placeholder="e.g., Kangundo Main Aggregation Center"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                placeholder="e.g., Kangundo Market"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">County *</label>
                <Select
                  value={formData.county || ""}
                  onValueChange={(value) => setFormData({ ...formData, county: value, subCounty: undefined, ward: undefined })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.county || "Select county"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subcounty</label>
                <Select
                  value={formData.subCounty || ""}
                  onValueChange={(value) => setFormData({ ...formData, subCounty: value || undefined, ward: undefined })}
                  disabled={subCounties.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.subCounty || "Select subcounty"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subCounties.map((sc) => (
                      <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward (Optional)</label>
              <Select
                value={formData.ward || ""}
                onValueChange={(value) => setFormData({ ...formData, ward: value || undefined })}
                disabled={wards.length === 0}
              >
                <SelectTrigger>
                  <SelectValue>{formData.ward || "Select ward"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coordinates (lat,lng)</label>
              <Input
                placeholder="e.g., -1.2921,36.8219"
                value={formData.coordinates ?? ""}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Center Type *</label>
              <Select
                value={formData.centerType}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  centerType: value as "main" | "satellite",
                  mainCenterId: value === "main" ? "" : formData.mainCenterId,
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Center</SelectItem>
                  <SelectItem value="satellite">Satellite Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.centerType === "satellite" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Center *</label>
                <Select
                  value={formData.mainCenterId}
                  onValueChange={(value) => setFormData({ ...formData, mainCenterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.mainCenterId ? (mainCenters.find((c) => c.id === formData.mainCenterId)?.name ?? formData.mainCenterId) : "Select main center"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mainCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Capacity (kg) *</label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={formData.totalCapacity || ""}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manager *</label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => setFormData({ ...formData, managerId: value })}
              >
                <SelectTrigger>
                  <SelectValue>{formData.managerId ? (aggregationManagers.find((m) => m.id === formData.managerId)?.name ?? formData.managerId) : "Select aggregation manager"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {aggregationManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCenter} 
              disabled={
                !formData.name || 
                !formData.location || 
                !formData.county || 
                !formData.totalCapacity || 
                !formData.managerId ||
                (formData.centerType === "satellite" && !formData.mainCenterId)
              }
            >
              Create Center
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Center Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Aggregation Center</DialogTitle>
            <DialogDescription>Update aggregation center information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Center Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location *</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">County *</label>
                <Select
                  value={formData.county || ""}
                  onValueChange={(value) => setFormData({ ...formData, county: value, subCounty: undefined, ward: undefined })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.county || "Select county"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((c) => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subcounty</label>
                <Select
                  value={formData.subCounty || ""}
                  onValueChange={(value) => setFormData({ ...formData, subCounty: value || undefined, ward: undefined })}
                  disabled={subCounties.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.subCounty || "Select subcounty"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {subCounties.map((sc) => (
                      <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ward (Optional)</label>
              <Select
                value={formData.ward || ""}
                onValueChange={(value) => setFormData({ ...formData, ward: value || undefined })}
                disabled={wards.length === 0}
              >
                <SelectTrigger>
                  <SelectValue>{formData.ward || "Select ward"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {wards.map((w) => (
                    <SelectItem key={w.id} value={w.name}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Coordinates</label>
              <Input
                value={formData.coordinates ?? ""}
                onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Center Type</label>
              <Select
                value={formData.centerType}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  centerType: value as "main" | "satellite",
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Center</SelectItem>
                  <SelectItem value="satellite">Satellite Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.centerType === "satellite" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Main Center</label>
                <Select
                  value={formData.mainCenterId}
                  onValueChange={(value) => setFormData({ ...formData, mainCenterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.mainCenterId ? (mainCenters.find((c) => c.id === formData.mainCenterId)?.name ?? formData.mainCenterId) : "Select main center"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {mainCenters.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Capacity (kg) *</label>
              <Input
                type="number"
                value={formData.totalCapacity || ""}
                onChange={(e) => setFormData({ ...formData, totalCapacity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Manager</label>
              <Select
                value={formData.managerId}
                onValueChange={(value) => setFormData({ ...formData, managerId: value })}
              >
                <SelectTrigger>
                  <SelectValue>{formData.managerId ? (aggregationManagers.find((m) => m.id === formData.managerId)?.name ?? formData.managerId) : "Select aggregation manager"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {aggregationManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCenter} 
              disabled={
                !formData.name || 
                !formData.location || 
                !formData.county || 
                !formData.totalCapacity
              }
            >
              Update Center
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
