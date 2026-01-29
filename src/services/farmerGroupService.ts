/**
 * Farmer Group Service
 * 
 * Handles all farmer group-related API calls.
 * 
 * Backend API endpoints:
 * - GET /api/v1/farmer-groups - List farmer groups
 * - GET /api/v1/farmer-groups/:id - Get farmer group by ID
 * - POST /api/v1/farmer-groups - Create farmer group
 * - PUT /api/v1/farmer-groups/:id - Update farmer group
 * - DELETE /api/v1/farmer-groups/:id - Delete farmer group
 */

import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

export interface FarmerGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  county: string;
  subCounty: string;
  ward?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmerGroupData {
  name: string;
  description?: string;
  county: string;
  subCounty: string;
  ward?: string;
  isActive?: boolean;
}

export interface UpdateFarmerGroupData {
  name?: string;
  description?: string;
  county?: string;
  subCounty?: string;
  ward?: string;
  isActive?: boolean;
}

/**
 * Get all farmer groups with optional filters
 */
export async function getFarmerGroups(filters?: {
  county?: string;
  subCounty?: string;
  ward?: string;
  isActive?: boolean;
  search?: string;
}): Promise<FarmerGroup[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.county) params.county = filters.county;
    if (filters?.subCounty) params.subCounty = filters.subCounty;
    if (filters?.ward) params.ward = filters.ward;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;
    if (filters?.search) params.search = filters.search;

    return await apiGet<FarmerGroup[]>('/farmer-groups', params);
  } catch (error) {
    console.error('Error fetching farmer groups:', error);
    return [];
  }
}

/**
 * Get farmer group by ID
 */
export async function getFarmerGroupById(id: string): Promise<FarmerGroup | null> {
  try {
    return await apiGet<FarmerGroup>(`/farmer-groups/${id}`);
  } catch (error) {
    console.error('Error fetching farmer group:', error);
    return null;
  }
}

/**
 * Create a new farmer group
 */
export async function createFarmerGroup(data: CreateFarmerGroupData): Promise<FarmerGroup> {
  try {
    return await apiPost<FarmerGroup>('/farmer-groups', data);
  } catch (error) {
    console.error('Error creating farmer group:', error);
    throw error;
  }
}

/**
 * Update farmer group
 */
export async function updateFarmerGroup(id: string, data: UpdateFarmerGroupData): Promise<FarmerGroup> {
  try {
    return await apiPut<FarmerGroup>(`/farmer-groups/${id}`, data);
  } catch (error) {
    console.error('Error updating farmer group:', error);
    throw error;
  }
}

/**
 * Delete farmer group
 */
export async function deleteFarmerGroup(id: string): Promise<void> {
  try {
    await apiDelete(`/farmer-groups/${id}`);
  } catch (error) {
    console.error('Error deleting farmer group:', error);
    throw error;
  }
}
