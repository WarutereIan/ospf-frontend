/**
 * API Client Utility
 * 
 * Centralized API client for making authenticated requests to the backend.
 * Handles authentication, error handling, and response transformation.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api/v1';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  timestamp?: string;
  message?: string;
}

/**
 * Get stored access token from localStorage
 */
function getAccessToken(): string | null {
  try {
    const authData = localStorage.getItem('ofsp_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.accessToken || null;
    }
  } catch (error) {
    console.error('Error reading access token:', error);
  }
  return null;
}

/**
 * Get stored refresh token from localStorage
 */
function getRefreshToken(): string | null {
  try {
    const authData = localStorage.getItem('ofsp_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.refreshToken || null;
    }
  } catch (error) {
    console.error('Error reading refresh token:', error);
  }
  return null;
}

/**
 * Store tokens in localStorage
 */
export function storeTokens(accessToken: string, refreshToken: string, user: any): void {
  try {
    localStorage.setItem('ofsp_auth', JSON.stringify({
      accessToken,
      refreshToken,
      user,
    }));
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

/**
 * Clear stored tokens
 */
export function clearTokens(): void {
  localStorage.removeItem('ofsp_auth');
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data: ApiResponse<{ accessToken: string; refreshToken: string }> = await response.json();
    
    if (data.success && data.data) {
      // Update stored tokens
      const authData = localStorage.getItem('ofsp_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        storeTokens(data.data.accessToken, data.data.refreshToken, parsed.user);
        return data.data.accessToken;
      }
    }

    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${API_PREFIX}${endpoint}`;
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401, try to refresh token and retry once
  if (response.status === 401 && accessToken) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } else {
      // Refresh failed, clear tokens and redirect to login
      clearTokens();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || 'An error occurred',
      statusCode: response.status,
      error: data.error,
    };
    throw error;
  }

  return data as ApiResponse<T>;
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await apiRequest<T>(url, {
    method: 'GET',
  });

  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(endpoint: string, body?: any): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.data;
}

/**
 * PUT request
 */
export async function apiPut<T>(endpoint: string, body?: any): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.data;
}

/**
 * PATCH request
 */
export async function apiPatch<T>(endpoint: string, body?: any): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.data;
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'DELETE',
  });

  return response.data;
}
