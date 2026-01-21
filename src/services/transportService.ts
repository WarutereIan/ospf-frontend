/**
 * Transport Service
 * 
 * Handles all transport-related API calls:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 * 
 * Backend API endpoints to implement:
 * - GET /api/transport/requests - List transport requests
 * - GET /api/transport/requests/:id - Get request details
 * - POST /api/transport/requests - Create transport request
 * - PUT /api/transport/requests/:id/accept - Accept request
 * - PUT /api/transport/requests/:id/reject - Reject request
 * - PUT /api/transport/requests/:id/status - Update request status
 * - GET /api/transport/deliveries - List active deliveries
 * - GET /api/transport/deliveries/:id - Get delivery details
 * - POST /api/transport/deliveries/:id/tracking - Add tracking update
 * - GET /api/transport/stats - Get transport statistics
 */

import type {
  TransportRequest,
  ActiveDelivery,
  DeliveryTrackingUpdate,
  TransportFilters,
  TransportStats,
  FarmPickupSchedule,
  PickupSlot,
  PickupSlotBooking,
  PickupScheduleFilters,
  AggregationCenterCapacity,
  PickupReceipt,
} from "@/types/transport";
import type { ApiResponse } from "@/types/inputCustomer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

const MOCK_REQUESTS: TransportRequest[] = [];

export async function getTransportRequests(filters?: TransportFilters): Promise<TransportRequest[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS;
}

export async function getTransportRequestById(id: string): Promise<TransportRequest | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS.find(request => request.id === id) || null;
}

export async function createTransportRequest(request: Partial<TransportRequest>): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: request as TransportRequest, message: "Transport request created successfully" };
}

export async function acceptTransportRequest(id: string, providerId: string): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status: "accepted", providerId }, message: "Request accepted" };
}

export async function rejectTransportRequest(id: string): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status: "rejected" }, message: "Request rejected" };
}

export async function updateTransportRequestStatus(
  id: string,
  status: TransportRequest["status"]
): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status }, message: "Request status updated" };
}

export async function getActiveDeliveries(): Promise<ActiveDelivery[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS.filter(r => r.status === "in_transit" || r.status === "delivered") as ActiveDelivery[];
}

export async function addTrackingUpdate(
  deliveryId: string,
  update: Partial<DeliveryTrackingUpdate>
): Promise<ApiResponse<DeliveryTrackingUpdate>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: update as DeliveryTrackingUpdate, message: "Tracking update added" };
}

export async function getTransportStats(): Promise<TransportStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    totalRequests: 0,
    pendingRequests: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalRevenue: 0,
    averageDistance: 0,
    onTimeDeliveryRate: 0,
  };
}

// Farm Pickup Schedule Services

const MOCK_SCHEDULES: FarmPickupSchedule[] = [];
const MOCK_SLOT_BOOKINGS: PickupSlotBooking[] = [];

/**
 * Get farm pickup schedules
 */
export async function getPickupSchedules(filters?: PickupScheduleFilters): Promise<FarmPickupSchedule[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  let filtered = [...MOCK_SCHEDULES];
  
  if (filters) {
    if (filters.providerId) {
      filtered = filtered.filter(s => s.providerId === filters.providerId);
    }
    if (filters.aggregationCenterId) {
      filtered = filtered.filter(s => s.aggregationCenterId === filters.aggregationCenterId);
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(s => s.status === filters.status);
    }
    if (filters.hasAvailableCapacity) {
      filtered = filtered.filter(s => s.availableCapacity > 0);
    }
    if (filters.dateRange) {
      filtered = filtered.filter(s => {
        const scheduleDate = new Date(s.scheduledDate);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return scheduleDate >= start && scheduleDate <= end;
      });
    }
  }
  
  return filtered;
}

/**
 * Get pickup schedule by ID
 */
export async function getPickupScheduleById(id: string): Promise<FarmPickupSchedule | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_SCHEDULES.find(s => s.id === id) || null;
}

/**
 * Create farm pickup schedule
 */
export async function createPickupSchedule(schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const newSchedule: FarmPickupSchedule = {
    id: `schedule-${Date.now()}`,
    scheduleNumber: `SCH-${Date.now().toString().slice(-6)}`,
    providerId: schedule.providerId || "",
    providerName: schedule.providerName || "",
    aggregationCenterId: schedule.aggregationCenterId || "",
    aggregationCenterName: schedule.aggregationCenterName || "",
    route: schedule.route || "",
    scheduledDate: schedule.scheduledDate || new Date().toISOString(),
    scheduledTime: schedule.scheduledTime || "",
    totalCapacity: schedule.totalCapacity || 0,
    usedCapacity: 0,
    availableCapacity: schedule.totalCapacity || 0,
    pickupLocations: schedule.pickupLocations || [],
    status: schedule.status || "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_SCHEDULES.push(newSchedule);
  return { data: newSchedule, message: "Pickup schedule created successfully" };
}

/**
 * Update pickup schedule
 */
export async function updatePickupSchedule(id: string, schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const index = MOCK_SCHEDULES.findIndex(s => s.id === id);
  if (index === -1) {
    return { data: null as any, error: "Schedule not found" };
  }
  const updated = { ...MOCK_SCHEDULES[index], ...schedule, updatedAt: new Date().toISOString() };
  MOCK_SCHEDULES[index] = updated;
  return { data: updated, message: "Schedule updated successfully" };
}

/**
 * Publish pickup schedule
 */
export async function publishPickupSchedule(id: string): Promise<ApiResponse<FarmPickupSchedule>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const schedule = MOCK_SCHEDULES.find(s => s.id === id);
  if (!schedule) {
    return { data: null as any, error: "Schedule not found" };
  }
  const updated = { ...schedule, status: "published" as const, publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const index = MOCK_SCHEDULES.findIndex(s => s.id === id);
  MOCK_SCHEDULES[index] = updated;
  return { data: updated, message: "Schedule published successfully" };
}

/**
 * Cancel pickup schedule
 */
export async function cancelPickupSchedule(id: string): Promise<ApiResponse<FarmPickupSchedule>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const schedule = MOCK_SCHEDULES.find(s => s.id === id);
  if (!schedule) {
    return { data: null as any, error: "Schedule not found" };
  }
  const updated = { ...schedule, status: "cancelled" as const, updatedAt: new Date().toISOString() };
  const index = MOCK_SCHEDULES.findIndex(s => s.id === id);
  MOCK_SCHEDULES[index] = updated;
  return { data: updated, message: "Schedule cancelled successfully" };
}

/**
 * Get pickup slots for a schedule
 */
export async function getPickupSlots(scheduleId: string): Promise<PickupSlot[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  // Mock implementation - in real app, fetch from API
  return [];
}

/**
 * Book pickup slot
 */
export async function bookPickupSlot(scheduleId: string, slotId: string, booking: Partial<PickupSlotBooking>): Promise<ApiResponse<PickupSlotBooking>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const newBooking: PickupSlotBooking = {
    id: `booking-${Date.now()}`,
    slotId,
    scheduleId,
    farmerId: booking.farmerId || "",
    farmerName: booking.farmerName || "",
    quantity: booking.quantity || 0,
    location: booking.location || "",
    contactPhone: booking.contactPhone || "",
    status: "confirmed",
    bookedAt: new Date().toISOString(),
  };
  MOCK_SLOT_BOOKINGS.push(newBooking);
  
  // Update schedule capacity
  const schedule = MOCK_SCHEDULES.find(s => s.id === scheduleId);
  if (schedule) {
    schedule.usedCapacity += newBooking.quantity;
    schedule.availableCapacity = schedule.totalCapacity - schedule.usedCapacity;
    schedule.updatedAt = new Date().toISOString();
  }
  
  return { data: newBooking, message: "Slot booked successfully" };
}

/**
 * Cancel pickup slot booking
 */
export async function cancelPickupSlotBooking(bookingId: string): Promise<ApiResponse<void>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const booking = MOCK_SLOT_BOOKINGS.find(b => b.id === bookingId);
  if (!booking) {
    return { data: undefined, error: "Booking not found" };
  }
  
  // Update schedule capacity
  const schedule = MOCK_SCHEDULES.find(s => s.id === booking.scheduleId);
  if (schedule) {
    schedule.usedCapacity -= booking.quantity;
    schedule.availableCapacity = schedule.totalCapacity - schedule.usedCapacity;
    schedule.updatedAt = new Date().toISOString();
  }
  
  // Remove booking
  const index = MOCK_SLOT_BOOKINGS.findIndex(b => b.id === bookingId);
  MOCK_SLOT_BOOKINGS.splice(index, 1);
  
  return { data: undefined, message: "Booking cancelled successfully" };
}

/**
 * Get aggregation center capacity
 */
export async function getAggregationCenterCapacity(centerId: string): Promise<AggregationCenterCapacity> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  // Mock implementation - in real app, fetch from aggregation service
  return {
    centerId,
    centerName: "Aggregation Center",
    totalCapacity: 10000,
    usedCapacity: 5000,
    availableCapacity: 5000,
    capacityPercentage: 50,
    status: "available",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get available pickup schedules for farmer
 * Filters by date, center, and available capacity
 */
export async function getAvailablePickupSchedules(filters?: {
  aggregationCenterId?: string;
  dateRange?: { start: string; end: string };
  minAvailableCapacity?: number;
}): Promise<FarmPickupSchedule[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  let filtered = MOCK_SCHEDULES.filter(s => 
    s.status === "published" || s.status === "active"
  );
  
  if (filters) {
    if (filters.aggregationCenterId) {
      filtered = filtered.filter(s => s.aggregationCenterId === filters.aggregationCenterId);
    }
    if (filters.dateRange) {
      filtered = filtered.filter(s => {
        const scheduleDate = new Date(s.scheduledDate);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return scheduleDate >= start && scheduleDate <= end;
      });
    }
    if (filters.minAvailableCapacity) {
      filtered = filtered.filter(s => s.availableCapacity >= filters.minAvailableCapacity!);
    }
  }
  
  return filtered;
}

/**
 * Get farmer's pickup bookings
 */
export async function getFarmerPickupBookings(farmerId: string): Promise<PickupSlotBooking[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_SLOT_BOOKINGS.filter(b => b.farmerId === farmerId);
}

/**
 * Confirm pickup and create batch
 */
export async function confirmPickup(
  bookingId: string,
  data: {
    batchId: string;
    variety: string;
    qualityGrade: "A" | "B" | "C";
    photos?: string[];
    notes?: string;
  }
): Promise<ApiResponse<PickupReceipt>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const booking = MOCK_SLOT_BOOKINGS.find(b => b.id === bookingId);
  if (!booking) {
    return { data: null as any, error: "Booking not found" };
  }

  // Generate QR code for batch
  const qrCode = `QR-${data.batchId}`;

  // Update booking
  booking.batchId = data.batchId;
  booking.qrCode = qrCode;
  booking.pickupConfirmed = true;
  booking.pickupConfirmedAt = new Date().toISOString();
  booking.pickupConfirmedBy = booking.farmerId;
  booking.status = "picked_up";
  booking.variety = data.variety;
  booking.qualityGrade = data.qualityGrade;
  booking.photos = data.photos;
  booking.notes = data.notes;

  // Get schedule for receipt
  const schedule = MOCK_SCHEDULES.find(s => s.id === booking.scheduleId);
  if (!schedule) {
    return { data: null as any, error: "Schedule not found" };
  }

  // Create receipt
  const receipt: PickupReceipt = {
    id: `receipt-${Date.now()}`,
    receiptNumber: `PUP-${Date.now().toString().slice(-8)}`,
    bookingId: booking.id,
    scheduleId: booking.scheduleId,
    farmerId: booking.farmerId,
    farmerName: booking.farmerName,
    providerId: schedule.providerId,
    providerName: schedule.providerName,
    aggregationCenterId: schedule.aggregationCenterId,
    aggregationCenterName: schedule.aggregationCenterName,
    batchId: data.batchId,
    qrCode,
    quantity: booking.quantity,
    variety: data.variety,
    qualityGrade: data.qualityGrade,
    pickupLocation: booking.location,
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: new Date().toISOString(),
    scheduledDeliveryDate: schedule.scheduledDate,
    photos: data.photos,
    notes: data.notes,
    createdAt: new Date().toISOString(),
    createdBy: booking.farmerId,
  };

  booking.pickupReceiptId = receipt.id;

  return { data: receipt, message: "Pickup confirmed and receipt generated" };
}

/**
 * Get pickup receipt by ID
 */
export async function getPickupReceipt(receiptId: string): Promise<PickupReceipt | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  // Mock implementation - in real app, fetch from API
  return null;
}

/**
 * Get pickup receipt by booking ID
 */
export async function getPickupReceiptByBooking(bookingId: string): Promise<PickupReceipt | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  // Mock implementation - in real app, fetch from API
  return null;
}

/**
 * Generate batch ID
 */
export function generateBatchId(farmerId: string, variety: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const farmerPrefix = farmerId.slice(0, 4).toUpperCase();
  return `BATCH-${farmerPrefix}-${variety.toUpperCase().slice(0, 3)}-${timestamp}-${random}`;
}
