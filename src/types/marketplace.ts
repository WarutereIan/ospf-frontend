/**
 * Marketplace Types
 * 
 * Types for marketplace-related functionality:
 * - Produce listings
 * - Marketplace orders (farmer-buyer transactions)
 * - Marketplace transactions
 */

/**
 * Produce listing status
 */
export type ListingStatus = "active" | "sold" | "inactive" | "pending";

/**
 * Quality grade
 */
export type QualityGrade = "A" | "B" | "C";

/**
 * OFSP variety
 * @deprecated Use OFSPVariety enum from @/types/shared/enums instead
 * Keeping for backward compatibility - use uppercase enum values
 */
export type OFSPVariety = "KENYA" | "SPK004" | "KAKAMEGA" | "KABODE" | "OTHER";

/**
 * Marketplace Order Status
 * Order lifecycle for marketplace transactions
 */
export type MarketplaceOrderStatus =
  | "order_placed"
  | "order_accepted"
  | "payment_secured"
  | "ready_to_process" // Payment confirmed by farmer, ready for aggregation center to start processing
  | "processing" // Aggregation center is processing the order
  | "ready_for_collection" // Order processed and ready for buyer collection
  | "in_transit"
  | "at_aggregation"
  | "quality_checked"
  | "quality_approved"
  | "quality_rejected" // Quality check failed
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "rejected"
  | "disputed"
  | "cancelled";

/**
 * Payment Status
 */
export type PaymentStatus = 
  | "pending" 
  | "secured" 
  | "confirmed_by_farmer"
  | "released" 
  | "refunded" 
  | "disputed";

/**
 * Produce Listing
 * Represents produce available for sale on the marketplace
 */
export interface ProduceListing {
  id: string; // UUID
  farmerId: string; // Reference to farmer profile
  farmerName: string; // Denormalized for quick display
  farmerRating?: number; // Denormalized farmer rating
  variety: OFSPVariety;
  quantity: number; // Total quantity available (kg)
  availableQuantity: number; // Remaining quantity (kg)
  qualityGrade: QualityGrade;
  pricePerKg: number;
  location: string;
  subCounty: string;
  description?: string;
  photos?: string[]; // Image URLs
  status: ListingStatus;
  responseTime?: number; // Farmer response time in minutes
  distance?: number; // Distance from buyer (km)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  batchId: string; // Batch ID for traceability
  qrCode?: string; // QR code for traceability
  coordinates?: [number, number]; // [lat, lng]
}

/**
 * Marketplace Order
 * Represents an order placed through the marketplace
 */
export interface MarketplaceOrder {
  id: string; // UUID
  orderNumber: string; // Human-readable order number
  listingId?: string; // Reference to produce listing (if order came from listing)
  farmerId: string; // Reference to farmer
  farmerName: string; // Denormalized
  farmerPhone: string;
  farmerRating?: number;
  buyerId: string; // Reference to buyer
  buyerName: string; // Denormalized
  buyerPhone?: string;
  variety: OFSPVariety;
  quantity: number; // kg
  qualityGrade: QualityGrade;
  pricePerKg: number;
  totalAmount: number; // quantity * pricePerKg
  status: MarketplaceOrderStatus;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  fulfillmentType?: "self_pickup" | "request_transport"; // How buyer wants to receive order
  deliveryLocation?: string;
  aggregationCenter?: string;
  centerLocation?: string;
  estimatedDeliveryDate?: string; // ISO 8601
  actualDeliveryDate?: string; // ISO 8601
  photos?: string[];
  notes?: string;
  batchId: string; // Batch ID for traceability
  qrCode?: string; // QR code
  qualityScore?: number; // Quality check score
  qualityFeedback?: string;
  stockOutRecorded?: boolean; // Tracks if order has been recorded as stock out
  collected?: boolean; // Tracks if order has been collected by buyer
  farmerCoordinates?: [number, number];
  deliveryCoordinates?: [number, number];
  currentCoordinates?: [number, number]; // For in-transit tracking
  canRate?: boolean; // Whether buyer can rate farmer
  // Extended properties used in dashboards
  totalQuantity?: number; // Alias for quantity (used in some contexts)
  items?: Array<{ // Order items (used in some contexts)
    variety: OFSPVariety;
    grade: QualityGrade;
    quantity: number;
  }>;
  sellerId?: string; // Alias for farmerId (used in some contexts)
  sellerName?: string; // Alias for farmerName (used in some contexts)
  origin?: string; // Origin location (used in some contexts)
  location?: string; // Location (used in some contexts)
  // Extended properties for buyer order details
  farmerDeliveryHistory?: string; // Farmer delivery history (used in some contexts)
  farmerQualityAverage?: number; // Farmer quality average percentage (used in some contexts)
  deliveryDate?: string; // Delivery date (used in some contexts, alias for estimatedDeliveryDate or actualDeliveryDate)
}

/**
 * Marketplace filters
 */
export interface MarketplaceFilters {
  status?: ListingStatus | "all"; // Filter by listing status
  variety?: OFSPVariety | "all";
  qualityGrade?: QualityGrade | "all";
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  subCounty?: string;
  farmerId?: string; // Filter by farmer ID (for farmer's own listings)
  searchQuery?: string;
  minRating?: number;
  maxDistance?: number; // km
}

/**
 * Order filters
 */
export interface MarketplaceOrderFilters {
  status?: MarketplaceOrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  farmerId?: string;
  buyerId?: string;
  centerId?: string; // Filter orders by aggregation center
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Sourcing Request Status
 */
export type SourcingRequestStatus = "open" | "urgent" | "draft" | "closed" | "fulfilled";

/**
 * Product Type for Sourcing
 */
export type SourcingProductType = "fresh_roots" | "process_grade" | "planting_vines";

/**
 * Recurring Frequency
 */
export type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";

/**
 * Sourcing Request
 * Buyer's request for sourcing produce
 */
export interface SourcingRequest {
  id: string; // UUID
  requestId: string; // Human-readable request ID
  buyerId: string; // Reference to buyer
  buyerName: string; // Denormalized
  title: string;
  productType: SourcingProductType;
  variety?: OFSPVariety; // OFSP variety for sourcing
  status: SourcingRequestStatus;
  fulfilled: number; // Quantity fulfilled
  total: number; // Total quantity needed
  quantity?: number; // Alias for total (used in some contexts)
  unit: "tons" | "kg" | "units";
  priceRange?: { min: number; max: number };
  pricePerUnit?: number;
  priceUnit: "kg" | "unit";
  deadline: string; // ISO 8601 or formatted date
  deliveryRegion?: string;
  qualityGrade?: QualityGrade;
  suppliers?: SupplierReference[]; // Suppliers who have responded
  isPastDue?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringEndDate?: string; // ISO 8601
  nextDeliveryDate?: string; // ISO 8601
  additionalRequirements?: string;
  deliveryLocation?: string; // Delivery location (used in some contexts)
  notes?: string; // Additional notes (used in some contexts)
  offers?: SupplierOffer[]; // Supplier offers for this request
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Supplier Reference
 */
export interface SupplierReference {
  id: string;
  name?: string;
  initials: string;
  color: string;
}

/**
 * Supplier Offer
 * Farmer's offer to fulfill sourcing request
 */
export interface SupplierOffer {
  id: string; // UUID
  sourcingRequestId: string;
  farmerId: string;
  supplierName: string;
  rating?: number;
  isNewSupplier?: boolean;
  quantity: number;
  quantityUnit: "kg" | "tons" | "units";
  pricePerKg: number;
  grade: QualityGrade;
  batchId?: string; // Batch ID for traceability
  qrCode?: string; // QR code for traceability
  status?: "pending" | "accepted" | "rejected" | "converted";
  createdAt: string; // ISO 8601
}

/**
 * Recurring Order
 * Recurring marketplace order
 */
export interface RecurringOrder {
  id: string; // UUID
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  variety: OFSPVariety;
  quantity: number; // kg
  qualityGrade: QualityGrade;
  pricePerKg: number;
  frequency: RecurringFrequency;
  startDate: string; // ISO 8601
  endDate?: string; // ISO 8601
  nextDeliveryDate: string; // ISO 8601
  nextDelivery?: string; // Alias for nextDeliveryDate (formatted date)
  isActive: boolean;
  status?: "active" | "paused" | "cancelled"; // Order status
  completedDeliveries?: number; // Number of completed deliveries
  totalDeliveries?: number; // Total number of expected deliveries
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Sourcing Request Filters
 */
export interface SourcingRequestFilters {
  status?: SourcingRequestStatus | "all";
  productType?: SourcingProductType | "all";
  buyerId?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Negotiation Status
 */
export type NegotiationStatus = 
  | "pending"      // Initial offer sent, waiting for response
  | "counter_offer" // Counter offer made
  | "accepted"     // Terms agreed upon
  | "rejected"     // Negotiation rejected
  | "expired"      // Negotiation expired
  | "converted";   // Converted to order

/**
 * Negotiation Message
 * Represents a message/offer in a negotiation thread
 */
export interface NegotiationMessage {
  id: string; // UUID
  negotiationId: string;
  senderId: string; // Buyer or Farmer ID
  senderName: string;
  senderType: "buyer" | "farmer";
  message?: string; // Optional text message
  pricePerKg?: number; // Proposed price per kg
  quantity?: number; // Proposed quantity (kg)
  totalAmount?: number; // Calculated total
  isCounterOffer: boolean; // Whether this is a counter offer
  createdAt: string; // ISO 8601
  readAt?: string; // ISO 8601
}

/**
 * Negotiation
 * Represents a negotiation between buyer and farmer for a listing
 */
export interface Negotiation {
  id: string; // UUID
  negotiationNumber: string; // Human-readable negotiation number
  listingId: string; // Reference to produce listing
  listing?: ProduceListing; // Denormalized listing data
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone?: string;
  status: NegotiationStatus;
  // Original listing details
  originalPricePerKg: number;
  originalQuantity: number;
  // Current negotiated terms
  negotiatedPricePerKg?: number;
  negotiatedQuantity?: number;
  negotiatedTotalAmount?: number;
  // Messages/offers in the negotiation
  messages: NegotiationMessage[];
  // Expiration
  expiresAt?: string; // ISO 8601
  // Conversion to order
  orderId?: string; // If converted to order
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastMessageAt?: string; // ISO 8601 - Last message timestamp
}

/**
 * Negotiation Filters
 */
export interface NegotiationFilters {
  status?: NegotiationStatus | "all";
  farmerId?: string;
  buyerId?: string;
  listingId?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * RFQ Status
 * Request for Quotation status
 */
export type RFQStatus = 
  | "draft"       // RFQ being created
  | "published"   // RFQ published, accepting quotes
  | "closed"      // RFQ closed, no more quotes accepted
  | "evaluating"  // Buyer evaluating quotes
  | "awarded"     // RFQ awarded to supplier(s)
  | "cancelled";  // RFQ cancelled

/**
 * RFQ Response Status
 * Status of a supplier's response to an RFQ
 */
export type RFQResponseStatus = 
  | "draft"       // Response being prepared
  | "submitted"  // Response submitted
  | "under_review" // Under buyer review
  | "shortlisted" // Shortlisted by buyer
  | "awarded"    // Awarded/selected
  | "rejected"   // Rejected by buyer
  | "withdrawn"; // Withdrawn by supplier

/**
 * RFQ (Request for Quotation)
 * Enhanced sourcing request with RFQ workflow
 */
export interface RFQ extends SourcingRequest {
  // RFQ-specific fields
  rfqNumber: string; // Human-readable RFQ number
  rfqStatus: RFQStatus;
  // Quote submission details
  quoteDeadline: string; // ISO 8601 - Deadline for quote submission
  evaluationDeadline?: string; // ISO 8601 - Deadline for evaluation
  // Response management
  responses?: RFQResponse[]; // Supplier responses/quotes
  totalResponses?: number; // Number of responses received
  // Award details
  awardedTo?: string[]; // IDs of awarded suppliers
  awardedAt?: string; // ISO 8601
  // Terms and conditions
  termsAndConditions?: string;
  evaluationCriteria?: string; // How quotes will be evaluated
  // Attachments
  attachments?: string[]; // RFQ document attachments
}

/**
 * RFQ Response
 * Supplier's quote/response to an RFQ
 */
export interface RFQResponse {
  id: string; // UUID
  rfqId: string; // Reference to RFQ
  supplierId: string; // Farmer/Supplier ID
  supplierName: string;
  supplierRating?: number;
  status: RFQResponseStatus;
  // Quote details
  quantity: number; // Quantity offered
  quantityUnit: "kg" | "tons" | "units";
  pricePerUnit: number; // Price per unit
  priceUnit: "kg" | "unit";
  totalAmount: number; // Total quote amount
  // Product details
  variety?: OFSPVariety;
  qualityGrade: QualityGrade;
  batchId?: string; // Batch ID for traceability
  qrCode?: string; // QR code
  // Delivery terms
  deliveryTime?: string; // Estimated delivery time
  deliveryLocation?: string;
  paymentTerms?: string; // Payment terms offered
  // Additional information
  notes?: string; // Additional notes from supplier
  attachments?: string[]; // Response attachments
  // Timeline
  submittedAt?: string; // ISO 8601
  evaluatedAt?: string; // ISO 8601
  awardedAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * RFQ Filters
 */
export interface RFQFilters {
  status?: RFQStatus | "all";
  productType?: SourcingProductType | "all";
  buyerId?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * RFQ Response Filters
 */
export interface RFQResponseFilters {
  rfqId?: string;
  supplierId?: string;
  status?: RFQResponseStatus | "all";
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Marketplace statistics
 */
export interface MarketplaceStats {
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalVolume: number; // Total kg sold
  totalValue: number; // Total revenue
  averagePrice: number; // Average price per kg
  avgPricePerKg?: number; // Alias for averagePrice (used in some contexts)
  totalSourcingRequests?: number;
  activeSourcingRequests?: number;
  totalRecurringOrders?: number;
  totalNegotiations?: number;
  activeNegotiations?: number;
  totalRFQs?: number;
  activeRFQs?: number;
}
