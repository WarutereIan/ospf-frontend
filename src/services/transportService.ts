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
    ORDER_DELIVERY: 'order_delivery',
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
  // Extract requester name if requester is an object
  let requesterName = request.requesterName;
  let requester: string | undefined;
  
  if (request.requester && typeof request.requester === 'object') {
    // If requester is an object, extract the name from profile or use email
    requesterName = request.requester.profile?.name || 
                   request.requester.profile?.firstName || 
                   request.requester.email || 
                   request.requesterName || 
                   'Unknown';
    requester = requesterName;
  } else if (typeof request.requester === 'string') {
    requester = request.requester;
    requesterName = requesterName || requester;
  } else {
    requester = requesterName;
  }

  // Extract provider name if provider is an object
  let providerName = request.providerName;
  if (request.provider && typeof request.provider === 'object') {
    providerName = request.provider.profile?.name || 
                   request.provider.profile?.firstName || 
                   request.provider.email || 
                   request.providerName || 
                   undefined;
  }

  // Map backend field names to frontend field names
  // Backend uses: pickupLocation, deliveryLocation, cargoDescription, estimatedWeight, scheduledPickup, estimatedCost/agreedCost
  // Frontend expects: from/to, description, weight, scheduledTime, amount
  
  // Handle coordinates - backend uses pickupCoords/deliveryCoords (string "lat,lng")
  // Frontend expects fromCoordinates/toCoordinates ([number, number]) or pickupCoordinates/deliveryCoordinates (string)
  let fromCoordinates: [number, number] | undefined;
  let toCoordinates: [number, number] | undefined;
  let pickupCoordinates: string | undefined;
  let deliveryCoordinates: string | undefined;
  
  if (request.pickupCoords) {
    pickupCoordinates = request.pickupCoords;
    const coords = request.pickupCoords.split(',').map((c: string) => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      fromCoordinates = [coords[0], coords[1]];
    }
  }
  
  if (request.deliveryCoords) {
    deliveryCoordinates = request.deliveryCoords;
    const coords = request.deliveryCoords.split(',').map((c: string) => parseFloat(c.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      toCoordinates = [coords[0], coords[1]];
    }
  }

  // Handle scheduled time - backend uses scheduledPickup (DateTime), frontend expects scheduledTime (ISO string)
  let scheduledTime: string = '';
  if (request.scheduledPickup) {
    if (request.scheduledPickup instanceof Date) {
      scheduledTime = request.scheduledPickup.toISOString();
    } else if (typeof request.scheduledPickup === 'string') {
      scheduledTime = request.scheduledPickup;
    }
  } else if (request.scheduledTime) {
    // Fallback to scheduledTime if it exists
    scheduledTime = request.scheduledTime instanceof Date 
      ? request.scheduledTime.toISOString() 
      : request.scheduledTime;
  }

  // Handle dates - convert DateTime to ISO strings
  const requestedPickupDate = request.requestedPickupDate 
    ? (request.requestedPickupDate instanceof Date ? request.requestedPickupDate.toISOString().split('T')[0] : request.requestedPickupDate.split('T')[0])
    : request.scheduledPickup 
      ? (request.scheduledPickup instanceof Date ? request.scheduledPickup.toISOString().split('T')[0] : request.scheduledPickup.split('T')[0])
      : undefined;
  
  const requestedDeliveryDate = request.requestedDeliveryDate
    ? (request.requestedDeliveryDate instanceof Date ? request.requestedDeliveryDate.toISOString().split('T')[0] : request.requestedDeliveryDate.split('T')[0])
    : request.scheduledDelivery
      ? (request.scheduledDelivery instanceof Date ? request.scheduledDelivery.toISOString().split('T')[0] : request.scheduledDelivery.split('T')[0])
      : undefined;

  // Handle amount - backend uses estimatedCost or agreedCost, frontend expects amount
  const amount = request.agreedCost ?? request.estimatedCost ?? request.amount ?? 0;

  // Handle collection dates
  const collectedAt = request.collectedAt 
    ? (request.collectedAt instanceof Date ? request.collectedAt.toISOString() : request.collectedAt)
    : undefined;

  // Handle ETA
  const eta = request.eta 
    ? (request.eta instanceof Date ? request.eta.toISOString() : request.eta)
    : undefined;
  const estimatedArrival = eta;

  // Handle acceptedAt
  const acceptedAt = request.acceptedAt
    ? (request.acceptedAt instanceof Date ? request.acceptedAt.toISOString() : request.acceptedAt)
    : undefined;

  // Handle actual pickup/delivery times
  const actualPickup = request.actualPickup
    ? (request.actualPickup instanceof Date ? request.actualPickup.toISOString() : request.actualPickup)
    : undefined;
  const actualDelivery = request.actualDelivery
    ? (request.actualDelivery instanceof Date ? request.actualDelivery.toISOString() : request.actualDelivery)
    : undefined;
  const pickupAt = actualPickup;
  const deliveredAt = actualDelivery;

  return {
    ...request,
    // IDs
    id: request.id,
    requestId: request.id, // Alias
    requesterId: request.requesterId,
    
    // Requester info
    requesterName: requesterName || request.requesterName || '',
    requester: requester || requesterName || request.requesterName || '',
    requesterType: request.requesterType || 'farmer',
    
    // Provider info
    providerId: request.providerId,
    providerName: providerName || request.providerName,
    
    // Type and status
    type: mapTransportRequestType(request.type),
    requestType: request.requestType ? mapTransportRequestType(request.requestType) : mapTransportRequestType(request.type),
    status: mapTransportRequestStatus(request.status),
    
    // Locations - map backend field names to frontend aliases
    from: request.pickupLocation || request.from || '',
    pickupLocation: request.pickupLocation || request.from || '',
    to: request.deliveryLocation || request.to || '',
    deliveryLocation: request.deliveryLocation || request.to || '',
    pickupCounty: request.pickupCounty,
    deliveryCounty: request.deliveryCounty,
    fromCoordinates,
    toCoordinates,
    pickupCoordinates,
    deliveryCoordinates,
    
    // Distance
    distance: request.distance ?? 0,
    
    // Cargo - map backend field names
    description: request.cargoDescription || request.description || '',
    weight: request.estimatedWeight ?? request.actualWeight ?? request.weight ?? 0,
    quantity: request.quantity ?? request.estimatedWeight ?? request.actualWeight,
    specialInstructions: request.specialInstructions || request.notes,
    
    // Scheduling
    scheduledTime,
    scheduledPickupTime: scheduledTime, // Alias
    requestedPickupDate,
    requestedDeliveryDate,
    
    // Pricing
    amount,
    estimatedCost: request.estimatedCost ?? amount,
    
    // Collection info
    collectionStatus: request.collectionStatus,
    collectedBy: request.collectedBy,
    collectedAt,
    collectionDate: request.collectionDate,
    collectionTime: request.collectionTime,
    collectionNotes: request.collectionNotes,
    
    // Vehicle & Driver
    vehicleId: request.vehicleId,
    driverName: request.driverName,
    driverPhone: request.driverPhone,
    
    // Tracking
    currentCoordinates: request.currentCoordinates 
      ? (typeof request.currentCoordinates === 'string' 
          ? request.currentCoordinates.split(',').map((c: string) => parseFloat(c.trim())) as [number, number]
          : request.currentCoordinates)
      : undefined,
    currentLocation: request.currentLocation,
    progress: request.progress,
    eta,
    estimatedArrival,
    
    // Media & Feedback
    photos: request.photos || [],
    rating: request.rating,
    review: request.review,
    notes: request.notes,
    
    // Linked entities
    orderId: request.orderId,
    orderNumber: request.order?.orderNumber || request.orderNumber,
    orderStockOutRecorded: request.order?.stockOutRecorded ?? false,
    inputOrderId: request.inputOrderId,
    pickupScheduleId: request.pickupScheduleId,
    pickupSlotId: request.pickupSlotId,
    
    // Tracking updates
    trackingUpdates: request.trackingUpdates?.map((update: any) => ({
      id: update.id,
      requestId: update.requestId || update.deliveryId || request.id,
      deliveryId: update.requestId || update.deliveryId || request.id,
      timestamp: update.createdAt 
        ? (update.createdAt instanceof Date ? update.createdAt.toISOString() : update.createdAt)
        : update.timestamp,
      createdAt: update.createdAt 
        ? (update.createdAt instanceof Date ? update.createdAt.toISOString() : update.createdAt)
        : update.timestamp,
      location: update.location || 'Unknown Location',
      coordinates: update.coordinates 
        ? (typeof update.coordinates === 'string' 
            ? update.coordinates.split(',').map((c: string) => parseFloat(c.trim())) as [number, number]
            : update.coordinates)
        : undefined,
      notes: update.notes,
      photos: update.photos || [],
      status: update.status,
    })) || [],
    
    // Timestamps
    createdAt: request.createdAt instanceof Date ? request.createdAt.toISOString() : (request.createdAt || new Date().toISOString()),
    updatedAt: request.updatedAt instanceof Date ? request.updatedAt.toISOString() : (request.updatedAt || new Date().toISOString()),
    acceptedAt,
    pickupAt,
    deliveredAt,
  };
}

/**
 * Transform pickup schedule from backend format to frontend format
 */
function transformPickupSchedule(schedule: any): FarmPickupSchedule {
  // Extract nested relations
  const aggregationCenter = schedule.aggregationCenter || {};
  const provider = schedule.provider || {};
  
  // Handle scheduledDate - convert Date to ISO string if needed
  let scheduledDate: string;
  if (schedule.scheduledDate instanceof Date) {
    scheduledDate = schedule.scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
  } else if (typeof schedule.scheduledDate === 'string') {
    scheduledDate = schedule.scheduledDate.split('T')[0]; // Extract date part if ISO string
  } else {
    scheduledDate = schedule.scheduledDate || '';
  }
  
  // Handle scheduledTime - keep as time string (HH:mm format) for display
  // The frontend formatTime function will handle formatting it
  const scheduledTime = schedule.scheduledTime || '';
  
  // Handle estimatedArrivalTime - convert Date to ISO string if needed
  let estimatedArrivalTime: string | undefined;
  if (schedule.estimatedArrivalTime) {
    if (schedule.estimatedArrivalTime instanceof Date) {
      estimatedArrivalTime = schedule.estimatedArrivalTime.toISOString();
    } else if (typeof schedule.estimatedArrivalTime === 'string') {
      estimatedArrivalTime = schedule.estimatedArrivalTime;
    }
  }
  
  // Calculate capacities if not present
  const totalCapacity = schedule.totalCapacity || 0;
  const usedCapacity = schedule.usedCapacity ?? (totalCapacity - (schedule.availableCapacity ?? totalCapacity));
  const availableCapacity = schedule.availableCapacity ?? (totalCapacity - usedCapacity);
  
  // Transform pickup locations if present
  const pickupLocations = (schedule.pickupLocations || []).map((loc: any) => ({
    id: loc.id || '',
    scheduleId: loc.scheduleId || schedule.id,
    location: loc.location || '',
    coordinates: loc.coordinates,
    subCounty: loc.subCounty,
    ward: loc.ward,
    estimatedPickupTime: loc.estimatedPickupTime instanceof Date 
      ? loc.estimatedPickupTime.toISOString() 
      : (loc.estimatedPickupTime || undefined),
    order: loc.order || 0,
  }));
  
  return {
    id: schedule.id,
    scheduleNumber: schedule.scheduleNumber || '',
    providerId: schedule.providerId || '',
    providerName: provider?.name || provider?.profileName || schedule.providerName || 'Transport Provider',
    aggregationCenterId: schedule.aggregationCenterId || aggregationCenter.id || '',
    aggregationCenterName: aggregationCenter.name || schedule.aggregationCenterName || 'Aggregation Center',
    route: schedule.route || '',
    scheduledDate,
    scheduledTime,
    estimatedArrivalTime,
    totalCapacity,
    usedCapacity,
    availableCapacity,
    vehicleId: schedule.vehicleId,
    vehicleType: schedule.vehicleType,
    driverId: schedule.driverId,
    driverName: schedule.driverName,
    driverPhone: schedule.driverPhone,
    status: mapPickupScheduleStatus(schedule.status),
    pickupLocations,
    centerAvailableCapacity: aggregationCenter.availableCapacity,
    centerTotalCapacity: aggregationCenter.totalCapacity,
    pricePerKg: schedule.pricePerKg,
    fixedPrice: schedule.fixedPrice,
    notes: schedule.notes,
    createdAt: schedule.createdAt instanceof Date ? schedule.createdAt.toISOString() : (schedule.createdAt || ''),
    updatedAt: schedule.updatedAt instanceof Date ? schedule.updatedAt.toISOString() : (schedule.updatedAt || ''),
    publishedAt: schedule.publishedAt instanceof Date ? schedule.publishedAt.toISOString() : (schedule.publishedAt || undefined),
    completedAt: schedule.completedAt instanceof Date ? schedule.completedAt.toISOString() : (schedule.completedAt || undefined),
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
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.requesterId) params.requesterId = filters.requesterId;
    // Transform status filter to backend format (UPPER_CASE) if provided
    // Note: Frontend "in_transit" maps to both "IN_TRANSIT_PICKUP" and "IN_TRANSIT_DELIVERY" on backend
    // For now, we don't filter by status if it's "in_transit" since backend has separate statuses
    if (filters?.status && filters.status !== "all" && filters.status !== "in_transit") {
      params.status = filters.status.toUpperCase();
    }
    // Transform type filter to backend format (UPPER_CASE) if provided
    if (filters?.type && filters.type !== "all") {
      params.type = filters.type.toUpperCase();
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
 * Backend CreateTransportRequestDto shape (POST /transport/requests).
 */
interface CreateTransportRequestDto {
  type: 'PRODUCE_PICKUP' | 'PRODUCE_DELIVERY' | 'INPUT_DELIVERY';
  description?: string;
  requesterType?: string;
  pickupLocation: string;
  pickupCounty: string;
  pickupCoordinates?: string;
  deliveryLocation: string;
  deliveryCounty: string;
  deliveryCoordinates?: string;
  distance?: number;
  requestedPickupDate?: string;
  requestedDeliveryDate?: string;
  weight?: number;
  quantity?: number;
  specialInstructions?: string;
  orderId?: string;
  inputOrderId?: string;
  pickupScheduleId?: string;
  pickupSlotId?: string;
}

/**
 * Map frontend transport request to backend CreateTransportRequestDto.
 */
function toCreateTransportRequestDto(request: Partial<TransportRequest>): CreateTransportRequestDto {
  const type = request.type 
    ? (request.type === 'produce_pickup' ? 'PRODUCE_PICKUP' :
       request.type === 'produce_delivery' ? 'PRODUCE_DELIVERY' :
       request.type === 'input_delivery' ? 'INPUT_DELIVERY' :
       request.type === 'order_delivery' ? 'ORDER_DELIVERY' : 'PRODUCE_PICKUP')
    : 'PRODUCE_PICKUP';
  
  return {
    type: type as CreateTransportRequestDto['type'],
    description: request.description,
    requesterType: request.requesterType,
    pickupLocation: request.pickupLocation || '',
    pickupCounty: request.pickupCounty || '',
    pickupCoordinates: request.pickupCoordinates,
    deliveryLocation: request.deliveryLocation || '',
    deliveryCounty: request.deliveryCounty || '',
    deliveryCoordinates: request.deliveryCoordinates,
    distance: request.distance,
    requestedPickupDate: request.requestedPickupDate,
    requestedDeliveryDate: request.requestedDeliveryDate,
    weight: request.weight,
    quantity: request.quantity,
    specialInstructions: request.specialInstructions,
    orderId: request.orderId,
    inputOrderId: request.inputOrderId,
    pickupScheduleId: request.pickupScheduleId,
    pickupSlotId: request.pickupSlotId,
  };
}

/**
 * Create a transport request
 * Backend: POST /api/v1/transport/requests
 */
export async function createTransportRequest(request: Partial<TransportRequest>): Promise<ApiResponse<TransportRequest>> {
  try {
    const dto = toCreateTransportRequestDto(request);
    const created = await apiPost<any>('/transport/requests', dto);
    // Success message will be shown by the calling component
    return { data: transformTransportRequest(created), message: "Transport request created successfully" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
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
 * Map frontend status to backend status format
 */
function mapStatusToBackend(frontendStatus: TransportRequest["status"], transportType?: string): string {
  // Handle the simplified "in_transit" status - map to appropriate backend status
  if (frontendStatus === "in_transit") {
    // For order deliveries, when marking as collected, use IN_TRANSIT_PICKUP (picking up from aggregation center)
    // For other types, also use IN_TRANSIT_PICKUP when marking as collected
    return "IN_TRANSIT_PICKUP";
  }
  
  // Map other statuses to UPPER_CASE
  const statusMap: Record<string, string> = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    delivered: "DELIVERED",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  
  return statusMap[frontendStatus] || frontendStatus.toUpperCase();
}

/**
 * Update transport request status
 * Backend: PUT /api/v1/transport/requests/:id/status
 */
export async function updateTransportRequestStatus(
  id: string,
  status: TransportRequest["status"],
  transportType?: string
): Promise<ApiResponse<TransportRequest>> {
  try {
    // Transform frontend status to backend format
    const backendStatus = mapStatusToBackend(status, transportType);
    const updated = await apiPut<any>(`/transport/requests/${id}/status`, { status: backendStatus });
    return { data: transformTransportRequest(updated), message: "Request status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update request status" };
  }
}

/**
 * Transform active delivery from backend format to frontend format
 */
function transformActiveDelivery(request: any): ActiveDelivery {
  // Use the base transport request transformation
  const baseRequest = transformTransportRequest(request);
  
  // Extract tracking updates if present
  const trackingUpdates = request.trackingUpdates?.map((update: any) => ({
    id: update.id,
    requestId: update.requestId,
    status: update.status,
    location: update.location,
    coordinates: update.coordinates 
      ? (typeof update.coordinates === 'string' 
          ? update.coordinates.split(',').map((c: string) => parseFloat(c.trim())) as [number, number]
          : update.coordinates)
      : undefined,
    notes: update.notes,
    photos: update.photos || [],
    createdAt: update.createdAt instanceof Date ? update.createdAt.toISOString() : (update.createdAt || new Date().toISOString()),
  })) || [];
  
  return {
    ...baseRequest,
    // ActiveDelivery specific fields
    status: baseRequest.status === "in_transit" || baseRequest.status === "delivered" 
      ? baseRequest.status as "in_transit" | "delivered"
      : "in_transit", // Default to in_transit for active deliveries
    estimatedArrival: baseRequest.estimatedArrival,
    eta: baseRequest.eta || baseRequest.estimatedArrival,
    currentLocation: baseRequest.currentLocation,
    progress: baseRequest.progress,
    trackingUpdates,
  };
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

    const deliveries = await apiGet<any[]>('/transport/deliveries', params);
    return deliveries.map(transformActiveDelivery);
  } catch (error) {
    console.error('Error fetching active deliveries:', error);
    return [];
  }
}

/**
 * Backend AddTrackingUpdateDto shape (POST /transport/tracking/:requestId).
 */
interface AddTrackingUpdateDto {
  status: string; // Must be uppercase: PENDING, IN_TRANSIT, DELIVERED, COMPLETED
  location: string;
  coordinates?: string;
  notes?: string;
  timestamp?: string; // ISO 8601 timestamp when location was captured
}

/**
 * Map frontend tracking update to backend AddTrackingUpdateDto.
 */
function toAddTrackingUpdateDto(update: Partial<DeliveryTrackingUpdate>): AddTrackingUpdateDto {
  // Map frontend status to backend uppercase format
  const statusMap: Record<string, string> = {
    'pending': 'PENDING',
    'in_transit': 'IN_TRANSIT',
    'delivered': 'DELIVERED',
    'completed': 'COMPLETED',
  };
  
  const backendStatus = update.status 
    ? (statusMap[update.status.toLowerCase()] || update.status.toUpperCase())
    : 'IN_TRANSIT'; // Default to IN_TRANSIT for location updates
  
  return {
    status: backendStatus,
    location: update.location || '',
    coordinates: update.coordinates,
    notes: update.notes,
    timestamp: update.timestamp || new Date().toISOString(), // Capture timestamp when location was captured
  };
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
    const dto = toAddTrackingUpdateDto(update);
    const created = await apiPost<DeliveryTrackingUpdate>(`/transport/tracking/${deliveryId}`, dto);
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
    if (filters?.status && filters.status !== "all") {
      // Transform status to backend format (UPPER_CASE)
      params.status = filters.status.toUpperCase();
    }
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
 * Backend CreatePickupScheduleDto shape (POST /transport/pickup-schedules).
 */
interface CreatePickupScheduleDto {
  aggregationCenterId: string;
  route: string;
  scheduledDate: string;
  scheduledTime: string;
  totalCapacity: number;
  vehicleId?: string;
  vehicleType?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  pricePerKg?: number;
  fixedPrice?: number;
  notes?: string;
}

/**
 * Map frontend pickup schedule to backend CreatePickupScheduleDto.
 */
function toCreatePickupScheduleDto(schedule: Partial<FarmPickupSchedule>): CreatePickupScheduleDto {
  if (!schedule.aggregationCenterId) {
    throw new Error('Aggregation Center ID is required');
  }
  
  return {
    aggregationCenterId: schedule.aggregationCenterId,
    route: schedule.route || '',
    scheduledDate: schedule.scheduledDate instanceof Date 
      ? schedule.scheduledDate.toISOString() 
      : (schedule.scheduledDate || ''),
    scheduledTime: schedule.scheduledTime || '',
    totalCapacity: typeof schedule.totalCapacity === 'number' ? schedule.totalCapacity : 0,
    vehicleId: schedule.vehicleId,
    vehicleType: schedule.vehicleType,
    driverId: schedule.driverId,
    driverName: schedule.driverName,
    driverPhone: schedule.driverPhone,
    pricePerKg: schedule.pricePerKg,
    fixedPrice: schedule.fixedPrice,
    notes: schedule.notes,
  };
}

/**
 * Create farm pickup schedule
 * Backend: POST /api/v1/transport/pickup-schedules
 */
export async function createPickupSchedule(schedule: Partial<FarmPickupSchedule>): Promise<ApiResponse<FarmPickupSchedule>> {
  try {
    const dto = toCreatePickupScheduleDto(schedule);
    const created = await apiPost<any>('/transport/pickup-schedules', dto);
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
 * Backend BookPickupSlotDto shape (POST /transport/pickup-slots/:id/book).
 */
interface BookPickupSlotDto {
  quantity: number;
  location: string;
  coordinates?: string;
  contactPhone: string;
  notes?: string;
  variety?: string;
  qualityGrade?: 'A' | 'B' | 'C';
  photos?: string[];
}

/**
 * Map frontend booking to backend BookPickupSlotDto.
 */
function toBookPickupSlotDto(booking: Partial<PickupSlotBooking>): BookPickupSlotDto {
  return {
    quantity: typeof booking.quantity === 'number' ? booking.quantity : 0,
    location: booking.location || '',
    coordinates: booking.coordinates,
    contactPhone: booking.contactPhone || '',
    notes: booking.notes,
    variety: booking.variety,
    qualityGrade: (booking.qualityGrade === 'A' || booking.qualityGrade === 'B' || booking.qualityGrade === 'C')
      ? booking.qualityGrade
      : undefined,
    photos: booking.photos,
  };
}

/**
 * Book pickup slot
 * Backend: POST /api/v1/transport/pickup-schedules/:scheduleId/book
 * Creates a slot dynamically when booking. The slot ID is generated and returned.
 * DTO allows only: quantity, location, coordinates?, contactPhone, notes?, variety?, qualityGrade?, photos?
 * farmerId comes from JWT; farmerName, batchId etc. are stripped (forbidNonWhitelisted).
 */
export async function bookPickupSlot(scheduleId: string, slotId: string, booking: Partial<PickupSlotBooking>): Promise<ApiResponse<PickupSlotBooking>> {
  try {
    const dto = toBookPickupSlotDto(booking);
    // Note: slotId parameter is kept for backward compatibility but not used
    // The backend creates the slot dynamically based on scheduleId
    const created = await apiPost<any>(`/transport/pickup-schedules/${scheduleId}/book`, dto);
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
 * Uses the aggregation center endpoint to get capacity info
 */
export async function getAggregationCenterCapacity(centerId: string): Promise<AggregationCenterCapacity | null> {
  try {
    // Fetch center details from aggregation service
    const center = await apiGet<any>(`/aggregation/centers/${centerId}`);
    
    if (!center) {
      return null;
    }
    
    // Calculate capacity from center data
    const totalCapacity = center.totalCapacity || 0;
    const usedCapacity = center.currentStock || 0;
    const availableCapacity = Math.max(0, totalCapacity - usedCapacity);
    const capacityPercentage = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;
    
    // Determine status based on capacity
    let status: "available" | "near_full" | "full" | "over_capacity";
    if (capacityPercentage >= 100) {
      status = "over_capacity";
    } else if (capacityPercentage >= 90) {
      status = "full";
    } else if (capacityPercentage >= 75) {
      status = "near_full";
    } else {
      status = "available";
    }
    
    return {
      centerId: center.id || centerId,
      centerName: center.name || "Aggregation Center",
      totalCapacity,
      usedCapacity,
      availableCapacity,
      capacityPercentage,
      status,
      lastUpdated: center.updatedAt || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching aggregation center capacity:', error);
    return null;
  }
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
 * Get bookings for a pickup schedule
 * Backend: GET /api/v1/transport/pickup-slots/bookings?scheduleId=...
 */
export async function getScheduleBookings(scheduleId: string, filters?: {
  status?: string;
}): Promise<PickupSlotBooking[]> {
  try {
    const params: Record<string, any> = { scheduleId };
    if (filters?.status) params.status = filters.status;
    const bookings = await apiGet<any[]>('/transport/pickup-slots/bookings', params, { showErrorToast: false });
    
    // Transform backend format to frontend format
    return bookings.map((booking: any) => ({
      id: booking.id,
      slotId: booking.slotId,
      scheduleId: booking.scheduleId,
      farmerId: booking.farmerId,
      farmerName: booking.farmerName || (booking.farmer?.profile 
        ? `${booking.farmer.profile.firstName} ${booking.farmer.profile.lastName}`
        : booking.farmer?.email || booking.farmer?.phone || 'Farmer'),
      quantity: booking.quantity,
      batchId: booking.batchId,
      qrCode: booking.qrCode,
      location: booking.location,
      coordinates: booking.coordinates ? booking.coordinates.split(',').map(Number) : undefined,
      contactPhone: booking.contactPhone || booking.farmer?.phone,
      notes: booking.notes,
      status: booking.status,
      bookedAt: booking.bookedAt,
      cancelledAt: booking.cancelledAt,
      pickupConfirmed: booking.pickupConfirmed,
      pickupConfirmedAt: booking.pickupConfirmedAt,
      pickupConfirmedBy: booking.pickupConfirmedBy,
      pickupReceiptId: booking.pickupReceiptId,
      variety: booking.variety,
      qualityGrade: booking.qualityGrade,
      photos: booking.photos || [],
    }));
  } catch (error) {
    console.error('Error fetching schedule bookings:', error);
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
 * Transform backend pickup receipt to frontend format
 * Backend returns receipt with nested relations (booking, aggregationCenter)
 */
function transformPickupReceipt(backendReceipt: any): PickupReceipt {
  return {
    id: backendReceipt.id,
    receiptNumber: backendReceipt.receiptNumber,
    bookingId: backendReceipt.bookingId,
    scheduleId: backendReceipt.scheduleId,
    farmerId: backendReceipt.farmerId,
    farmerName: backendReceipt.booking?.farmer?.name || backendReceipt.booking?.farmer?.email || "Unknown Farmer",
    providerId: backendReceipt.providerId,
    providerName: backendReceipt.booking?.slot?.schedule?.provider?.name || backendReceipt.booking?.slot?.schedule?.provider?.email || "Unknown Provider",
    aggregationCenterId: backendReceipt.aggregationCenterId,
    aggregationCenterName: backendReceipt.aggregationCenter?.name || "Unknown Center",
    batchId: backendReceipt.batchId,
    qrCode: backendReceipt.qrCode,
    quantity: backendReceipt.quantity,
    variety: backendReceipt.variety,
    qualityGrade: backendReceipt.qualityGrade,
    pickupLocation: backendReceipt.pickupLocation,
    pickupDate: backendReceipt.pickupDate ? new Date(backendReceipt.pickupDate).toISOString() : new Date().toISOString(),
    pickupTime: backendReceipt.pickupTime || new Date().toTimeString().slice(0, 5), // HH:mm format
    scheduledDeliveryDate: backendReceipt.scheduledDeliveryDate ? new Date(backendReceipt.scheduledDeliveryDate).toISOString() : undefined,
    photos: backendReceipt.photos || [],
    notes: backendReceipt.notes,
    createdAt: backendReceipt.createdAt ? new Date(backendReceipt.createdAt).toISOString() : new Date().toISOString(),
    createdBy: backendReceipt.createdBy,
  };
}

/**
 * Confirm pickup and create batch
 * Backend: POST /api/v1/transport/pickup-slots/bookings/:id/confirm
 * Returns booking with nested pickupReceipt
 * Note: Batch ID is generated by backend for consistency
 */
export async function confirmPickup(
  bookingId: string,
  data: {
    variety: string;
    qualityGrade: "A" | "B" | "C";
    photos?: string[];
    notes?: string;
  }
): Promise<ApiResponse<PickupSlotBooking>> {
  try {
    // Disable error toast in apiPost - we'll handle success/error in the component
    const confirmed = await apiPost<any>(
      `/transport/pickup-slots/bookings/${bookingId}/confirm`,
      {
        variety: data.variety,
        qualityGrade: data.qualityGrade,
        photos: data.photos,
        notes: data.notes,
      },
      { showErrorToast: false } // Disable automatic error toast - component will handle feedback
    );
    
    // Log the response for debugging
    console.log('[confirmPickup] API response received:', confirmed);
    
    // Handle case where response might be wrapped in { data: ... } from apiPost
    // apiPost already extracts response.data, so confirmed should be the booking directly
    // But handle both cases for safety
    const booking = confirmed?.data || confirmed;
    
    // Check if the response is valid
    if (!booking) {
      console.error('[confirmPickup] Empty or null response from API:', confirmed);
      return { data: null as any, error: "Received empty response from server" };
    }
    
    // Check if booking has the expected structure (should have an id)
    if (typeof booking !== 'object') {
      console.error('[confirmPickup] Invalid response type:', typeof booking, booking);
      return { data: null as any, error: "Invalid response type from server" };
    }
    
    // If booking doesn't have id, it might be a different structure - log for debugging
    if (!booking.id) {
      console.warn('[confirmPickup] Response missing id field, but proceeding:', Object.keys(booking));
    }
    
    return { data: booking, message: "Pickup confirmed successfully. Receipt generated." };
  } catch (error: any) {
    console.error('[confirmPickup] Error caught:', error);
    // Return error response without showing toast (component will handle it)
    // This prevents duplicate error toasts since apiPost already showed one
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
 * Backend: GET /api/v1/transport/receipts?bookingId=...
 */
export async function getPickupReceiptByBooking(bookingId: string): Promise<PickupReceipt | null> {
  try {
    const receipt = await apiGet<any>(`/transport/receipts`, { bookingId });
    if (!receipt) return null;
    return transformPickupReceipt(receipt);
  } catch (error) {
    console.error('Error fetching pickup receipt:', error);
    return null;
  }
}

/**
 * Transform backend booking response to extract receipt
 * Backend returns booking with nested pickupReceipt
 */
export function extractReceiptFromBooking(booking: any): PickupReceipt | null {
  if (!booking?.pickupReceipt) return null;
  return transformPickupReceipt(booking.pickupReceipt);
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
