/**
 * Profile Types
 * 
 * Generic user profile types that can be used across different contexts.
 * Profiles can be viewed by different roles (e.g., buyer viewing farmer profile,
 * input provider viewing customer profile, etc.)
 */

/**
 * User role types
 */
export type UserRole = 
  | "farmer" 
  | "buyer" 
  | "input_provider" 
  | "transport_provider" 
  | "aggregation_manager" 
  | "county_officer" 
  | "staff";

/**
 * Profile status
 */
export type ProfileStatus = "active" | "inactive" | "pending" | "suspended";

/**
 * Base profile interface
 * Extended by specific profile types
 */
export interface BaseProfile {
  id: string; // UUID
  userId: string; // Reference to user account
  name: string;
  phone: string;
  email?: string;
  location: string;
  coordinates?: [number, number]; // [lat, lng]
  status: ProfileStatus;
  permissions?: string[]; // User permissions (for staff/admin users)
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  avatar?: string; // Profile image URL
}

/**
 * Farmer Profile
 * Used when viewing farmer information from any context
 */
export interface FarmerProfile extends BaseProfile {
  role: "farmer";
  subCounty?: string;
  ward?: string;
  rating?: number; // Average rating from buyers
  totalRatings?: number; // Number of ratings
  totalSales?: number; // Total sales volume
  totalRevenue?: number; // Total revenue earned
  qualityAverage?: number; // Average quality score
  responseTime?: number; // Average response time in minutes
  verified?: boolean; // Whether farmer is verified
  certifications?: string[]; // Certifications/licenses
  farmSize?: number; // Farm size in acres
  varieties?: string[]; // OFSP varieties grown
  orderCount?: number; // Number of orders placed
  registrationDate?: string; // ISO 8601 - When farmer registered
  lastActivity?: string; // ISO 8601 - Last activity timestamp
}

/**
 * Buyer Profile
 * Used when viewing buyer information
 */
export interface BuyerProfile extends BaseProfile {
  role: "buyer";
  businessName?: string;
  businessType?: string; // e.g., "processor", "retailer", "exporter"
  rating?: number; // Average rating from farmers
  totalRatings?: number;
  totalPurchases?: number; // Total purchase volume
  totalSpent?: number; // Total amount spent
  paymentReliability?: number; // Payment reliability score
  verified?: boolean;
}

/**
 * Input Provider Profile
 * Used when viewing input provider information
 */
export interface InputProviderProfile extends BaseProfile {
  role: "input_provider";
  businessName: string;
  businessType?: string;
  rating?: number;
  totalRatings?: number;
  totalCustomers?: number;
  totalOrders?: number;
  verified?: boolean;
}

/**
 * Transport Provider Profile
 */
export interface TransportProviderProfile extends BaseProfile {
  role: "transport_provider";
  businessName: string;
  vehicleTypes?: string[];
  rating?: number;
  totalRatings?: number;
  totalDeliveries?: number;
  verified?: boolean;
}

/**
 * Union type for all profile types
 */
export type Profile = 
  | FarmerProfile 
  | BuyerProfile 
  | InputProviderProfile 
  | TransportProviderProfile;

/**
 * Profile filter options
 * 
 * Backend-supported filters: role, county, subcounty, ward
 * Client-side only filters: status, searchQuery, verified, location
 */
export interface ProfileFilters {
  // Backend-supported filters (sent to API)
  role?: UserRole;
  county?: string;
  subcounty?: string; // Backend uses 'subcounty', Prisma uses 'subCounty' (camelCase)
  ward?: string;
  
  // Client-side only filters (applied after fetching from backend)
  status?: ProfileStatus;
  searchQuery?: string;
  verified?: boolean;
  location?: string; // Alias for searchQuery or separate location search
}

/**
 * Rating
 * Rating/review for a user (farmer, buyer, etc.)
 */
export interface Rating {
  id: string; // UUID
  ratedUserId: string; // User being rated
  ratedUserName: string; // Denormalized
  raterId: string; // User giving the rating
  raterName: string; // Denormalized
  orderId?: string; // Related order (if applicable)
  orderType?: "marketplace" | "input" | "transport";
  farmerId?: string; // Alias for ratedUserId (used in some contexts)
  overallRating: number; // 1-5
  qualityRating?: number; // 1-5
  deliveryRating?: number; // 1-5
  communicationRating?: number; // 1-5
  review?: string; // Text review
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

/**
 * Rating Summary
 * Aggregated rating data for a user
 */
export interface RatingSummary {
  userId: string;
  averageRating: number; // Average of all ratings
  totalRatings: number;
  ratingDistribution: {
    "5": number;
    "4": number;
    "3": number;
    "2": number;
    "1": number;
  };
  averageQualityRating?: number;
  averageDeliveryRating?: number;
  averageCommunicationRating?: number;
  topRated?: Array<{ 
    farmerId: string; 
    farmerName: string; 
    averageRating: number; 
    totalOrders: number;
    userId?: string; // Alias for farmerId
    name?: string; // Alias for farmerName
    rating?: number; // Alias for averageRating
  }>; // Top rated suppliers/farmers (used in some contexts)
}

/**
 * Rating filters
 */
export interface RatingFilters {
  ratedUserId?: string;
  raterId?: string;
  buyerId?: string; // Alias for raterId (used in some contexts)
  orderId?: string;
  minRating?: number;
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Profile statistics (for dashboards)
 */
export interface ProfileStats {
  total: number;
  active: number;
  verified: number;
  byRole: Record<UserRole, number>;
}
