import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  IconSearch,
  IconTruck,
  IconCalendar,
  IconMapPin,
  IconPackage,
  IconClock,
  IconLoader2,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAggregation } from "@/contexts/AggregationContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { FarmPickupSchedule, PickupSlotBooking, AggregationCenterCapacity } from "@/types/transport";

export function PickupSchedules() {
  const { user } = useAuth();
  const { pickupSchedules, centerCapacities, fetchAvailablePickupSchedules, bookPickupSlot, isLoading } = useTransport();
  const { centers, fetchCenters, isLoading: centersLoading } = useAggregation();

  const [selectedCenter, setSelectedCenter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState<FarmPickupSchedule | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingQuantity, setBookingQuantity] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingBatchId, setBookingBatchId] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    // Fetch aggregation centers
    fetchCenters();
    
    // Fetch available schedules for next 30 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    fetchAvailablePickupSchedules({
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSchedules = pickupSchedules.filter((schedule) => {
    if (selectedCenter !== "all" && schedule.aggregationCenterId !== selectedCenter) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        schedule.route.toLowerCase().includes(query) ||
        schedule.aggregationCenterName.toLowerCase().includes(query) ||
        schedule.providerName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getCenterCapacity = (centerId: string): AggregationCenterCapacity | null => {
    return centerCapacities.get(centerId) || null;
  };

  const getCapacityStatus = (capacity: AggregationCenterCapacity | null) => {
    if (!capacity) return { label: "Unknown", className: "bg-gray-100 text-gray-700" };
    if (capacity.status === "full") return { label: "Full", className: "bg-red-100 text-red-700" };
    if (capacity.status === "near_full") return { label: "Near Full", className: "bg-yellow-100 text-yellow-700" };
    return { label: "Available", className: "bg-green-100 text-green-700" };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    try {
      // If time is in HH:mm format, format it directly
      if (time.match(/^\d{2}:\d{2}/)) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
      // If time is an ISO datetime string, parse it
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
      return time;
    } catch {
      return time;
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSchedule || !bookingQuantity || !bookingLocation) {
      return;
    }

    const quantity = parseFloat(bookingQuantity);
    if (quantity <= 0) {
      return;
    }

    if (quantity > selectedSchedule.availableCapacity) {
      alert(`Quantity exceeds available capacity (${selectedSchedule.availableCapacity} kg)`);
      return;
    }

    const centerCapacity = getCenterCapacity(selectedSchedule.aggregationCenterId);
    if (centerCapacity && quantity > centerCapacity.availableCapacity) {
      alert(`Quantity exceeds center available capacity (${centerCapacity.availableCapacity} kg)`);
      return;
    }

    setIsBooking(true);
    try {
      const booking: Partial<PickupSlotBooking> = {
        farmerId: user?.id || "",
        farmerName: user?.name || "",
        quantity,
        location: bookingLocation,
        batchId: bookingBatchId || undefined,
        contactPhone: user?.phone || "",
        notes: bookingNotes || undefined,
      };

      const result = await bookPickupSlot(selectedSchedule.id, selectedSchedule.id, booking);
      if (result) {
        setBookingDialogOpen(false);
        setBookingQuantity("");
        setBookingLocation("");
        setBookingBatchId("");
        setBookingNotes("");
        // Refresh schedules
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        await fetchAvailablePickupSchedules({
          dateRange: {
            start: new Date().toISOString().split("T")[0],
            end: endDate.toISOString().split("T")[0],
          },
        });
      }
    } catch (err) {
      console.error("Failed to book slot:", err);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Farm Pickup Schedules</h1>
          <p className="text-stone-500 mt-1">
            Browse and book scheduled pickup slots for delivering produce to aggregation centers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-2.5 h-[18px] w-[18px] text-stone-400" />
            <Input
              type="text"
              placeholder="Search by route, center, or provider..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger className="w-full lg:w-[250px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Aggregation Centers</SelectItem>
              {centersLoading ? (
                <SelectItem value="loading" disabled>Loading centers...</SelectItem>
              ) : centers.length === 0 ? (
                <SelectItem value="no-centers" disabled>No centers available</SelectItem>
              ) : (
                centers.map((center) => (
                  <SelectItem key={center.id} value={center.id}>
                    {center.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedules Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-1/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSchedules.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map((schedule) => {
            const centerCapacity = getCenterCapacity(schedule.aggregationCenterId);
            const capacityStatus = getCapacityStatus(centerCapacity);
            const capacityPercentage = centerCapacity
              ? Math.round((centerCapacity.usedCapacity / centerCapacity.totalCapacity) * 100)
              : 0;
            const isUrgent = schedule.availableCapacity < schedule.totalCapacity * 0.2;

            return (
              <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{schedule.route}</CardTitle>
                      <CardDescription className="mt-1">
                        {schedule.aggregationCenterName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      schedule.status === "published" && "bg-blue-50 text-blue-700 border-blue-200",
                      schedule.status === "active" && "bg-green-50 text-green-700 border-green-200"
                    )}>
                      {schedule.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Schedule Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconCalendar className="h-4 w-4" />
                      <span>{formatDate(schedule.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconClock className="h-4 w-4" />
                      <span>{formatTime(schedule.scheduledTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconTruck className="h-4 w-4" />
                      <span>{schedule.providerName}</span>
                    </div>
                    {schedule.estimatedArrivalTime && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <IconCheck className="h-4 w-4" />
                        <span>Arrives: {formatTime(schedule.estimatedArrivalTime)}</span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Info */}
                  <div className="space-y-2 p-3 bg-stone-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-stone-600">Transport Capacity:</span>
                      <span className="font-semibold">
                        {schedule.usedCapacity.toLocaleString()} / {schedule.totalCapacity.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          isUrgent ? "bg-red-500" : "bg-green-500"
                        )}
                        style={{ width: `${(schedule.usedCapacity / schedule.totalCapacity) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={cn(
                        isUrgent ? "text-red-600 font-semibold" : "text-green-600"
                      )}>
                        {schedule.availableCapacity.toLocaleString()} kg available
                      </span>
                    </div>
                  </div>

                  {/* Center Capacity */}
                  {centerCapacity && (
                    <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-700 font-medium">Center Storage:</span>
                        <Badge variant="outline" className={cn("text-xs", capacityStatus.className)}>
                          {capacityStatus.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-blue-600">
                        <span>Available: {centerCapacity.availableCapacity.toLocaleString()} kg</span>
                        <span>{capacityPercentage}% used</span>
                      </div>
                      {centerCapacity.status === "full" && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <IconAlertCircle className="h-3 w-3" />
                          <span>Center is full - consider alternative centers</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pickup Locations */}
                  {schedule.pickupLocations && schedule.pickupLocations.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-stone-500 uppercase">Pickup Locations:</p>
                      <div className="space-y-1">
                        {schedule.pickupLocations.slice(0, 3).map((location, idx) => (
                          <div key={location.id} className="flex items-center gap-2 text-xs text-stone-600">
                            <IconMapPin className="h-3 w-3" />
                            <span>{location.location}</span>
                            {location.estimatedPickupTime && (
                              <span className="text-stone-400">({formatTime(location.estimatedPickupTime)})</span>
                            )}
                          </div>
                        ))}
                        {schedule.pickupLocations.length > 3 && (
                          <p className="text-xs text-stone-400">
                            +{schedule.pickupLocations.length - 3} more locations
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  {schedule.pricePerKg && (
                    <div className="text-sm">
                      <span className="text-stone-600">Price: </span>
                      <span className="font-semibold">KES {schedule.pricePerKg}/kg</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setBookingDialogOpen(true);
                      }}
                      disabled={schedule.availableCapacity <= 0 || schedule.status !== "published"}
                    >
                      <IconPackage className="mr-2 h-4 w-4" />
                      Book Pickup Slot
                    </Button>
                    {schedule.availableCapacity <= 0 && (
                      <p className="text-xs text-red-600 mt-2 text-center">Fully booked</p>
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
            <p className="text-lg font-medium text-stone-500">No pickup schedules available</p>
            <p className="text-sm text-stone-500 mt-1">
              {searchQuery || selectedCenter !== "all"
                ? "Try adjusting your filters"
                : "Check back later for new pickup schedules"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book Pickup Slot</DialogTitle>
            <DialogDescription>
              Book a slot on {selectedSchedule?.route} to {selectedSchedule?.aggregationCenterName}
            </DialogDescription>
          </DialogHeader>
          {selectedSchedule && (
            <div className="space-y-4">
              {/* Schedule Summary */}
              <div className="p-3 bg-stone-50 rounded-lg space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Date:</span>
                  <span className="font-semibold">{formatDate(selectedSchedule.scheduledDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Time:</span>
                  <span className="font-semibold">{formatTime(selectedSchedule.scheduledTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Available Capacity:</span>
                  <span className="font-semibold">{selectedSchedule.availableCapacity.toLocaleString()} kg</span>
                </div>
                {selectedSchedule.pricePerKg && (
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600">Price:</span>
                    <span className="font-semibold">KES {selectedSchedule.pricePerKg}/kg</span>
                  </div>
                )}
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity (kg) *</label>
                  <Input
                    type="number"
                    value={bookingQuantity}
                    onChange={(e) => setBookingQuantity(e.target.value)}
                    placeholder="Enter quantity in kg"
                    min={0}
                    max={selectedSchedule.availableCapacity}
                    step={0.1}
                  />
                  <p className="text-xs text-stone-500">
                    Maximum: {selectedSchedule.availableCapacity.toLocaleString()} kg
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pickup Location *</label>
                  <Input
                    value={bookingLocation}
                    onChange={(e) => setBookingLocation(e.target.value)}
                    placeholder="Your farm location or pickup point"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch ID (Optional)</label>
                  <Input
                    value={bookingBatchId}
                    onChange={(e) => setBookingBatchId(e.target.value)}
                    placeholder="e.g., BATCH-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <textarea
                    className="w-full p-2 border border-stone-200 rounded-lg text-sm"
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any special instructions or notes..."
                    rows={3}
                  />
                </div>

                {/* Total Cost */}
                {bookingQuantity && selectedSchedule.pricePerKg && (
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Cost:</span>
                      <span className="text-lg font-bold text-primary">
                        KES {(parseFloat(bookingQuantity) * selectedSchedule.pricePerKg).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialogOpen(false)} disabled={isBooking}>
              Cancel
            </Button>
            <Button onClick={handleBookSlot} disabled={isBooking || !bookingQuantity || !bookingLocation}>
              {isBooking ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
