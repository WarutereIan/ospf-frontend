/**
 * User Service
 * 
 * Handles all user management API calls (admin/staff only).
 * 
 * Backend API endpoints:
 * - GET /api/v1/users - Get all users (admin/staff)
 * - POST /api/v1/users - Create user (admin/staff)
 * - GET /api/v1/users/:id - Get user by ID (admin/staff)
 * - PUT /api/v1/users/:id - Update user (admin/staff)
 * - PATCH /api/v1/users/:id/status - Update user status (admin/staff)
 * - PATCH /api/v1/users/:id/role - Update user role (admin/staff)
 * - POST /api/v1/users/:id/reset-password - Reset password (admin/staff)
 */

import { apiGet, apiPost, apiPut, apiPatch, apiPostFormData, apiDelete } from "@/lib/api-client";
import type { UserRole } from "@/contexts/AuthContext";

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface CreateUserData {
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    county?: string;
    subcounty?: string;
    ward?: string;
    // Extended assignment fields
    farmerGroupId?: string;        // Optional for farmers
    aggregationCenterId?: string;  // Mandatory for aggregation managers (validated in UI/backend)
    assignedCounty?: string;       // For county staff
    assignedSubCounty?: string;    // For county staff
    hasAllAccess?: boolean;        // For county staff
  };
}

export interface UpdateUserData {
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  profile?: {
    firstName: string;
    lastName: string;
    county?: string;
    subcounty?: string;
    ward?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Map frontend role to backend role format
 */
function mapRoleToBackend(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    farmer: 'FARMER',
    lead_farmer: 'LEAD_FARMER',
    buyer: 'BUYER',
    input_provider: 'INPUT_PROVIDER',
    transport_provider: 'TRANSPORT_PROVIDER',
    aggregation_manager: 'AGGREGATION_MANAGER',
    county_officer: 'EXTENSION_OFFICER',
    officer: 'EXTENSION_OFFICER',
    extension_officer: 'EXTENSION_OFFICER',
    staff: 'STAFF',
  };
  return roleMap[role] || 'FARMER';
}

/**
 * Map backend role to frontend role format
 */
function mapRoleFromBackend(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    FARMER: 'farmer',
    LEAD_FARMER: 'lead_farmer',
    BUYER: 'buyer',
    INPUT_PROVIDER: 'input_provider',
    TRANSPORT_PROVIDER: 'transport_provider',
    AGGREGATION_MANAGER: 'aggregation_manager',
    EXTENSION_OFFICER: 'county_officer',
    STAFF: 'staff',
    ADMIN: 'staff',
  };
  return roleMap[role] || 'farmer';
}

/**
 * Map frontend status to backend status format
 */
function mapStatusToBackend(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    suspended: 'SUSPENDED',
    pending: 'PENDING_VERIFICATION',
  };
  return statusMap[status] || 'PENDING_VERIFICATION';
}

/**
 * Map backend status to frontend status format
 */
function mapStatusFromBackend(status: string): UserStatus {
  const statusMap: Record<string, UserStatus> = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING_VERIFICATION: 'pending',
  };
  return statusMap[status] ?? 'pending';
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  try {
    const response = await apiPost<any>('/users', {
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: mapRoleToBackend(data.role),
      profile: {
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        county: data.profile.county,
        subcounty: data.profile.subcounty,
        ward: data.profile.ward,
        farmerGroupId: data.profile.farmerGroupId,
        aggregationCenterId: data.profile.aggregationCenterId,
        assignedCounty: data.profile.assignedCounty,
        assignedSubCounty: data.profile.assignedSubCounty,
        hasAllAccess: data.profile.hasAllAccess,
      },
    });

    return {
      id: response.id,
      email: response.email,
      phone: response.phone,
      role: mapRoleFromBackend(response.role),
      status: mapStatusFromBackend(response.status),
      profile: response.profile,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Get all users with optional filters
 */
export async function getUsers(filters?: {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}): Promise<User[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.role) params.role = mapRoleToBackend(filters.role);
    if (filters?.status) params.status = mapStatusToBackend(filters.status);
    if (filters?.search) params.search = filters.search;

    const response = await apiGet<any[]>('/users', params);
    return response.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: mapRoleFromBackend(user.role),
      status: mapStatusFromBackend(user.status),
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const response = await apiGet<any>(`/users/${id}`);
    return {
      id: response.id,
      email: response.email,
      phone: response.phone,
      role: mapRoleFromBackend(response.role),
      status: mapStatusFromBackend(response.status),
      profile: response.profile,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  try {
    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.phone) updateData.phone = data.phone;
    if (data.role) updateData.role = mapRoleToBackend(data.role);
    if (data.status) updateData.status = mapStatusToBackend(data.status);

    const response = await apiPut<any>(`/users/${id}`, updateData);
    return {
      id: response.id,
      email: response.email,
      phone: response.phone,
      role: mapRoleFromBackend(response.role),
      status: mapStatusFromBackend(response.status),
      profile: response.profile,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Update user status
 */
export async function updateUserStatus(id: string, status: UserStatus): Promise<User> {
  try {
    const response = await apiPatch<any>(`/users/${id}/status`, {
      status: mapStatusToBackend(status),
    });
    return {
      id: response.id,
      email: response.email,
      phone: response.phone,
      role: mapRoleFromBackend(response.role),
      status: mapStatusFromBackend(response.status),
      profile: response.profile,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

/**
 * Update user role
 */
export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  try {
    const response = await apiPatch<any>(`/users/${id}/role`, {
      role: mapRoleToBackend(role),
    });
    return {
      id: response.id,
      email: response.email,
      phone: response.phone,
      role: mapRoleFromBackend(response.role),
      status: mapStatusFromBackend(response.status),
      profile: response.profile,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Reset user password
 */
export async function resetPassword(id: string, newPassword: string): Promise<void> {
  try {
    await apiPost(`/users/${id}/reset-password`, {
      newPassword,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Delete user (admin/staff only). Fails if user has related data (orders, etc.).
 */
export async function deleteUser(id: string): Promise<void> {
  await apiDelete(`/users/${id}`);
}

export interface BulkCreateFarmersResult {
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
}

/**
 * Bulk create farmer users from a CSV file.
 * Expected columns: name, phone, email (optional), farmer_group_code (optional), county, subcounty, ward.
 */
export async function bulkCreateFarmers(file: File): Promise<BulkCreateFarmersResult> {
  const formData = new FormData();
  formData.append("file", file);
  return apiPostFormData<BulkCreateFarmersResult>("/users/bulk-farmers", formData);
}
