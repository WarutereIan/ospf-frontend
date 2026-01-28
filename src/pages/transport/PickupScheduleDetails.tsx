import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  IconTruck,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconPackage,
  IconArrowLeft,
  IconUser,
  IconPhone,
  IconCheck,
  IconX,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getPickupScheduleById, getScheduleBookings } from "@/services/transportService";
import type { FarmPickupSchedule, PickupSlotBooking } from "@/types/transport";

export function PickupScheduleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchPickupSchedules, publishPickupSchedule, cancelPickupSchedule } = useTransport();

  const [schedule, setSchedule] = useState<FarmPickupSchedule | null>(null);
  const [bookings, setBookings] = useState<PickupSlotBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<PickupSlotBooking | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const scheduleData = await getPickupScheduleById(id);
        if (scheduleData) {
          setSchedule(scheduleData);
          // Load bookings for this schedule
          const bookingsData = await getScheduleBookings(id);
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingBookings(false);
      }
    };

    loadSchedule();
  }, [id]);

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

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}t`;
    }
    return `${kg} kg`;
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

  // Check if scheduled time has passed
  const hasScheduledTimePassed = (schedule: FarmPickupSchedule): boolean => {
    const scheduledDateTime = getScheduledDateTime(schedule);
    return scheduledDateTime.getTime() < new Date().getTime();
  };

  // Check if schedule can be cancelled (scheduled time hasn't passed and not completed/cancelled)
  const canCancelSchedule = (schedule: FarmPickupSchedule): boolean => {
    if (schedule.status === "completed" || schedule.status === "cancelled") {
      return false;
    }
    return !hasScheduledTimePassed(schedule);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "completed":
        return "bg-stone-50 text-stone-700 border-stone-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "picked_up":
        return "bg-green-50 text-green-700 border-green-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  const handlePublish = async () => {
    if (!schedule) return;
    try {
      await publishPickupSchedule(schedule.id);
      await fetchPickupSchedules({ providerId: user?.id });
      navigate("/dashboard/transport-provider/pickup-schedules");
    } catch (err) {
      console.error("Failed to publish schedule:", err);
    }
  };

  const handleCancel = async () => {
    if (!schedule) return;
    if (!canCancelSchedule(schedule)) {
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
      await cancelPickupSchedule(schedule.id);
      await fetchPickupSchedules({ providerId: user?.id });
      navigate("/dashboard/transport-provider/pickup-schedules");
    } catch (err) {
      console.error("Failed to cancel schedule:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Card>
          <CardContent className="py-12 text-center">
            <IconAlertCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-500">Schedule not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dashboard/transport-provider/pickup-schedules")}
            >
              <IconArrowLeft className="h-4 w-4 mr-2" />
              Back to Schedules
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const utilization = (schedule.usedCapacity / schedule.totalCapacity) * 100;
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const pickedUpBookings = bookings.filter(b => b.status === "picked_up" || b.status === "completed").length;
  const cancelledBookings = bookings.filter(b => b.status === "cancelled").length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard/transport-provider/pickup-schedules")}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">{schedule.route}</h1>
            <p className="text-stone-500 mt-1">
              Schedule #{schedule.scheduleNumber || schedule.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-sm", getStatusColor(schedule.status))}>
            {schedule.status}
          </Badge>
          {schedule.status === "draft" && (
            <Button variant="outline" size="sm" onClick={handlePublish}>
              Publish
            </Button>
          )}
          {schedule.status !== "completed" && schedule.status !== "cancelled" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
              disabled={!canCancelSchedule(schedule)}
              title={
                !canCancelSchedule(schedule)
                  ? hasScheduledTimePassed(schedule)
                    ? "Cannot cancel: Scheduled time has passed"
                    : "Cannot cancel: Schedule is completed or cancelled"
                  : "Cancel schedule"
              }
            >
              <IconX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Show warning if scheduled time has passed */}
      {hasScheduledTimePassed(schedule) && schedule.status !== "completed" && schedule.status !== "cancelled" && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2 text-orange-800">
            <IconClock className="h-4 w-4" />
            <p className="text-sm font-medium">Scheduled time has passed - cancellation disabled</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Schedule Details */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <IconMapPin className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="font-medium">{schedule.aggregationCenterName}</p>
                  <p className="text-xs text-stone-500">Aggregation Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconCalendar className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="font-medium">{formatDate(schedule.scheduledDate)}</p>
                  <p className="text-xs text-stone-500">Scheduled Date</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconClock className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="font-medium">{formatTime(schedule.scheduledTime)}</p>
                  <p className="text-xs text-stone-500">Pickup Time</p>
                </div>
              </div>
              {schedule.estimatedArrivalTime && (
                <div className="flex items-center gap-2 text-sm">
                  <IconTruck className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="font-medium">{formatTime(schedule.estimatedArrivalTime)}</p>
                    <p className="text-xs text-stone-500">Estimated Arrival</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t space-y-3">
              <div>
                <p className="text-xs text-stone-500 mb-1">Capacity Utilization</p>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-stone-600">
                    {schedule.usedCapacity.toLocaleString()} / {schedule.totalCapacity.toLocaleString()} kg
                  </span>
                  <span className="font-semibold">{utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${utilization}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {schedule.availableCapacity.toLocaleString()} kg available
                </p>
              </div>

              {schedule.vehicleType && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Vehicle</p>
                  <p className="text-sm font-medium">{schedule.vehicleType}</p>
                </div>
              )}

              {schedule.driverName && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Driver</p>
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-stone-400" />
                    <div>
                      <p className="text-sm font-medium">{schedule.driverName}</p>
                      {schedule.driverPhone && (
                        <p className="text-xs text-stone-500">{schedule.driverPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {schedule.pricePerKg && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Pricing</p>
                  <p className="text-sm font-medium">KES {schedule.pricePerKg.toFixed(2)} per kg</p>
                </div>
              )}

              {schedule.fixedPrice && (
                <div>
                  <p className="text-xs text-stone-500 mb-1">Pricing</p>
                  <p className="text-sm font-medium">KES {schedule.fixedPrice.toFixed(2)} fixed</p>
                </div>
              )}
            </div>

            {schedule.notes && (
              <div className="pt-4 border-t">
                <p className="text-xs text-stone-500 mb-1">Notes</p>
                <p className="text-sm text-stone-700">{schedule.notes}</p>
              </div>
            )}

            {schedule.pickupLocations && schedule.pickupLocations.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-xs text-stone-500 mb-2">Pickup Locations</p>
                <div className="space-y-2">
                  {schedule.pickupLocations
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((location, idx) => (
                      <div key={location.id || idx} className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-stone-400 w-6">{idx + 1}.</span>
                        <div>
                          <p className="font-medium">{location.location}</p>
                          {(location.subCounty || location.ward) && (
                            <p className="text-xs text-stone-500">
                              {location.subCounty}
                              {location.ward && `, ${location.ward}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings Summary</CardTitle>
            <CardDescription>{totalBookings} total booking{totalBookings !== 1 ? 's' : ''}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-8">
                <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">Confirmed</p>
                    <p className="text-2xl font-bold text-blue-700">{confirmedBookings}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">Picked Up</p>
                    <p className="text-2xl font-bold text-green-700">{pickedUpBookings}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-600 mb-1">Cancelled</p>
                    <p className="text-2xl font-bold text-red-700">{cancelledBookings}</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <p className="text-xs text-stone-600 mb-1">Total Quantity</p>
                    <p className="text-2xl font-bold text-stone-700">
                      {formatWeight(bookings.reduce((sum, b) => sum + b.quantity, 0))}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>All bookings for this schedule</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBookings ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : bookings.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead>Batch ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow 
                      key={booking.id}
                      className="cursor-pointer hover:bg-stone-50"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setBookingDetailsOpen(true);
                      }}
                    >
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{booking.farmerName || "Farmer"}</p>
                          {booking.contactPhone && (
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <IconPhone className="h-3 w-3" />
                              {booking.contactPhone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconMapPin className="h-3.5 w-3.5 text-stone-400" />
                          <span>{booking.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <IconPackage className="h-3.5 w-3.5 text-stone-400" />
                          <span className="font-medium">{formatWeight(booking.quantity)}</span>
                          {booking.variety && (
                            <span className="text-xs text-stone-500">({booking.variety})</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className={cn("text-xs", getBookingStatusColor(booking.status))}>
                            {booking.status === "picked_up" ? (
                              <span className="flex items-center gap-1">
                                <IconCheck className="h-3 w-3" />
                                Picked Up
                              </span>
                            ) : booking.status === "completed" ? (
                              <span className="flex items-center gap-1">
                                <IconCheck className="h-3 w-3" />
                                Completed
                              </span>
                            ) : (
                              booking.status
                            )}
                          </Badge>
                          {booking.pickupConfirmed && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <IconCheck className="h-3 w-3" />
                              Confirmed
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-stone-600">
                        {new Date(booking.bookedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {booking.batchId ? (
                          <code className="text-xs bg-stone-100 px-2 py-1 rounded font-mono">
                            {booking.batchId.slice(0, 8)}...
                          </code>
                        ) : (
                          <span className="text-xs text-stone-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <IconPackage className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-stone-500">No bookings yet</p>
              <p className="text-sm text-stone-500 mt-1">Bookings will appear here once farmers book slots</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for this pickup booking
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Farmer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Farmer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-stone-400" />
                    <div>
                      <p className="font-medium">{selectedBooking.farmerName || "Farmer"}</p>
                      <p className="text-xs text-stone-500">Farmer Name</p>
                    </div>
                  </div>
                  {selectedBooking.contactPhone && (
                    <div className="flex items-center gap-2">
                      <IconPhone className="h-4 w-4 text-stone-400" />
                      <div>
                        <p className="font-medium">{selectedBooking.contactPhone}</p>
                        <p className="text-xs text-stone-500">Contact Phone</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-stone-400" />
                    <div>
                      <p className="font-medium">{selectedBooking.location}</p>
                      <p className="text-xs text-stone-500">Pickup Location</p>
                    </div>
                  </div>
                  {selectedBooking.coordinates && (
                    <div className="text-sm">
                      <p className="text-stone-500">Coordinates:</p>
                      <p className="font-mono text-xs">{selectedBooking.coordinates[0]}, {selectedBooking.coordinates[1]}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <IconPackage className="h-4 w-4 text-stone-400" />
                    <div>
                      <p className="font-medium">{formatWeight(selectedBooking.quantity)}</p>
                      <p className="text-xs text-stone-500">Quantity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCalendar className="h-4 w-4 text-stone-400" />
                    <div>
                      <p className="font-medium">{new Date(selectedBooking.bookedAt).toLocaleString()}</p>
                      <p className="text-xs text-stone-500">Booked At</p>
                    </div>
                  </div>
                  {selectedBooking.notes && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Notes</p>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Produce Information */}
              {(selectedBooking.variety || selectedBooking.qualityGrade) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Produce Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedBooking.variety && (
                      <div>
                        <p className="text-xs text-stone-500 mb-1">Variety</p>
                        <p className="font-medium">{selectedBooking.variety}</p>
                      </div>
                    )}
                    {selectedBooking.qualityGrade && (
                      <div>
                        <p className="text-xs text-stone-500 mb-1">Quality Grade</p>
                        <Badge variant="outline" className="text-sm">
                          Grade {selectedBooking.qualityGrade}
                        </Badge>
                      </div>
                    )}
                    {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                      <div>
                        <p className="text-xs text-stone-500 mb-2">Photos</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedBooking.photos.map((photo, idx) => (
                            <img
                              key={idx}
                              src={photo}
                              alt={`Produce photo ${idx + 1}`}
                              className="w-full h-32 object-cover rounded border border-stone-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Status & Batch Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status & Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">Status</p>
                    <Badge variant="outline" className={cn("text-sm", getBookingStatusColor(selectedBooking.status))}>
                      {selectedBooking.status === "picked_up" ? (
                        <span className="flex items-center gap-1">
                          <IconCheck className="h-3 w-3" />
                          Picked Up
                        </span>
                      ) : selectedBooking.status === "completed" ? (
                        <span className="flex items-center gap-1">
                          <IconCheck className="h-3 w-3" />
                          Completed
                        </span>
                      ) : (
                        selectedBooking.status
                      )}
                    </Badge>
                  </div>
                  {selectedBooking.pickupConfirmed && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Pickup Confirmation</p>
                      <div className="flex items-center gap-2 text-green-600">
                        <IconCheck className="h-4 w-4" />
                        <span className="text-sm font-medium">Confirmed</span>
                      </div>
                      {selectedBooking.pickupConfirmedAt && (
                        <p className="text-xs text-stone-500 mt-1">
                          Confirmed at: {new Date(selectedBooking.pickupConfirmedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedBooking.batchId && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Batch ID</p>
                      <code className="text-sm bg-stone-100 px-2 py-1 rounded font-mono block">
                        {selectedBooking.batchId}
                      </code>
                    </div>
                  )}
                  {selectedBooking.qrCode && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">QR Code</p>
                      <code className="text-sm bg-stone-100 px-2 py-1 rounded font-mono block">
                        {selectedBooking.qrCode}
                      </code>
                    </div>
                  )}
                  {selectedBooking.cancelledAt && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">Cancelled At</p>
                      <p className="text-sm">{new Date(selectedBooking.cancelledAt).toLocaleString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
