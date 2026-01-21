import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconTruck,
  IconCalendar,
  IconMapPin,
  IconPackage,
  IconPlus,
  IconEdit,
  IconX,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
  IconClock,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import { allAggregationCenters } from "@/data/aggregationCenters";
import { cn } from "@/lib/utils";
import type { FarmPickupSchedule, PickupLocation } from "@/types/transport";

export function PickupScheduleManagement() {
  const { user } = useAuth();
  const {
    pickupSchedules,
    centerCapacities,
    fetchPickupSchedules,
    createPickupSchedule,
    updatePickupSchedule,
    publishPickupSchedule,
    cancelPickupSchedule,
    fetchAggregationCenterCapacity,
    isLoading,
  } = useTransport();

  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedSchedule, setSelectedSchedule] = useState<FarmPickupSchedule | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form state
  const [formData, setFormData] = useState({
    aggregationCenterId: "",
    route: "",
    scheduledDate: "",
    scheduledTime: "",
    estimatedArrivalTime: "",
    totalCapacity: "",
    vehicleType: "",
    pricePerKg: "",
    fixedPrice: "",
    notes: "",
  });
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [newLocation, setNewLocation] = useState({ location: "", subCounty: "", ward: "", estimatedPickupTime: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPickupSchedules({ providerId: user.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredSchedules = pickupSchedules.filter(
    (schedule) => filterStatus === "all" || schedule.status === filterStatus
  );

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setFormData({
      aggregationCenterId: "",
      route: "",
      scheduledDate: "",
      scheduledTime: "",
      estimatedArrivalTime: "",
      totalCapacity: "",
      vehicleType: "",
      pricePerKg: "",
      fixedPrice: "",
      notes: "",
    });
    setPickupLocations([]);
    setNewLocation({ location: "", subCounty: "", ward: "", estimatedPickupTime: "" });
    setView("create");
  };

  const handleEditSchedule = (schedule: FarmPickupSchedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      aggregationCenterId: schedule.aggregationCenterId,
      route: schedule.route,
      scheduledDate: schedule.scheduledDate.split("T")[0],
      scheduledTime: schedule.scheduledTime,
      estimatedArrivalTime: schedule.estimatedArrivalTime?.split("T")[1]?.slice(0, 5) || "",
      totalCapacity: schedule.totalCapacity.toString(),
      vehicleType: schedule.vehicleType || "",
      pricePerKg: schedule.pricePerKg?.toString() || "",
      fixedPrice: schedule.fixedPrice?.toString() || "",
      notes: schedule.notes || "",
    });
    setPickupLocations(schedule.pickupLocations || []);
    setView("edit");
  };

  const handleAddLocation = () => {
    if (!newLocation.location) return;
    const location: PickupLocation = {
      id: `loc-${Date.now()}`,
      scheduleId: selectedSchedule?.id || "",
      location: newLocation.location,
      subCounty: newLocation.subCounty,
      ward: newLocation.ward,
      estimatedPickupTime: newLocation.estimatedPickupTime
        ? `${formData.scheduledDate}T${newLocation.estimatedPickupTime}:00`
        : undefined,
      order: pickupLocations.length + 1,
    };
    setPickupLocations([...pickupLocations, location]);
    setNewLocation({ location: "", subCounty: "", ward: "", estimatedPickupTime: "" });
  };

  const handleRemoveLocation = (locationId: string) => {
    setPickupLocations(pickupLocations.filter(loc => loc.id !== locationId));
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    if (!formData.aggregationCenterId || !formData.route || !formData.scheduledDate || !formData.scheduledTime || !formData.totalCapacity) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const center = allAggregationCenters.find(c => c.value === formData.aggregationCenterId);
      const scheduleData: Partial<FarmPickupSchedule> = {
        providerId: user?.id || "",
        providerName: user?.name || "",
        aggregationCenterId: formData.aggregationCenterId,
        aggregationCenterName: center?.label || "",
        route: formData.route,
        scheduledDate: formData.scheduledDate,
        scheduledTime: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
        estimatedArrivalTime: formData.estimatedArrivalTime
          ? `${formData.scheduledDate}T${formData.estimatedArrivalTime}:00`
          : undefined,
        totalCapacity: parseFloat(formData.totalCapacity),
        vehicleType: formData.vehicleType || undefined,
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : undefined,
        fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice) : undefined,
        pickupLocations,
        notes: formData.notes || undefined,
        status: saveAsDraft ? "draft" : "published",
      };

      if (selectedSchedule) {
        await updatePickupSchedule(selectedSchedule.id, scheduleData);
      } else {
        await createPickupSchedule(scheduleData);
      }

      // Fetch center capacity
      if (formData.aggregationCenterId) {
        await fetchAggregationCenterCapacity(formData.aggregationCenterId);
      }

      setView("list");
      if (user?.id) {
        await fetchPickupSchedules({ providerId: user.id });
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("Failed to save schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishPickupSchedule(id);
      if (user?.id) {
        await fetchPickupSchedules({ providerId: user.id });
      }
    } catch (err) {
      console.error("Failed to publish schedule:", err);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this schedule? All bookings will be cancelled.")) {
      return;
    }
    try {
      await cancelPickupSchedule(id);
      if (user?.id) {
        await fetchPickupSchedules({ providerId: user.id });
      }
    } catch (err) {
      console.error("Failed to cancel schedule:", err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    try {
      const date = new Date(time);
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return time;
    }
  };

  if (view === "create" || view === "edit") {
    const selectedCenter = allAggregationCenters.find(c => c.value === formData.aggregationCenterId);
    const centerCapacity = selectedCenter ? centerCapacities.get(formData.aggregationCenterId) : null;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{view === "create" ? "Create" : "Edit"} Pickup Schedule</h1>
            <p className="text-stone-500 mt-1">Set up a scheduled pickup route for farmers</p>
          </div>
          <Button variant="outline" onClick={() => setView("list")}>
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
            <CardDescription>Configure your pickup route and capacity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aggregationCenterId">Aggregation Center *</Label>
                <Select
                  value={formData.aggregationCenterId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, aggregationCenterId: value });
                    fetchAggregationCenterCapacity(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAggregationCenters.map((center) => (
                      <SelectItem key={center.value} value={center.value}>
                        {center.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {centerCapacity && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Center Capacity:</span>
                      <span className="font-semibold">
                        {centerCapacity.availableCapacity.toLocaleString()} / {centerCapacity.totalCapacity.toLocaleString()} kg
                      </span>
                    </div>
                    {centerCapacity.status === "full" && (
                      <div className="flex items-center gap-1 text-red-600 mt-1">
                        <IconAlertCircle className="h-3 w-3" />
                        <span>Center is full</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">Route Name *</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="e.g., Kangundo Route"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Pickup Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedArrivalTime">Estimated Arrival</Label>
                <Input
                  id="estimatedArrivalTime"
                  type="time"
                  value={formData.estimatedArrivalTime}
                  onChange={(e) => setFormData({ ...formData, estimatedArrivalTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCapacity">Total Capacity (kg) *</Label>
                <Input
                  id="totalCapacity"
                  type="number"
                  value={formData.totalCapacity}
                  onChange={(e) => setFormData({ ...formData, totalCapacity: e.target.value })}
                  placeholder="0"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Input
                  id="vehicleType"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  placeholder="e.g., Truck, Van"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Price per kg (KES)</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>

            {/* Pickup Locations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pickup Locations</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLocation}
                  disabled={!newLocation.location}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>

              {/* Add Location Form */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-stone-50 rounded-lg">
                <Input
                  placeholder="Location name"
                  value={newLocation.location}
                  onChange={(e) => setNewLocation({ ...newLocation, location: e.target.value })}
                />
                <Input
                  placeholder="Sub-county"
                  value={newLocation.subCounty}
                  onChange={(e) => setNewLocation({ ...newLocation, subCounty: e.target.value })}
                />
                <Input
                  placeholder="Ward (optional)"
                  value={newLocation.ward}
                  onChange={(e) => setNewLocation({ ...newLocation, ward: e.target.value })}
                />
                <Input
                  type="time"
                  placeholder="Pickup time"
                  value={newLocation.estimatedPickupTime}
                  onChange={(e) => setNewLocation({ ...newLocation, estimatedPickupTime: e.target.value })}
                />
              </div>

              {/* Location List */}
              {pickupLocations.length > 0 && (
                <div className="space-y-2">
                  {pickupLocations.map((location, idx) => (
                    <div key={location.id} className="flex items-center gap-2 p-2 bg-stone-50 rounded">
                      <span className="text-sm font-medium w-8">{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="font-medium">{location.location}</p>
                        <p className="text-xs text-stone-500">
                          {location.subCounty}
                          {location.ward && `, ${location.ward}`}
                          {location.estimatedPickupTime && ` • ${formatTime(location.estimatedPickupTime)}`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(location.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setView("list")} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    {selectedSchedule ? "Update & Publish" : "Create & Publish"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Pickup Schedules</h1>
          <p className="text-stone-500 mt-1">Create and manage scheduled pickup routes for farmers</p>
        </div>
        <Button onClick={handleCreateSchedule}>
          <IconPlus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSchedules.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map((schedule) => {
            const centerCapacity = centerCapacities.get(schedule.aggregationCenterId);
            const utilization = (schedule.usedCapacity / schedule.totalCapacity) * 100;

            return (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{schedule.route}</CardTitle>
                      <CardDescription className="mt-1">{schedule.aggregationCenterName}</CardDescription>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      schedule.status === "published" && "bg-blue-50 text-blue-700",
                      schedule.status === "active" && "bg-green-50 text-green-700",
                      schedule.status === "draft" && "bg-gray-50 text-gray-700"
                    )}>
                      {schedule.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconCalendar className="h-4 w-4" />
                      <span>{formatDate(schedule.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconClock className="h-4 w-4" />
                      <span>{formatTime(schedule.scheduledTime)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Capacity:</span>
                      <span className="font-semibold">
                        {schedule.usedCapacity.toLocaleString()} / {schedule.totalCapacity.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-500">
                      {schedule.availableCapacity.toLocaleString()} kg available
                    </p>
                  </div>

                  {centerCapacity && (
                    <div className="p-2 bg-blue-50 rounded text-xs">
                      <span className="text-blue-700">Center: </span>
                      <span className="font-semibold">
                        {centerCapacity.availableCapacity.toLocaleString()} kg available
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    {schedule.status === "draft" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handlePublish(schedule.id)}
                      >
                        Publish
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      <IconEdit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {schedule.status !== "completed" && schedule.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(schedule.id)}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <IconTruck className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-500">No schedules found</p>
            <p className="text-sm text-stone-500 mt-1">
              {filterStatus !== "all"
                ? "Try adjusting your filters"
                : "Create your first pickup schedule"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
