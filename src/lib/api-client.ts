/**
 * API Client Utility
 * 
 * Centralized API client for making authenticated requests to the backend.
 * Uses HttpOnly cookies for secure token storage - tokens are automatically
 * sent with requests via `credentials: 'include'`.
 * 
 * Automatically shows toast notifications for errors.
 */

import { showError, formatApiError } from './toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || 'api/v1';

/**
 * Configuration for API requests
 */
export interface ApiRequestOptions {
  /**
   * Whether to show toast notifications for errors (default: true)
   */
  showErrorToast?: boolean;
  /**
   * Custom error message to show in toast (overrides API error message)
   */
  errorMessage?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  data: T;
  statusCode?: number;
  timestamp?: string;
  message?: string;
  error?: string;
}

/**
 * Session invalidation flag - prevents retry loops when refresh token is invalid
 * Also persisted to sessionStorage to survive page refreshes
 */
let sessionInvalidated = typeof window !== 'undefined' 
  ? sessionStorage.getItem('session_invalidated') === 'true' 
  : false;

/**
 * Rate limit tracking - prevents retry loops when rate limited
 * Maps endpoint patterns to their rate limit expiration times
 */
const rateLimitBlocks = new Map<string, number>();

/**
 * Check if an endpoint is currently rate limited
 */
function isRateLimited(endpoint: string): boolean {
  const blockUntil = rateLimitBlocks.get(endpoint);
  if (blockUntil && Date.now() < blockUntil) {
    return true;
  }
  if (blockUntil && Date.now() >= blockUntil) {
    // Block expired, remove it
    rateLimitBlocks.delete(endpoint);
  }
  return false;
}

/**
 * Block an endpoint from requests for a specified duration (exponential backoff)
 */
function blockEndpoint(endpoint: string, retryCount: number = 0): void {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 30000);
  const blockUntil = Date.now() + backoffMs;
  rateLimitBlocks.set(endpoint, blockUntil);
  
  // Clean up after block expires
  setTimeout(() => {
    rateLimitBlocks.delete(endpoint);
  }, backoffMs);
}

/**
 * Get retry count for an endpoint (for exponential backoff)
 */
const endpointRetryCounts = new Map<string, number>();
function getRetryCount(endpoint: string): number {
  return endpointRetryCounts.get(endpoint) || 0;
}
function incrementRetryCount(endpoint: string): void {
  const current = getRetryCount(endpoint);
  endpointRetryCounts.set(endpoint, current + 1);
}
function resetRetryCount(endpoint: string): void {
  endpointRetryCounts.delete(endpoint);
}

/**
 * Set session as invalidated (persists across page refreshes)
 */
function setSessionInvalidated(value: boolean): void {
  sessionInvalidated = value;
  if (typeof window !== 'undefined') {
    if (value) {
      sessionStorage.setItem('session_invalidated', 'true');
    } else {
      sessionStorage.removeItem('session_invalidated');
    }
  }
}

/**
 * Reset session invalidation flag (used after successful login)
 */
export function resetSessionInvalidation(): void {
  setSessionInvalidated(false);
  isRefreshing = false;
  refreshPromise = null;
}

/**
 * Clear local user data (cookies are HttpOnly, cleared by backend on logout)
 * Does NOT reset session invalidation - that's only reset on successful login
 */
export function clearLocalAuth(): void {
  localStorage.removeItem('ofsp_user');
  // Don't reset sessionInvalidated here - we want it to persist
  // until the user successfully logs in again
  isRefreshing = false;
  refreshPromise = null;
}

/**
 * Store minimal user info in localStorage (for quick access, not auth)
 * Actual auth tokens are in HttpOnly cookies managed by backend
 */
export function storeLocalUser(user: Record<string, unknown>): void {
  try {
    localStorage.setItem('ofsp_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user info:', error);
  }
}

/**
 * Get locally stored user info
 */
export function getLocalUser(): Record<string, unknown> | null {
  try {
    const userData = localStorage.getItem('ofsp_user');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error reading user info:', error);
  }
  return null;
}

/**
 * Refresh token lock to prevent multiple simultaneous refresh attempts
 */
let refreshPromise: Promise<boolean> | null = null;
let isRefreshing = false;

/**
 * Refresh access token using refresh token cookie
 * The backend reads the refresh_token from HttpOnly cookie
 * Uses a lock mechanism to prevent multiple simultaneous refresh attempts
 */
async function refreshAccessToken(): Promise<boolean> {
  // If session is already known to be invalid, don't try to refresh
  if (sessionInvalidated) {
    return false;
  }

  // If already refreshing, wait for the existing refresh to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // Start new refresh attempt
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshUrl = API_BASE_URL 
        ? `${API_BASE_URL}/${API_PREFIX}/auth/refresh`
        : `/${API_PREFIX}/auth/refresh`;
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
      });

      const success = response.ok;
      
      // If refresh failed, check the reason
      if (!success) {
        // If refresh token is invalid (401), mark session as invalidated
        // This prevents further retry attempts
        if (response.status === 401) {
          setSessionInvalidated(true);
          // Clear lock immediately - no point retrying
          isRefreshing = false;
          refreshPromise = null;
          // Clear auth and redirect to login
          clearLocalAuth();
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
          return false;
        }
        
        // For 429 (rate limit), wait longer before allowing another refresh attempt
        const delay = response.status === 429 ? 5000 : 1000;
        setTimeout(() => {
          isRefreshing = false;
          refreshPromise = null;
        }, delay);
      } else {
        // Success - clear lock immediately and reset invalidation flag
        setSessionInvalidated(false);
        isRefreshing = false;
        refreshPromise = null;
      }

      return success;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear lock on error after delay
      setTimeout(() => {
        isRefreshing = false;
        refreshPromise = null;
      }, 1000);
      return false;
    }
  })();

  return refreshPromise;
}

/**
 * Make an authenticated API request
 * Cookies are automatically sent via `credentials: 'include'`
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit & { apiOptions?: ApiRequestOptions } = {}
): Promise<ApiResponse<T>> {
  const { apiOptions = {}, ...fetchOptions } = options;
  const { showErrorToast = true, errorMessage } = apiOptions;
  // Construct URL: if API_BASE_URL is empty (dev), use relative path for proxy
  // Otherwise use full URL (production)
  const url = API_BASE_URL 
    ? `${API_BASE_URL}/${API_PREFIX}${endpoint}`
    : `/${API_PREFIX}${endpoint}`;

  // Check if session is invalidated - don't make request if so
  // EXCEPT for auth endpoints which need to verify/refresh the session
  const isAuthEndpoint = endpoint.startsWith('/auth/');
  // Also allow certain public endpoints even when session is invalidated
  // (e.g. push notifications need to fetch the VAPID public key on login screen).
  const isPublicAllowedWhenInvalidated =
    endpoint === '/notifications/push/public-key';

  if (sessionInvalidated && !isAuthEndpoint && !isPublicAllowedWhenInvalidated) {
    const error: ApiError = {
      message: 'Session expired',
      statusCode: 401,
      error: 'Authentication failed',
    };
    if (showErrorToast) {
      showError('Session expired', 'Please log in again');
    }
    throw error;
  }

  // Check if endpoint is rate limited - don't make request if so
  if (isRateLimited(endpoint)) {
    const retryCount = getRetryCount(endpoint);
    const error: ApiError = {
      message: 'Too many requests - please wait',
      statusCode: 429,
      error: 'Rate limit exceeded',
    };
    if (showErrorToast && retryCount === 0) {
      // Only show toast on first rate limit hit
      showError('Too many requests', 'Please wait a moment and try again');
    }
    throw error;
  }

  const isFormData = fetchOptions.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...fetchOptions.headers,
  };
  const body = fetchOptions.body === undefined
    ? undefined
    : (isFormData ? fetchOptions.body : JSON.stringify(fetchOptions.body));

  let response = await fetch(url, {
    ...fetchOptions,
    method: fetchOptions.method ?? 'GET',
    body,
    headers,
    credentials: 'include', // Send HttpOnly cookies with request
  });

  // If 401, try to refresh token and retry once (unless session is already invalidated)
  if (response.status === 401) {
    // If session is already known to be invalid, skip refresh and redirect immediately
    if (sessionInvalidated) {
      clearLocalAuth();
      if (showErrorToast) {
        showError('Session expired', 'Please log in again');
      }
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
      const error: ApiError = {
        message: 'Session expired',
        statusCode: 401,
        error: 'Authentication failed',
      };
      throw error;
    }

    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new cookies
      response = await fetch(url, {
        ...fetchOptions,
        method: fetchOptions.method ?? 'GET',
        body,
        headers,
        credentials: 'include',
      });
      
      // If retry still returns 401, session is truly expired
      if (response.status === 401) {
        // Mark session as invalidated to prevent further attempts
        setSessionInvalidated(true);
        // Clear lock and local data, redirect to login
        isRefreshing = false;
        refreshPromise = null;
        clearLocalAuth();
        if (showErrorToast) {
          showError('Session expired', 'Please log in again');
        }
        // Use setTimeout to avoid navigation during render
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        const error: ApiError = {
          message: 'Session expired',
          statusCode: 401,
          error: 'Authentication failed',
        };
        throw error;
      }
    } else {
      // Refresh failed - refreshAccessToken handles redirect if refresh token is invalid
      // For other failures (429, network errors), we still need to handle here
      if (!sessionInvalidated) {
        // Only handle if refreshAccessToken didn't already redirect
        // If refresh failed due to 429, don't invalidate session - just throw error
        // The refreshAccessToken function already handles 429 with backoff
        isRefreshing = false;
        refreshPromise = null;
        // Only invalidate and redirect if it's an auth issue, not rate limiting
        if ((response.status as number) !== 429) {
          setSessionInvalidated(true);
          clearLocalAuth();
          if (showErrorToast) {
            showError('Session expired', 'Please log in again');
          }
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      const error: ApiError = {
        message: 'Authentication failed',
        statusCode: 401,
        error: 'Authentication failed',
      };
      throw error;
    }
  }
  
  // Handle 429 (rate limit) errors gracefully
  if (response.status === 429) {
    const retryCount = getRetryCount(endpoint);
    incrementRetryCount(endpoint);
    
    // Block this endpoint from further requests (exponential backoff)
    blockEndpoint(endpoint, retryCount);
    
    const error: ApiError = {
      message: 'Too many requests - please wait',
      statusCode: 429,
      error: 'Rate limit exceeded',
    };
    
    // Only show toast on first rate limit hit to avoid spam
    if (showErrorToast && retryCount === 0) {
      showError('Too many requests', 'Please wait a moment and try again');
    }
    
    // Reset retry count after a delay (successful requests will also reset it)
    setTimeout(() => {
      resetRetryCount(endpoint);
    }, 60000); // Reset after 1 minute
    
    throw error;
  }
  
  // Reset retry count on successful request
  if (response.ok) {
    resetRetryCount(endpoint);
  }

  // Parse response JSON (handle empty responses)
  let data: any = {};
  try {
    const text = await response.text();
    if (text) {
      data = JSON.parse(text);
    }
  } catch (error) {
    // Response might not be JSON (e.g., empty body)
    console.warn('Failed to parse response as JSON:', error);
  }

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || 'An error occurred',
      statusCode: response.status,
      error: data.error,
    };
    
    // Don't log 401 errors if we already handled them above (they're expected)
    if (response.status !== 401) {
      console.error(
        `[api-client] ${fetchOptions.method ?? 'GET'} ${url} ${response.status}: ${error.message}`,
      );
    }
    
    // Show toast notification for errors (unless disabled or already shown)
    if (showErrorToast && response.status !== 401 && response.status !== 429) {
      const message = errorMessage || formatApiError(error);
      const description = response.status >= 500
        ? 'Server error. Please try again later.'
        : undefined;
      
      showError(message, description);
    }
    
    throw error;
  }

  return data as ApiResponse<T>;
}

/**
 * GET request
 * By default, GET requests don't show error toasts (they often fail silently in lists)
 * Set showErrorToast: true in options to enable error toasts for specific GET requests
 */
export async function apiGet<T>(
  endpoint: string, 
  params?: Record<string, any>,
  options?: ApiRequestOptions
): Promise<T> {
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
    apiOptions: {
      showErrorToast: false, // GET requests don't show errors by default
      ...options, // Allow override
    },
  });

  return response.data;
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string, 
  body?: any,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'POST',
    body: body,
    apiOptions: options,
  });

  return response.data;
}

/**
 * POST request with FormData (e.g. file upload). Do not set Content-Type; browser sets multipart boundary.
 * Returns the full response body (backend may not wrap in { data }).
 */
export async function apiPostFormData<T>(
  endpoint: string,
  formData: FormData,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'POST',
    body: formData,
    apiOptions: options,
  });

  return (response as unknown) as T;
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string, 
  body?: any,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body,
    apiOptions: options,
  });

  return response.data;
}

/**
 * PATCH request
 */
export async function apiPatch<T>(
  endpoint: string, 
  body?: any,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: body,
    apiOptions: options,
  });

  return response.data;
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest<T>(endpoint, {
    method: 'DELETE',
    apiOptions: options,
  });

  return response.data;
}
