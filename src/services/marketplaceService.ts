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
 * Map backend payment status (UPPER_CASE) to frontend format (lowercase)
 */
function mapPaymentStatus(backendStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    PENDING: 'pending',
    SECURED: 'secured',
    RELEASED: 'released',
    REFUNDED: 'refunded',
    DISPUTED: 'disputed',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Map backend OFSP variety (UPPER_CASE) to frontend format (Title Case)
 */
function mapOFSPVariety(backendVariety: string): OFSPVariety {
  const varietyMap: Record<string, OFSPVariety> = {
    KENYA: 'Kenya',
    SPK004: 'SPK004', // Keep as-is
    KAKAMEGA: 'Kakamega',
    KABODE: 'Kabode',
    OTHER: 'Other',
  };
  return varietyMap[backendVariety] || 'Other';
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
  return {
    ...order,
    status: mapOrderStatus(order.status),
    paymentStatus: order.paymentStatus ? mapPaymentStatus(order.paymentStatus) : order.paymentStatus,
    variety: order.variety ? mapOFSPVariety(order.variety) : order.variety,
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
 * Transform sourcing request from backend format to frontend format
 */
function transformSourcingRequest(request: any): SourcingRequest {
  return {
    ...request,
    productType: request.productType ? mapSourcingProductType(request.productType) : request.productType,
    variety: request.variety ? mapOFSPVariety(request.variety) : request.variety,
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
  return {
    ...response,
    status: mapRFQResponseStatus(response.status),
    variety: response.variety ? mapOFSPVariety(response.variety) : response.variety,
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
    if (filters?.status) params.status = filters.status;
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
 * Create a produce listing
 * Backend: POST /api/v1/marketplace/listings
 */
export async function createListing(listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  try {
    const created = await apiPost<any>('/marketplace/listings', listing);
    return { data: transformProduceListing(created), message: "Listing created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create listing" };
  }
}

/**
 * Update a listing
 * Backend: PUT /api/v1/marketplace/listings/:id
 */
export async function updateListing(id: string, listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  try {
    const updated = await apiPut<any>(`/marketplace/listings/${id}`, listing);
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
 * Create a marketplace order
 * Backend: POST /api/v1/marketplace/orders
 */
export async function createMarketplaceOrder(order: Partial<MarketplaceOrder>): Promise<ApiResponse<MarketplaceOrder>> {
  try {
    const created = await apiPost<any>('/marketplace/orders', order);
    return { data: transformMarketplaceOrder(created), message: "Order created successfully" };
  } catch (error: any) {
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
 * Create a sourcing request
 * Backend: POST /api/v1/marketplace/sourcing-requests
 */
export async function createSourcingRequest(request: Partial<SourcingRequest>): Promise<ApiResponse<SourcingRequest>> {
  try {
    const created = await apiPost<any>('/marketplace/sourcing-requests', request);
    return { data: transformSourcingRequest(created), message: "Sourcing request created successfully" };
  } catch (error: any) {
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
 * Submit supplier offer
 * Backend: POST /api/v1/marketplace/sourcing-requests/:requestId/offers
 */
export async function submitSupplierOffer(requestId: string, offer: Partial<SupplierOffer>): Promise<ApiResponse<SupplierOffer>> {
  try {
    const created = await apiPost<SupplierOffer>(`/marketplace/sourcing-requests/${requestId}/offers`, offer);
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
    return { data: accepted, message: "Offer accepted" };
  } catch (error: any) {
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
 * Initiate negotiation
 * Backend: POST /api/v1/marketplace/negotiations
 */
export async function initiateNegotiation(
  listingId: string,
  message: Partial<NegotiationMessage>
): Promise<ApiResponse<Negotiation>> {
  try {
    const created = await apiPost<any>('/marketplace/negotiations', {
      listingId,
      ...message,
    });
    return { 
      data: transformNegotiation(created), 
      message: "Negotiation initiated successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to initiate negotiation" };
  }
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
    const updated = await apiPost<any>(`/marketplace/negotiations/${negotiationId}/messages`, message);
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
 */
export async function createRFQ(rfq: Partial<RFQ>): Promise<ApiResponse<RFQ>> {
  try {
    const created = await apiPost<any>('/marketplace/rfqs', rfq);
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
 */
export async function updateRFQ(id: string, rfq: Partial<RFQ>): Promise<ApiResponse<RFQ>> {
  try {
    const updated = await apiPut<any>(`/marketplace/rfqs/${id}`, rfq);
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
    return responses.map(transformRFQResponse);
  } catch (error) {
    console.error('Error fetching RFQ responses:', error);
    return [];
  }
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
    const created = await apiPost<any>(`/marketplace/rfqs/${rfqId}/responses`, response);
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
