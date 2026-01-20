/**
 * Marketplace Service
 * 
 * Handles all marketplace-related API calls:
 * - Produce listings
 * - Marketplace orders
 * 
 * Backend API endpoints to implement:
 * - GET /api/marketplace/listings - List produce listings
 * - GET /api/marketplace/listings/:id - Get listing details
 * - POST /api/marketplace/listings - Create listing
 * - PUT /api/marketplace/listings/:id - Update listing
 * - DELETE /api/marketplace/listings/:id - Delete listing
 * - GET /api/marketplace/orders - List marketplace orders
 * - GET /api/marketplace/orders/:id - Get order details
 * - POST /api/marketplace/orders - Create order
 * - PUT /api/marketplace/orders/:id/status - Update order status
 * - GET /api/marketplace/stats - Get marketplace statistics
 */

import type {
  ProduceListing,
  MarketplaceOrder,
  SourcingRequest,
  SupplierOffer,
  RecurringOrder,
  MarketplaceFilters,
  MarketplaceOrderFilters,
  SourcingRequestFilters,
  MarketplaceStats,
} from "@/types/marketplace";
import type { ApiResponse } from "@/types/inputCustomer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

// Mock data - will be replaced with API calls
const MOCK_LISTINGS: ProduceListing[] = [];
const MOCK_ORDERS: MarketplaceOrder[] = [];

export async function getListings(filters?: MarketplaceFilters): Promise<ProduceListing[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_LISTINGS;
}

export async function getListingById(id: string): Promise<ProduceListing | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_LISTINGS.find(listing => listing.id === id) || null;
}

export async function createListing(listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: listing as ProduceListing, message: "Listing created successfully" };
}

export async function updateListing(id: string, listing: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: listing as ProduceListing, message: "Listing updated successfully" };
}

export async function deleteListing(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

export async function getMarketplaceOrders(filters?: MarketplaceOrderFilters): Promise<MarketplaceOrder[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_ORDERS;
}

export async function getMarketplaceOrderById(id: string): Promise<MarketplaceOrder | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_ORDERS.find(order => order.id === id) || null;
}

export async function createMarketplaceOrder(order: Partial<MarketplaceOrder>): Promise<ApiResponse<MarketplaceOrder>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: order as MarketplaceOrder, message: "Order created successfully" };
}

export async function updateMarketplaceOrderStatus(
  id: string,
  status: MarketplaceOrder["status"]
): Promise<ApiResponse<MarketplaceOrder>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const order = MOCK_ORDERS.find(o => o.id === id);
  if (!order) {
    return { data: order!, error: "Order not found" };
  }
  return { data: { ...order, status }, message: "Order status updated" };
}

export async function getSourcingRequests(filters?: SourcingRequestFilters): Promise<SourcingRequest[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
}

export async function getSourcingRequestById(id: string): Promise<SourcingRequest | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return null;
}

export async function createSourcingRequest(request: Partial<SourcingRequest>): Promise<ApiResponse<SourcingRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: request as SourcingRequest, message: "Sourcing request created successfully" };
}

export async function updateSourcingRequest(id: string, request: Partial<SourcingRequest>): Promise<ApiResponse<SourcingRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: request as SourcingRequest, message: "Sourcing request updated successfully" };
}

export async function submitSupplierOffer(requestId: string, offer: Partial<SupplierOffer>): Promise<ApiResponse<SupplierOffer>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: offer as SupplierOffer, message: "Offer submitted successfully" };
}

export async function acceptSupplierOffer(offerId: string): Promise<ApiResponse<SupplierOffer>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: {} as SupplierOffer, message: "Offer accepted" };
}

export async function getRecurringOrders(): Promise<RecurringOrder[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return [];
}

export async function createRecurringOrder(order: Partial<RecurringOrder>): Promise<ApiResponse<RecurringOrder>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: order as RecurringOrder, message: "Recurring order created successfully" };
}

export async function updateRecurringOrder(id: string, order: Partial<RecurringOrder>): Promise<ApiResponse<RecurringOrder>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: order as RecurringOrder, message: "Recurring order updated successfully" };
}

export async function cancelRecurringOrder(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

export async function getMarketplaceStats(): Promise<MarketplaceStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
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
  };
}
