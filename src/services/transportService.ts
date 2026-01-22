/**
 * Transport Service
 * 
 * Handles all transport-related API calls:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 * - Pickup schedules and slots
 * 
 * Backend API endpoints:
 * - GET /api/v1/transport/requests - List transport requests
 * - GET /api/v1/transport/requests/:id - Get request details
 * - POST /api/v1/transport/requests - Create transport request
 * - PUT /api/v1/transport/requests/:id/accept - Accept request
 * - PUT /api/v1/transport/requests/:id/status - Update request status
 * - GET /api/v1/transport/pickup-schedules - List pickup schedules
 * - POST /api/v1/transport/pickup-schedules - Create pickup schedule
 * - GET /api/v1/transport/pickup-slots - Get pickup slots
 * - POST /api/v1/transport/pickup-slots/:id/book - Book pickup slot
 * - GET /api/v1/transport/tracking/:requestId - Get tracking updates
 * - POST /api/v1/transport/tracking/:requestId - Add tracking update
 * - GET /api/v1/transport/stats - Get transport statistics
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
import { apiGet, apiPost, apiPut } from "@/lib/api-client";

// ==================== Transport Requests ====================

/**
 * Get all transport requests
 * Backend: GET /api/v1/transport/requests
 */
export async function getTransportRequests(filters?: TransportFilters): Promise<TransportRequest[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.requesterId) params.requesterId = filters.requesterId;
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.status) params.status = filters.status;
    if (filters?.type) params.type = filters.type;

    return await apiGet<TransportRequest[]>('/transport/requests', params);
  } catch (error) {
    console.error('Error fetching transport requests:', error);
    return [];
  }
}

/**
 * Get transport request by ID
 * Backend: GET /api/v1/transport/requests/:id
 */
export async function getTransportRequestById(id: string): Promise<TransportRequest | null> {
  try {
    return await apiGet<TransportRequest>(`/transport/requests/${id}`);
  } catch (error) {
    console.error('Error fetching transport request:', error);
    return null;
  }
}

/**
 * Create a transport request
 * Backend: POST /api/v1/transport/requests
 */
export async function createTransportRequest(request: Partial<TransportRequest>): Promise<ApiResponse<TransportRequest>> {
  try {
    const created = await apiPost<TransportRequest>('/transport/requests', request);
    return { data: created, message: "Transport request created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create transport request" };
  }
}

/**
 * Accept a transport request
 * Backend: PUT /api/v1/transport/requests/:id/accept
 */
export async function acceptTransportRequest(id: string, providerId: string): Promise<ApiResponse<TransportRequest>> {
  try {
    const accepted = await apiPut<TransportRequest>(`/transport/requests/${id}/accept`);
    return { data: accepted, message: "Request accepted" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to accept request" };
  }
}

/**
 * Reject transport request
 * TODO: Backend needs to implement PUT /api/v1/transport/requests/:id/reject
 */
export async function rejectTransportRequest(id: string): Promise<ApiResponse<TransportRequest>> {
  // Backend doesn't have reject endpoint yet - using status update as fallback
  return updateTransportRequestStatus(id, "rejected" as TransportRequest["status"]);
}

/**
 * Update transport request status
 * Backend: PUT /api/v1/transport/requests/:id/status
 */
export async function updateTransportRequestStatus(
  id: string,
  status: TransportRequest["status"]
): Promise<ApiResponse<TransportRequest>> {
  try {
    const updated = await apiPut<TransportRequest>(`/transport/requests/${id}/status`, { status });
    return { data: updated, message: "Request status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update request status" };
  }
}

/**
 * Get active deliveries
 * TODO: Backend needs to implement GET /api/v1/transport/deliveries endpoint
 */
export async function getActiveDeliveries(): Promise<ActiveDelivery[]> {
  // Backend doesn't have deliveries endpoint yet
  // Filter transport requests by status as fallback
  try {
    const requests = await getTransportRequests({ status: "in_transit" });
    return requests.filter(r => r.status === "in_transit" || r.status === "delivered") as ActiveDelivery[];
  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    return [];
  }
}

/**
 * Add tracking update
 * Backend: POST /api/v1/transport/tracking/:requestId
 */
export async function addTrackingUpdate(
  deliveryId: string,
  update: Partial<DeliveryTrackingUpdate>
): Promise<ApiResponse<DeliveryTrackingUpdate>> {
  try {
    const created = await apiPost<DeliveryTrackingUpdate>(`/transport/tracking/${deliveryId}`, update);
    return { data: created, message: "Tracking update added" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to add tracking update" };
  }
}

/**
 * Get tracking updates
 * Backend: GET /api/v1/transport/tracking/:requestId
 */
export async function getTrackingUpdates(requestId: string): Promise<DeliveryTrackingUpdate[]> {
  try {
    return await apiGet<DeliveryTrackingUpdate[]>(`/transport/tracking/${requestId}`);
  } catch (error) {
    console.error('Error fetching tracking updates:', error);
    return [];
  }
}

/**
 * Get transport statistics
 * Backend: GET /api/v1/transport/stats
 */
export async function getTransportStats(): Promise<TransportStats> {
  try {
    return await apiGet<TransportStats>('/transport/stats');
  } catch (error) {
    console.error('Error fetching transport stats:', error);
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
}

// ==================== Farm Pickup Schedule Services ====================

/**
 * Get farm pickup schedules
 * Backend: GET /api/v1/transport/pickup-schedules
 */
export async function getPickupSchedules(filters?: PickupScheduleFilters): Promise<FarmPickupSchedule[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.aggregationCenterId) params.centerId = filters.aggregationCenterId;
    if (filters?.status && filters.status !== "all") params.status = filters.status;
    if (filters?.dateRange) {
      params.dateFrom = filters.dateRange.start;
      params.dateTo = filters.dateRange.end;
    }

    const schedules = await apiGet<FarmPickupSchedule[]>('/transport/pickup-schedules', params);
    
    // Filter by available capacity on frontend if needed
    if (filters?.hasAvailableCapacity) {
      return schedules.filter(s => s.availableCapacity > 0);
    }
    
    return schedules;
  } catch (error) {
    console.error('Error fetching pickup schedules:', error);
    return [];
  }
}

/**
 * Get pickup schedule by ID
 * Backend: GET /api/v1/transport/pickup-schedules/:id
 */
export async function getPickupScheduleById(id: string): Promise<FarmPickupSchedule | null> {
  try {
    return await apiGet<FarmPickupSchedule>(`/transport/pickup-schedules/${id}`);
  } catch (error) {
    console.error('Error fetching pickup schedule:', error);
    return null;
  }
}

/**
 * Create farm pickup schedule
 * Backend: POST /api/v1/transport/pickup-schedules
 */
export async function createPickupSchedule(schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  try {
    const created = await apiPost<FarmPickupSchedule>('/transport/pickup-schedules', schedule);
    return { data: created, message: "Pickup schedule created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create pickup schedule" };
  }
}

/**
 * Update pickup schedule
 * TODO: Backend needs to implement PUT /api/v1/transport/pickup-schedules/:id
 */
export async function updatePickupSchedule(id: string, schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  // Backend doesn't have update endpoint yet
  return { data: schedule as FarmPickupSchedule, message: "Update not implemented yet" };
}

/**
 * Publish pickup schedule
 * TODO: Backend needs to implement PUT /api/v1/transport/pickup-schedules/:id/publish
 */
export async function publishPickupSchedule(id: string): Promise<ApiResponse<FarmPickupSchedule>> {
  // Backend doesn't have publish endpoint yet
  return { data: null as any, error: "Publish not implemented yet" };
}

/**
 * Cancel pickup schedule
 * TODO: Backend needs to implement PUT /api/v1/transport/pickup-schedules/:id/cancel
 */
export async function cancelPickupSchedule(id: string): Promise<ApiResponse<FarmPickupSchedule>> {
  // Backend doesn't have cancel endpoint yet
  return { data: null as any, error: "Cancel not implemented yet" };
}

/**
 * Get pickup slots for a schedule
 * Backend: GET /api/v1/transport/pickup-slots?scheduleId=...
 */
export async function getPickupSlots(scheduleId: string): Promise<PickupSlot[]> {
  try {
    return await apiGet<PickupSlot[]>('/transport/pickup-slots', { scheduleId });
  } catch (error) {
    console.error('Error fetching pickup slots:', error);
    return [];
  }
}

/**
 * Book pickup slot
 * Backend: POST /api/v1/transport/pickup-slots/:id/book
 */
export async function bookPickupSlot(scheduleId: string, slotId: string, booking: Partial<PickupSlotBooking>): Promise<ApiResponse<PickupSlotBooking>> {
  try {
    const created = await apiPost<PickupSlotBooking>(`/transport/pickup-slots/${slotId}/book`, booking);
    return { data: created, message: "Slot booked successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to book slot" };
  }
}

/**
 * Cancel pickup slot booking
 * TODO: Backend needs to implement DELETE /api/v1/transport/pickup-slots/:id/book or similar
 */
export async function cancelPickupSlotBooking(bookingId: string): Promise<ApiResponse<void>> {
  // Backend doesn't have cancel booking endpoint yet
  return { data: undefined, error: "Cancel booking not implemented yet" };
}

/**
 * Get aggregation center capacity
 * TODO: Backend needs to implement GET /api/v1/aggregation/centers/:id/capacity
 */
export async function getAggregationCenterCapacity(centerId: string): Promise<AggregationCenterCapacity> {
  // Backend doesn't have capacity endpoint yet - will be in aggregation service
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
  try {
    const scheduleFilters: PickupScheduleFilters = {
      aggregationCenterId: filters?.aggregationCenterId,
      dateRange: filters?.dateRange,
      status: "published",
      hasAvailableCapacity: filters?.minAvailableCapacity ? true : undefined,
    };
    
    let schedules = await getPickupSchedules(scheduleFilters);
    
    // Filter by minimum available capacity
    if (filters?.minAvailableCapacity) {
      schedules = schedules.filter(s => s.availableCapacity >= filters.minAvailableCapacity!);
    }
    
    return schedules;
  } catch (error) {
    console.error('Error fetching available pickup schedules:', error);
    return [];
  }
}

/**
 * Get farmer's pickup bookings
 * TODO: Backend needs to implement GET /api/v1/transport/pickup-slots/bookings?farmerId=...
 */
export async function getFarmerPickupBookings(farmerId: string): Promise<PickupSlotBooking[]> {
  // Backend doesn't have bookings endpoint yet
  return [];
}

/**
 * Confirm pickup and create batch
 * TODO: Backend needs to implement POST /api/v1/transport/pickup-slots/:id/confirm
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
  // Backend doesn't have confirm pickup endpoint yet
  return { data: null as any, error: "Confirm pickup not implemented yet" };
}

/**
 * Get pickup receipt by ID
 * TODO: Backend needs to implement GET /api/v1/transport/receipts/:id
 */
export async function getPickupReceipt(receiptId: string): Promise<PickupReceipt | null> {
  // Backend doesn't have receipts endpoint yet
  return null;
}

/**
 * Get pickup receipt by booking ID
 * TODO: Backend needs to implement GET /api/v1/transport/receipts?bookingId=...
 */
export async function getPickupReceiptByBooking(bookingId: string): Promise<PickupReceipt | null> {
  // Backend doesn't have receipts endpoint yet
  return null;
}

/**
 * Generate batch ID (client-side utility)
 */
export function generateBatchId(farmerId: string, variety: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const farmerPrefix = farmerId.slice(0, 4).toUpperCase();
  return `BATCH-${farmerPrefix}-${variety.toUpperCase().slice(0, 3)}-${timestamp}-${random}`;
}
