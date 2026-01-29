/**
 * Profile Service
 * 
 * Handles all profile-related API calls.
 * Profiles can be viewed by different roles (e.g., buyer viewing farmer,
 * input provider viewing customer, etc.)
 * 
 * Backend API endpoints:
 * - GET /api/v1/profiles/:id - Get profile by ID
 * - GET /api/v1/profiles - List profiles with filters
 * - GET /api/v1/profiles/farmers - List farmer profiles
 * - GET /api/v1/profiles/buyers - List buyer profiles
 * - GET /api/v1/profiles/:id/farmer - Get farmer profile
 * - GET /api/v1/profiles/:id/buyer - Get buyer profile
 * - PUT /api/v1/profiles/:id - Update profile
 * - GET /api/v1/profiles/:id/ratings - Get ratings for a user
 * - GET /api/v1/profiles/:id/ratings/summary - Get rating summary
 * - POST /api/v1/profiles/:id/ratings - Create a rating
 */

import type { 
  Profile, 
  FarmerProfile, 
  BuyerProfile,
  ProfileFilters,
  ProfileStats,
  Rating,
  RatingSummary,
  RatingFilters,
  UserRole,
  ProfileStatus,
} from "@/types/profile";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";

// ==================== Enum Transformation Utilities ====================

/**
 * Map backend user role (UPPER_CASE) to frontend format (lowercase)
 */
function mapUserRole(backendRole: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    FARMER: 'farmer',
    BUYER: 'buyer',
    INPUT_PROVIDER: 'input_provider',
    TRANSPORT_PROVIDER: 'transport_provider',
    AGGREGATION_MANAGER: 'aggregation_manager',
    COUNTY_OFFICER: 'county_officer',
    STAFF: 'staff',
    ADMIN: 'staff', // Map ADMIN to staff for frontend
  };
  return roleMap[backendRole] || 'farmer';
}

/**
 * Map backend profile status (UPPER_CASE) to frontend format (lowercase)
 */
function mapProfileStatus(backendStatus: string): ProfileStatus {
  const statusMap: Record<string, ProfileStatus> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending',
  };
  return statusMap[backendStatus] || 'pending';
}

/**
 * Transform profile from backend format to frontend format
 * Flattens nested user object and transforms enums
 */
function transformProfile(profile: any): Profile {
  // Flatten nested user object if present
  const flattened: any = {
    ...profile,
    // Extract user fields to root level
    email: profile.user?.email || profile.email,
    role: profile.user?.role ? mapUserRole(profile.user.role) : (profile.role ? mapUserRole(profile.role) : profile.role),
    status: profile.user?.status ? mapProfileStatus(profile.user.status) : (profile.status ? mapProfileStatus(profile.status) : profile.status),
  };
  
  // Remove nested user object if it exists
  if (flattened.user) {
    delete flattened.user;
  }
  
  return flattened as Profile;
}

/**
 * Get profile by ID
 * Works for any profile type (farmer, buyer, etc.)
 * 
 * Backend: GET /api/v1/profiles/:id
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    const profile = await apiGet<any>(`/profiles/${id}`);
    return transformProfile(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Get farmer profile by ID
 * 
 * Backend: GET /api/v1/profiles/:id/farmer
 */
export async function getFarmerProfile(id: string): Promise<FarmerProfile | null> {
  try {
    const profile = await apiGet<any>(`/profiles/${id}/farmer`);
    return transformProfile(profile) as FarmerProfile;
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    return null;
  }
}

/**
 * Get buyer profile by ID
 * 
 * Backend: GET /api/v1/profiles/:id/buyer
 */
export async function getBuyerProfile(id: string): Promise<BuyerProfile | null> {
  try {
    const profile = await apiGet<any>(`/profiles/${id}/buyer`);
    return transformProfile(profile) as BuyerProfile;
  } catch (error) {
    console.error('Error fetching buyer profile:', error);
    return null;
  }
}

/**
 * List profiles with filters
 * 
 * Backend: GET /api/v1/profiles?role=farmer&county=...&subcounty=...&ward=...
 */
export async function getProfiles(filters?: ProfileFilters): Promise<Profile[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.role) params.role = filters.role;
    if (filters?.county) params.county = filters.county;
    if (filters?.subcounty) params.subcounty = filters.subcounty;
    if (filters?.ward) params.ward = filters.ward;

    return await apiGet<Profile[]>('/profiles', params);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

/**
 * Backend UpdateProfileDto shape (PUT /profiles/:id).
 */
interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  county?: string;
  subcounty?: string;
  ward?: string;
  location?: string;
  businessName?: string;
  businessRegistrationNumber?: string;
  bio?: string;
  profilePicture?: string;
  // Assignment fields
  farmerGroupId?: string;
  aggregationCenterId?: string;
  assignedCounty?: string;
  assignedSubCounty?: string;
  hasAllAccess?: boolean;
}

/**
 * Map frontend profile to backend UpdateProfileDto.
 */
function toUpdateProfileDto(updates: Partial<Profile>): UpdateProfileDto {
  const dto: UpdateProfileDto = {};
  if (updates.firstName !== undefined) dto.firstName = updates.firstName;
  if (updates.lastName !== undefined) dto.lastName = updates.lastName;
  if (updates.phone !== undefined) dto.phoneNumber = updates.phone;
  const u = updates as Record<string, unknown>;
  if (u.county !== undefined) dto.county = u.county as string;
  if (u.subCounty !== undefined) dto.subcounty = u.subCounty as string;
  if (u.ward !== undefined) dto.ward = u.ward as string;
  if (updates.location !== undefined) dto.location = updates.location;
  if ((updates as any).businessName !== undefined) dto.businessName = (updates as any).businessName;
  if ((updates as any).businessRegistrationNumber !== undefined) dto.businessRegistrationNumber = (updates as any).businessRegistrationNumber;
  if ((updates as any).bio !== undefined) dto.bio = (updates as any).bio;
  if ((updates as any).profilePicture !== undefined) dto.profilePicture = (updates as any).profilePicture;
  if (updates.farmerGroupId !== undefined) dto.farmerGroupId = updates.farmerGroupId;
  if (updates.aggregationCenterId !== undefined) dto.aggregationCenterId = updates.aggregationCenterId;
  if (updates.assignedCounty !== undefined) dto.assignedCounty = updates.assignedCounty;
  if (updates.assignedSubCounty !== undefined) dto.assignedSubCounty = updates.assignedSubCounty;
  if (updates.hasAllAccess !== undefined) dto.hasAllAccess = updates.hasAllAccess;
  return dto;
}

/**
 * Update profile
 * 
 * Backend: PUT /api/v1/profiles/:id
 */
export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    const dto = toUpdateProfileDto(updates);
    const updated = await apiPut<any>(`/profiles/${id}`, dto);
    return transformProfile(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Backend CreateRatingDto shape (POST /profiles/:id/ratings).
 */
interface CreateRatingDto {
  rating: number;
  comment?: string;
  orderId?: string;
}

/**
 * Map frontend rating to backend CreateRatingDto.
 */
function toCreateRatingDto(rating: Partial<Rating>): CreateRatingDto {
  // Rating type uses overallRating and review; backend expects rating and comment
  const ratingValue = typeof (rating as Record<string, unknown>).rating === 'number'
    ? (rating as Record<string, unknown>).rating as number
    : typeof rating.overallRating === 'number'
      ? rating.overallRating
      : 0;
  return {
    rating: ratingValue,
    comment: rating.review ?? (rating as Record<string, unknown>).comment as string | undefined,
    orderId: rating.orderId,
  };
}

/**
 * Submit a rating for a user
 * 
 * Backend: POST /api/v1/profiles/:id/ratings
 */
export async function submitRating(rating: Partial<Rating> & { ratedUserId: string }): Promise<ApiResponse<Rating>> {
  try {
    const { ratedUserId, ...ratingData } = rating;
    const dto = toCreateRatingDto(ratingData);
    const createdRating = await apiPost<Rating>(`/profiles/${ratedUserId}/ratings`, dto);
    return { data: createdRating, message: "Rating submitted successfully" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to submit rating" };
  }
}

/**
 * Get ratings for a user
 * 
 * Backend: GET /api/v1/profiles/:id/ratings
 */
export async function getRatings(filters?: RatingFilters & { userId?: string }): Promise<Rating[]> {
  try {
    if (!filters?.userId) {
      return [];
    }

    const params: Record<string, any> = {};
    if (filters.minRating) params.minRating = filters.minRating;
    //if (filters.maxRating) params.maxRating = filters.maxRating;

    return await apiGet<Rating[]>(`/profiles/${filters.userId}/ratings`, params);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return [];
  }
}

/**
 * Get rating summary for a user
 * 
 * Backend: GET /api/v1/profiles/:id/ratings/summary
 */
export async function getRatingSummary(userId: string): Promise<RatingSummary> {
  try {
    return await apiGet<RatingSummary>(`/profiles/${userId}/ratings/summary`);
  } catch (error) {
    console.error('Error fetching rating summary:', error);
    return {
      userId,
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {
        "5": 0,
        "4": 0,
        "3": 0,
        "2": 0,
        "1": 0,
      },
    };
  }
}

/**
 * Get profile statistics
 * 
 * TODO: Backend needs to implement GET /api/v1/profiles/stats endpoint
 */
export async function getProfileStats(): Promise<ProfileStats> {
  // Backend doesn't have stats endpoint yet
  // Return default structure for now
  return {
    total: 0,
    active: 0,
    verified: 0,
    byRole: {
      farmer: 0,
      buyer: 0,
      input_provider: 0,
      transport_provider: 0,
      aggregation_manager: 0,
      county_officer: 0,
      staff: 0,
    },
  };
}
