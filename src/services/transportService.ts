/**
 * Transport Service
 * 
 * Handles all transport-related API calls:
 * - Transport requests
 * - Active deliveries
 * - Delivery tracking
 * 
 * Backend API endpoints to implement:
 * - GET /api/transport/requests - List transport requests
 * - GET /api/transport/requests/:id - Get request details
 * - POST /api/transport/requests - Create transport request
 * - PUT /api/transport/requests/:id/accept - Accept request
 * - PUT /api/transport/requests/:id/reject - Reject request
 * - PUT /api/transport/requests/:id/status - Update request status
 * - GET /api/transport/deliveries - List active deliveries
 * - GET /api/transport/deliveries/:id - Get delivery details
 * - POST /api/transport/deliveries/:id/tracking - Add tracking update
 * - GET /api/transport/stats - Get transport statistics
 */

import type {
  TransportRequest,
  ActiveDelivery,
  DeliveryTrackingUpdate,
  TransportFilters,
  TransportStats,
} from "@/types/transport";
import type { ApiResponse } from "@/types/inputCustomer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 1000;

const MOCK_REQUESTS: TransportRequest[] = [];

export async function getTransportRequests(filters?: TransportFilters): Promise<TransportRequest[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS;
}

export async function getTransportRequestById(id: string): Promise<TransportRequest | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS.find(request => request.id === id) || null;
}

export async function createTransportRequest(request: Partial<TransportRequest>): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: request as TransportRequest, message: "Transport request created successfully" };
}

export async function acceptTransportRequest(id: string, providerId: string): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status: "accepted", providerId }, message: "Request accepted" };
}

export async function rejectTransportRequest(id: string): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status: "rejected" }, message: "Request rejected" };
}

export async function updateTransportRequestStatus(
  id: string,
  status: TransportRequest["status"]
): Promise<ApiResponse<TransportRequest>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) {
    return { data: request!, error: "Request not found" };
  }
  return { data: { ...request, status }, message: "Request status updated" };
}

export async function getActiveDeliveries(): Promise<ActiveDelivery[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_REQUESTS.filter(r => r.status === "in_transit" || r.status === "delivered") as ActiveDelivery[];
}

export async function addTrackingUpdate(
  deliveryId: string,
  update: Partial<DeliveryTrackingUpdate>
): Promise<ApiResponse<DeliveryTrackingUpdate>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return { data: update as DeliveryTrackingUpdate, message: "Tracking update added" };
}

export async function getTransportStats(): Promise<TransportStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
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
