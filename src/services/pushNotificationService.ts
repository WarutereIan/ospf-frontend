/**
 * Push Notification Service
 * 
 * Handles web push notification subscription management:
 * - Get VAPID public key
 * - Subscribe to push notifications
 * - Unsubscribe from push notifications
 * - Get user subscriptions
 * 
 * Backend API endpoints:
 * - GET /api/v1/notifications/push/public-key - Get VAPID public key
 * - POST /api/v1/notifications/push/subscribe - Subscribe to push
 * - POST /api/v1/notifications/push/unsubscribe - Unsubscribe from push
 * - GET /api/v1/notifications/push/subscriptions - Get user subscriptions
 */

import { apiGet, apiPost } from '@/lib/api-client';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  userAgent?: string;
  deviceInfo?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get VAPID public key from backend
 * Backend: GET /api/v1/notifications/push/public-key
 */
export async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await apiGet<{ publicKey: string }>('/notifications/push/public-key');
    return response.publicKey || null;
  } catch (error) {
    console.error('Error fetching VAPID public key:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 * Backend: POST /api/v1/notifications/push/subscribe
 */
export async function subscribeToPushNotifications(
  subscription: PushSubscriptionData
): Promise<PushSubscription> {
  try {
    return await apiPost<PushSubscription>('/notifications/push/subscribe', subscription);
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 * Backend: POST /api/v1/notifications/push/unsubscribe
 */
export async function unsubscribeFromPushNotifications(
  endpoint: string
): Promise<void> {
  try {
    await apiPost('/notifications/push/unsubscribe', { endpoint });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
}

/**
 * Get all push subscriptions for current user
 * Backend: GET /api/v1/notifications/push/subscriptions
 * Suppresses error toasts for 401 errors (expected when not authenticated)
 */
export async function getUserPushSubscriptions(): Promise<PushSubscription[]> {
  try {
    // Suppress error toast for this endpoint - 401s are expected when not authenticated
    const result = await apiGet<PushSubscription[]>('/notifications/push/subscriptions', undefined, { showErrorToast: false });
    // Ensure we always return an array
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    // Don't log 401 errors - they're expected when not authenticated
    if (error?.statusCode !== 401 && error?.statusCode !== 429) {
      console.error('Error fetching push subscriptions:', error);
    }
    return [];
  }
}
