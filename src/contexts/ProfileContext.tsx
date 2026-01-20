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
  submitRating,
  getRatings,
  getRatingSummary,
} from "@/services/profileService";

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
  
  // Actions
  fetchProfile: (id: string) => Promise<void>;
  fetchFarmerProfile: (id: string) => Promise<void>;
  fetchBuyerProfile: (id: string) => Promise<void>;
  fetchProfiles: (filters?: ProfileFilters) => Promise<void>;
  setFilters: (filters: ProfileFilters) => void;
  clearSelectedProfile: () => void;
  
  // Rating Actions
  submitRating: (rating: Partial<Rating>) => Promise<void>;
  fetchRatings: (filters?: RatingFilters) => Promise<void>;
  fetchRatingSummary: (userId: string) => Promise<void>;
  setRatingFilters: (filters: RatingFilters) => void;
  
  // Computed
  filteredProfiles: Profile[];
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedRatingSummary, setSelectedRatingSummary] = useState<RatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProfileFilters>({});
  const [ratingFilters, setRatingFiltersState] = useState<RatingFilters>({});

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
      const data = await getProfiles(appliedFilters);
      setProfiles(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch profiles";
      setError(errorMessage);
      console.error("Error fetching profiles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const setFilters = useCallback((newFilters: ProfileFilters) => {
    setFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getProfiles(newFilters);
        setProfiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profiles");
      }
    })();
  }, []);

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

  const submitRatingAction = useCallback(async (rating: Partial<Rating>) => {
    setIsLoading(true);
    setError(null);
    try {
      await submitRating(rating);
      await fetchRatings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit rating";
      setError(errorMessage);
      console.error("Error submitting rating:", err);
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
    setFilters,
    clearSelectedProfile,
    submitRating: submitRatingAction,
    fetchRatings,
    fetchRatingSummary,
    setRatingFilters,
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
