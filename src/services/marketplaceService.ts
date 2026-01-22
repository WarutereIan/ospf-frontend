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
} from "@/types/marketplace";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

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
    if (filters?.county) params.county = filters.county;
    if (filters?.status) params.status = filters.status;
    if (filters?.minPrice) params.minPrice = filters.minPrice;
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice;

    return await apiGet<ProduceListing[]>('/marketplace/listings', params);
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
    return await apiGet<ProduceListing>(`/marketplace/listings/${id}`);
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
    const created = await apiPost<ProduceListing>('/marketplace/listings', listing);
    return { data: created, message: "Listing created successfully" };
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
    const updated = await apiPut<ProduceListing>(`/marketplace/listings/${id}`, listing);
    return { data: updated, message: "Listing updated successfully" };
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
    if (filters?.status) params.status = filters.status;
    if (filters?.listingId) params.listingId = filters.listingId;

    return await apiGet<MarketplaceOrder[]>('/marketplace/orders', params);
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
    return await apiGet<MarketplaceOrder>(`/marketplace/orders/${id}`);
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
    const created = await apiPost<MarketplaceOrder>('/marketplace/orders', order);
    return { data: created, message: "Order created successfully" };
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
    const updated = await apiPut<MarketplaceOrder>(`/marketplace/orders/${id}/status`, { status });
    return { data: updated, message: "Order status updated" };
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
    if (filters?.status) params.status = filters.status;

    return await apiGet<SourcingRequest[]>('/marketplace/sourcing-requests', params);
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
    return await apiGet<SourcingRequest>(`/marketplace/sourcing-requests/${id}`);
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
    const created = await apiPost<SourcingRequest>('/marketplace/sourcing-requests', request);
    return { data: created, message: "Sourcing request created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create sourcing request" };
  }
}

/**
 * Update a sourcing request
 * TODO: Backend needs to implement PUT /api/v1/marketplace/sourcing-requests/:id
 */
export async function updateSourcingRequest(id: string, request: Partial<SourcingRequest>): Promise<ApiResponse<SourcingRequest>> {
  // Backend doesn't have update endpoint yet
  return { data: request as SourcingRequest, message: "Update not implemented yet" };
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
 * TODO: Backend needs to implement recurring orders endpoints
 */
export async function getRecurringOrders(): Promise<RecurringOrder[]> {
  // Backend doesn't have recurring orders endpoint yet
  return [];
}

/**
 * Create recurring order
 * TODO: Backend needs to implement recurring orders endpoints
 */
export async function createRecurringOrder(order: Partial<RecurringOrder>): Promise<ApiResponse<RecurringOrder>> {
  // Backend doesn't have recurring orders endpoint yet
  return { data: order as RecurringOrder, message: "Recurring orders not implemented yet" };
}

/**
 * Update recurring order
 * TODO: Backend needs to implement recurring orders endpoints
 */
export async function updateRecurringOrder(id: string, order: Partial<RecurringOrder>): Promise<ApiResponse<RecurringOrder>> {
  // Backend doesn't have recurring orders endpoint yet
  return { data: order as RecurringOrder, message: "Recurring orders not implemented yet" };
}

/**
 * Cancel recurring order
 * TODO: Backend needs to implement recurring orders endpoints
 */
export async function cancelRecurringOrder(id: string): Promise<void> {
  // Backend doesn't have recurring orders endpoint yet
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
    if (filters?.status) params.status = filters.status;

    return await apiGet<Negotiation[]>('/marketplace/negotiations', params);
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
    return await apiGet<Negotiation>(`/marketplace/negotiations/${id}`);
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
    const created = await apiPost<Negotiation>('/marketplace/negotiations', {
      listingId,
      ...message,
    });
    return { 
      data: created, 
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
    const updated = await apiPost<Negotiation>(`/marketplace/negotiations/${negotiationId}/messages`, message);
    return { 
      data: updated, 
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
    const accepted = await apiPut<Negotiation>(`/marketplace/negotiations/${negotiationId}/accept`);
    return { 
      data: accepted, 
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
    const rejected = await apiPut<Negotiation>(`/marketplace/negotiations/${negotiationId}/reject`);
    return { 
      data: rejected, 
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
    if (filters?.status) params.status = filters.status;

    return await apiGet<RFQ[]>('/marketplace/rfqs', params);
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
    return await apiGet<RFQ>(`/marketplace/rfqs/${id}`);
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
    const created = await apiPost<RFQ>('/marketplace/rfqs', rfq);
    return { 
      data: created, 
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
    const updated = await apiPut<RFQ>(`/marketplace/rfqs/${id}`, rfq);
    return { 
      data: updated, 
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
    const published = await apiPut<RFQ>(`/marketplace/rfqs/${id}/publish`);
    return { 
      data: published, 
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
    const closed = await apiPut<RFQ>(`/marketplace/rfqs/${id}/close`);
    return { 
      data: closed, 
      message: "RFQ closed successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to close RFQ" };
  }
}

/**
 * Cancel RFQ
 * TODO: Backend needs to implement PUT /api/v1/marketplace/rfqs/:id/cancel
 */
export async function cancelRFQ(id: string): Promise<ApiResponse<RFQ>> {
  // Backend doesn't have cancel endpoint yet - using close as fallback
  return closeRFQ(id);
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
    if (filters?.status) params.status = filters.status;

    return await apiGet<RFQResponse[]>(`/marketplace/rfqs/${rfqId}/responses`, params);
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
    const created = await apiPost<RFQResponse>(`/marketplace/rfqs/${rfqId}/responses`, response);
    return { 
      data: created, 
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
    return await apiGet<RFQResponse>(`/marketplace/rfq-responses/${responseId}`);
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
    const updated = await apiPut<RFQResponse>(`/marketplace/rfq-responses/${responseId}/status`, { status });
    return { 
      data: updated, 
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
    const awarded = await apiPut<RFQ>(`/marketplace/rfqs/${rfqId}/award/${responseIds[0]}`);
    return { 
      data: awarded, 
      message: "RFQ awarded successfully" 
    };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to award RFQ" };
  }
}

/**
 * Convert RFQ response to order
 * TODO: Backend needs to implement POST /api/v1/marketplace/rfqs/:rfqId/responses/:responseId/convert-to-order
 */
export async function convertRFQResponseToOrder(
  rfqId: string,
  responseId: string
): Promise<ApiResponse<MarketplaceOrder>> {
  // Backend doesn't have convert endpoint yet
  return { 
    data: null as any, 
    error: "Convert to order not implemented yet" 
  };
}
