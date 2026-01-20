/**
 * Input Customer Types
 * 
 * These types define the data structures for input provider customers (farmers).
 * These will guide backend API development and database schema design.
 */

/**
 * Customer status enumeration
 */
export type CustomerStatus = "active" | "inactive" | "new";

/**
 * Order status for customer order history
 */
export type OrderStatus = 
  | "pending" 
  | "accepted" 
  | "processing" 
  | "ready_for_pickup" 
  | "in_transit" 
  | "delivered" 
  | "completed" 
  | "cancelled" 
  | "rejected";

/**
 * Customer order history item
 */
export interface CustomerOrderHistory {
  orderNumber: string;
  inputName: string;
  quantity: number;
  amount: number;
  date: string; // ISO 8601 date string
  status: OrderStatus;
}

/**
 * Customer entity
 * 
 * Represents a farmer who has placed orders with an input provider.
 * This will map to a database table with relationships to orders.
 */
export interface Customer {
  id: string; // UUID or unique identifier
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string; // Optional email
  location: string; // Full address or location description
  createdAt?: string; // ISO 8601 - Customer registration date
  totalOrders: number; // Calculated field - count of orders
  totalSpent: number; // Calculated field - sum of order amounts
  lastOrderDate: string; // ISO 8601 date string
  firstOrderDate: string; // ISO 8601 date string
  averageOrderValue: number; // Calculated field - totalSpent / totalOrders
  status: CustomerStatus;
  favoriteCategory?: string; // Most purchased input category
  orderHistory: CustomerOrderHistory[]; // Related orders (can be fetched separately)
  updatedAt?: string; // ISO 8601 date string - when customer record was last updated
}

/**
 * Customer statistics summary
 * Used for dashboard displays
 */
export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  new: number;
  totalRevenue: number;
  averageOrderValue: number;
}

/**
 * Customer filter options
 */
export interface CustomerFilters {
  searchQuery?: string;
  status?: CustomerStatus;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Customer creation/update payload
 */
export interface CustomerPayload {
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string;
  location: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * Paginated response for customer lists
 */
export interface PaginatedCustomers {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
