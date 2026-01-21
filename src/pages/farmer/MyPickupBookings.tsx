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
  IconClock,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconQrcode,
  IconPhoto,
  IconDownload,
  IconPrinter,
} from "@tabler/icons-react";
import { useTransport } from "@/contexts/TransportContext";
import { useAuth } from "@/contexts/AuthContext";
import { allAggregationCenters } from "@/data/aggregationCenters";
import { cn } from "@/lib/utils";
import { getFarmerPickupBookings, confirmPickup, generateBatchId, getPickupReceiptByBooking } from "@/services/transportService";
import type { PickupSlotBooking, PickupReceipt } from "@/types/transport";

export function MyPickupBookings() {
  const { user } = useAuth();
  const { fetchPickupSchedules } = useTransport();

  const [bookings, setBookings] = useState<PickupSlotBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<PickupSlotBooking | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receipt, setReceipt] = useState<PickupReceipt | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Confirmation form state
  const [confirmationForm, setConfirmationForm] = useState({
    batchId: "",
    variety: "",
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
      const data = await getFarmerPickupBookings(user.id);
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => filterStatus === "all" || booking.status === filterStatus
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
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

  const handleConfirmPickup = (booking: PickupSlotBooking) => {
    setSelectedBooking(booking);
    // Auto-generate batch ID when dialog opens (with default variety)
    if (user?.id) {
      const autoBatchId = generateBatchId(user.id, "OFSP");
      setConfirmationForm({ 
        batchId: autoBatchId,
        variety: "",
        qualityGrade: "A",
        notes: "",
        photos: [],
      });
    }
    setConfirmDialogOpen(true);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // TODO: Replace with actual file upload API
    const newPhotos = Array.from(files).map((file) => URL.createObjectURL(file));
    setConfirmationForm({
      ...confirmationForm,
      photos: [...confirmationForm.photos, ...newPhotos],
    });
  };

  const handleRemovePhoto = (index: number) => {
    setConfirmationForm({
      ...confirmationForm,
      photos: confirmationForm.photos.filter((_, i) => i !== index),
    });
  };

  const handleSubmitConfirmation = async () => {
    if (!selectedBooking || !confirmationForm.variety) {
      alert("Please fill in all required fields (Variety)");
      return;
    }

    // Ensure batch ID is generated if somehow missing
    if (!confirmationForm.batchId && user?.id) {
      const batchId = generateBatchId(user.id, confirmationForm.variety);
      setConfirmationForm(prev => ({ ...prev, batchId }));
    }

    setIsConfirming(true);
    try {
      const result = await confirmPickup(selectedBooking.id, {
        batchId: confirmationForm.batchId,
        variety: confirmationForm.variety,
        qualityGrade: confirmationForm.qualityGrade,
        photos: confirmationForm.photos.length > 0 ? confirmationForm.photos : undefined,
        notes: confirmationForm.notes || undefined,
      });

      if (result.data) {
        setReceipt(result.data);
        setConfirmDialogOpen(false);
        setReceiptDialogOpen(true);
        // Reset form
        setConfirmationForm({
          batchId: "",
          variety: "",
          qualityGrade: "A",
          notes: "",
          photos: [],
        });
        // Reload bookings
        await loadBookings();
      } else {
        alert(result.error || "Failed to confirm pickup");
      }
    } catch (err) {
      console.error("Failed to confirm pickup:", err);
      alert("Failed to confirm pickup. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleViewReceipt = async (booking: PickupSlotBooking) => {
    if (booking.pickupReceiptId) {
      try {
        const receiptData = await getPickupReceiptByBooking(booking.id);
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
    window.print();
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement PDF download
    alert("PDF download feature coming soon");
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => {
            const schedule = null; // TODO: Fetch schedule details if needed
            const canConfirm = booking.status === "confirmed" && !booking.pickupConfirmed;

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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Pickup & Create Batch</DialogTitle>
            <DialogDescription>
              Confirm that your produce has been picked up and create a batch for traceability
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
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

              {/* Batch ID (Auto-generated) */}
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID *</Label>
                <Input
                  id="batchId"
                  value={confirmationForm.batchId}
                  readOnly
                  className="font-mono bg-stone-50"
                  placeholder="Auto-generated..."
                />
                <p className="text-xs text-stone-500">
                  Batch ID is auto-generated and will be used for traceability throughout the supply chain
                </p>
              </div>

              {/* Variety */}
              <div className="space-y-2">
                <Label htmlFor="variety">Produce Variety *</Label>
                <Input
                  id="variety"
                  value={confirmationForm.variety}
                  onChange={(e) => {
                    const variety = e.target.value;
                    setConfirmationForm({ ...confirmationForm, variety });
                    // Auto-update batch ID when variety changes
                    if (user?.id && variety) {
                      const newBatchId = generateBatchId(user.id, variety);
                      setConfirmationForm(prev => ({ ...prev, batchId: newBatchId }));
                    }
                  }}
                  placeholder="e.g., Kenya, Kabode, Vita"
                />
                <p className="text-xs text-stone-500">
                  Batch ID will update automatically when you enter the variety
                </p>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A (Premium)</SelectItem>
                    <SelectItem value="B">Grade B (Standard)</SelectItem>
                    <SelectItem value="C">Grade C (Economy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Photos (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {confirmationForm.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Photo ${index + 1}`} className="h-20 w-20 object-cover rounded" />
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
            <Button onClick={handleSubmitConfirmation} disabled={isConfirming || !confirmationForm.batchId || !confirmationForm.variety}>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pickup Receipt</DialogTitle>
            <DialogDescription>
              Receipt for confirmed produce pickup
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <div className="space-y-6 print:space-y-4">
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
                  {receipt.qrCode && (
                    <div className="text-center">
                      <IconQrcode className="h-12 w-12 mx-auto text-primary" />
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
                        src={photo}
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
