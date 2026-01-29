/**
 * Marketplace Service
 * 
 * Handles all marketplace-related API calls:
 * - Produce listings
 * - Marketplace orders
 * - RFQs and RFQ responses
 * - Sourcing requests and supplier offers
 * - Negotiations
 * 
 * Backend API endpoints:
 * - GET /api/v1/marketplace/listings - List produce listings
 * - GET /api/v1/marketplace/listings/:id - Get listing details
 * - POST /api/v1/marketplace/listings - Create listing
 * - PUT /api/v1/marketplace/listings/:id - Update listing
 * - DELETE /api/v1/marketplace/listings/:id - Delete listing
 * - GET /api/v1/marketplace/orders - List marketplace orders
 * - GET /api/v1/marketplace/orders/:id - Get order details
 * - POST /api/v1/marketplace/orders - Create order
 * - PUT /api/v1/marketplace/orders/:id/status - Update order status
 * - GET /api/v1/marketplace/stats - Get marketplace statistics
 */

import type {
  ProduceListing,
  MarketplaceOrder,
  SourcingRequest,
  SourcingRequestStatus,
  SupplierOffer,
  RecurringOrder,
  Negotiation,
  NegotiationMessage,
  NegotiationFilters,
  RFQ,
  RFQResponse,
  RFQFilters,
  RFQResponseFilters,
  MarketplaceFilters,
  MarketplaceOrderFilters,
  SourcingRequestFilters,
  MarketplaceStats,
  MarketplaceOrderStatus,
  ListingStatus,
  PaymentStatus,
  OFSPVariety,
  SourcingProductType,
  RFQStatus,
  RFQResponseStatus,
  NegotiationStatus,
} from "@/types/marketplace";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { showSuccess } from "@/lib/toast";

// ==================== Enum Transformation Utilities ====================

/**
 * Map backend order status (UPPER_CASE) to frontend format (lowercase)
 */
function mapOrderStatus(backendStatus: string): MarketplaceOrderStatus {
  const statusMap: Record<string, MarketplaceOrderStatus> = {
    ORDER_PLACED: 'order_placed',
    ORDER_ACCEPTED: 'order_accepted',
    ORDER_REJECTED: 'rejected',
    PAYMENT_SECURED: 'payment_secured',
    READY_TO_PROCESS: 'ready_to_process',
    PROCESSING: 'processing',
    READY_FOR_COLLECTION: 'ready_for_collection',
    RELEASED: 'released',
    COLLECTED: 'collected',
    IN_TRANSIT: 'in_transit',
    AT_AGGREGATION: 'at_aggregation',
    QUALITY_CHECKED: 'quality_checked',
    QUALITY_APPROVED: 'quality_approved',
    QUALITY_REJECTED: 'quality_rejected',
    OUT_FOR_DELIVERY: 'out_for_delivery',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed',
  };
  return statusMap[backendStatus] || backendStatus.toLowerCase().replace(/-/g, '_') as MarketplaceOrderStatus;
}

/**
 * Map backend listing status (UPPER_CASE) to frontend format (lowercase)
 * Handles "EXPIRED" → "pending" mapping
 */
function mapListingStatus(backendStatus: string): ListingStatus {
  const statusMap: Record<string, ListingStatus> = {
    ACTIVE: 'active',
    SOLD: 'sold',
    INACTIVE: 'inactive',
    EXPIRED: 'pending', // Backend has EXPIRED, frontend uses pending
    PENDING: 'pending',
  };
  return statusMap[backendStatus] || 'inactive';
}

/**
 * Map frontend listing status (lowercase) to backend Prisma enum (UPPER_CASE).
 * Use when sending filters to the API (e.g. GET /marketplace/listings?status=ACTIVE).
 */
function toBackendListingStatus(frontendStatus: ListingStatus | 'all'): string | undefined {
  if (!frontendStatus || frontendStatus === 'all') return undefined;
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    sold: 'SOLD',
    inactive: 'INACTIVE',
    pending: 'EXPIRED', // Frontend "pending" = backend EXPIRED
  };
  return statusMap[frontendStatus];
}

/**
 * Map backend payment status (UPPER_CASE) to frontend format (lowercase)
 */
function mapPaymentStatus(backendStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    PENDING: 'pending',
    SECURED: 'secured',
    CONFIRMED_BY_FARMER: 'confirmed_by_farmer',
    RELEASED: 'released',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
    FAILED: 'failed',
  };
  // Normalize to uppercase for lookup, then map to lowercase frontend format
  const normalized = backendStatus?.toUpperCase() || 'PENDING';
  return statusMap[normalized] || 'pending';
}

/**
 * Map backend OFSP variety (UPPER_CASE) to frontend format (Title Case)
 */
function mapOFSPVariety(backendVariety: string | null | undefined): OFSPVariety | undefined {
  if (!backendVariety) return undefined;
  // Backend sends uppercase enum values, normalize to uppercase and return uppercase
  const upper = backendVariety.toUpperCase();
  const validVarieties: OFSPVariety[] = ['KENYA', 'SPK004', 'KAKAMEGA', 'KABODE', 'OTHER'];
  return validVarieties.includes(upper as OFSPVariety) ? (upper as OFSPVariety) : 'KENYA';
}

/**
 * Map backend sourcing product type (UPPER_CASE) to frontend format (lowercase)
 * Handles "OFSP" if present (though frontend doesn't have it)
 */
function mapSourcingProductType(backendType: string): SourcingProductType {
  const typeMap: Record<string, SourcingProductType> = {
    FRESH_ROOTS: 'fresh_roots',
    PROCESS_GRADE: 'process_grade',
    PLANTING_VINES: 'planting_vines',
    OFSP: 'fresh_roots', // Map OFSP to fresh_roots if backend sends it
  };
  return typeMap[backendType] || 'fresh_roots';
}

/**
 * Map backend RFQ status (UPPER_CASE) to frontend format (lowercase)
 */
function mapRFQStatus(backendStatus: string): RFQStatus {
  const statusMap: Record<string, RFQStatus> = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CLOSED: 'closed',
    EVALUATING: 'evaluating',
    AWARDED: 'awarded',
    CANCELLED: 'cancelled',
  };
  return statusMap[backendStatus] || 'draft';
}

/**
 * Map backend RFQ response status (UPPER_CASE) to frontend format (lowercase)
 */
function mapRFQResponseStatus(backendStatus: string): RFQResponseStatus {
  const statusMap: Record<string, RFQResponseStatus> = {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    SHORTLISTED: 'shortlisted',
    AWARDED: 'awarded',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
  };
  return statusMap[backendStatus] || 'draft';
}

/**
 * Map backend sourcing request status (UPPER_CASE) to frontend format (lowercase)
 */
function mapSourcingRequestStatus(backendStatus: string): SourcingRequestStatus {
  const statusMap: Record<string, SourcingRequestStatus> = {
    DRAFT: 'draft',
    OPEN: 'open',
    URGENT: 'urgent',
    CLOSED: 'closed',
    FULFILLED: 'fulfilled',
  };
  return statusMap[backendStatus] ?? 'draft';
}

/**
 * Map backend negotiation status (UPPER_CASE) to frontend format (lowercase)
 */
function mapNegotiationStatus(backendStatus: string): NegotiationStatus {
  const statusMap: Record<string, NegotiationStatus> = {
    PENDING: 'pending',
    COUNTER_OFFER: 'counter_offer',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    CONVERTED: 'converted',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Transform marketplace order from backend format to frontend format
 */
function transformMarketplaceOrder(order: any): MarketplaceOrder {
  // Derive aggregation center info from related data
  let aggregationCenter: string | undefined;
  let centerLocation: string | undefined;
  
  // Try to get from stock transactions (most direct)
  if (order.stockTransactions && Array.isArray(order.stockTransactions) && order.stockTransactions.length > 0) {
    const stockTx = order.stockTransactions[0];
    if (stockTx?.center) {
      aggregationCenter = stockTx.center.name;
      centerLocation = stockTx.center.location;
    }
  }
  
  // Also check if already present (denormalized from backend)
  if (!aggregationCenter && order.aggregationCenter) {
    aggregationCenter = order.aggregationCenter;
  }
  if (!centerLocation && order.centerLocation) {
    centerLocation = order.centerLocation;
  }
  
  // Derive buyer and farmer names from nested relations
  const buyerName = order.buyer?.profile
    ? [order.buyer.profile.firstName, order.buyer.profile.lastName].filter(Boolean).join(' ') || order.buyer.email
    : order.buyerName || order.buyer?.email || '';
  
  const farmerName = order.farmer?.profile
    ? [order.farmer.profile.firstName, order.farmer.profile.lastName].filter(Boolean).join(' ') || order.farmer.email
    : order.farmerName || order.farmer?.email || '';
  
  const buyerPhone = order.buyer?.profile?.phone || order.buyerPhone;
  const farmerPhone = order.farmer?.profile?.phone || order.farmerPhone;
  
  // Get payment status from payment relation (source of truth) or order.paymentStatus
  // Payment relation status is the authoritative source since it's updated by payment service
  let paymentStatus: string | undefined;
  
  // Priority 1: Check payment relation (most accurate)
  if (order.payment?.status) {
    paymentStatus = order.payment.status;
  }
  // Priority 2: Check order's paymentStatus field (may be denormalized)
  else if (order.paymentStatus) {
    paymentStatus = order.paymentStatus;
  }
  // Priority 3: Default to pending if no payment exists yet
  else {
    paymentStatus = 'PENDING';
  }
  
  // Debug logging in development
  if (import.meta.env.DEV && order.id) {
    console.debug(`[Order ${order.id}] Payment status:`, {
      fromPayment: order.payment?.status,
      fromOrder: order.paymentStatus,
      final: paymentStatus,
      mapped: mapPaymentStatus(paymentStatus),
    });
  }
  
  // Calculate canRate: buyer can rate if order is completed/delivered
  // Note: Actual rating check (whether already rated) should be done in components
  // by comparing with existing ratings
  const mappedStatus = mapOrderStatus(order.status);
  const canRate = mappedStatus === "completed" || mappedStatus === "delivered";
  
  return {
    ...order,
    status: mappedStatus,
    paymentStatus: mapPaymentStatus(paymentStatus),
    variety: order.variety ? mapOFSPVariety(order.variety) : order.variety,
    aggregationCenter,
    centerLocation,
    buyerName,
    farmerName,
    buyerPhone,
    farmerPhone,
    deliveryLocation: order.deliveryAddress || order.deliveryLocation,
    canRate, // Set based on status (component will refine based on existing ratings)
  };
}

/**
 * Transform produce listing from backend format to frontend format
 */
function transformProduceListing(listing: any): ProduceListing {
  return {
    ...listing,
    status: mapListingStatus(listing.status),
    variety: listing.variety ? mapOFSPVariety(listing.variety) : listing.variety,
  };
}

/**
 * Transform sourcing request from backend format to frontend format.
 * Backend (Prisma): quantity, fulfilled, unit, priceRangeMin, priceRangeMax, pricePerUnit, priceUnit, deadline (ISO).
 */
function transformSourcingRequest(request: any): SourcingRequest {
  // Transform variety from backend enum (UPPERCASE) to frontend format
  const transformVariety = (v: string | null | undefined): string | undefined => {
    if (!v) return undefined;
    // Backend sends uppercase, keep it uppercase for frontend
    const upper = v.toUpperCase();
    const valid = ['KENYA', 'SPK004', 'KAKAMEGA', 'KABODE', 'OTHER'];
    return valid.includes(upper) ? upper : undefined;
  };
  const total = typeof request.quantity === 'number' && Number.isFinite(request.quantity)
    ? request.quantity
    : typeof request.total === 'number' && Number.isFinite(request.total)
      ? request.total
      : 0;
  const fulfilled = typeof request.fulfilled === 'number' && Number.isFinite(request.fulfilled)
    ? request.fulfilled
    : 0;
  const priceRangeMin = request.priceRangeMin ?? request.priceRange?.min;
  const priceRangeMax = request.priceRangeMax ?? request.priceRange?.max;
  const priceRange =
    typeof priceRangeMin === 'number' &&
    Number.isFinite(priceRangeMin) &&
    typeof priceRangeMax === 'number' &&
    Number.isFinite(priceRangeMax)
      ? { min: priceRangeMin, max: priceRangeMax }
      : undefined;
  const pricePerUnit = typeof request.pricePerUnit === 'number' && Number.isFinite(request.pricePerUnit)
    ? request.pricePerUnit
    : undefined;
  const priceUnit = request.priceUnit === 'kg' || request.priceUnit === 'unit' ? request.priceUnit : 'kg';
  const deadline = request.deadline != null
    ? (typeof request.deadline === 'string' ? request.deadline : (request.deadline as Date)?.toISOString?.() ?? '')
    : request.deliveryDate ?? '';
  const buyerName = request.buyer?.profile
    ? [request.buyer.profile.firstName, request.buyer.profile.lastName].filter(Boolean).join(' ') || request.buyer.email
    : request.buyerName ?? request.buyer?.email ?? '';

  const status = request.status ? mapSourcingRequestStatus(request.status) : 'draft';

  const offers = Array.isArray(request.offers)
    ? request.offers.map(transformSupplierOffer)
    : [];

  return {
    ...request,
    productType: request.productType ? mapSourcingProductType(request.productType) : request.productType,
    variety: request.variety ? mapOFSPVariety(request.variety) : request.variety,
    status,
    total,
    quantity: total,
    fulfilled,
    priceRange,
    pricePerUnit,
    priceUnit,
    deadline,
    buyerName,
    offers,
  };
}

/**
 * Transform supplier offer from backend format to frontend format.
 * Backend: farmer (profile), quantity, quantityUnit, pricePerKg, qualityGrade, batchId, qrCode, status.
 */
function transformSupplierOffer(offer: any): SupplierOffer {
  const prof = offer.farmer?.profile;
  const supplierName = prof
    ? [prof.firstName, prof.lastName].filter(Boolean).join(' ') || offer.farmer?.email || 'Unknown'
    : offer.supplierName || 'Unknown';
  const g = (offer.qualityGrade ?? offer.grade ?? 'B').toString().toUpperCase().slice(0, 1);
  const gradeSafe: 'A' | 'B' | 'C' = (g === 'A' || g === 'B' || g === 'C') ? g : 'B';
  return {
    id: offer.id,
    sourcingRequestId: offer.sourcingRequestId,
    farmerId: offer.farmerId,
    supplierName,
    rating: typeof prof?.rating === 'number' && Number.isFinite(prof.rating) ? prof.rating : undefined,
    quantity: typeof offer.quantity === 'number' ? offer.quantity : 0,
    quantityUnit: offer.quantityUnit === 'tons' ? 'tons' : offer.quantityUnit === 'units' ? 'units' : 'kg',
    pricePerKg: typeof offer.pricePerKg === 'number' ? offer.pricePerKg : 0,
    grade: gradeSafe,
    batchId: offer.batchId ?? undefined,
    qrCode: offer.qrCode ?? undefined,
    status: offer.status?.toLowerCase?.() as 'pending' | 'accepted' | 'rejected' | 'converted' | undefined,
    createdAt: typeof offer.createdAt === 'string' ? offer.createdAt : (offer.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
  };
}

/**
 * Transform RFQ from backend format to frontend format
 */
function transformRFQ(rfq: any): RFQ {
  return {
    ...transformSourcingRequest(rfq),
    rfqNumber: rfq.rfqNumber || rfq.requestId || '',
    rfqStatus: rfq.rfqStatus ? mapRFQStatus(rfq.rfqStatus) : (rfq.status ? mapRFQStatus(rfq.status) : 'draft'),
    quoteDeadline: rfq.quoteDeadline || rfq.deadline || '',
    responses: rfq.responses ? rfq.responses.map(transformRFQResponse) : rfq.responses,
  } as RFQ;
}

/**
 * Transform RFQ response from backend format to frontend format
 */
function transformRFQResponse(response: any): RFQResponse {
  // Debug: Log raw response to see what we're getting (only in dev)
  if (import.meta.env.DEV && (!response.pricePerUnit && response.pricePerUnit !== 0) && (!response.totalAmount && response.totalAmount !== 0)) {
    console.log('RFQ Response data structure:', {
      pricePerUnit: response.pricePerUnit,
      totalAmount: response.totalAmount,
      quantity: response.quantity,
      rawResponse: response,
    });
  }
  
  // Handle numeric conversions - check both direct fields and potential string values
  // Note: 0 is a valid value, so we check for null/undefined specifically
  // Also handle edge cases like string "O" or other invalid values
  const parseNumeric = (value: any): number => {
    if (value == null) return 0;
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  };
  
  const pricePerUnit = parseNumeric(response.pricePerUnit);
  const totalAmount = parseNumeric(response.totalAmount);
  const quantity = parseNumeric(response.quantity);
  
  return {
    ...response,
    status: mapRFQResponseStatus(response.status),
    variety: response.variety ? mapOFSPVariety(response.variety) : response.variety,
    // Ensure numeric fields are properly converted
    quantity,
    pricePerUnit,
    totalAmount,
    // Map supplier info from nested supplier object if present
    supplierName: response.supplierName || response.supplier?.profile?.name || response.supplier?.name || 'Unknown Supplier',
    supplierRating: response.supplierRating || response.supplier?.rating,
  };
}

/**
 * Transform negotiation from backend format to frontend format
 */
function transformNegotiation(negotiation: any): Negotiation {
  return {
    ...negotiation,
    status: mapNegotiationStatus(negotiation.status),
    variety: negotiation.variety ? mapOFSPVariety(negotiation.variety) : negotiation.variety,
  };
}

// ==================== Produce Listings ====================

/**
 * Get all produce listings
 * Backend: GET /api/v1/marketplace/listings
 */
export async function getListings(filters?: MarketplaceFilters): Promise<ProduceListing[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.variety) params.variety = filters.variety;
    if ((filters as any)?.county) params.county = (filters as any).county;
    const backendStatus = toBackendListingStatus(filters?.status ?? 'all');
    if (backendStatus) params.status = backendStatus;
    if (filters?.minPrice) params.minPrice = filters.minPrice;
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice;

    const listings = await apiGet<any[]>('/marketplace/listings', params);
    return listings.map(transformProduceListing);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

/**
 * Get listing by ID
 * Backend: GET /api/v1/marketplace/listings/:id
 */
export async function getListingById(id: string): Promise<ProduceListing | null> {
  try {
    const listing = await apiGet<any>(`/marketplace/listings/${id}`);
    return transformProduceListing(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

/**
 * Backend CreateListingDto shape (POST /marketplace/listings).
 */
interface CreateListingDto {
  variety: 'KENYA' | 'SPK004' | 'KAKAMEGA' | 'KABODE' | 'OTHER';
  quantity: number;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerKg: number;
  county: string;
  subcounty?: string;
  ward?: string;
  location?: string;
  description?: string;
  photos?: string[];
  batchId?: string;
  harvestDate?: string;
}

/**
 * Map frontend listing to backend CreateListingDto.
 */
function toCreateListingDto(listing: Partial<ProduceListing>): CreateListingDto {
  const variety = (listing.variety as string) || 'KENYA';
  const varietyNorm = typeof variety === 'string' ? variety.toUpperCase().replace(/^SPK004$/i, 'SPK004').replace(/^KENYA$/i, 'KENYA').replace(/^KAKAMEGA$/i, 'KAKAMEGA').replace(/^KABODE$/i, 'KABODE') : 'OTHER';
  const L: Record<string, unknown> = listing as Record<string, unknown>;
  return {
    variety: (varietyNorm === 'KENYA' || varietyNorm === 'SPK004' || varietyNorm === 'KAKAMEGA' || varietyNorm === 'KABODE' ? varietyNorm : 'OTHER') as CreateListingDto['variety'],
    quantity: typeof listing.quantity === 'number' ? listing.quantity : 0,
    qualityGrade: (listing.qualityGrade === 'A' || listing.qualityGrade === 'B' || listing.qualityGrade === 'C') 
      ? listing.qualityGrade 
      : 'B',
    pricePerKg: typeof listing.pricePerKg === 'number' ? listing.pricePerKg : 0,
    county: (L.county as string) || (listing.location || ''),
    subcounty: (L.subcounty as string) ?? listing.subCounty,
    ward: L.ward as string | undefined,
    location: listing.location,
    description: listing.description,
    photos: listing.photos,
    batchId: listing.batchId,
    harvestDate: L.harvestDate as string | undefined,
  };
}

/**
 * Create a produce listing
 * Backend: POST /api/v1/marketplace/listings
 */
export async function createListing(listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  try {
    const dto = toCreateListingDto(listing);
    const created = await apiPost<any>('/marketplace/listings', dto);
    return { data: transformProduceListing(created), message: "Listing created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create listing" };
  }
}

/**
 * Backend UpdateListingDto shape (PUT /marketplace/listings/:id).
 */
interface UpdateListingDto {
  variety?: 'KENYA' | 'SPK004' | 'KAKAMEGA' | 'KABODE' | 'OTHER';
  quantity?: number;
  availableQuantity?: number;
  qualityGrade?: 'A' | 'B' | 'C';
  pricePerKg?: number;
  county?: string;
  subcounty?: string;
  ward?: string;
  location?: string;
  description?: string;
  photos?: string[];
  status?: string;
}

/**
 * Map frontend listing to backend UpdateListingDto.
 */
function toUpdateListingDto(listing: Partial<ProduceListing>): UpdateListingDto {
  const dto: UpdateListingDto = {};
  const ext = listing as Record<string, unknown>;
  if (listing.variety) {
    const v = String(listing.variety).toUpperCase();
    dto.variety = (v === 'KENYA' || v === 'SPK004' || v === 'KAKAMEGA' || v === 'KABODE' || v === 'OTHER' ? v : 'OTHER') as UpdateListingDto['variety'];
  }
  if (listing.quantity !== undefined) dto.quantity = listing.quantity;
  if (listing.availableQuantity !== undefined) dto.availableQuantity = listing.availableQuantity;
  if (listing.qualityGrade && (listing.qualityGrade === 'A' || listing.qualityGrade === 'B' || listing.qualityGrade === 'C')) {
    dto.qualityGrade = listing.qualityGrade;
  }
  if (listing.pricePerKg !== undefined) dto.pricePerKg = listing.pricePerKg;
  if (ext.county) dto.county = ext.county as string;
  if (ext.subcounty) dto.subcounty = ext.subcounty as string;
  if (ext.ward) dto.ward = ext.ward as string;
  if (listing.location) dto.location = listing.location;
  if (listing.description) dto.description = listing.description;
  if (listing.photos) dto.photos = listing.photos;
  if (listing.status) dto.status = listing.status;
  return dto;
}

/**
 * Update a listing
 * Backend: PUT /api/v1/marketplace/listings/:id
 */
export async function updateListing(id: string, listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  try {
    const dto = toUpdateListingDto(listing);
    const updated = await apiPut<any>(`/marketplace/listings/${id}`, dto);
    return { data: transformProduceListing(updated), message: "Listing updated successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update listing" };
  }
}

/**
 * Delete a listing
 * Backend: DELETE /api/v1/marketplace/listings/:id
 */
export async function deleteListing(id: string): Promise<void> {
  try {
    await apiDelete(`/marketplace/listings/${id}`);
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
}

// ==================== Marketplace Orders ====================

/**
 * Get all marketplace orders
 * Backend: GET /api/v1/marketplace/orders
 */
export async function getMarketplaceOrders(filters?: MarketplaceOrderFilters): Promise<MarketplaceOrder[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.buyerId) params.buyerId = filters.buyerId;
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.centerId) params.centerId = filters.centerId;
    // Transform status filter to backend format (UPPER_CASE) if provided
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }
    if ((filters as any)?.listingId) params.listingId = (filters as any).listingId;

    const orders = await apiGet<any[]>('/marketplace/orders', params);
    return orders.map(transformMarketplaceOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get order by ID
 * Backend: GET /api/v1/marketplace/orders/:id
 */
export async function getMarketplaceOrderById(id: string): Promise<MarketplaceOrder | null> {
  try {
    const order = await apiGet<any>(`/marketplace/orders/${id}`);
    return transformMarketplaceOrder(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Backend CreateOrderDto shape (POST /marketplace/orders).
 */
/** Matches backend CreateOrderDto (POST /marketplace/orders). deliveryCoordinates sent as "lat,lng" string. */
interface CreateOrderDto {
  listingId?: string;
  farmerId: string;
  variety: 'KENYA' | 'SPK004' | 'KAKAMEGA' | 'KABODE' | 'OTHER';
  quantity: number;
  qualityGrade: 'A' | 'B' | 'C';
  pricePerKg: number;
  deliveryAddress?: string;
  deliveryCounty?: string;
  notes?: string;
  rfqResponseId?: string;
  supplierOfferId?: string;
  negotiationId?: string;
  fulfillmentType?: 'self_pickup' | 'request_transport';
  /** Backend expects string e.g. "lat,lng" */
  deliveryCoordinates?: string;
}

/**
 * Map frontend order to backend CreateOrderDto.
 */
function toCreateOrderDto(order: Partial<MarketplaceOrder>): CreateOrderDto {
  const v = order.variety ? String(order.variety).toUpperCase() : 'KENYA';
  const variety = (v === 'KENYA' || v === 'SPK004' || v === 'KAKAMEGA' || v === 'KABODE' || v === 'OTHER' ? v : 'OTHER') as CreateOrderDto['variety'];
  const ext = order as Record<string, unknown>;
  const deliveryAddress = (ext.deliveryAddress as string)?.trim() || (order.deliveryLocation && order.deliveryLocation.trim()) || undefined;
  return {
    listingId: order.listingId,
    farmerId: order.farmerId || '',
    variety,
    quantity: typeof order.quantity === 'number' ? order.quantity : 0,
    qualityGrade: (order.qualityGrade === 'A' || order.qualityGrade === 'B' || order.qualityGrade === 'C')
      ? order.qualityGrade
      : 'B',
    pricePerKg: typeof order.pricePerKg === 'number' ? order.pricePerKg : 0,
    deliveryAddress,
    notes: order.notes,
    rfqResponseId: ext.rfqResponseId as string | undefined,
    supplierOfferId: ext.supplierOfferId as string | undefined,
    negotiationId: ext.negotiationId as string | undefined,
    deliveryCounty: ext.deliveryCounty as string | undefined,
    fulfillmentType: ((ext.fulfillmentType as string) || 'self_pickup') as 'self_pickup' | 'request_transport',
    deliveryCoordinates: (() => {
      const coords = ext.deliveryCoordinates as [number, number] | undefined;
      return coords && coords.length === 2 && Number.isFinite(coords[0]) && Number.isFinite(coords[1])
        ? `${coords[0]},${coords[1]}`
        : undefined;
    })(),
  };
}

/**
 * Create a marketplace order
 * Backend: POST /api/v1/marketplace/orders
 */
export async function createMarketplaceOrder(order: Partial<MarketplaceOrder>): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const dto = toCreateOrderDto(order);
    const created = await apiPost<any>('/marketplace/orders', dto);
    showSuccess("Order created successfully");
    return { data: transformMarketplaceOrder(created), message: "Order created successfully" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
    return { data: null as any, error: error.message || "Failed to create order" };
  }
}

/**
 * Update order status
 * Backend: PUT /api/v1/marketplace/orders/:id/status
 */
export async function updateMarketplaceOrderStatus(
  id: string,
  status: MarketplaceOrder["status"]
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    // Transform frontend status to backend format (UPPER_CASE)
    const backendStatus = status.toUpperCase().replace(/_/g, '_');
    const updated = await apiPut<any>(`/marketplace/orders/${id}/status`, { status: backendStatus });
    return { data: transformMarketplaceOrder(updated), message: "Order status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update order status" };
  }
}

/**
 * Start order processing (aggregation center)
 * Backend: PUT /api/v1/marketplace/orders/:id/start-processing
 */
export async function startOrderProcessing(
  id: string
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const updated = await apiPut<any>(`/marketplace/orders/${id}/start-processing`, {});
    return { data: transformMarketplaceOrder(updated), message: "Order processing started" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to start order processing" };
  }
}

/**
 * Mark order as ready for collection (aggregation center)
 * Backend: PUT /api/v1/marketplace/orders/:id/ready-for-collection
 */
export async function markOrderReadyForCollection(
  id: string
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const updated = await apiPut<any>(`/marketplace/orders/${id}/ready-for-collection`, {});
    return { data: transformMarketplaceOrder(updated), message: "Order marked as ready for collection" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to mark order as ready for collection" };
  }
}

/**
 * Mark order as collected by buyer
 * Backend: PUT /api/v1/marketplace/orders/:id/collect
 */
export async function markOrderAsCollected(
  id: string
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const updated = await apiPut<any>(`/marketplace/orders/${id}/collect`, {});
    return { data: transformMarketplaceOrder(updated), message: "Order marked as collected" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to mark order as collected" };
  }
}

/**
 * Confirm delivery by buyer (for request_transport orders)
 * Backend: PUT /api/v1/marketplace/orders/:id/confirm-delivery
 */
export async function confirmDeliveryByBuyer(
  id: string
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const updated = await apiPut<any>(`/marketplace/orders/${id}/confirm-delivery`, {});
    return { data: transformMarketplaceOrder(updated), message: "Delivery confirmed successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to confirm delivery" };
  }
}

// ==================== Sourcing Requests ====================

/**
 * Get all sourcing requests
 * Backend: GET /api/v1/marketplace/sourcing-requests
 */
export async function getSourcingRequests(filters?: SourcingRequestFilters): Promise<SourcingRequest[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.buyerId) params.buyerId = filters.buyerId;
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase();
    }
    if (filters?.productType && filters.productType !== "all") {
      params.productType = filters.productType.toUpperCase().replace(/_/g, '_');
    }

    const requests = await apiGet<any[]>('/marketplace/sourcing-requests', params);
    return requests.map(transformSourcingRequest);
  } catch (error) {
    console.error('Error fetching sourcing requests:', error);
    return [];
  }
}

/**
 * Get sourcing request by ID
 * Backend: GET /api/v1/marketplace/sourcing-requests/:id
 */
export async function getSourcingRequestById(id: string): Promise<SourcingRequest | null> {
  try {
    const request = await apiGet<any>(`/marketplace/sourcing-requests/${id}`);
    return transformSourcingRequest(request);
  } catch (error) {
    console.error('Error fetching sourcing request:', error);
    return null;
  }
}

/**
 * Backend CreateSourcingRequestDto shape (POST /marketplace/sourcing-requests).
 * Only these fields are accepted; forbidNonWhitelisted rejects extra properties.
 */
interface CreateSourcingRequestDto {
  title?: string;
  publishImmediately?: boolean;
  productType: 'FRESH_ROOTS' | 'PROCESS_GRADE' | 'PLANTING_VINES' | 'OFSP';
  variety: 'KENYA' | 'SPK004' | 'KAKAMEGA' | 'KABODE' | 'OTHER';
  quantity: number;
  unit?: 'kg' | 'tons' | 'units';
  qualityGrade: 'A' | 'B' | 'C';
  deliveryDate: string; // ISO 8601
  deliveryLocation: string;
  description?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  pricePerUnit?: number;
  priceUnit?: 'kg' | 'unit';
}

function toBackendProductType(v: string | undefined): CreateSourcingRequestDto['productType'] {
  const s = (v || '').toLowerCase().replace(/\s+/g, '_');
  if (s === 'fresh_roots' || s === 'fresh_ofsp_roots') return 'FRESH_ROOTS';
  if (s === 'process_grade' || s === 'ofsp_flour') return 'PROCESS_GRADE';
  if (s === 'planting_vines' || s === 'planting_vines') return 'PLANTING_VINES';
  if (s === 'ofsp') return 'OFSP';
  return 'FRESH_ROOTS';
}

function toBackendVariety(v: string | undefined): CreateSourcingRequestDto['variety'] {
  const u = (v || 'KENYA').toUpperCase();
  const valid: CreateSourcingRequestDto['variety'][] = ['KENYA', 'SPK004', 'KAKAMEGA', 'KABODE', 'OTHER'];
  return valid.includes(u as any) ? (u as CreateSourcingRequestDto['variety']) : 'KENYA';
}

function toBackendQualityGrade(v: string | undefined): CreateSourcingRequestDto['qualityGrade'] {
  if (v === 'A' || v === 'B' || v === 'C') return v;
  const s = (v || '').toLowerCase();
  if (s.includes('grade a') || s.includes('premium')) return 'A';
  if (s.includes('grade b') || s.includes('standard')) return 'B';
  if (s.includes('processing')) return 'C';
  return 'B';
}

function toBackendUnit(v: string | undefined): 'kg' | 'tons' | 'units' {
  const u = (v || 'kg').toLowerCase();
  if (u === 'tons') return 'tons';
  if (u === 'units' || u === 'bags') return 'units';
  return 'kg';
}

/**
 * Map frontend form / Partial<SourcingRequest> to backend CreateSourcingRequestDto.
 */
function toCreateSourcingRequestDto(
  r: Partial<SourcingRequest> & { deliveryRegion?: string; qualityGrade?: string; variety?: string; publishImmediately?: boolean }
): CreateSourcingRequestDto {
  const quantity = typeof r.quantity === 'number' ? r.quantity : (r.total ?? 0);
  const deadline = r.deadline ?? (r.nextDeliveryDate as string) ?? '';
  const dateStr = deadline.includes('T') ? deadline : deadline ? `${deadline}T00:00:00.000Z` : new Date().toISOString();
  const dto: CreateSourcingRequestDto = {
    title: r.title || undefined,
    productType: toBackendProductType(r.productType as string),
    variety: toBackendVariety(r.variety),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unit: toBackendUnit(r.unit),
    qualityGrade: toBackendQualityGrade(r.qualityGrade as string),
    deliveryDate: dateStr,
    deliveryLocation: (r.deliveryLocation ?? r.deliveryRegion ?? '').trim() || 'Nairobi HQ',
    description: (r.additionalRequirements as string) || r.notes || undefined,
  };
  
  // Add price information if available
  if (r.priceRange && typeof r.priceRange.min === 'number' && typeof r.priceRange.max === 'number') {
    dto.priceRangeMin = r.priceRange.min;
    dto.priceRangeMax = r.priceRange.max;
    dto.priceUnit = r.priceUnit || (r.unit === 'kg' ? 'kg' : r.unit === 'units' ? 'unit' : 'kg');
  } else if (r.pricePerUnit !== undefined && typeof r.pricePerUnit === 'number') {
    dto.pricePerUnit = r.pricePerUnit;
    dto.priceUnit = r.priceUnit || (r.unit === 'kg' ? 'kg' : r.unit === 'units' ? 'unit' : 'kg');
  }
  
  if (r.publishImmediately === true) dto.publishImmediately = true;
  return dto;
}

/**
 * Create a sourcing request
 * Backend: POST /api/v1/marketplace/sourcing-requests
 * Maps frontend payload to CreateSourcingRequestDto (only whitelisted fields).
 */
export async function createSourcingRequest(
  request: Partial<SourcingRequest> & { deliveryRegion?: string; qualityGrade?: string; variety?: string; publishImmediately?: boolean }
): Promise<ApiResponse<SourcingRequest>> {
  try {
    const dto = toCreateSourcingRequestDto(request);
    const created = await apiPost<any>('/marketplace/sourcing-requests', dto);
    showSuccess("Sourcing request created successfully");
    return { data: transformSourcingRequest(created), message: "Sourcing request created successfully" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
    return { data: null as any, error: error.message || "Failed to create sourcing request" };
  }
}

/**
 * Update a sourcing request
 * Backend: PUT /api/v1/marketplace/sourcing-requests/:id
 */
export async function updateSourcingRequest(id: string, request: Partial<SourcingRequest>): Promise<ApiResponse<SourcingRequest>> {
  try {
    // Map frontend fields to backend DTO format
    const updateData: any = {};
    if (request.title !== undefined) updateData.title = request.title;
    if (request.productType !== undefined) updateData.productType = request.productType;
    if (request.variety !== undefined) updateData.variety = request.variety;
    if (request.quantity !== undefined) updateData.quantity = request.quantity;
    if (request.unit !== undefined) updateData.unit = request.unit;
    if (request.qualityGrade !== undefined) updateData.qualityGrade = request.qualityGrade;
    if (request.deadline !== undefined) {
      updateData.deliveryDate = typeof request.deadline === 'string' ? request.deadline : (request.deadline as any)?.toISOString?.() || String(request.deadline);
    }
    if (request.deliveryLocation !== undefined) updateData.deliveryLocation = request.deliveryLocation;
    if (request.additionalRequirements !== undefined) updateData.description = request.additionalRequirements;
    
    // Map price information
    const reqExt = request as Record<string, unknown>;
    const priceRangeMin = reqExt.priceRangeMin as number | undefined;
    const priceRangeMax = reqExt.priceRangeMax as number | undefined;
    if (priceRangeMin !== undefined && priceRangeMax !== undefined) {
      updateData.priceRangeMin = priceRangeMin;
      updateData.priceRangeMax = priceRangeMax;
      updateData.priceUnit = request.priceUnit || (request.unit === 'kg' ? 'kg' : request.unit === 'units' ? 'unit' : 'kg');
    } else if (request.priceRange && typeof request.priceRange.min === 'number' && typeof request.priceRange.max === 'number') {
      updateData.priceRangeMin = request.priceRange.min;
      updateData.priceRangeMax = request.priceRange.max;
      updateData.priceUnit = request.priceUnit || (request.unit === 'kg' ? 'kg' : request.unit === 'units' ? 'unit' : 'kg');
    } else if (request.pricePerUnit !== undefined && typeof request.pricePerUnit === 'number') {
      updateData.pricePerUnit = request.pricePerUnit;
      updateData.priceUnit = request.priceUnit || (request.unit === 'kg' ? 'kg' : request.unit === 'units' ? 'unit' : 'kg');
    }

    const updated = await apiPut<any>(`/marketplace/sourcing-requests/${id}`, updateData);
    return { 
      data: transformSourcingRequest(updated), 
      message: "Sourcing request updated successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update sourcing request" };
  }
}

/**
 * Publish a sourcing request (DRAFT → OPEN)
 * Backend: PUT /api/v1/marketplace/sourcing-requests/:id/publish
 */
export async function publishSourcingRequest(id: string): Promise<ApiResponse<SourcingRequest>> {
  try {
    const updated = await apiPut<any>(`/marketplace/sourcing-requests/${id}/publish`);
    return { data: transformSourcingRequest(updated), message: "Sourcing request published" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to publish sourcing request" };
  }
}

/**
 * Close a sourcing request (OPEN/URGENT → CLOSED)
 * Backend: PUT /api/v1/marketplace/sourcing-requests/:id/close
 */
export async function closeSourcingRequest(id: string): Promise<ApiResponse<SourcingRequest>> {
  try {
    const updated = await apiPut<any>(`/marketplace/sourcing-requests/${id}/close`);
    return { data: transformSourcingRequest(updated), message: "Sourcing request closed" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to close sourcing request" };
  }
}

/**
 * Backend CreateSupplierOfferDto shape (POST /marketplace/sourcing-requests/:requestId/offers).
 */
interface CreateSupplierOfferDto {
  quantity: number;
  quantityUnit: string;
  pricePerKg: number;
  qualityGrade?: string;
  batchId?: string;
  notes?: string;
  deliveryDate?: string;
}

/**
 * Map frontend offer to backend CreateSupplierOfferDto.
 */
function toCreateSupplierOfferDto(offer: Partial<SupplierOffer>): CreateSupplierOfferDto {
  const ext = offer as Record<string, unknown>;
  return {
    quantity: typeof offer.quantity === 'number' ? offer.quantity : 0,
    quantityUnit: offer.quantityUnit || 'kg',
    pricePerKg: typeof offer.pricePerKg === 'number' ? offer.pricePerKg : 0,
    qualityGrade: offer.grade,
    batchId: offer.batchId,
    notes: ext.notes as string | undefined,
    deliveryDate: ext.deliveryDate as string | undefined,
  };
}

/**
 * Submit supplier offer
 * Backend: POST /api/v1/marketplace/sourcing-requests/:requestId/offers
 */
export async function submitSupplierOffer(requestId: string, offer: Partial<SupplierOffer>): Promise<ApiResponse<SupplierOffer>> {
  try {
    const dto = toCreateSupplierOfferDto(offer);
    const created = await apiPost<SupplierOffer>(`/marketplace/sourcing-requests/${requestId}/offers`, dto);
    return { data: created, message: "Offer submitted successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to submit offer" };
  }
}

/**
 * Accept supplier offer
 * Backend: PUT /api/v1/marketplace/supplier-offers/:id/accept
 */
export async function acceptSupplierOffer(offerId: string): Promise<ApiResponse<SupplierOffer>> {
  try {
    const accepted = await apiPut<SupplierOffer>(`/marketplace/supplier-offers/${offerId}/accept`);
    showSuccess("Offer accepted successfully");
    return { data: accepted, message: "Offer accepted" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
    return { data: null as any, error: error.message || "Failed to accept offer" };
  }
}

// ==================== Recurring Orders ====================

/**
 * Get recurring orders
 * Backend: GET /api/v1/marketplace/recurring-orders
 */
export async function getRecurringOrders(filters?: {
  buyerId?: string;
  farmerId?: string;
  isActive?: boolean;
}): Promise<RecurringOrder[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.buyerId) params.buyerId = filters.buyerId;
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;

    const orders = await apiGet<any[]>('/marketplace/recurring-orders', params);
    return orders.map(order => ({
      ...order,
      variety: order.variety ? mapOFSPVariety(order.variety) : order.variety,
    }));
  } catch (error) {
    console.error('Error fetching recurring orders:', error);
    return [];
  }
}

/**
 * Get recurring order by ID
 * Backend: GET /api/v1/marketplace/recurring-orders/:id
 */
export async function getRecurringOrderById(id: string): Promise<RecurringOrder | null> {
  try {
    const order = await apiGet<any>(`/marketplace/recurring-orders/${id}`);
    return {
      ...order,
      variety: order.variety ? mapOFSPVariety(order.variety) : order.variety,
    };
  } catch (error) {
    console.error('Error fetching recurring order:', error);
    return null;
  }
}

/**
 * Create recurring order
 * Backend: POST /api/v1/marketplace/recurring-orders
 */
export async function createRecurringOrder(order: Partial<RecurringOrder> & { buyerId: string; farmerId: string }): Promise<ApiResponse<RecurringOrder>> {
  try {
    const created = await apiPost<any>('/marketplace/recurring-orders', order);
    return { 
      data: {
        ...created,
        variety: created.variety ? mapOFSPVariety(created.variety) : created.variety,
      }, 
      message: "Recurring order created successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create recurring order" };
  }
}

/**
 * Update recurring order
 * Backend: PUT /api/v1/marketplace/recurring-orders/:id
 */
export async function updateRecurringOrder(id: string, order: Partial<RecurringOrder>): Promise<ApiResponse<RecurringOrder>> {
  try {
    const updated = await apiPut<any>(`/marketplace/recurring-orders/${id}`, order);
    return { 
      data: {
        ...updated,
        variety: updated.variety ? mapOFSPVariety(updated.variety) : updated.variety,
      }, 
      message: "Recurring order updated successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update recurring order" };
  }
}

/**
 * Cancel/Delete recurring order
 * Backend: DELETE /api/v1/marketplace/recurring-orders/:id
 */
export async function cancelRecurringOrder(id: string): Promise<void> {
  try {
    await apiDelete(`/marketplace/recurring-orders/${id}`);
  } catch (error) {
    console.error('Error deleting recurring order:', error);
    throw error;
  }
}

/**
 * Get marketplace statistics
 * Backend: GET /api/v1/marketplace/stats
 */
export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  try {
    return await apiGet<MarketplaceStats>('/marketplace/stats');
  } catch (error) {
    console.error('Error fetching marketplace stats:', error);
    return {
      totalListings: 0,
      activeListings: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalVolume: 0,
      totalValue: 0,
      averagePrice: 0,
      totalSourcingRequests: 0,
      activeSourcingRequests: 0,
      totalRecurringOrders: 0,
      totalNegotiations: 0,
      activeNegotiations: 0,
      totalRFQs: 0,
      activeRFQs: 0,
    };
  }
}

// ==================== Negotiation Functions ====================

/**
 * Get negotiations
 * Backend: GET /api/v1/marketplace/negotiations
 */
export async function getNegotiations(filters?: NegotiationFilters): Promise<Negotiation[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.listingId) params.listingId = filters.listingId;
    if (filters?.buyerId) params.buyerId = filters.buyerId;
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }

    const negotiations = await apiGet<any[]>('/marketplace/negotiations', params);
    return negotiations.map(transformNegotiation);
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    return [];
  }
}

/**
 * Get negotiation by ID
 * Backend: GET /api/v1/marketplace/negotiations/:id
 */
export async function getNegotiationById(id: string): Promise<Negotiation | null> {
  try {
    const negotiation = await apiGet<any>(`/marketplace/negotiations/${id}`);
    return transformNegotiation(negotiation);
  } catch (error) {
    console.error('Error fetching negotiation:', error);
    return null;
  }
}

/**
 * Backend CreateNegotiationDto shape (POST /marketplace/negotiations).
 */
interface CreateNegotiationDto {
  listingId: string;
  proposedPrice: number;
  proposedQuantity: number;
  message?: string;
}

/**
 * Map frontend negotiation to backend CreateNegotiationDto.
 */
function toCreateNegotiationDto(listingId: string, message: Partial<NegotiationMessage>): CreateNegotiationDto {
  const ext = message as Record<string, unknown>;
  const proposedPrice = typeof ext.proposedPrice === 'number' ? ext.proposedPrice : typeof message.pricePerKg === 'number' ? message.pricePerKg : 0;
  const proposedQuantity = typeof ext.proposedQuantity === 'number' ? ext.proposedQuantity : typeof message.quantity === 'number' ? message.quantity : 0;
  return {
    listingId,
    proposedPrice,
    proposedQuantity,
    message: message.message,
  };
}

/**
 * Initiate negotiation
 * Backend: POST /api/v1/marketplace/negotiations
 */
export async function initiateNegotiation(
  listingId: string,
  message: Partial<NegotiationMessage>
): Promise<ApiResponse<Negotiation>> {
  try {
    const dto = toCreateNegotiationDto(listingId, message);
    const created = await apiPost<any>('/marketplace/negotiations', dto);
    return { 
      data: transformNegotiation(created), 
      message: "Negotiation initiated successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to initiate negotiation" };
  }
}

/**
 * Backend SendNegotiationMessageDto shape (POST /marketplace/negotiations/:id/messages).
 */
interface SendNegotiationMessageDto {
  message: string;
  counterPrice?: number;
  counterQuantity?: number;
}

/**
 * Map frontend message to backend SendNegotiationMessageDto.
 */
function toSendNegotiationMessageDto(message: Partial<NegotiationMessage>): SendNegotiationMessageDto {
  const ext = message as Record<string, unknown>;
  return {
    message: message.message || '',
    counterPrice: typeof ext.counterPrice === 'number' ? ext.counterPrice : undefined,
    counterQuantity: typeof ext.counterQuantity === 'number' ? ext.counterQuantity : undefined,
  };
}

/**
 * Send negotiation message (counter offer)
 * Backend: POST /api/v1/marketplace/negotiations/:id/messages
 */
export async function sendNegotiationMessage(
  negotiationId: string,
  message: Partial<NegotiationMessage>
): Promise<ApiResponse<Negotiation>> {
  try {
    const dto = toSendNegotiationMessageDto(message);
    const updated = await apiPost<any>(`/marketplace/negotiations/${negotiationId}/messages`, dto);
    return { 
      data: transformNegotiation(updated), 
      message: "Message sent successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to send message" };
  }
}

/**
 * Accept negotiation terms
 * Backend: PUT /api/v1/marketplace/negotiations/:id/accept
 */
export async function acceptNegotiation(negotiationId: string): Promise<ApiResponse<Negotiation>> {
  try {
    const accepted = await apiPut<any>(`/marketplace/negotiations/${negotiationId}/accept`);
    return { 
      data: transformNegotiation(accepted), 
      message: "Negotiation accepted" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to accept negotiation" };
  }
}

/**
 * Reject negotiation
 * Backend: PUT /api/v1/marketplace/negotiations/:id/reject
 */
export async function rejectNegotiation(negotiationId: string): Promise<ApiResponse<Negotiation>> {
  try {
    const rejected = await apiPut<any>(`/marketplace/negotiations/${negotiationId}/reject`);
    return { 
      data: transformNegotiation(rejected), 
      message: "Negotiation rejected" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to reject negotiation" };
  }
}

/**
 * Convert negotiation to order
 * TODO: Backend needs to implement POST /api/v1/marketplace/negotiations/:id/convert-to-order
 */
export async function convertNegotiationToOrder(
  negotiationId: string
): Promise<ApiResponse<MarketplaceOrder>> {
  // Backend doesn't have convert endpoint yet
  return { 
    data: null as any, 
    error: "Convert to order not implemented yet" 
  };
}

// ==================== RFQ DTO Mapper ====================

/** Backend CreateRFQDto: only these fields are allowed (forbidNonWhitelisted). */
interface CreateRFQDto {
  title?: string;
  productType: string;
  variety: string;
  quantity: number;
  unit?: string;
  qualityGrade: string;
  deliveryDate: string;
  deliveryLocation?: string;
  description?: string;
  quoteDeadline?: string;
}

const PRODUCT_TYPE_TO_BACKEND: Record<string, string> = {
  fresh_roots: "FRESH_ROOTS",
  process_grade: "PROCESS_GRADE",
  planting_vines: "PLANTING_VINES",
  ofsp: "OFSP",
};

const VARIETY_TO_BACKEND: Record<string, string> = {
  Kenya: "KENYA",
  SPK004: "SPK004",
  Kakamega: "KAKAMEGA",
  Kabode: "KABODE",
  Other: "OTHER",
};

function toCreateRFQDto(rfq: Partial<RFQ>): CreateRFQDto {
  const productType = (rfq.productType && PRODUCT_TYPE_TO_BACKEND[rfq.productType])
    ? PRODUCT_TYPE_TO_BACKEND[rfq.productType]
    : "FRESH_ROOTS";
  const variety = (rfq.variety && VARIETY_TO_BACKEND[rfq.variety])
    ? VARIETY_TO_BACKEND[rfq.variety]
    : "OTHER";
  const quantity = typeof rfq.total === "number" && Number.isFinite(rfq.total)
    ? Math.max(0, rfq.total)
    : Math.max(0, parseFloat(String(rfq.total ?? 0)) || 0);
  const unit = rfq.unit === "tons" || rfq.unit === "units" ? rfq.unit : "kg";
  const qualityGrade = rfq.qualityGrade === "A" || rfq.qualityGrade === "B" || rfq.qualityGrade === "C"
    ? rfq.qualityGrade
    : "B";
  const deliveryDate = rfq.deadline || rfq.nextDeliveryDate || "";
  const deliveryLocation = rfq.deliveryRegion ?? rfq.deliveryLocation;
  const parts: string[] = [];
  if (rfq.additionalRequirements) parts.push(String(rfq.additionalRequirements));
  if (rfq.termsAndConditions) parts.push(String(rfq.termsAndConditions));
  if (rfq.evaluationCriteria) parts.push(String(rfq.evaluationCriteria));
  const description = parts.length ? parts.join("\n\n") : undefined;

  const dto: CreateRFQDto = {
    ...(rfq.title != null && rfq.title !== "" && { title: String(rfq.title) }),
    productType,
    variety,
    quantity,
    unit,
    qualityGrade,
    deliveryDate,
    ...(deliveryLocation != null && String(deliveryLocation).trim() !== "" && { deliveryLocation: String(deliveryLocation).trim() }),
    ...(description != null && description !== "" && { description }),
    ...(rfq.quoteDeadline != null && rfq.quoteDeadline !== "" && { quoteDeadline: String(rfq.quoteDeadline) }),
  };
  return dto;
}

function toUpdateRFQDto(rfq: Partial<RFQ>): Partial<CreateRFQDto> {
  const out: Partial<CreateRFQDto> = {};
  if (rfq.title != null) out.title = String(rfq.title);
  if (rfq.productType != null && PRODUCT_TYPE_TO_BACKEND[rfq.productType])
    out.productType = PRODUCT_TYPE_TO_BACKEND[rfq.productType];
  if (rfq.variety != null && VARIETY_TO_BACKEND[rfq.variety])
    out.variety = VARIETY_TO_BACKEND[rfq.variety];
  if (typeof rfq.total === "number" && Number.isFinite(rfq.total))
    out.quantity = Math.max(0, rfq.total);
  else if (rfq.total != null) {
    const n = parseFloat(String(rfq.total));
    if (Number.isFinite(n)) out.quantity = Math.max(0, n);
  }
  if (rfq.unit === "kg" || rfq.unit === "tons" || rfq.unit === "units") out.unit = rfq.unit;
  if (rfq.qualityGrade === "A" || rfq.qualityGrade === "B" || rfq.qualityGrade === "C")
    out.qualityGrade = rfq.qualityGrade;
  const deliveryDate = rfq.deadline ?? rfq.nextDeliveryDate;
  if (deliveryDate != null && String(deliveryDate).trim() !== "") out.deliveryDate = String(deliveryDate).trim();
  const deliveryLocation = rfq.deliveryRegion ?? rfq.deliveryLocation;
  if (deliveryLocation != null && String(deliveryLocation).trim() !== "")
    out.deliveryLocation = String(deliveryLocation).trim();
  const parts: string[] = [];
  if (rfq.additionalRequirements) parts.push(String(rfq.additionalRequirements));
  if (rfq.termsAndConditions) parts.push(String(rfq.termsAndConditions));
  if (rfq.evaluationCriteria) parts.push(String(rfq.evaluationCriteria));
  if (parts.length) out.description = parts.join("\n\n");
  if (rfq.quoteDeadline != null && rfq.quoteDeadline !== "") out.quoteDeadline = String(rfq.quoteDeadline);
  return out;
}

// ==================== RFQ Functions ====================

/**
 * Get RFQs
 * Backend: GET /api/v1/marketplace/rfqs
 */
export async function getRFQs(filters?: RFQFilters): Promise<RFQ[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.buyerId) params.buyerId = filters.buyerId;
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase();
    }
    if (filters?.productType && filters.productType !== "all") {
      params.productType = filters.productType.toUpperCase().replace(/_/g, '_');
    }

    const rfqs = await apiGet<any[]>('/marketplace/rfqs', params);
    return rfqs.map(transformRFQ);
  } catch (error) {
    console.error('Error fetching RFQs:', error);
    return [];
  }
}

/**
 * Get RFQ by ID
 * Backend: GET /api/v1/marketplace/rfqs/:id
 */
export async function getRFQById(id: string): Promise<RFQ | null> {
  try {
    const rfq = await apiGet<any>(`/marketplace/rfqs/${id}`);
    return transformRFQ(rfq);
  } catch (error) {
    console.error('Error fetching RFQ:', error);
    return null;
  }
}

/**
 * Create RFQ
 * Backend: POST /api/v1/marketplace/rfqs
 * Payload must match CreateRFQDto (forbidNonWhitelisted).
 */
export async function createRFQ(rfq: Partial<RFQ>): Promise<ApiResponse<RFQ>> {
  try {
    const dto = toCreateRFQDto(rfq);
    const created = await apiPost<any>('/marketplace/rfqs', dto);
    return { 
      data: transformRFQ(created), 
      message: "RFQ created successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create RFQ" };
  }
}

/**
 * Update RFQ
 * Backend: PUT /api/v1/marketplace/rfqs/:id
 * Payload must match Partial<CreateRFQDto> (forbidNonWhitelisted).
 */
export async function updateRFQ(id: string, rfq: Partial<RFQ>): Promise<ApiResponse<RFQ>> {
  try {
    const dto = toUpdateRFQDto(rfq);
    const updated = await apiPut<any>(`/marketplace/rfqs/${id}`, dto);
    return { 
      data: transformRFQ(updated), 
      message: "RFQ updated successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update RFQ" };
  }
}

/**
 * Publish RFQ
 * Backend: PUT /api/v1/marketplace/rfqs/:id/publish
 */
export async function publishRFQ(id: string): Promise<ApiResponse<RFQ>> {
  try {
    const published = await apiPut<any>(`/marketplace/rfqs/${id}/publish`);
    return { 
      data: transformRFQ(published), 
      message: "RFQ published successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to publish RFQ" };
  }
}

/**
 * Close RFQ
 * Backend: PUT /api/v1/marketplace/rfqs/:id/close
 */
export async function closeRFQ(id: string): Promise<ApiResponse<RFQ>> {
  try {
    const closed = await apiPut<any>(`/marketplace/rfqs/${id}/close`);
    return { 
      data: transformRFQ(closed), 
      message: "RFQ closed successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to close RFQ" };
  }
}

/**
 * Cancel RFQ
 * Backend: PUT /api/v1/marketplace/rfqs/:id/cancel
 */
export async function cancelRFQ(id: string, reason?: string): Promise<ApiResponse<RFQ>> {
  try {
    const cancelled = await apiPut<any>(`/marketplace/rfqs/${id}/cancel`, { reason });
    return { 
      data: transformRFQ(cancelled), 
      message: "RFQ cancelled successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to cancel RFQ" };
  }
}

/**
 * Get RFQ responses
 * Backend: GET /api/v1/marketplace/rfqs/:rfqId/responses
 */
export async function getRFQResponses(
  rfqId: string,
  filters?: RFQResponseFilters
): Promise<RFQResponse[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.supplierId) params.supplierId = filters.supplierId;
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }

    const responses = await apiGet<any[]>(`/marketplace/rfqs/${rfqId}/responses`, params);
    // Debug: Log first response to check data structure (only in dev)
    if (import.meta.env.DEV && responses.length > 0) {
      console.log('RFQ Response data from backend:', {
        pricePerUnit: responses[0].pricePerUnit,
        totalAmount: responses[0].totalAmount,
        quantity: responses[0].quantity,
        typeOfPricePerUnit: typeof responses[0].pricePerUnit,
        typeOfTotalAmount: typeof responses[0].totalAmount,
        fullResponse: responses[0],
      });
    }
    return responses.map(transformRFQResponse);
  } catch (error) {
    console.error('Error fetching RFQ responses:', error);
    return [];
  }
}

/**
 * Backend CreateRFQResponseDto shape (POST /marketplace/rfqs/:rfqId/responses).
 */
interface CreateRFQResponseDto {
  pricePerKg: number;
  notes?: string;
  deliveryDate?: string;
  batchId: string; // Required - batch selection is mandatory
}

/**
 * Map frontend RFQ response to backend CreateRFQResponseDto.
 */
function toCreateRFQResponseDto(response: Partial<RFQResponse>): CreateRFQResponseDto {
  if (!response.batchId) {
    throw new Error('Batch selection is required when submitting a quote');
  }
  const ext = response as Record<string, unknown>;
  return {
    pricePerKg: typeof response.pricePerUnit === 'number' ? response.pricePerUnit : 0,
    notes: response.notes,
    deliveryDate: (ext.deliveryDate as string | undefined) ?? response.deliveryTime,
    batchId: response.batchId,
  };
}

/**
 * Submit RFQ response (quote)
 * Backend: POST /api/v1/marketplace/rfqs/:rfqId/responses
 */
export async function submitRFQResponse(
  rfqId: string,
  response: Partial<RFQResponse>
): Promise<ApiResponse<RFQResponse>> {
  try {
    const dto = toCreateRFQResponseDto(response);
    const created = await apiPost<any>(`/marketplace/rfqs/${rfqId}/responses`, dto);
    return { 
      data: transformRFQResponse(created), 
      message: "Quote submitted successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to submit quote" };
  }
}

/**
 * Get RFQ response by ID
 * Backend: GET /api/v1/marketplace/rfq-responses/:id
 */
export async function getRFQResponseById(
  rfqId: string,
  responseId: string
): Promise<RFQResponse | null> {
  try {
    const response = await apiGet<any>(`/marketplace/rfq-responses/${responseId}`);
    return transformRFQResponse(response);
  } catch (error) {
    console.error('Error fetching RFQ response:', error);
    return null;
  }
}

/**
 * Update RFQ response status (shortlist, reject, award)
 * Backend: PUT /api/v1/marketplace/rfq-responses/:id/status
 */
export async function updateRFQResponseStatus(
  rfqId: string,
  responseId: string,
  status: RFQResponse["status"]
): Promise<ApiResponse<RFQResponse>> {
  try {
    // Transform frontend status to backend format (UPPER_CASE)
    const backendStatus = status.toUpperCase().replace(/_/g, '_');
    const updated = await apiPut<any>(`/marketplace/rfq-responses/${responseId}/status`, { status: backendStatus });
    return { 
      data: transformRFQResponse(updated), 
      message: "Response status updated" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update response status" };
  }
}

/**
 * Award RFQ to supplier(s)
 * Backend: PUT /api/v1/marketplace/rfqs/:rfqId/award/:responseId
 */
export async function awardRFQ(
  rfqId: string,
  responseIds: string[]
): Promise<ApiResponse<RFQ>> {
  try {
    // Backend accepts single responseId, so we'll award the first one
    // TODO: Backend may need to support multiple awards
    const awarded = await apiPut<any>(`/marketplace/rfqs/${rfqId}/award/${responseIds[0]}`);
    return { 
      data: transformRFQ(awarded), 
      message: "RFQ awarded successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to award RFQ" };
  }
}

/**
 * Convert RFQ response to order
 * Backend: POST /api/v1/marketplace/rfqs/:rfqId/responses/:responseId/convert-to-order
 */
export async function convertRFQResponseToOrder(
  rfqId: string,
  responseId: string,
  deliveryAddress?: string,
  deliveryCounty?: string
): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const order = await apiPost<any>(
      `/marketplace/rfqs/${rfqId}/responses/${responseId}/convert-to-order`,
      { deliveryAddress, deliveryCounty }
    );
    return { 
      data: order, 
      message: "Order created from RFQ response" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to convert RFQ response to order" };
  }
}
