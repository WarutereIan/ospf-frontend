/**
 * Input Types
 * 
 * Types for input provider functionality:
 * - Input products
 * - Input orders (farmer orders from input providers)
 * - Input customers (farmers who order inputs)
 */

/**
 * Input category
 */
export type InputCategory = 
  | "Planting Material" 
  | "Fertilizer" 
  | "Soil Amendment" 
  | "Tools & Equipment" 
  | "Training Materials";

/**
 * Input status
 */
export type InputStatus = "active" | "inactive" | "out_of_stock";

/**
 * Input Order Status
 * Order lifecycle for input orders
 */
export type InputOrderStatus =
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
 * Input Payment Status
 */
export type InputPaymentStatus = "pending" | "paid" | "refunded";

/**
 * Input Product
 * Represents an agricultural input product
 */
export interface Input {
  id: string; // UUID
  providerId: string; // Reference to input provider
  providerName: string; // Denormalized
  name: string;
  category: InputCategory;
  description: string;
  price: number; // Price per unit
  unit: string; // e.g., "cutting", "kg", "book", "bag"
  stock: number; // Available stock
  minimumStock?: number; // Reorder threshold
  images: string[]; // Image URLs
  location: string;
  rating?: number; // Average rating
  reviews?: number; // Number of reviews
  status: InputStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Input Order
 * Represents an order placed by a farmer for inputs
 */
export interface InputOrder {
  id: string; // UUID
  orderNumber: string; // Human-readable order number
  farmerId: string; // Reference to farmer/customer
  farmerName: string; // Denormalized
  farmerPhone: string;
  farmerLocation: string;
  inputId: string; // Reference to input product
  inputName: string; // Denormalized
  inputCategory: InputCategory;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number; // quantity * pricePerUnit
  transportFee: number;
  totalAmount: number; // subtotal + transportFee
  status: InputOrderStatus;
  paymentStatus: InputPaymentStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deliveryDate?: string; // ISO 8601
  notes?: string;
  requiresTransport: boolean;
  transportProviderId?: string;
  transportProvider?: string; // Denormalized
  amount?: number; // Alias for totalAmount (used in some contexts)
  date?: string; // Alias for createdAt (formatted date, used in some contexts)
  // Extended properties used in dashboards
  customerName?: string; // Alias for farmerName (used in some contexts)
  items?: Array<{ // Order items (used in some contexts)
    productName: string;
    quantity: number;
    unit: string;
  }>;
}

/**
 * Input Customer
 * Represents a farmer who has ordered inputs (customer of input provider)
 * Note: This is essentially a FarmerProfile viewed from input provider context
 */
export interface InputCustomer {
  id: string; // Farmer ID (same as farmer profile ID)
  farmerId: string; // Reference to farmer profile
  farmerName: string;
  farmerPhone: string;
  farmerEmail?: string;
  location: string;
  // Calculated fields (can be computed from orders)
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string; // ISO 8601
  firstOrderDate: string; // ISO 8601
  averageOrderValue: number;
  status: "active" | "inactive" | "new";
  favoriteCategory?: InputCategory;
  createdAt?: string; // ISO 8601 - Customer registration date (used in some contexts)
  // Related data (can be fetched separately)
  orderHistory?: InputOrder[];
}

/**
 * Input filters
 */
export interface InputFilters {
  category?: InputCategory | "all";
  status?: InputStatus | "all";
  searchQuery?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Input Order filters
 */
export interface InputOrderFilters {
  status?: InputOrderStatus | "all";
  paymentStatus?: InputPaymentStatus | "all";
  farmerId?: string;
  inputId?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
  searchQuery?: string;
}

/**
 * Customer filters
 */
export interface CustomerFilters {
  searchQuery?: string;
  status?: "active" | "inactive" | "new" | "all";
  location?: string;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Input statistics
 */
export interface InputStats {
  totalInputs: number;
  activeInputs: number;
  outOfStock: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

/**
 * Customer statistics
 */
export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  new: number;
  totalRevenue: number;
  averageOrderValue: number;
}
