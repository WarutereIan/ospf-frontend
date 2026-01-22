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
  TransportRequestStatus,
  TransportRequestType,
  PickupScheduleStatus,
  PickupSlotStatus,
} from "@/types/transport";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

// ==================== Enum Transformation Utilities ====================

/**
 * Map backend transport request status (UPPER_CASE) to frontend format (lowercase)
 * Backend has separate pickup/delivery statuses, frontend has simplified "in_transit"
 */
function mapTransportRequestStatus(backendStatus: string): TransportRequestStatus {
  const statusMap: Record<string, TransportRequestStatus> = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    IN_TRANSIT_PICKUP: 'in_transit', // Map to simplified frontend status
    IN_TRANSIT_DELIVERY: 'in_transit', // Map to simplified frontend status
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Map backend transport request type (UPPER_CASE) to frontend format (lowercase)
 */
function mapTransportRequestType(backendType: string): TransportRequestType {
  const typeMap: Record<string, TransportRequestType> = {
    PRODUCE_PICKUP: 'produce_pickup',
    PRODUCE_DELIVERY: 'produce_delivery',
    INPUT_DELIVERY: 'input_delivery',
  };
  return typeMap[backendType] || 'produce_pickup';
}

/**
 * Map backend pickup schedule status (UPPER_CASE) to frontend format (lowercase)
 */
function mapPickupScheduleStatus(backendStatus: string): PickupScheduleStatus {
  const statusMap: Record<string, PickupScheduleStatus> = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return statusMap[backendStatus] || 'draft';
}

/**
 * Map backend pickup slot status (UPPER_CASE) to frontend format (lowercase)
 */
function mapPickupSlotStatus(backendStatus: string): PickupSlotStatus {
  const statusMap: Record<string, PickupSlotStatus> = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    FULL: 'full',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  };
  return statusMap[backendStatus] || 'available';
}

/**
 * Transform transport request from backend format to frontend format
 */
function transformTransportRequest(request: any): TransportRequest {
  return {
    ...request,
    status: mapTransportRequestStatus(request.status),
    type: mapTransportRequestType(request.type),
    requestType: request.requestType ? mapTransportRequestType(request.requestType) : request.requestType,
  };
}

/**
 * Transform pickup schedule from backend format to frontend format
 */
function transformPickupSchedule(schedule: any): FarmPickupSchedule {
  return {
    ...schedule,
    status: mapPickupScheduleStatus(schedule.status),
  };
}

/**
 * Transform pickup slot from backend format to frontend format
 */
function transformPickupSlot(slot: any): PickupSlot {
  return {
    ...slot,
    status: mapPickupSlotStatus(slot.status),
  };
}

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
    // Transform status filter to backend format (UPPER_CASE) if provided
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }
    // Transform type filter to backend format (UPPER_CASE) if provided
    if (filters?.type && filters.type !== "all") {
      params.type = filters.type.toUpperCase().replace(/_/g, '_');
    }

    const requests = await apiGet<any[]>('/transport/requests', params);
    return requests.map(transformTransportRequest);
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
    const request = await apiGet<any>(`/transport/requests/${id}`);
    return transformTransportRequest(request);
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
    const created = await apiPost<any>('/transport/requests', request);
    return { data: transformTransportRequest(created), message: "Transport request created successfully" };
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
    const accepted = await apiPut<any>(`/transport/requests/${id}/accept`);
    return { data: transformTransportRequest(accepted), message: "Request accepted" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to accept request" };
  }
}

/**
 * Reject transport request
 * Backend: PUT /api/v1/transport/requests/:id/reject
 */
export async function rejectTransportRequest(id: string): Promise<ApiResponse<TransportRequest>> {
  try {
    const rejected = await apiPut<any>(`/transport/requests/${id}/reject`);
    return { data: transformTransportRequest(rejected), message: "Request rejected" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to reject request" };
  }
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
    // Transform frontend status to backend format (UPPER_CASE)
    const backendStatus = status.toUpperCase().replace(/_/g, '_');
    const updated = await apiPut<any>(`/transport/requests/${id}/status`, { status: backendStatus });
    return { data: transformTransportRequest(updated), message: "Request status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update request status" };
  }
}

/**
 * Get active deliveries
 * Backend: GET /api/v1/transport/deliveries
 */
export async function getActiveDeliveries(filters?: {
  providerId?: string;
  requesterId?: string;
}): Promise<ActiveDelivery[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.requesterId) params.requesterId = filters.requesterId;

    return await apiGet<ActiveDelivery[]>('/transport/deliveries', params);
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

    const schedules = await apiGet<any[]>('/transport/pickup-schedules', params);
    const transformed = schedules.map(transformPickupSchedule);
    
    // Filter by available capacity on frontend if needed
    if (filters?.hasAvailableCapacity) {
      return transformed.filter(s => s.availableCapacity > 0);
    }
    
    return transformed;
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
    const schedule = await apiGet<any>(`/transport/pickup-schedules/${id}`);
    return transformPickupSchedule(schedule);
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
    const created = await apiPost<any>('/transport/pickup-schedules', schedule);
    return { data: transformPickupSchedule(created), message: "Pickup schedule created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create pickup schedule" };
  }
}

/**
 * Update pickup schedule
 * Backend: PUT /api/v1/transport/pickup-schedules/:id
 */
export async function updatePickupSchedule(id: string, schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  try {
    // Map frontend fields to backend DTO format
    const updateData: any = {};
    if (schedule.route !== undefined) updateData.route = schedule.route;
    if (schedule.scheduledDate !== undefined) updateData.scheduledDate = schedule.scheduledDate instanceof Date ? schedule.scheduledDate.toISOString() : schedule.scheduledDate;
    if (schedule.scheduledTime !== undefined) updateData.scheduledTime = schedule.scheduledTime;
    if (schedule.totalCapacity !== undefined) updateData.totalCapacity = schedule.totalCapacity;
    if (schedule.vehicleId !== undefined) updateData.vehicleId = schedule.vehicleId;
    if (schedule.vehicleType !== undefined) updateData.vehicleType = schedule.vehicleType;
    if (schedule.driverId !== undefined) updateData.driverId = schedule.driverId;
    if (schedule.driverName !== undefined) updateData.driverName = schedule.driverName;
    if (schedule.driverPhone !== undefined) updateData.driverPhone = schedule.driverPhone;
    if (schedule.pricePerKg !== undefined) updateData.pricePerKg = schedule.pricePerKg;
    if (schedule.fixedPrice !== undefined) updateData.fixedPrice = schedule.fixedPrice;
    if (schedule.notes !== undefined) updateData.notes = schedule.notes;

    const updated = await apiPut<any>(`/transport/pickup-schedules/${id}`, updateData);
    return { data: transformPickupSchedule(updated), message: "Pickup schedule updated successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update pickup schedule" };
  }
}

/**
 * Publish pickup schedule
 * Backend: PUT /api/v1/transport/pickup-schedules/:id/publish
 */
export async function publishPickupSchedule(id: string): Promise<ApiResponse<FarmPickupSchedule>> {
  try {
    const published = await apiPut<any>(`/transport/pickup-schedules/${id}/publish`);
    return { data: transformPickupSchedule(published), message: "Schedule published successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to publish schedule" };
  }
}

/**
 * Cancel pickup schedule
 * Backend: PUT /api/v1/transport/pickup-schedules/:id/cancel
 */
export async function cancelPickupSchedule(id: string, reason?: string): Promise<ApiResponse<FarmPickupSchedule>> {
  try {
    const cancelled = await apiPut<any>(`/transport/pickup-schedules/${id}/cancel`, { reason });
    return { data: transformPickupSchedule(cancelled), message: "Schedule cancelled successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to cancel schedule" };
  }
}

/**
 * Get pickup slots for a schedule
 * Backend: GET /api/v1/transport/pickup-slots?scheduleId=...
 */
export async function getPickupSlots(scheduleId: string): Promise<PickupSlot[]> {
  try {
    const slots = await apiGet<any[]>('/transport/pickup-slots', { scheduleId });
    return slots.map(transformPickupSlot);
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
    const created = await apiPost<any>(`/transport/pickup-slots/${slotId}/book`, booking);
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
 * Backend: GET /api/v1/transport/pickup-slots/bookings?farmerId=...
 */
export async function getFarmerPickupBookings(farmerId: string, filters?: {
  status?: string;
  scheduleId?: string;
}): Promise<PickupSlotBooking[]> {
  try {
    const params: Record<string, any> = { farmerId };
    if (filters?.status) params.status = filters.status;
    if (filters?.scheduleId) params.scheduleId = filters.scheduleId;
    return await apiGet<PickupSlotBooking[]>('/transport/pickup-slots/bookings', params);
  } catch (error) {
    console.error('Error fetching farmer pickup bookings:', error);
    return [];
  }
}

/**
 * Confirm pickup and create batch
 * Backend: POST /api/v1/transport/pickup-slots/bookings/:id/confirm
 */
export async function confirmPickup(
  bookingId: string,
  data: {
    batchId?: string;
    variety: string;
    qualityGrade: "A" | "B" | "C";
    photos?: string[];
    notes?: string;
  }
): Promise<ApiResponse<PickupSlotBooking>> {
  try {
    const confirmed = await apiPost<any>(`/transport/pickup-slots/bookings/${bookingId}/confirm`, {
      batchId: data.batchId,
      variety: data.variety,
      qualityGrade: data.qualityGrade,
      photos: data.photos,
      notes: data.notes,
    });
    return { data: confirmed, message: "Pickup confirmed successfully. Receipt generated." };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to confirm pickup" };
  }
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
