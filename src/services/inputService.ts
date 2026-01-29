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
  InputStatus,
  InputOrderStatus,
  InputPaymentStatus,
} from "@/types/input";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";
import { showSuccess } from "@/lib/toast";

// ==================== Enum Transformation Utilities ====================

/**
 * Map backend input status (UPPER_CASE) to frontend format (lowercase)
 */
function mapInputStatus(backendStatus: string): InputStatus {
  const statusMap: Record<string, InputStatus> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
  };
  return statusMap[backendStatus] || 'inactive';
}

/**
 * Map backend input order status (UPPER_CASE) to frontend format (lowercase)
 */
function mapInputOrderStatus(backendStatus: string): InputOrderStatus {
  const statusMap: Record<string, InputOrderStatus> = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    PROCESSING: 'processing',
    READY_FOR_PICKUP: 'ready_for_pickup',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    REJECTED: 'rejected',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Map backend input payment status (UPPER_CASE) to frontend format (lowercase)
 */
function mapInputPaymentStatus(backendStatus: string): InputPaymentStatus {
  const statusMap: Record<string, InputPaymentStatus> = {
    PENDING: 'pending',
    PAID: 'paid',
    REFUNDED: 'refunded',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Transform input from backend format to frontend format
 */
function transformInput(input: any): Input {
  return {
    ...input,
    status: mapInputStatus(input.status),
  };
}

/**
 * Transform input order from backend format to frontend format
 * Extracts nested farmer and input data to flat structure
 */
function transformInputOrder(order: any): InputOrder {
  // Extract farmer information from nested structure
  const farmerName = order.farmer?.profile
    ? [order.farmer.profile.firstName, order.farmer.profile.lastName].filter(Boolean).join(' ') || order.farmer.email
    : order.farmerName || order.farmer?.email || 'Unknown';
  
  const farmerPhone = order.farmer?.profile?.phone || order.farmer?.phone || order.farmerPhone || '';
  
  // Extract farmer location from profile
  const farmerLocation = order.farmer?.profile?.county || 
                        order.farmer?.profile?.subCounty || 
                        order.farmer?.profile?.address ||
                        order.farmerLocation || 
                        '';

  // Extract input information from nested structure
  const inputName = order.input?.name || order.inputName || 'Unknown';
  const inputCategory = order.input?.category || order.inputCategory || 'Planting Material';
  
  // Extract provider information if needed
  const providerName = order.input?.provider?.profile
    ? [order.input.provider.profile.firstName, order.input.provider.profile.lastName].filter(Boolean).join(' ') || order.input.provider.email
    : order.input?.provider?.businessName || 
      order.providerName || 
      'Unknown Provider';

  // Extract transport provider if available
  const transportProvider = order.transportRequest?.provider?.profile
    ? [order.transportRequest.provider.profile.firstName, order.transportRequest.provider.profile.lastName].filter(Boolean).join(' ') || order.transportRequest.provider.email
    : order.transportRequest?.provider?.businessName ||
      order.transportProvider || 
      undefined;

  // Map category from backend enum to frontend format
  const categoryMap: Record<string, string> = {
    'PLANTING_MATERIAL': 'Planting Material',
    'FERTILIZER': 'Fertilizer',
    'SOIL_AMENDMENT': 'Soil Amendment',
    'TOOLS_EQUIPMENT': 'Tools & Equipment',
    'TRAINING_MATERIALS': 'Training Materials',
  };
  const mappedCategory = categoryMap[inputCategory] || inputCategory;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    farmerId: order.farmerId,
    farmerName,
    farmerPhone,
    farmerLocation,
    inputId: order.inputId,
    inputName,
    inputCategory: mappedCategory as any,
    quantity: order.quantity,
    unit: order.unit,
    pricePerUnit: order.pricePerUnit,
    subtotal: order.subtotal,
    transportFee: order.transportFee || 0,
    totalAmount: order.totalAmount,
    status: mapInputOrderStatus(order.status),
    paymentStatus: order.paymentStatus ? mapInputPaymentStatus(order.paymentStatus) : 'pending',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryDate: order.deliveryDate,
    notes: order.notes,
    requiresTransport: order.requiresTransport || false,
    transportProviderId: order.transportRequestId || order.transportProviderId,
    transportProvider,
    // Aliases for compatibility
    amount: order.totalAmount,
    date: order.createdAt,
    customerName: farmerName,
    // Items array for dashboard compatibility
    items: [{
      productName: inputName,
      quantity: order.quantity,
      unit: order.unit,
    }],
  };
}

/**
 * Transform input customer from backend format to frontend format
 * Supports both:
 * - flat customer objects returned by GET /inputs/customers
 * - nested User objects returned by GET /inputs/customers/:id
 */
function transformInputCustomer(customer: any): InputCustomer {
  // If backend already returned the flattened shape, normalize + add safe defaults.
  const looksFlat =
    typeof customer?.farmerName === "string" &&
    customer?.totalOrders !== undefined &&
    customer?.totalSpent !== undefined;

  if (looksFlat) {
    return {
      id: customer.id,
      farmerId: customer.farmerId || customer.id,
      farmerName: customer.farmerName || "Unknown",
      farmerPhone: customer.farmerPhone || "",
      farmerEmail: customer.farmerEmail || customer.farmerEmail || undefined,
      location: customer.location || "",
      totalOrders: customer.totalOrders ?? 0,
      totalSpent: customer.totalSpent ?? 0,
      lastOrderDate: customer.lastOrderDate || customer.lastOrderDate || "",
      firstOrderDate: customer.firstOrderDate || customer.firstOrderDate || "",
      averageOrderValue: customer.averageOrderValue ?? 0,
      status: customer.status || "active",
      favoriteCategory: customer.favoriteCategory || undefined,
      createdAt: customer.createdAt || undefined,
      orderHistory: Array.isArray(customer.orderHistory) ? customer.orderHistory : [],
    };
  }

  // Nested user shape (from getInputCustomerById)
  const firstName = customer?.profile?.firstName || "";
  const lastName = customer?.profile?.lastName || "";
  const farmerName = [firstName, lastName].filter(Boolean).join(" ").trim() || customer?.email || "Unknown";

  const location =
    customer?.profile?.county ||
    customer?.profile?.subCounty ||
    customer?.profile?.address ||
    "";

  const rawOrders = Array.isArray(customer?.inputOrders) ? customer.inputOrders : [];
  const orderHistory = rawOrders.map(transformInputOrder);

  const totalOrders = orderHistory.length;
  const totalSpent = orderHistory.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const lastOrderDate = orderHistory[0]?.createdAt || "";
  const firstOrderDate = orderHistory[orderHistory.length - 1]?.createdAt || "";

  // Status heuristic: new if first order is within 30 days; inactive if no orders; else active
  let status: InputCustomer["status"] = "active";
  if (totalOrders === 0) status = "inactive";
  else {
    const first = firstOrderDate ? new Date(firstOrderDate) : null;
    if (first && !isNaN(first.getTime())) {
      const days = (Date.now() - first.getTime()) / (1000 * 60 * 60 * 24);
      if (days <= 30) status = "new";
    }
  }

  // Favorite category from orders (uses already-mapped order.inputCategory)
  let favoriteCategory: InputCustomer["favoriteCategory"] | undefined;
  const categoryCounts: Record<string, number> = {};
  for (const o of orderHistory) {
    if (!o.inputCategory) continue;
    const key = String(o.inputCategory);
    categoryCounts[key] = (categoryCounts[key] || 0) + 1;
  }
  const favoriteKey = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
  if (favoriteKey) favoriteCategory = favoriteKey as any;

  return {
    id: customer.id,
    farmerId: customer.id,
    farmerName,
    farmerPhone: customer.phone || "",
    farmerEmail: customer.email || undefined,
    location,
    totalOrders,
    totalSpent,
    lastOrderDate,
    firstOrderDate,
    averageOrderValue,
    status,
    favoriteCategory,
    createdAt: customer.createdAt || undefined,
    orderHistory,
  };
}

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
    // Transform status filter to backend format (UPPER_CASE) if provided
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }
    if (filters?.minPrice) params.minPrice = filters.minPrice;
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters?.search !== undefined) params.search = filters.search;
    else if (filters?.searchQuery !== undefined) params.search = filters.searchQuery;

    const inputs = await apiGet<any[]>('/inputs', params);
    return inputs.map(transformInput);
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
    const input = await apiGet<any>(`/inputs/${id}`);
    return transformInput(input);
  } catch (error) {
    console.error('Error fetching input:', error);
    return null;
  }
}

/**
 * Backend CreateInputDto shape (POST /inputs).
 */
interface CreateInputDto {
  name: string;
  category: 'Planting Material' | 'Fertilizer' | 'Soil Amendment' | 'Tools & Equipment' | 'Training Materials';
  description: string;
  price: number;
  unit: string;
  stock: number;
  minimumStock?: number;
  images?: string[];
  location: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

/**
 * Map frontend input to backend CreateInputDto.
 */
function toCreateInputDto(input: Partial<Input>): CreateInputDto {
  return {
    name: input.name || '',
    category: (input.category as CreateInputDto['category']) || 'Planting Material',
    description: input.description || '',
    price: typeof input.price === 'number' ? input.price : 0,
    unit: input.unit || '',
    stock: typeof input.stock === 'number' ? input.stock : 0,
    minimumStock: input.minimumStock,
    images: input.images,
    location: input.location || '',
    status: input.status as CreateInputDto['status'],
  };
}

/**
 * Create input
 * Backend: POST /api/v1/inputs
 */
export async function createInput(input: Partial<Input>): Promise<ApiResponse<Input>> {
  try {
    const dto = toCreateInputDto(input);
    const created = await apiPost<Input>('/inputs', dto);
    showSuccess("Input created successfully");
    return { data: created, message: "Input created successfully" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
    return { data: null as any, error: error.message || "Failed to create input" };
  }
}

/**
 * Backend UpdateInputDto shape (PUT /inputs/:id).
 */
interface UpdateInputDto {
  name?: string;
  category?: 'Planting Material' | 'Fertilizer' | 'Soil Amendment' | 'Tools & Equipment' | 'Training Materials';
  description?: string;
  price?: number;
  unit?: string;
  stock?: number;
  minimumStock?: number;
  images?: string[];
  location?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

/**
 * Map frontend input to backend UpdateInputDto.
 */
function toUpdateInputDto(input: Partial<Input>): UpdateInputDto {
  const dto: UpdateInputDto = {};
  if (input.name !== undefined) dto.name = input.name;
  if (input.category !== undefined) dto.category = input.category as UpdateInputDto['category'];
  if (input.description !== undefined) dto.description = input.description;
  if (input.price !== undefined) dto.price = input.price;
  if (input.unit !== undefined) dto.unit = input.unit;
  if (input.stock !== undefined) dto.stock = input.stock;
  if (input.minimumStock !== undefined) dto.minimumStock = input.minimumStock;
  if (input.images !== undefined) dto.images = input.images;
  if (input.location !== undefined) dto.location = input.location;
  if (input.status !== undefined) dto.status = input.status as UpdateInputDto['status'];
  return dto;
}

/**
 * Update input
 * Backend: PUT /api/v1/inputs/:id
 */
export async function updateInput(id: string, input: Partial<Input>): Promise<ApiResponse<Input>> {
  try {
    const dto = toUpdateInputDto(input);
    const updated = await apiPut<any>(`/inputs/${id}`, dto);
    return { data: transformInput(updated), message: "Input updated successfully" };
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
    // Transform status filters to backend format (UPPER_CASE) if provided
    if (filters?.status && filters.status !== "all") {
      params.status = filters.status.toUpperCase().replace(/_/g, '_');
    }
    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      params.paymentStatus = filters.paymentStatus.toUpperCase();
    }

    const orders = await apiGet<any[]>('/inputs/orders', params);
    return orders.map(transformInputOrder);
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
    const order = await apiGet<any>(`/inputs/orders/${id}`);
    return transformInputOrder(order);
  } catch (error) {
    console.error('Error fetching input order:', error);
    return null;
  }
}

/**
 * Backend CreateInputOrderDto shape (POST /inputs/orders).
 */
interface CreateInputOrderDto {
  inputId: string;
  quantity: number;
  requiresTransport?: boolean;
  transportFee?: number;
  deliveryDate?: string;
  notes?: string;
}

/**
 * Map frontend input order to backend CreateInputOrderDto.
 */
function toCreateInputOrderDto(order: Partial<InputOrder>): CreateInputOrderDto {
  return {
    inputId: order.inputId || '',
    quantity: typeof order.quantity === 'number' ? order.quantity : 0,
    requiresTransport: order.requiresTransport,
    transportFee: order.transportFee,
    deliveryDate: order.deliveryDate,
    notes: order.notes,
  };
}

/**
 * Create input order
 * Backend: POST /api/v1/inputs/orders
 */
export async function createInputOrder(order: Partial<InputOrder>): Promise<ApiResponse<InputOrder>> {
  try {
    const dto = toCreateInputOrderDto(order);
    const created = await apiPost<any>('/inputs/orders', dto);
    return { data: transformInputOrder(created), message: "Input order created successfully" };
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
    // Transform frontend status to backend format (UPPER_CASE)
    const backendStatus = status.toUpperCase().replace(/_/g, '_');
    const updated = await apiPut<any>(`/inputs/orders/${id}/status`, { status: backendStatus });
    return { data: transformInputOrder(updated), message: "Order status updated" };
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
    if (filters?.searchQuery !== undefined) params.search = filters.searchQuery;
    if ((filters as any)?.minOrders) params.minOrders = (filters as any).minOrders;
    if ((filters as any)?.minSpent) params.minSpent = (filters as any).minSpent;

    const customers = await apiGet<any[]>('/inputs/customers', params);
    return customers.map(transformInputCustomer);
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
    const customer = await apiGet<any>(`/inputs/customers/${id}`);
    return transformInputCustomer(customer);
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
    const orders = await apiGet<any[]>(`/inputs/customers/${customerId}/orders`);
    return orders.map(transformInputOrder);
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
