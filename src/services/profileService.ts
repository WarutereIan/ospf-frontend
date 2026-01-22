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
} from "@/types/profile";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPut, apiPost } from "@/lib/api-client";

/**
 * Get profile by ID
 * Works for any profile type (farmer, buyer, etc.)
 * 
 * Backend: GET /api/v1/profiles/:id
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    return await apiGet<Profile>(`/profiles/${id}`);
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
    return await apiGet<FarmerProfile>(`/profiles/${id}/farmer`);
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
    return await apiGet<BuyerProfile>(`/profiles/${id}/buyer`);
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
 * Update profile
 * 
 * Backend: PUT /api/v1/profiles/:id
 */
export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  try {
    return await apiPut<Profile>(`/profiles/${id}`, updates);
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

/**
 * Submit a rating for a user
 * 
 * Backend: POST /api/v1/profiles/:id/ratings
 */
export async function submitRating(rating: Partial<Rating> & { ratedUserId: string }): Promise<ApiResponse<Rating>> {
  try {
    const { ratedUserId, ...ratingData } = rating;
    const createdRating = await apiPost<Rating>(`/profiles/${ratedUserId}/ratings`, ratingData);
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
    if (filters.maxRating) params.maxRating = filters.maxRating;

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
