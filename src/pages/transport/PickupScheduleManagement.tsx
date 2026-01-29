import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAggregation } from "@/contexts/AggregationContext";
import { cn } from "@/lib/utils";
import type { FarmPickupSchedule, PickupLocation, PickupScheduleStatus } from "@/types/transport";

export function PickupScheduleManagement() {
  const navigate = useNavigate();
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
  const { centers: aggregationCenters, fetchCenters } = useAggregation();

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
    vehiclePlateNumber: "",
    driverName: "",
    driverPhone: "",
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

  useEffect(() => {
    // Fetch real aggregation centers from backend
    fetchCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      vehiclePlateNumber: "",
      driverName: "",
      driverPhone: "",
      pricePerKg: "",
      fixedPrice: "",
      notes: "",
    });
    setPickupLocations([]);
    setNewLocation({ location: "", subCounty: "", ward: "", estimatedPickupTime: "" });
    setView("create");
  };

  const handleEditSchedule = (schedule: FarmPickupSchedule) => {
    if (!canEditSchedule(schedule)) {
      if (schedule.status === "completed" || schedule.status === "cancelled") {
        alert("Cannot edit schedule: Schedule is already completed or cancelled");
      } else if (isWithinOneHour(schedule)) {
        alert("Cannot edit schedule: Less than 1 hour until scheduled time");
      }
      return;
    }
    setSelectedSchedule(schedule);
    setFormData({
      aggregationCenterId: schedule.aggregationCenterId,
      route: schedule.route,
      scheduledDate: schedule.scheduledDate.split("T")[0],
      scheduledTime: schedule.scheduledTime,
      estimatedArrivalTime: schedule.estimatedArrivalTime?.split("T")[1]?.slice(0, 5) || "",
      totalCapacity: schedule.totalCapacity.toString(),
      vehicleType: schedule.vehicleType || "",
      vehiclePlateNumber: schedule.vehicleId || "",
      driverName: schedule.driverName || "",
      driverPhone: schedule.driverPhone || "",
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
      const center = aggregationCenters.find(c => c.id === formData.aggregationCenterId);
      const scheduleData: Partial<FarmPickupSchedule> = {
        providerId: user?.id || "",
        providerName: user?.name || "",
        aggregationCenterId: formData.aggregationCenterId,
        aggregationCenterName: center?.name || "",
        route: formData.route,
        scheduledDate: formData.scheduledDate,
        scheduledTime: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
        estimatedArrivalTime: formData.estimatedArrivalTime
          ? `${formData.scheduledDate}T${formData.estimatedArrivalTime}:00`
          : undefined,
        totalCapacity: parseFloat(formData.totalCapacity),
        vehicleType: formData.vehicleType || undefined,
        vehicleId: formData.vehiclePlateNumber || undefined,
        driverName: formData.driverName || undefined,
        driverPhone: formData.driverPhone || undefined,
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : undefined,
        fixedPrice: formData.fixedPrice ? parseFloat(formData.fixedPrice) : undefined,
        pickupLocations,
        notes: formData.notes || undefined,
        status: (saveAsDraft ? "draft" : "published") as PickupScheduleStatus,
      };

      if (selectedSchedule) {
        // If publishing a draft schedule, update it first (keep as draft), then publish
        if (!saveAsDraft && selectedSchedule.status === "draft") {
          // Update schedule data but keep status as draft for now
          const updateData = { ...scheduleData, status: "draft" as PickupScheduleStatus };
          await updatePickupSchedule(selectedSchedule.id, updateData);
          // Then publish it using the publish endpoint
          await publishPickupSchedule(selectedSchedule.id);
        } else {
          // For non-draft schedules or when saving as draft, just update
          await updatePickupSchedule(selectedSchedule.id, scheduleData);
        }
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
    const schedule = pickupSchedules.find(s => s.id === id);
    if (schedule && !canCancelSchedule(schedule)) {
      if (hasScheduledTimePassed(schedule)) {
        alert("Cannot cancel schedule: Scheduled time has already passed");
      } else {
        alert("Cannot cancel schedule: Schedule is already completed or cancelled");
      }
      return;
    }
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

  // Helper function to get the scheduled datetime
  const getScheduledDateTime = (schedule: FarmPickupSchedule): Date => {
    try {
      // scheduledTime can be ISO 8601 or HH:mm format
      if (schedule.scheduledTime.includes('T')) {
        return new Date(schedule.scheduledTime);
      }
      // If it's HH:mm format, combine with scheduledDate
      const dateStr = schedule.scheduledDate.split('T')[0];
      const timeStr = schedule.scheduledTime.includes(':') 
        ? schedule.scheduledTime.split('T')[0].split(' ')[0] 
        : schedule.scheduledTime;
      return new Date(`${dateStr}T${timeStr}`);
    } catch {
      // Fallback: use scheduledDate if parsing fails
      return new Date(schedule.scheduledDate);
    }
  };

  // Check if schedule is less than 1 hour from scheduled time
  const isWithinOneHour = (schedule: FarmPickupSchedule): boolean => {
    const scheduledDateTime = getScheduledDateTime(schedule);
    const now = new Date();
    const diffMs = scheduledDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours < 1;
  };

  // Check if scheduled time has passed
  const hasScheduledTimePassed = (schedule: FarmPickupSchedule): boolean => {
    const scheduledDateTime = getScheduledDateTime(schedule);
    return scheduledDateTime.getTime() < new Date().getTime();
  };

  // Check if 24 hours have passed since scheduled time (for auto-completion)
  const is24HoursPast = (schedule: FarmPickupSchedule): boolean => {
    const scheduledDateTime = getScheduledDateTime(schedule);
    const now = new Date();
    const diffMs = now.getTime() - scheduledDateTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  // Check if schedule can be edited
  // Draft schedules can always be edited
  // Published/active schedules can only be edited if not within 1 hour of scheduled time
  const canEditSchedule = (schedule: FarmPickupSchedule): boolean => {
    if (schedule.status === "completed" || schedule.status === "cancelled") {
      return false;
    }
    // Draft schedules can always be edited
    if (schedule.status === "draft") {
      return true;
    }
    // For published/active schedules, check if within 1 hour
    return !isWithinOneHour(schedule);
  };

  // Check if schedule can be cancelled (scheduled time hasn't passed and not completed/cancelled)
  const canCancelSchedule = (schedule: FarmPickupSchedule): boolean => {
    if (schedule.status === "completed" || schedule.status === "cancelled") {
      return false;
    }
    return !hasScheduledTimePassed(schedule);
  };

  // Use ref to access current schedules without triggering re-renders
  const schedulesRef = useRef(pickupSchedules);
  schedulesRef.current = pickupSchedules;
  
  // Track if we've done the initial auto-complete check
  const hasCheckedRef = useRef(false);

  // Auto-complete schedules that are 24 hours past (check periodically)
  // Note: This is a frontend check - ideally handled by a backend cron job
  useEffect(() => {
    const checkAndAutoComplete = async () => {
      const currentSchedules = schedulesRef.current;
      const schedulesToComplete = currentSchedules.filter(
        (schedule) => 
          schedule.status !== "completed" && 
          schedule.status !== "cancelled" && 
          is24HoursPast(schedule)
      );

      // Only fetch if there are schedules that need completion AND we haven't just fetched
      if (schedulesToComplete.length > 0 && user?.id) {
        try {
          await fetchPickupSchedules({ providerId: user.id });
        } catch (err: any) {
          // Don't retry on auth errors (401) or rate limit errors (429)
          // The API client already handles these and prevents retries
          if (err?.statusCode === 401 || err?.statusCode === 429) {
            console.warn('Skipping schedule refresh due to auth/rate limit error');
            return;
          }
          console.error('Error refreshing schedules:', err);
        }
      }
    };

    // Only run initial check once after schedules are loaded
    if (!hasCheckedRef.current && pickupSchedules.length > 0) {
      hasCheckedRef.current = true;
      checkAndAutoComplete();
    }

    // Check every 5 minutes for schedules that need auto-completion
    const interval = setInterval(checkAndAutoComplete, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // Only depend on user?.id - use ref for schedules to avoid re-triggering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (view === "create" || view === "edit") {
    const selectedCenter = aggregationCenters.find(c => c.id === formData.aggregationCenterId);
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
                    {aggregationCenters.length > 0 ? (
                      aggregationCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} {center.location ? `- ${center.location}` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>Loading centers...</SelectItem>
                    )}
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
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const today = new Date().toISOString().split("T")[0];
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 1);
                    const maxDateStr = maxDate.toISOString().split("T")[0];
                    
                    // Ensure date is today or tomorrow (valid for only one day)
                    if (selectedDate < today) {
                      alert("Schedule date cannot be in the past");
                      return;
                    }
                    if (selectedDate > maxDateStr) {
                      alert("Schedule can only be set for today or tomorrow (one day validity)");
                      return;
                    }
                    setFormData({ ...formData, scheduledDate: selectedDate });
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 1);
                    return maxDate.toISOString().split("T")[0];
                  })()}
                />
                <p className="text-xs text-stone-500">Schedule is valid for one day only (today or tomorrow)</p>
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
                <Label htmlFor="vehiclePlateNumber">Vehicle Plate Number</Label>
                <Input
                  id="vehiclePlateNumber"
                  value={formData.vehiclePlateNumber}
                  onChange={(e) => setFormData({ ...formData, vehiclePlateNumber: e.target.value })}
                  placeholder="e.g., KCA 123X"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="e.g., John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverPhone">Driver Phone Number</Label>
                <Input
                  id="driverPhone"
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  placeholder="e.g., +254712345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="fixedPrice">Fixed Price (KES)</Label>
                <Input
                  id="fixedPrice"
                  type="number"
                  value={formData.fixedPrice}
                  onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value })}
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

      {/* Schedules Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSchedules.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule #</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => {
                    const centerCapacity = centerCapacities.get(schedule.aggregationCenterId);
                    const utilization = (schedule.usedCapacity / schedule.totalCapacity) * 100;

                    return (
                      <TableRow
                        key={schedule.id}
                        className="cursor-pointer hover:bg-stone-50"
                        onClick={() => navigate(`/dashboard/transport-provider/pickup-schedules/${schedule.id}`)}
                      >
                        <TableCell className="font-medium">
                          {schedule.scheduleNumber || schedule.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{schedule.route}</p>
                            <div className="text-xs text-stone-500 space-y-0.5">
                              {schedule.vehicleType && (
                                <p>{schedule.vehicleType}</p>
                              )}
                              {schedule.vehicleId && (
                                <p>Plate: {schedule.vehicleId}</p>
                              )}
                              {schedule.driverName && (
                                <p>Driver: {schedule.driverName}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{schedule.aggregationCenterName}</p>
                            {centerCapacity && (
                              <p className="text-xs text-stone-500">
                                {centerCapacity.availableCapacity.toLocaleString()} kg available
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-sm">
                              <IconCalendar className="h-3.5 w-3.5 text-stone-400" />
                              <span>{formatDate(schedule.scheduledDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-stone-500">
                              <IconClock className="h-3 w-3 text-stone-400" />
                              <span>{formatTime(schedule.scheduledTime)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-stone-600">
                                {schedule.usedCapacity.toLocaleString()} / {schedule.totalCapacity.toLocaleString()} kg
                              </span>
                            </div>
                            <div className="w-full bg-stone-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 bg-primary rounded-full"
                                style={{ width: `${utilization}%` }}
                              />
                            </div>
                            <p className="text-xs text-stone-500">
                              {schedule.availableCapacity.toLocaleString()} kg available
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            schedule.status === "published" && "bg-blue-50 text-blue-700 border-blue-200",
                            schedule.status === "active" && "bg-green-50 text-green-700 border-green-200",
                            schedule.status === "draft" && "bg-gray-50 text-gray-700 border-gray-200",
                            schedule.status === "completed" && "bg-stone-50 text-stone-700 border-stone-200",
                            schedule.status === "cancelled" && "bg-red-50 text-red-700 border-red-200"
                          )}>
                            {schedule.status}
                          </Badge>
                          {isWithinOneHour(schedule) && schedule.status !== "draft" && schedule.status !== "completed" && schedule.status !== "cancelled" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-yellow-700">
                              <IconAlertCircle className="h-3 w-3" />
                              <span>Editing disabled</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {schedule.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(schedule.id)}
                              >
                                Publish
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                              disabled={!canEditSchedule(schedule)}
                              title={
                                !canEditSchedule(schedule)
                                  ? schedule.status === "completed" || schedule.status === "cancelled"
                                    ? "Cannot edit: Schedule is completed or cancelled"
                                    : isWithinOneHour(schedule)
                                      ? "Cannot edit: Less than 1 hour until scheduled time"
                                      : "Cannot edit schedule"
                                  : "Edit schedule"
                              }
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            {schedule.status !== "completed" && schedule.status !== "cancelled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(schedule.id)}
                                disabled={!canCancelSchedule(schedule)}
                                title={
                                  !canCancelSchedule(schedule)
                                    ? hasScheduledTimePassed(schedule)
                                      ? "Cannot cancel: Scheduled time has passed"
                                      : "Cannot cancel: Schedule is completed or cancelled"
                                    : "Cancel schedule"
                                }
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
