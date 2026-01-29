/**
 * Transport Types
 * 
 * Types for transport provider functionality:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 * - Transport history
 * - Farm pickup schedules
 */

/**
 * Transport request type
 */
export type TransportRequestType = 
  | "produce_pickup" // Farm → Aggregation Center
  | "produce_delivery" // Aggregation Center → Buyer/Market
  | "input_delivery" // Input Provider → Farmer
  | "order_delivery"; // Marketplace Order Delivery (Aggregation Center → Buyer)

/**
 * Transport request status
 */
export type TransportRequestStatus = 
  | "pending" 
  | "accepted" 
  | "rejected" 
  | "in_transit" 
  | "delivered" 
  | "completed" 
  | "cancelled";

/**
 * Collection status for transport requests
 */
export type CollectionStatus = "pending" | "collected" | "ready";

/**
 * Pickup Schedule Status
 */
export type PickupScheduleStatus = "draft" | "published" | "active" | "completed" | "cancelled";

/**
 * Pickup Slot Status
 */
export type PickupSlotStatus = "available" | "booked" | "full" | "completed" | "cancelled";

/**
 * Transport Request
 * Represents a request for transport services
 */
export interface TransportRequest {
  id: string; // UUID
  requestId?: string; // Alias for id (used in some contexts)
  type: TransportRequestType;
  requestType?: TransportRequestType; // Alias for type (used in some contexts)
  requesterId: string; // ID of the entity requesting transport
  requesterName: string; // Name of requester
  requester?: string; // Alias for requesterName (used in some contexts)
  requesterType: "farmer" | "buyer" | "aggregation_center" | "input_provider";
  from: string; // Pickup location
  pickupLocation?: string; // Alias for from (used in some contexts)
  fromCoordinates?: [number, number]; // [lat, lng]
  to: string; // Delivery location
  deliveryLocation?: string; // Alias for to (used in some contexts)
  toCoordinates?: [number, number]; // [lat, lng]
  distance: number; // km
  scheduledTime: string; // ISO 8601
  scheduledPickupTime?: string; // Alias for scheduledTime (used in some contexts)
  requestedPickupDate?: string; // ISO 8601 - Requested pickup date
  requestedDeliveryDate?: string; // ISO 8601 - Requested delivery date
  pickupCounty?: string; // County for pickup location
  deliveryCounty?: string; // County for delivery location
  pickupCoordinates?: string; // Coordinates as string (lat,lng format)
  deliveryCoordinates?: string; // Coordinates as string (lat,lng format)
  weight: number; // kg
  quantity?: number; // Quantity (alternative to weight in some contexts)
  description: string;
  specialInstructions?: string; // Special instructions for transport
  amount: number; // Transport fee
  estimatedCost?: number; // Estimated transport cost (alias for amount or separate estimate)
  status: TransportRequestStatus;
  orderId?: string; // Related marketplace order ID
  orderNumber?: string; // Related marketplace order number
  orderStockOutRecorded?: boolean; // Whether the linked order has completed stockout
  inputOrderId?: string; // Related input order ID
  collectionStatus?: CollectionStatus; // Status for collection phase
  collectedBy?: string; // User ID who collected
  collectedAt?: string; // ISO 8601
  collectionDate?: string; // Collection date (YYYY-MM-DD format)
  collectionTime?: string; // Collection time (HH:mm format)
  collectionNotes?: string; // Notes about the collection
  providerId?: string; // Transport provider who accepted
  providerName?: string;
  vehicleId?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  acceptedAt?: string; // ISO 8601
  pickupAt?: string; // ISO 8601
  deliveredAt?: string; // ISO 8601
  currentCoordinates?: [number, number]; // For real-time tracking
  currentLocation?: string; // Human-readable current location name
  progress?: number; // Delivery progress percentage (0-100)
  eta?: string; // Estimated time of arrival (formatted string)
  estimatedArrival?: string; // ISO 8601 - ETA for delivery (alias for eta)
  photos?: string[]; // Array of photo URLs for delivery documentation
  rating?: number; // Rating given by requester (1-5)
  review?: string; // Review text from requester
  notes?: string;
  // New fields for scheduled pickup system
  pickupScheduleId?: string; // If booked from a schedule
  pickupSlotId?: string; // Specific slot booked
}

/**
 * Farm Pickup Schedule
 * Transport provider's scheduled pickup route from farms to aggregation center
 */
export interface FarmPickupSchedule {
  id: string; // UUID
  scheduleNumber: string; // Human-readable schedule number
  providerId: string; // Transport provider ID
  providerName: string;
  aggregationCenterId: string; // Target aggregation center
  aggregationCenterName: string;
  route: string; // Route description (e.g., "Kangundo Route")
  scheduledDate: string; // ISO 8601 date
  scheduledTime: string; // ISO 8601 time or HH:mm format
  estimatedArrivalTime?: string; // ISO 8601 - Estimated arrival at center
  totalCapacity: number; // Total transport capacity in kg
  usedCapacity: number; // Currently booked capacity in kg
  availableCapacity: number; // Available capacity in kg (totalCapacity - usedCapacity)
  vehicleId?: string; // Vehicle assigned
  vehicleType?: string; // Type of vehicle
  driverId?: string; // Driver assigned
  driverName?: string;
  driverPhone?: string;
  status: PickupScheduleStatus;
  // Route details
  pickupLocations: PickupLocation[]; // List of pickup locations on route
  // Center capacity sync
  centerAvailableCapacity?: number; // Available storage at aggregation center
  centerTotalCapacity?: number; // Total storage capacity at center
  // Pricing
  pricePerKg?: number; // Price per kg for this schedule
  fixedPrice?: number; // Fixed price for the route
  // Metadata
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  publishedAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
}

/**
 * Pickup Location
 * A location on the pickup route where farmers can be picked up
 */
export interface PickupLocation {
  id: string; // UUID
  scheduleId: string; // Parent schedule ID
  location: string; // Location name/address
  coordinates?: [number, number]; // [lat, lng]
  subCounty?: string;
  ward?: string;
  estimatedPickupTime?: string; // ISO 8601 - Estimated time at this location
  order: number; // Order in route (1, 2, 3, ...)
}

/**
 * Pickup Slot
 * A time slot within a schedule that farmers can book
 */
export interface PickupSlot {
  id: string; // UUID
  scheduleId: string; // Parent schedule ID
  locationId?: string; // Specific pickup location (if applicable)
  startTime: string; // ISO 8601 - Slot start time
  endTime: string; // ISO 8601 - Slot end time
  capacity: number; // Capacity for this slot in kg
  usedCapacity: number; // Booked capacity in kg
  availableCapacity: number; // Available capacity in kg
  status: PickupSlotStatus;
  bookings: PickupSlotBooking[]; // Farmers who booked this slot
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Pickup Slot Booking
 * A farmer's booking in a pickup slot
 */
export interface PickupSlotBooking {
  id: string; // UUID
  slotId: string; // Pickup slot ID
  scheduleId: string; // Schedule ID
  farmerId: string; // Farmer ID
  farmerName: string;
  quantity: number; // Quantity in kg
  batchId?: string; // Batch ID (created at pickup confirmation)
  qrCode?: string; // QR code for batch traceability
  location: string; // Pickup location
  coordinates?: [number, number]; // [lat, lng]
  contactPhone: string; // Farmer contact
  notes?: string;
  status: "confirmed" | "cancelled" | "picked_up" | "completed";
  bookedAt: string; // ISO 8601
  cancelledAt?: string; // ISO 8601
  // Pickup confirmation fields
  pickupConfirmed?: boolean; // Farmer confirmed pickup
  pickupConfirmedAt?: string; // ISO 8601 - When farmer confirmed
  pickupConfirmedBy?: string; // Farmer ID who confirmed
  pickupReceiptId?: string; // Receipt ID for pickup
  variety?: string; // Produce variety
  qualityGrade?: "A" | "B" | "C"; // Quality grade
  photos?: string[]; // Photos taken at pickup
  /** Nested receipt returned by confirm API */
  pickupReceipt?: PickupReceipt;
}

/**
 * Active Delivery
 * Transport request that is currently in transit
 */
export interface ActiveDelivery extends TransportRequest {
  status: "in_transit" | "delivered";
  estimatedArrival?: string; // ISO 8601 - ETA for delivery
  eta?: string; // Alias for estimatedArrival (formatted time string)
  currentLocation?: string; // Human-readable current location name
  progress?: number; // Delivery progress percentage (0-100)
  trackingUpdates?: DeliveryTrackingUpdate[];
}

/**
 * Delivery
 * Completed delivery record (alias for TransportRequest with delivered status)
 */
export type Delivery = TransportRequest;

/**
 * Delivery Tracking Update
 */
export interface DeliveryTrackingUpdate {
  id: string;
  requestId: string;
  deliveryId?: string; // Alias for requestId (used in some contexts)
  timestamp?: string; // ISO 8601 (alias for createdAt)
  createdAt?: string; // ISO 8601 - when the update was created
  coordinates?: [number, number]; // [lat, lng]
  location: string; // Human-readable location name
  status: string;
  notes?: string;
  photos?: string[];
}

/**
 * Transport filters
 */
export interface TransportFilters {
  type?: TransportRequestType | "all";
  status?: TransportRequestStatus | "all";
  requesterType?: string;
  requesterId?: string; // Filter by requester (buyer/farmer)
  providerId?: string; // Filter by transport provider
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Pickup Schedule Filters
 */
export interface PickupScheduleFilters {
  providerId?: string;
  aggregationCenterId?: string;
  status?: PickupScheduleStatus | "all";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  route?: string;
  hasAvailableCapacity?: boolean;
  searchQuery?: string;
}

/**
 * Transport statistics
 */
export interface TransportStats {
  totalRequests: number;
  pendingRequests: number;
  activeDeliveries: number;
  completedDeliveries: number;
  totalRevenue: number;
  averageDistance: number;
  onTimeDeliveryRate: number;
}

/**
 * Aggregation Center Capacity Info
 * Real-time capacity information for aggregation centers
 */
export interface AggregationCenterCapacity {
  centerId: string;
  centerName: string;
  totalCapacity: number; // Total storage capacity in kg
  usedCapacity: number; // Currently used capacity in kg
  availableCapacity: number; // Available capacity in kg
  reservedCapacity?: number; // Reserved for incoming deliveries in kg
  capacityPercentage: number; // Used capacity percentage (0-100)
  status: "available" | "near_full" | "full" | "over_capacity";
  lastUpdated: string; // ISO 8601
}

/**
 * Pickup Receipt
 * Receipt generated when farmer confirms pickup
 */
export interface PickupReceipt {
  id: string; // UUID
  receiptNumber: string; // Human-readable receipt number
  bookingId: string; // PickupSlotBooking ID
  scheduleId: string; // Schedule ID
  farmerId: string; // Farmer ID
  farmerName: string;
  providerId: string; // Transport provider ID
  providerName: string;
  aggregationCenterId: string; // Destination center
  aggregationCenterName: string;
  batchId: string; // Batch ID for traceability
  qrCode: string; // QR code for batch
  quantity: number; // Quantity in kg
  variety: string; // Produce variety
  qualityGrade: "A" | "B" | "C"; // Quality grade
  pickupLocation: string; // Where produce was picked up
  pickupDate: string; // ISO 8601 - Pickup date
  pickupTime: string; // ISO 8601 - Pickup time
  scheduledDeliveryDate?: string; // ISO 8601 - Expected delivery date
  photos?: string[]; // Photos taken at pickup
  notes?: string; // Additional notes
  createdAt: string; // ISO 8601
  createdBy: string; // Farmer ID who confirmed
}
