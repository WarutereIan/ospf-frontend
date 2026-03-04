import { useState, useEffect, useRef } from "react";
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
  IconClock,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconQrcode,
  IconPhoto,
  IconDownload,
  IconPrinter,
} from "@tabler/icons-react";
import QRCode from "react-qr-code";
import { useTransport } from "@/contexts/TransportContext";
import { extractReceiptFromBooking } from "@/services/transportService";
import { uploadImage, getImageFullUrl } from "@/services/uploadService";
import { getBatchVerifyUrl } from "@/services/traceabilityService";
import generatePDF from "react-to-pdf";
import { useAuth } from "@/contexts/AuthContext";
import { showSuccess, showError, formatApiError } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { OFSPVariety, OFSP_VARIETY_LABELS, OFSP_VARIETY_VALUES } from "@/types/shared/enums";
import type { PickupSlotBooking, PickupReceipt } from "@/types/transport";

export function MyPickupBookings() {
  const { user } = useAuth();
  const { fetchFarmerBookings, confirmPickup, fetchPickupReceipt, farmerBookings, isLoading: transportLoading } = useTransport();

  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PickupSlotBooking | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receipt, setReceipt] = useState<PickupReceipt | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const receiptPdfRef = useRef<HTMLDivElement>(null);

  // Confirmation form state
  const [confirmationForm, setConfirmationForm] = useState({
    variety: "" as OFSPVariety | "",
    qualityGrade: "A" as "A" | "B" | "C",
    notes: "",
    photos: [] as string[],
  });

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadBookings = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      await fetchFarmerBookings(user.id);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = farmerBookings.filter(
    (booking) => filterStatus === "all" || booking.status === filterStatus
  );

  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      return dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (time: string) => {
    try {
      // Handle HH:mm format (string like "14:30")
      if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      }
      // Handle ISO date string
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        return time; // Return original if invalid
      }
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return time || "Invalid Time";
    }
  };

  // Helper function to check if scheduled time has arrived
  const hasScheduledTimeArrived = (booking: PickupSlotBooking): boolean => {
    // Check if booking has slot/schedule info (from backend)
    const slot = (booking as any).slot;
    const schedule = slot?.schedule || (booking as any).schedule;
    
    if (!schedule) {
      // If no schedule info, allow confirmation (fallback)
      return true;
    }
    
    // Use schedule's scheduledDate and scheduledTime
    const scheduledDate = schedule.scheduledDate;
    const scheduledTime = schedule.scheduledTime;
    
    if (!scheduledDate || !scheduledTime) {
      // If no scheduled time info, allow confirmation (fallback)
      return true;
    }
    
    // Parse scheduled date and time
    let scheduledDateTime: Date;
    try {
      // scheduledTime might be in ISO format or HH:mm format
      if (scheduledTime.includes('T')) {
        // Full ISO datetime string
        scheduledDateTime = new Date(scheduledTime);
      } else if (scheduledTime.includes(':')) {
        // HH:mm format, combine with scheduledDate
        const dateStr = scheduledDate instanceof Date 
          ? scheduledDate.toISOString().split('T')[0]
          : scheduledDate.toString().split('T')[0];
        scheduledDateTime = new Date(`${dateStr}T${scheduledTime}`);
      } else {
        // Fallback: use scheduledDate only
        scheduledDateTime = scheduledDate instanceof Date 
          ? scheduledDate 
          : new Date(scheduledDate);
      }
      
      // Check if scheduled time has passed
      const now = new Date();
      return scheduledDateTime <= now;
    } catch (error) {
      console.error('Error parsing scheduled time:', error);
      // On error, allow confirmation (fallback)
      return true;
    }
  };

  const handleConfirmPickup = (booking: PickupSlotBooking) => {
    // Check if scheduled time has arrived
    if (!hasScheduledTimeArrived(booking)) {
      // Get schedule info for error message
      const slot = (booking as any).slot;
      const schedule = slot?.schedule || (booking as any).schedule;
      const scheduledDate = schedule?.scheduledDate;
      const scheduledTime = schedule?.scheduledTime;
      
      let timeMessage = "the scheduled pickup time";
      if (scheduledDate && scheduledTime) {
        try {
          const dateStr = scheduledDate instanceof Date 
            ? scheduledDate.toISOString().split('T')[0]
            : scheduledDate.split('T')[0];
          const timeStr = scheduledTime.includes('T') 
            ? scheduledTime.split('T')[1]?.slice(0, 5) || scheduledTime
            : scheduledTime;
          timeMessage = `${dateStr} at ${timeStr}`;
        } catch (e) {
          // Use default message
        }
      }
      
      showError(
        "Cannot Confirm Pickup",
        `You cannot confirm pickup before the scheduled time (${timeMessage}). Please wait until the scheduled pickup time has arrived.`
      );
      return;
    }
    
    setSelectedBooking(booking);
    // Batch ID is generated by backend for consistency
    setConfirmationForm({ 
      variety: "",
      qualityGrade: "A",
      notes: "",
      photos: [],
    });
    setConfirmDialogOpen(true);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploadingPhotos(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const { url } = await uploadImage(files[i]);
        urls.push(url);
      }
      setConfirmationForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...urls],
      }));
    } catch (err) {
      showError("Upload failed", err instanceof Error ? err.message : "Failed to upload photos");
    } finally {
      setUploadingPhotos(false);
      event.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setConfirmationForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitConfirmation = async () => {
    if (!selectedBooking || !confirmationForm.variety) {
      showError("Validation error", "Please fill in all required fields (Variety)");
      return;
    }

    setIsConfirming(true);
    try {
      const result = await confirmPickup(selectedBooking.id, {
        variety: confirmationForm.variety,
        qualityGrade: confirmationForm.qualityGrade,
        photos: confirmationForm.photos.length > 0 ? confirmationForm.photos : undefined,
        notes: confirmationForm.notes || undefined,
      });

      if (result) {
        // Extract receipt from booking response (context returns PickupSlotBooking | null)
        const bookingReceipt = extractReceiptFromBooking(result);
        if (bookingReceipt) {
          showSuccess(
            "Pickup confirmed successfully",
            `Batch ${bookingReceipt.batchId} has been confirmed and receipt generated`
          );
          setReceipt(bookingReceipt);
          setConfirmDialogOpen(false);
          setReceiptDialogOpen(true);
        } else {
          showError("Failed to confirm pickup", "Receipt was not generated");
        }
        // Reset form
        setConfirmationForm({
          variety: "",
          qualityGrade: "A",
          notes: "",
          photos: [],
        });
        // Reload bookings (silently - don't show errors if this fails)
        try {
          await loadBookings();
        } catch (err) {
          // Silently fail - bookings will refresh on next page load
          console.warn("Failed to reload bookings after confirmation:", err);
        }
      } else {
        showError("Failed to confirm pickup", "An error occurred while confirming pickup");
      }
    } catch (err) {
      console.error("Failed to confirm pickup:", err);
      showError("Failed to confirm pickup", formatApiError(err));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleViewReceipt = async (booking: PickupSlotBooking) => {
    if (booking.pickupReceiptId) {
      try {
        const receiptData = await fetchPickupReceipt(booking.id);
        if (receiptData) {
          setReceipt(receiptData);
          setReceiptDialogOpen(true);
        }
      } catch (err) {
        console.error("Failed to load receipt:", err);
      }
    }
  };

  const handlePrintReceipt = () => {
    if (!receipt) return;

    // Use browser's native print on the current dialog content
    // Add print styles to hide dialog footer buttons
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page { margin: 1cm; }
        body { margin: 0; }
        .print\\:hidden { display: none !important; }
        .print\\:space-y-4 > * + * { margin-top: 1rem; }
      }
    `;
    document.head.appendChild(style);

    window.print();

    // Clean up style after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownloadReceipt = async () => {
    if (!receipt || !receiptPdfRef.current) return;
    try {
      await generatePDF(receiptPdfRef, {
        filename: `receipt_${receipt.receiptNumber}.pdf`,
        page: { format: "a4", margin: 10 },
      });
    } catch (err) {
      console.error("Failed to generate receipt PDF:", err);
      showError("Failed to generate PDF. Please try again.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700">Confirmed</Badge>;
      case "picked_up":
        return <Badge className="bg-green-100 text-green-700">Picked Up</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-700">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">My Pickup Bookings</h1>
          <p className="text-stone-500 mt-1">
            Track and confirm your scheduled produce pickups
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="picked_up">Picked Up</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {(isLoading || transportLoading) ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => {
            const schedule = null; // TODO: Fetch schedule details if needed
            const scheduledTimeArrived = hasScheduledTimeArrived(booking);
            const canConfirm = booking.status === "confirmed" && !booking.pickupConfirmed && scheduledTimeArrived;

            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Booking #{booking.id.slice(-8)}</CardTitle>
                      <CardDescription className="mt-1">
                        {booking.location}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Booking Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconCalendar className="h-4 w-4" />
                      <span>Booked: {formatDate(booking.bookedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-600">
                      <IconPackage className="h-4 w-4" />
                      <span>{booking.quantity.toLocaleString()} kg</span>
                    </div>
                    {booking.batchId && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <IconQrcode className="h-4 w-4" />
                        <span className="font-mono text-xs">{booking.batchId}</span>
                      </div>
                    )}
                  </div>

                  {/* Batch Status */}
                  {booking.pickupConfirmed && booking.batchId && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-sm">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-700">Pickup Confirmed</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Batch ID: <span className="font-mono">{booking.batchId}</span>
                      </p>
                      {booking.variety && (
                        <p className="text-xs text-green-600">
                          Variety: {booking.variety} | Grade: {booking.qualityGrade}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {booking.status === "confirmed" && !booking.pickupConfirmed && !scheduledTimeArrived && (
                      <div className="w-full p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-700">
                          Pickup confirmation will be available once the scheduled time arrives
                        </p>
                      </div>
                    )}
                    {canConfirm && (
                      <Button
                        className="flex-1"
                        onClick={() => handleConfirmPickup(booking)}
                      >
                        <IconCheck className="mr-2 h-4 w-4" />
                        Confirm Pickup
                      </Button>
                    )}
                    {booking.pickupReceiptId && (
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleViewReceipt(booking)}
                      >
                        <IconDownload className="mr-2 h-4 w-4" />
                        View Receipt
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
            <IconPackage className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-stone-500">No bookings found</p>
            <p className="text-sm text-stone-500 mt-1">
              {filterStatus !== "all"
                ? "Try adjusting your filters"
                : "You haven't booked any pickup slots yet"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirm Pickup Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Confirm Pickup & Create Batch</DialogTitle>
            <DialogDescription>
              Confirm that your produce has been picked up and create a batch for traceability
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              {/* Booking Summary */}
              <div className="p-3 bg-stone-50 rounded-lg space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Quantity:</span>
                  <span className="font-semibold">{selectedBooking.quantity.toLocaleString()} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Location:</span>
                  <span className="font-semibold">{selectedBooking.location}</span>
                </div>
              </div>

              {/* Variety and Quality Grade */}
              <div className="grid grid-cols-2 gap-6">
                {/* Variety */}
                <div className="space-y-2">
                  <Label htmlFor="variety">Produce Variety *</Label>
                  <Select
                    value={confirmationForm.variety}
                    onValueChange={(value: OFSPVariety) => {
                      setConfirmationForm({ ...confirmationForm, variety: value });
                    }}
                  >
                    <SelectTrigger id="variety" className="w-full">
                      <SelectValue>{confirmationForm.variety ? undefined : "Select variety"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {OFSP_VARIETY_VALUES.map((variety) => (
                        <SelectItem key={variety} value={variety}>
                          {OFSP_VARIETY_LABELS[variety as OFSPVariety]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Grade */}
                <div className="space-y-2">
                  <Label htmlFor="qualityGrade">Quality Grade *</Label>
                  <Select
                    value={confirmationForm.qualityGrade}
                    onValueChange={(value: "A" | "B" | "C") =>
                      setConfirmationForm({ ...confirmationForm, qualityGrade: value })
                    }
                  >
                    <SelectTrigger id="qualityGrade" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A (Premium)</SelectItem>
                      <SelectItem value="B">Grade B (Standard)</SelectItem>
                      <SelectItem value="C">Grade C (Economy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {uploadingPhotos && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                  {confirmationForm.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={getImageFullUrl(photo)} alt={`Photo ${index + 1}`} className="h-20 w-20 object-cover rounded" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center h-20 w-20 border-2 border-dashed border-stone-300 rounded cursor-pointer hover:border-primary">
                    <IconPhoto className="h-6 w-6 text-stone-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={confirmationForm.notes}
                  onChange={(e) => setConfirmationForm({ ...confirmationForm, notes: e.target.value })}
                  placeholder="Any additional notes about the pickup..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isConfirming}>
              Cancel
            </Button>
            <Button onClick={handleSubmitConfirmation} disabled={isConfirming || !confirmationForm.variety}>
              {isConfirming ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  <IconCheck className="mr-2 h-4 w-4" />
                  Confirm Pickup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none">
          <DialogHeader>
            <DialogTitle>Pickup Receipt</DialogTitle>
            <DialogDescription>
              Receipt for confirmed produce pickup
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div ref={receiptPdfRef} className="space-y-6 print:space-y-4">
              {/* Receipt Header */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Pickup Receipt</h3>
                    <p className="text-sm text-stone-500">#{receipt.receiptNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-stone-500">Date: {formatDate(receipt.pickupDate)}</p>
                    <p className="text-sm text-stone-500">Time: {formatTime(receipt.pickupTime)}</p>
                  </div>
                </div>
              </div>

              {/* Batch Info */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-stone-600">Batch ID</p>
                    <p className="text-lg font-bold font-mono">{receipt.batchId}</p>
                  </div>
                  {(receipt.batchId || receipt.qrCode) && (
                    <div className="text-center">
                      <div className="bg-white p-2 rounded-lg inline-block">
                        <QRCode
                          value={getBatchVerifyUrl(receipt.batchId || receipt.qrCode)}
                          size={120}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 120 120`}
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1">QR Code</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-stone-600">Farmer</p>
                  <p className="text-base">{receipt.farmerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Transport Provider</p>
                  <p className="text-base">{receipt.providerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Destination</p>
                  <p className="text-base">{receipt.aggregationCenterName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Pickup Location</p>
                  <p className="text-base">{receipt.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Quantity</p>
                  <p className="text-base font-semibold">{receipt.quantity.toLocaleString()} kg</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Variety</p>
                  <p className="text-base">{receipt.variety}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-600">Quality Grade</p>
                  <Badge className="bg-primary/10 text-primary">
                    Grade {receipt.qualityGrade}
                  </Badge>
                </div>
                {receipt.scheduledDeliveryDate && (
                  <div>
                    <p className="text-sm font-medium text-stone-600">Expected Delivery</p>
                    <p className="text-base">{formatDate(receipt.scheduledDeliveryDate)}</p>
                  </div>
                )}
              </div>

              {/* Photos */}
              {receipt.photos && receipt.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {receipt.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={getImageFullUrl(photo)}
                        alt={`Photo ${index + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {receipt.notes && (
                <div>
                  <p className="text-sm font-medium text-stone-600 mb-1">Notes</p>
                  <p className="text-sm text-stone-700">{receipt.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-4 text-center text-xs text-stone-500">
                <p>This receipt confirms the pickup of produce and creation of batch for traceability.</p>
                <p className="mt-1">Batch ID: {receipt.batchId} is now traceable throughout the supply chain.</p>
              </div>
            </div>
          )}
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <IconPrinter className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadReceipt}>
              <IconDownload className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
