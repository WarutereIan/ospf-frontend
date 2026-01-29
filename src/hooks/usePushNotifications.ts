/**
 * usePushNotifications Hook
 * 
 * React hook for managing web push notifications:
 * - Check browser support
 * - Request permission
 * - Subscribe/unsubscribe
 * - Manage subscription state
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  getPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
  subscriptionToJSON,
} from '@/lib/push-notification-utils';
import {
  getVapidPublicKey,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getUserPushSubscriptions,
  type PushSubscription as PushSubscriptionType,
} from '@/services/pushNotificationService';

interface UsePushNotificationsReturn {
  // State
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: globalThis.PushSubscription | null;
  userSubscriptions: PushSubscriptionType[];

  // Actions
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  // Safely get user from AuthContext - handle case where AuthProvider might not be available
  let user: any = null;
  try {
    const authContext = useAuth();
    user = authContext?.user || null;
  } catch (error) {
    // AuthContext not available - this is okay, we'll just skip auth checks
    user = null;
  }

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<globalThis.PushSubscription | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<PushSubscriptionType[]>([]);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [lastUnauthorizedTime, setLastUnauthorizedTime] = useState<number | null>(null);

  // Define refreshSubscriptions before useEffect that uses it
  const refreshSubscriptions = useCallback(async () => {
    // Only fetch subscriptions if user is authenticated
    if (!user) {
      setUserSubscriptions([]);
      return;
    }

    // Prevent repeated calls if we recently got a 401 (within last 30 seconds)
    if (lastUnauthorizedTime && Date.now() - lastUnauthorizedTime < 30000) {
      return;
    }

    try {
      const subscriptions = await getUserPushSubscriptions();
      // Ensure subscriptions is always an array
      setUserSubscriptions(Array.isArray(subscriptions) ? subscriptions : []);
      // Clear unauthorized flag on success
      setLastUnauthorizedTime(null);
    } catch (err: any) {
      // If 401, set the unauthorized time to prevent repeated calls
      if (err?.statusCode === 401) {
        setLastUnauthorizedTime(Date.now());
      } else if (err?.statusCode !== 429) {
        // Don't log 429 errors (rate limiting)
        console.error('Error fetching user subscriptions:', err);
      }
      setUserSubscriptions([]);
    }
  }, [user, lastUnauthorizedTime]);

  // Check browser support and current state on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        // Register service worker
        try {
          const registration = await registerServiceWorker();
          setSwRegistration(registration);

          // Check existing subscription
          const existingSubscription = await getPushSubscription(registration);
          if (existingSubscription) {
            setSubscription(existingSubscription);
            setIsSubscribed(true);
          }

          // Load user subscriptions from backend (only if authenticated)
          if (user) {
            await refreshSubscriptions();
          }
        } catch (err) {
          console.error('Service worker registration failed:', err);
          setError(err instanceof Error ? err.message : 'Service worker registration failed');
        }
      }
    };

    checkSupport();
  }, [refreshSubscriptions, user]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    setIsLoading(true);
    setError(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      return newPermission;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const subscribe = useCallback(async (): Promise<void> => {
    if (!swRegistration) {
      throw new Error('Service worker not registered');
    }

    // Don't rely on React state here: permission state can lag behind
    // the user's response to Notification.requestPermission().
    const currentPermission = getNotificationPermission();
    if (currentPermission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get VAPID public key
      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        throw new Error('VAPID public key not available');
      }

      // Subscribe to push service
      const pushSubscription = await subscribeToPush(swRegistration, publicKey);
      setSubscription(pushSubscription);

      // Send subscription to backend
      const subscriptionData = subscriptionToJSON(pushSubscription);
      await subscribeToPushNotifications(subscriptionData);

      setIsSubscribed(true);
      await refreshSubscriptions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to push notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [swRegistration, permission, refreshSubscriptions]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!subscription) {
      throw new Error('No active subscription');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from push service
      await unsubscribeFromPush(subscription);

      // Remove from backend
      await unsubscribeFromPushNotifications(subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
      await refreshSubscriptions();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from push notifications';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, refreshSubscriptions]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    subscription,
    userSubscriptions,
    requestPermission,
    subscribe,
    unsubscribe,
    refreshSubscriptions,
  };
}
