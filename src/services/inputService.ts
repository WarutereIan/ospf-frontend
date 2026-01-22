/**
 * Input Service
 * 
 * Handles all input provider related API calls:
 * - Input products
 * - Input orders
 * - Input customers (farmers who order inputs)
 * 
 * Backend API endpoints:
 * - GET /api/v1/inputs - List inputs
 * - GET /api/v1/inputs/:id - Get input details
 * - POST /api/v1/inputs - Create input
 * - PUT /api/v1/inputs/:id - Update input
 * - DELETE /api/v1/inputs/:id - Delete input
 * - GET /api/v1/inputs/stats - Get input statistics
 * - GET /api/v1/inputs/customers - List input customers
 * - GET /api/v1/inputs/customers/:id - Get customer details
 * - GET /api/v1/inputs/customers/:id/orders - Get customer order history
 * - GET /api/v1/inputs/customers/stats - Get customer statistics
 * - GET /api/v1/inputs/orders - List input orders
 * - GET /api/v1/inputs/orders/:id - Get order details
 * - POST /api/v1/inputs/orders - Create input order
 * - PUT /api/v1/inputs/orders/:id/status - Update order status
 */

import type {
  Input,
  InputOrder,
  InputCustomer,
  InputFilters,
  InputOrderFilters,
  CustomerFilters,
  InputStats,
  CustomerStats,
} from "@/types/input";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

// ==================== Input Products ====================

/**
 * Get all inputs
 * Backend: GET /api/v1/inputs
 */
export async function getInputs(filters?: InputFilters): Promise<Input[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.category) params.category = filters.category;
    if (filters?.status) params.status = filters.status;
    if (filters?.minPrice) params.minPrice = filters.minPrice;
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters?.search) params.search = filters.search;

    return await apiGet<Input[]>('/inputs', params);
  } catch (error) {
    console.error('Error fetching inputs:', error);
    return [];
  }
}

/**
 * Get input by ID
 * Backend: GET /api/v1/inputs/:id
 */
export async function getInputById(id: string): Promise<Input | null> {
  try {
    return await apiGet<Input>(`/inputs/${id}`);
  } catch (error) {
    console.error('Error fetching input:', error);
    return null;
  }
}

/**
 * Create input
 * Backend: POST /api/v1/inputs
 */
export async function createInput(input: Partial<Input>): Promise<ApiResponse<Input>> {
  try {
    const created = await apiPost<Input>('/inputs', input);
    return { data: created, message: "Input created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create input" };
  }
}

/**
 * Update input
 * Backend: PUT /api/v1/inputs/:id
 */
export async function updateInput(id: string, input: Partial<Input>): Promise<ApiResponse<Input>> {
  try {
    const updated = await apiPut<Input>(`/inputs/${id}`, input);
    return { data: updated, message: "Input updated successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update input" };
  }
}

/**
 * Delete input
 * Backend: DELETE /api/v1/inputs/:id
 */
export async function deleteInput(id: string): Promise<void> {
  try {
    await apiDelete(`/inputs/${id}`);
  } catch (error) {
    console.error('Error deleting input:', error);
    throw error;
  }
}

// ==================== Input Orders ====================

/**
 * Get input orders
 * Backend: GET /api/v1/inputs/orders
 */
export async function getInputOrders(filters?: InputOrderFilters): Promise<InputOrder[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.farmerId) params.farmerId = filters.farmerId;
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.inputId) params.inputId = filters.inputId;
    if (filters?.status) params.status = filters.status;
    if (filters?.paymentStatus) params.paymentStatus = filters.paymentStatus;

    return await apiGet<InputOrder[]>('/inputs/orders', params);
  } catch (error) {
    console.error('Error fetching input orders:', error);
    return [];
  }
}

/**
 * Get input order by ID
 * Backend: GET /api/v1/inputs/orders/:id
 */
export async function getInputOrderById(id: string): Promise<InputOrder | null> {
  try {
    return await apiGet<InputOrder>(`/inputs/orders/${id}`);
  } catch (error) {
    console.error('Error fetching input order:', error);
    return null;
  }
}

/**
 * Create input order
 * Backend: POST /api/v1/inputs/orders
 */
export async function createInputOrder(order: Partial<InputOrder>): Promise<ApiResponse<InputOrder>> {
  try {
    const created = await apiPost<InputOrder>('/inputs/orders', order);
    return { data: created, message: "Input order created successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to create input order" };
  }
}

/**
 * Update input order status
 * Backend: PUT /api/v1/inputs/orders/:id/status
 */
export async function updateInputOrderStatus(
  id: string,
  status: InputOrder["status"]
): Promise<ApiResponse<InputOrder>> {
  try {
    const updated = await apiPut<InputOrder>(`/inputs/orders/${id}/status`, { status });
    return { data: updated, message: "Order status updated" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to update order status" };
  }
}

// ==================== Input Customers ====================

/**
 * Get input customers
 * Backend: GET /api/v1/inputs/customers
 */
export async function getInputCustomers(filters?: CustomerFilters): Promise<InputCustomer[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.providerId) params.providerId = filters.providerId;
    if (filters?.search) params.search = filters.search;
    if (filters?.minOrders) params.minOrders = filters.minOrders;
    if (filters?.minSpent) params.minSpent = filters.minSpent;

    return await apiGet<InputCustomer[]>('/inputs/customers', params);
  } catch (error) {
    console.error('Error fetching input customers:', error);
    return [];
  }
}

/**
 * Get input customer by ID
 * Backend: GET /api/v1/inputs/customers/:id
 */
export async function getInputCustomerById(id: string): Promise<InputCustomer | null> {
  try {
    return await apiGet<InputCustomer>(`/inputs/customers/${id}`);
  } catch (error) {
    console.error('Error fetching input customer:', error);
    return null;
  }
}

/**
 * Get customer order history
 * Backend: GET /api/v1/inputs/customers/:id/orders
 */
export async function getCustomerOrderHistory(customerId: string): Promise<InputOrder[]> {
  try {
    return await apiGet<InputOrder[]>(`/inputs/customers/${customerId}/orders`);
  } catch (error) {
    console.error('Error fetching customer order history:', error);
    return [];
  }
}

// ==================== Statistics ====================

/**
 * Get input statistics
 * Backend: GET /api/v1/inputs/stats
 */
export async function getInputStats(): Promise<InputStats> {
  try {
    return await apiGet<InputStats>('/inputs/stats');
  } catch (error) {
    console.error('Error fetching input stats:', error);
    return {
      totalInputs: 0,
      activeInputs: 0,
      outOfStock: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
    };
  }
}

/**
 * Get customer statistics
 * Backend: GET /api/v1/inputs/customers/stats
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  try {
    return await apiGet<CustomerStats>('/inputs/customers/stats');
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return {
      total: 0,
      active: 0,
      inactive: 0,
      new: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
    };
  }
}
