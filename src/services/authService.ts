/**
 * Auth Service
 * 
 * Handles all authentication-related API calls using HttpOnly cookies.
 * Tokens are stored in secure HttpOnly cookies by the backend - the frontend
 * only stores minimal user info for display purposes.
 * 
 * Backend API endpoints:
 * - POST /api/v1/auth/register - Register a new user
 * - POST /api/v1/auth/login - Login user (sets HttpOnly cookies)
 * - POST /api/v1/auth/refresh - Refresh access token (reads/writes cookies)
 * - POST /api/v1/auth/logout - Logout user (clears cookies)
 * - GET /api/v1/auth/me - Get current user from cookie
 */

import { apiPost, apiGet, storeLocalUser, clearLocalAuth, resetSessionInvalidation } from "@/lib/api-client";
import type { UserRole } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api/v1';

/**
 * Backend LoginDto shape (POST /auth/login).
 * Can use either email or phone for login.
 */
export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

/**
 * Backend RegisterDto shape (POST /auth/register).
 */
export interface RegisterRequest {
  email: string;
  phone: string;
  password: string;
  role: 'FARMER' | 'LEAD_FARMER' | 'BUYER' | 'TRANSPORT_PROVIDER' | 'AGGREGATION_MANAGER' | 'INPUT_PROVIDER' | 'EXTENSION_OFFICER';
  profile: {
    firstName: string;
    lastName: string;
    county: string;
    ward?: string;
    subCounty?: string;
  };
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    profile?: {
      firstName: string;
      lastName: string;
      county?: string;
      ward?: string;
      subCounty?: string;
    };
  };
  // Tokens are now set as HttpOnly cookies, but backend still returns them for backwards compatibility
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Map backend role (UPPER_CASE) to frontend role (lowercase)
 */
export function mapUserRole(backendRole: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    FARMER: 'farmer',
    LEAD_FARMER: 'lead_farmer',
    BUYER: 'buyer',
    EXTENSION_OFFICER: 'officer',
    STAFF: 'staff',
    AGGREGATION_MANAGER: 'aggregation_manager',
    INPUT_PROVIDER: 'input_provider',
    TRANSPORT_PROVIDER: 'transport_provider',
    ADMIN: 'staff', // Admin maps to staff in frontend
  };
  return roleMap[backendRole] || 'farmer';
}

/**
 * Transform backend user to frontend user format
 */
export function transformUser(backendUser: any): {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  email?: string;
  location?: string;
  subCounty?: string;
  createdAt?: string;
  lastLogin?: string;
} {
  return {
    id: backendUser.id,
    name: backendUser.profile
      ? `${backendUser.profile.firstName} ${backendUser.profile.lastName}`
      : backendUser.email,
    phone: backendUser.phone,
    role: mapUserRole(backendUser.role),
    email: backendUser.email,
    location: backendUser.profile?.county,
    subCounty: backendUser.profile?.subCounty,
    createdAt: backendUser.createdAt,
    lastLogin: backendUser.lastLogin,
  };
}

/**
 * Login user - backend sets HttpOnly cookies
 */
export async function login(
  phone: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");

    const response = await fetch(`${API_BASE_URL}/${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: receive and store HttpOnly cookies
      body: JSON.stringify({
        phone: normalizedPhone,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid phone number or password');
    }

    const raw = await response.json();
    const data: AuthResponse = raw.data ?? raw;

    const user = transformUser(data.user);
    // Store only user info locally (tokens are in HttpOnly cookies)
    storeLocalUser(user);
    // Reset session invalidation flag on successful login
    resetSessionInvalidation();

    return { success: true, user };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Invalid phone number or password',
    };
  }
}

/**
 * Register new user - backend sets HttpOnly cookies
 */
export async function register(
  registerData: RegisterRequest
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: receive and store HttpOnly cookies
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const raw = await response.json();
    const data: AuthResponse = raw.data ?? raw;

    const user = transformUser(data.user);
    // Store only user info locally (tokens are in HttpOnly cookies)
    storeLocalUser(user);
    // Reset session invalidation flag on successful registration
    resetSessionInvalidation();

    return { success: true, user };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Registration failed',
    };
  }
}

/**
 * Get current authenticated user from cookie
 * This validates the session by calling /auth/me with the HttpOnly cookie
 * Suppresses error toasts for this endpoint as it's called frequently
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const backendUser = await apiGet<any>('/auth/me', undefined, { showErrorToast: false, signal });
    if (!backendUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const user = transformUser(backendUser);
    storeLocalUser(user);
    resetSessionInvalidation();

    return { success: true, user };
  } catch (error: any) {
    if (error.statusCode !== 401 && error.statusCode !== 429 && error?.name !== 'AbortError') {
      console.error('Get current user error:', error);
    }
    return {
      success: false,
      error: error?.name === 'AbortError' ? 'Request timed out' : (error.message || 'Not authenticated'),
    };
  }
}

/**
 * Refresh access token - backend reads refresh_token cookie and sets new cookies
 */
export async function refreshToken(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send refresh_token cookie, receive new cookies
    });

    if (!response.ok) {
      clearLocalAuth();
      return { success: false, error: 'Token refresh failed' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Token refresh error:', error);
    clearLocalAuth();
    return {
      success: false,
      error: error.message || 'Token refresh failed',
    };
  }
}

/**
 * Forgot password (public) - sends a new auto-generated password via SMS/email.
 */
export async function forgotPassword(
  identifier: string
): Promise<{ success: boolean; message?: string; channel?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/${API_PREFIX}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: identifier.trim() }),
    });

    const raw = await response.json().catch(() => ({}));
    const data = raw.data ?? raw;

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return { success: true, message: data.message, channel: data.channel };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reset password' };
  }
}

/**
 * Change password for the currently logged-in user.
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiPost('/auth/change-password', { currentPassword, newPassword });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to change password' };
  }
}

/**
 * Logout user - backend clears HttpOnly cookies
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    await apiPost('/auth/logout');
  } catch (error) {
    // Ignore errors - we'll clear local data anyway
    console.error('Logout error:', error);
  } finally {
    // Always clear local user data
    clearLocalAuth();
  }

  return { success: true };
}
