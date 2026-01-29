/**
 * Profile Context
 * 
 * Provides global state management for user profiles.
 * Profiles can be viewed by different roles and contexts.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { 
  Profile, 
  FarmerProfile, 
  BuyerProfile, 
  ProfileFilters,
  Rating,
  RatingSummary,
  RatingFilters,
} from "@/types/profile";
import {
  getProfileById,
  getFarmerProfile,
  getBuyerProfile,
  getProfiles,
  updateProfile as updateProfileService,
  submitRating,
  getRatings,
  getRatingSummary,
  getProfileStats,
} from "@/services/profileService";
import {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  resetPassword,
  deleteUser as deleteUserService,
  type CreateUserData,
  type UpdateUserData,
  type User as UserType,
} from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiResponse } from "@/lib/api-client";
import type { UserRole } from "@/contexts/AuthContext";

interface ProfileContextType {
  // State
  profiles: Profile[];
  selectedProfile: Profile | null;
  ratings: Rating[];
  selectedRatingSummary: RatingSummary | null;
  ratingSummary: RatingSummary | null; // Alias for selectedRatingSummary (used in some contexts)
  isLoading: boolean;
  error: string | null;
  filters: ProfileFilters;
  ratingFilters: RatingFilters;
  
  // Profile Actions
  fetchProfile: (id: string) => Promise<void>;
  fetchFarmerProfile: (id: string) => Promise<void>;
  fetchBuyerProfile: (id: string) => Promise<void>;
  fetchProfiles: (filters?: ProfileFilters) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<Profile>;
  setFilters: (filters: ProfileFilters) => void;
  clearSelectedProfile: () => void;
  
  // User Management Actions (admin/staff only)
  createUser: (data: CreateUserData) => Promise<UserType>;
  getUserById: (id: string) => Promise<UserType | null>;
  updateUser: (id: string, data: UpdateUserData) => Promise<UserType>;
  updateUserStatus: (id: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => Promise<UserType>;
  updateUserRole: (id: string, role: UserRole) => Promise<UserType>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Rating Actions
  submitRating: (rating: Partial<Rating> & { ratedUserId: string }) => Promise<ApiResponse<Rating>>;
  fetchRatings: (filters?: RatingFilters) => Promise<void>;
  fetchRatingSummary: (userId: string) => Promise<void>;
  setRatingFilters: (filters: RatingFilters) => void;
  
  // Stats
  fetchProfileStats: () => Promise<void>;
  
  // Computed
  filteredProfiles: Profile[];
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedRatingSummary, setSelectedRatingSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProfileFilters>({});
  const [ratingFilters, setRatingFiltersState] = useState<RatingFilters>({});

  // Helper to transform User to Profile format
  const transformUserToProfile = useCallback((user: any): Profile => {
    const name = user.profile 
      ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.email
      : user.email;
    
    return {
      id: user.id,
      userId: user.id,
      name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      county: user.profile?.county,
      subCounty: user.profile?.subcounty || user.profile?.subCounty,
      ward: user.profile?.ward,
      // Assignment fields (mirroring backend profile assignments)
      farmerGroupId: user.profile?.farmerGroupId,
      aggregationCenterId: user.profile?.aggregationCenterId,
      assignedCounty: user.profile?.assignedCounty,
      assignedSubCounty: user.profile?.assignedSubCounty,
      hasAllAccess: user.profile?.hasAllAccess,
      location: user.profile?.location || user.profile?.county || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      permissions: [],
    } as Profile;
  }, []);

  const fetchProfile = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getProfileById(id);
      if (profile) {
        setSelectedProfile(profile);
      } else {
        setError("Profile not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFarmerProfile = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getFarmerProfile(id);
      if (profile) {
        setSelectedProfile(profile);
      } else {
        setError("Farmer profile not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch farmer profile";
      setError(errorMessage);
      console.error("Error fetching farmer profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBuyerProfile = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getBuyerProfile(id);
      if (profile) {
        setSelectedProfile(profile);
      } else {
        setError("Buyer profile not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch buyer profile";
      setError(errorMessage);
      console.error("Error fetching buyer profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProfiles = useCallback(async (newFilters?: ProfileFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      
      // For admin/staff users, use the /users endpoint which has more complete data
      const isAdminOrStaff = currentUser?.role === 'staff' || (currentUser?.role as string) === 'admin';
      
      if (isAdminOrStaff) {
        // Use getUsers for admin/staff to get full user data
        const users = await getUsers({
          role: appliedFilters.role,
          status: appliedFilters.status,
          search: appliedFilters.searchQuery,
        });
        // Transform users to profiles
        const transformedProfiles = users.map(transformUserToProfile);
        setProfiles(transformedProfiles);
      } else {
        // Use regular getProfiles for other roles
        const data = await getProfiles(appliedFilters);
        setProfiles(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profiles";
      setError(errorMessage);
      console.error("Error fetching profiles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentUser?.role, transformUserToProfile]);

  const setFilters = useCallback((newFilters: ProfileFilters) => {
    setFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const isAdminOrStaff = currentUser?.role === 'staff' || (currentUser?.role as string) === 'admin';
        
        if (isAdminOrStaff) {
          const users = await getUsers({
            role: newFilters.role,
            status: newFilters.status,
            search: newFilters.searchQuery,
          });
          const transformedProfiles = users.map(transformUserToProfile);
          setProfiles(transformedProfiles);
        } else {
          const data = await getProfiles(newFilters);
          setProfiles(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profiles");
      }
    })();
  }, [currentUser?.role, transformUserToProfile]);

  const clearSelectedProfile = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  const fetchRatings = useCallback(async (newFilters?: RatingFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || ratingFilters;
      const data = await getRatings(appliedFilters);
      setRatings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch ratings";
      setError(errorMessage);
      console.error("Error fetching ratings:", err);
    } finally {
      setIsLoading(false);
    }
  }, [ratingFilters]);

  const submitRatingAction = useCallback(async (rating: Partial<Rating> & { ratedUserId: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await submitRating(rating);
      if (result.error) {
        throw new Error(result.error);
      }
      await fetchRatings();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit rating";
      setError(errorMessage);
      console.error("Error submitting rating:", err);
      throw err; // Re-throw so components can handle it
    } finally {
      setIsLoading(false);
    }
  }, [fetchRatings]);

  const fetchRatingSummary = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await getRatingSummary(userId);
      setSelectedRatingSummary(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch rating summary";
      setError(errorMessage);
      console.error("Error fetching rating summary:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setRatingFilters = useCallback((newFilters: RatingFilters) => {
    setRatingFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getRatings(newFilters);
        setRatings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ratings");
      }
    })();
  }, []);

  // Update profile
  const updateProfileAction = useCallback(async (id: string, updates: Partial<Profile>): Promise<Profile> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateProfileService(id, updates);
      // Update in profiles list if exists
      setProfiles(prev => prev.map(p => p.id === id ? updated : p));
      // Update selected profile if it's the one being updated
      if (selectedProfile?.id === id) {
        setSelectedProfile(updated);
      }
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      console.error("Error updating profile:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfile]);

  // User Management Methods (admin/staff only)
  const createUserAction = useCallback(async (data: CreateUserData): Promise<UserType> => {
    setIsLoading(true);
    setError(null);
    try {
      const newUser = await createUser(data);
      // Transform to profile and add to list
      const newProfile = transformUserToProfile(newUser);
      setProfiles(prev => [newProfile, ...prev]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      console.error("Error creating user:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [transformUserToProfile]);

  const getUserByIdAction = useCallback(async (id: string): Promise<UserType | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await getUserById(id);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
      setError(errorMessage);
      console.error("Error fetching user:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserAction = useCallback(async (id: string, data: UpdateUserData): Promise<UserType> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateUser(id, data);
      // Transform to profile and update in list
      const updatedProfile = transformUserToProfile(updated);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
      // Update selected profile if it's the one being updated
      if (selectedProfile?.id === id) {
        setSelectedProfile(updatedProfile);
      }
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      console.error("Error updating user:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfile, transformUserToProfile]);

  const updateUserStatusAction = useCallback(async (id: string, status: 'active' | 'inactive' | 'suspended' | 'pending'): Promise<UserType> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateUserStatus(id, status);
      // Transform to profile and update in list
      const updatedProfile = transformUserToProfile(updated);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
      // Update selected profile if it's the one being updated
      if (selectedProfile?.id === id) {
        setSelectedProfile(updatedProfile);
      }
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user status";
      setError(errorMessage);
      console.error("Error updating user status:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfile, transformUserToProfile]);

  const updateUserRoleAction = useCallback(async (id: string, role: UserRole): Promise<UserType> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateUserRole(id, role);
      // Transform to profile and update in list
      const updatedProfile = transformUserToProfile(updated);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
      // Update selected profile if it's the one being updated
      if (selectedProfile?.id === id) {
        setSelectedProfile(updatedProfile);
      }
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user role";
      setError(errorMessage);
      console.error("Error updating user role:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedProfile, transformUserToProfile]);

  const resetUserPasswordAction = useCallback(async (id: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await resetPassword(id, newPassword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password";
      setError(errorMessage);
      console.error("Error resetting password:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserAction = useCallback(async (id: string): Promise<void> => {
    await deleteUserService(id);
  }, []);

  // Profile Stats
  const [profileStats, setProfileStats] = useState<any>(null);
  const fetchProfileStatsAction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await getProfileStats();
      setProfileStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profile stats";
      setError(errorMessage);
      console.error("Error fetching profile stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredProfiles = profiles.filter((profile) => {
    if (filters.role && profile.role !== filters.role) return false;
    if (filters.status && profile.status !== filters.status) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch =
        profile.name.toLowerCase().includes(query) ||
        profile.phone.includes(query) ||
        profile.location.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    if (filters.verified !== undefined && "verified" in profile) {
      if (profile.verified !== filters.verified) return false;
    }
    return true;
  });

  const value: ProfileContextType = {
    profiles,
    selectedProfile,
    ratings,
    selectedRatingSummary,
    ratingSummary: selectedRatingSummary, // Alias for selectedRatingSummary
    isLoading,
    error,
    filters,
    ratingFilters,
    fetchProfile,
    fetchFarmerProfile,
    fetchBuyerProfile,
    fetchProfiles,
    updateProfile: updateProfileAction,
    setFilters,
    clearSelectedProfile,
    createUser: createUserAction,
    getUserById: getUserByIdAction,
    updateUser: updateUserAction,
    updateUserStatus: updateUserStatusAction,
    updateUserRole: updateUserRoleAction,
    resetUserPassword: resetUserPasswordAction,
    deleteUser: deleteUserAction,
    submitRating: submitRatingAction,
    fetchRatings,
    fetchRatingSummary,
    setRatingFilters,
    fetchProfileStats: fetchProfileStatsAction,
    filteredProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
