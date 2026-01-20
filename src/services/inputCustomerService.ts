/**
 * Input Customer Service
 * 
 * This service handles all API calls related to input provider customers.
 * Currently uses mock data, but will be replaced with actual API calls.
 * 
 * Backend API endpoints to implement:
 * - GET /api/input-providers/customers - List all customers
 * - GET /api/input-providers/customers/:id - Get customer details
 * - GET /api/input-providers/customers/:id/orders - Get customer order history
 * - GET /api/input-providers/customers/stats - Get customer statistics
 * - POST /api/input-providers/customers - Create new customer (if needed)
 * - PUT /api/input-providers/customers/:id - Update customer information
 */

import type { 
  Customer, 
  CustomerStats, 
  CustomerFilters, 
  CustomerPayload,
  PaginatedCustomers,
  ApiResponse 
} from "@/types/inputCustomer";

/**
 * Base API URL - will be replaced with actual backend URL
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Mock delay to simulate API calls
 */
const MOCK_DELAY = 1000;

/**
 * Mock customer data - replace with actual API calls
 */
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    farmerName: "John Kamau",
    farmerPhone: "+254712345678",
    farmerEmail: "john.kamau@example.com",
    location: "Kangundo, Machakos",
    totalOrders: 5,
    totalSpent: 45000,
    lastOrderDate: "2024-01-15T10:30:00Z",
    firstOrderDate: "2023-11-10T08:00:00Z",
    averageOrderValue: 9000,
    status: "active",
    favoriteCategory: "Planting Material",
    orderHistory: [
      {
        orderNumber: "INP-ORD-001",
        inputName: "OFSP Vines (Kenya)",
        quantity: 500,
        amount: 15500,
        date: "2024-01-15T10:30:00Z",
        status: "pending",
      },
      {
        orderNumber: "INP-ORD-012",
        inputName: "NPK Fertilizer",
        quantity: 30,
        amount: 5000,
        date: "2023-12-20T14:15:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-008",
        inputName: "OFSP Vines (SPK004)",
        quantity: 300,
        amount: 11000,
        date: "2023-12-05T09:20:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-005",
        inputName: "Organic Compost",
        quantity: 50,
        amount: 4500,
        date: "2023-11-25T11:00:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-003",
        inputName: "OFSP Vines (Kenya)",
        quantity: 200,
        amount: 6500,
        date: "2023-11-10T08:00:00Z",
        status: "completed",
      },
    ],
  },
  {
    id: "2",
    farmerName: "Mary Wanjiku",
    farmerPhone: "+254723456789",
    farmerEmail: "mary.wanjiku@example.com",
    location: "Matungulu, Machakos",
    totalOrders: 3,
    totalSpent: 24000,
    lastOrderDate: "2024-01-14T14:20:00Z",
    firstOrderDate: "2023-12-01T10:00:00Z",
    averageOrderValue: 8000,
    status: "active",
    favoriteCategory: "Fertilizer",
    orderHistory: [
      {
        orderNumber: "INP-ORD-002",
        inputName: "NPK Fertilizer",
        quantity: 50,
        amount: 8000,
        date: "2024-01-14T14:20:00Z",
        status: "accepted",
      },
      {
        orderNumber: "INP-ORD-010",
        inputName: "NPK Fertilizer",
        quantity: 40,
        amount: 6500,
        date: "2023-12-15T13:30:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-006",
        inputName: "Organic Compost",
        quantity: 60,
        amount: 5500,
        date: "2023-12-01T10:00:00Z",
        status: "completed",
      },
    ],
  },
  {
    id: "3",
    farmerName: "Peter Mwangi",
    farmerPhone: "+254734567890",
    location: "Mwala, Machakos",
    totalOrders: 4,
    totalSpent: 38000,
    lastOrderDate: "2024-01-13T09:15:00Z",
    firstOrderDate: "2023-11-15T09:00:00Z",
    averageOrderValue: 9500,
    status: "active",
    favoriteCategory: "Planting Material",
    orderHistory: [
      {
        orderNumber: "INP-ORD-003",
        inputName: "OFSP Vines (SPK004)",
        quantity: 300,
        amount: 10500,
        date: "2024-01-13T09:15:00Z",
        status: "processing",
      },
      {
        orderNumber: "INP-ORD-009",
        inputName: "OFSP Vines (Kenya)",
        quantity: 400,
        amount: 12500,
        date: "2023-12-10T08:45:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-007",
        inputName: "Training Manuals",
        quantity: 5,
        amount: 2500,
        date: "2023-11-28T12:00:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-004",
        inputName: "OFSP Vines (SPK004)",
        quantity: 250,
        amount: 12500,
        date: "2023-11-15T09:00:00Z",
        status: "completed",
      },
    ],
  },
  {
    id: "4",
    farmerName: "Jane Wambui",
    farmerPhone: "+254745678901",
    farmerEmail: "jane.wambui@example.com",
    location: "Kangundo, Machakos",
    totalOrders: 2,
    totalSpent: 13000,
    lastOrderDate: "2024-01-12T11:45:00Z",
    firstOrderDate: "2023-12-20T10:30:00Z",
    averageOrderValue: 6500,
    status: "new",
    favoriteCategory: "Soil Amendment",
    orderHistory: [
      {
        orderNumber: "INP-ORD-004",
        inputName: "Organic Compost",
        quantity: 100,
        amount: 8500,
        date: "2024-01-12T11:45:00Z",
        status: "ready_for_pickup",
      },
      {
        orderNumber: "INP-ORD-011",
        inputName: "Organic Compost",
        quantity: 50,
        amount: 4500,
        date: "2023-12-20T10:30:00Z",
        status: "completed",
      },
    ],
  },
  {
    id: "5",
    farmerName: "David Kipchoge",
    farmerPhone: "+254756789012",
    location: "Matungulu, Machakos",
    totalOrders: 1,
    totalSpent: 5000,
    lastOrderDate: "2024-01-10T08:30:00Z",
    firstOrderDate: "2024-01-10T08:30:00Z",
    averageOrderValue: 5000,
    status: "new",
    favoriteCategory: "Training Materials",
    orderHistory: [
      {
        orderNumber: "INP-ORD-005",
        inputName: "Training Manuals",
        quantity: 10,
        amount: 5000,
        date: "2024-01-10T08:30:00Z",
        status: "delivered",
      },
    ],
  },
  {
    id: "6",
    farmerName: "Sarah Njeri",
    farmerPhone: "+254767890123",
    location: "Mwala, Machakos",
    totalOrders: 3,
    totalSpent: 19500,
    lastOrderDate: "2024-01-08T16:20:00Z",
    firstOrderDate: "2023-11-20T14:00:00Z",
    averageOrderValue: 6500,
    status: "active",
    favoriteCategory: "Planting Material",
    orderHistory: [
      {
        orderNumber: "INP-ORD-006",
        inputName: "OFSP Vines (Kenya)",
        quantity: 200,
        amount: 6500,
        date: "2024-01-08T16:20:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-013",
        inputName: "OFSP Vines (Kenya)",
        quantity: 150,
        amount: 5000,
        date: "2023-12-12T10:15:00Z",
        status: "completed",
      },
      {
        orderNumber: "INP-ORD-009",
        inputName: "OFSP Vines (SPK004)",
        quantity: 250,
        amount: 8000,
        date: "2023-11-20T14:00:00Z",
        status: "completed",
      },
    ],
  },
];

/**
 * Get all customers
 * 
 * Backend endpoint: GET /api/input-providers/customers
 * Query params: ?page=1&pageSize=20&status=active&search=query
 */
export async function getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers?${new URLSearchParams(filters)}`);
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  let filtered = [...MOCK_CUSTOMERS];
  
  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (customer) =>
        customer.farmerName.toLowerCase().includes(query) ||
        customer.farmerPhone.includes(query) ||
        customer.location.toLowerCase().includes(query)
    );
  }
  
  if (filters?.status) {
    filtered = filtered.filter((customer) => customer.status === filters.status);
  }
  
  if (filters?.location) {
    filtered = filtered.filter((customer) => 
      customer.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  return filtered;
}

/**
 * Get customer by ID
 * 
 * Backend endpoint: GET /api/input-providers/customers/:id
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers/${id}`);
  // if (!response.ok) return null;
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  return MOCK_CUSTOMERS.find((customer) => customer.id === id) || null;
}

/**
 * Get customer statistics
 * 
 * Backend endpoint: GET /api/input-providers/customers/stats
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers/stats`);
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  const customers = MOCK_CUSTOMERS;
  const total = customers.length;
  const active = customers.filter((c) => c.status === "active").length;
  const inactive = customers.filter((c) => c.status === "inactive").length;
  const newCustomers = customers.filter((c) => c.status === "new").length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const averageOrderValue = 
    total > 0 
      ? customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / total
      : 0;
  
  return {
    total,
    active,
    inactive,
    new: newCustomers,
    totalRevenue,
    averageOrderValue,
  };
}

/**
 * Get customer order history
 * 
 * Backend endpoint: GET /api/input-providers/customers/:id/orders
 */
export async function getCustomerOrderHistory(customerId: string): Promise<Customer["orderHistory"]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers/${customerId}/orders`);
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);
  return customer?.orderHistory || [];
}

/**
 * Create new customer
 * 
 * Backend endpoint: POST /api/input-providers/customers
 */
export async function createCustomer(payload: CustomerPayload): Promise<ApiResponse<Customer>> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  const newCustomer: Customer = {
    id: String(MOCK_CUSTOMERS.length + 1),
    ...payload,
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: new Date().toISOString(),
    firstOrderDate: new Date().toISOString(),
    averageOrderValue: 0,
    status: "new",
    orderHistory: [],
    createdAt: new Date().toISOString(),
  };
  
  return {
    data: newCustomer,
    message: "Customer created successfully",
  };
}

/**
 * Update customer
 * 
 * Backend endpoint: PUT /api/input-providers/customers/:id
 */
export async function updateCustomer(
  id: string,
  payload: Partial<CustomerPayload>
): Promise<ApiResponse<Customer>> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/input-providers/customers/${id}`, {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();
  
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
  if (!customer) {
    return {
      data: customer!,
      error: "Customer not found",
    };
  }
  
  const updatedCustomer: Customer = {
    ...customer,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  
  return {
    data: updatedCustomer,
    message: "Customer updated successfully",
  };
}
