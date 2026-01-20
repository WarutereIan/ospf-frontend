/**
 * Transport Types
 * 
 * Types for transport provider functionality:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 * - Transport history
 */

/**
 * Transport request type
 */
export type TransportRequestType = 
  | "produce_pickup" // Farm → Aggregation Center
  | "produce_delivery" // Aggregation Center → Buyer/Market
  | "input_delivery"; // Input Provider → Farmer

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
  weight: number; // kg
  description: string;
  amount: number; // Transport fee
  estimatedCost?: number; // Estimated transport cost (alias for amount or separate estimate)
  status: TransportRequestStatus;
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
  deliveryId: string;
  timestamp: string; // ISO 8601
  coordinates: [number, number]; // [lat, lng]
  status: string;
  notes?: string;
}

/**
 * Transport filters
 */
export interface TransportFilters {
  type?: TransportRequestType | "all";
  status?: TransportRequestStatus | "all";
  requesterType?: string;
  providerId?: string; // Filter by transport provider
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
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
