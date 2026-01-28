/**
 * Notification Context
 * 
 * Provides global state management for notification functionality:
 * - Notifications
 * - Alerts
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type {
  Notification,
  Alert,
  NotificationFilters,
  NotificationStats,
} from "@/types/notification";
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  archiveNotification,
  deleteNotification,
  getAlerts,
  acknowledgeAlert,
  getNotificationStats,
} from "@/services/notificationService";
import {
  isPushNotificationSupported,
  getNotificationPermission,
  registerServiceWorker,
  getPushSubscription,
} from "@/lib/push-notification-utils";

interface NotificationContextType {
  notifications: Notification[];
  selectedNotification: Notification | null;
  alerts: Alert[];
  filters: NotificationFilters;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Push notification state
  pushNotificationsEnabled: boolean;
  pushNotificationsSupported: boolean;
  notificationPermission: NotificationPermission | null;
  serviceWorkerRegistered: boolean;
  
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  fetchNotificationById: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  archive: (id: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  acknowledge: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (filters: NotificationFilters) => void;
  clearSelectedNotification: () => void;
  refreshPushNotificationStatus: () => Promise<void>;
  
  filteredNotifications: Notification[];
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filters, setFiltersState] = useState<NotificationFilters>({});
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [pushNotificationsSupported, setPushNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);

  // Function to check and refresh push notification status
  const refreshPushNotificationStatus = useCallback(async () => {
    try {
      // Check browser support
      const supported = isPushNotificationSupported();
      setPushNotificationsSupported(supported);

      if (!supported) {
        setNotificationPermission(null);
        setServiceWorkerRegistered(false);
        setPushNotificationsEnabled(false);
        return;
      }

      // Check notification permission
      const permission = getNotificationPermission();
      setNotificationPermission(permission);

      // Check service worker registration and subscription
      try {
        const registration = await registerServiceWorker();
        setServiceWorkerRegistered(!!registration);

        if (registration) {
          const subscription = await getPushSubscription(registration);
          setPushNotificationsEnabled(!!subscription);
        } else {
          setServiceWorkerRegistered(false);
          setPushNotificationsEnabled(false);
        }
      } catch (swError) {
        console.error('Service worker registration check failed:', swError);
        setServiceWorkerRegistered(false);
        setPushNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error checking push notification status:', error);
      setPushNotificationsEnabled(false);
      setServiceWorkerRegistered(false);
    }
  }, []);

  // Check push notification status on mount and when permission changes
  useEffect(() => {
    refreshPushNotificationStatus();

    let permissionStatus: PermissionStatus | null = null;
    let interval: NodeJS.Timeout | null = null;
    let handlePermissionChange: (() => void) | null = null;

    // Listen for permission changes using Permissions API (if available)
    if ('permissions' in navigator && 'query' in navigator.permissions) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((status) => {
          permissionStatus = status;
          // Set initial permission
          setNotificationPermission(status.state as NotificationPermission);

          // Listen for permission changes
          handlePermissionChange = () => {
            const newState = status.state as NotificationPermission;
            setNotificationPermission(newState);
            // Refresh full status if permission changed
            refreshPushNotificationStatus();
          };

          status.addEventListener('change', handlePermissionChange);
        })
        .catch((error) => {
          console.warn('Permissions API not fully supported:', error);
          // Fallback to periodic check
          interval = setInterval(() => {
            const currentPermission = getNotificationPermission();
            if (currentPermission !== notificationPermission) {
              setNotificationPermission(currentPermission);
              refreshPushNotificationStatus();
            }
          }, 5000);
        });
    } else {
      // Fallback: Check permission periodically (every 5 seconds) in case user changes it in browser settings
      interval = setInterval(() => {
        const currentPermission = getNotificationPermission();
        if (currentPermission !== notificationPermission) {
          setNotificationPermission(currentPermission);
          // Refresh full status if permission changed
          refreshPushNotificationStatus();
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (permissionStatus && handlePermissionChange) {
        try {
          permissionStatus.removeEventListener('change', handlePermissionChange);
        } catch (e) {
          // Ignore cleanup errors (some browsers don't support removeEventListener on PermissionStatus)
        }
      }
    };
  }, [refreshPushNotificationStatus, notificationPermission]);

  const fetchNotifications = useCallback(async (newFilters?: NotificationFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const appliedFilters = newFilters || filters;
      const data = await getNotifications(appliedFilters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchNotificationById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const notification = await getNotificationById(id);
      setSelectedNotification(notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notification");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch alerts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotificationStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await markNotificationAsRead(id);
      // Refresh related data - call service functions directly to avoid circular dependency
      const notificationsData = await getNotifications(filters);
      setNotifications(notificationsData);
      const statsData = await getNotificationStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const archive = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await archiveNotification(id);
      // Refresh notifications - call service function directly
      const data = await getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to archive notification");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const deleteAction = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteNotification(id);
      // Refresh notifications - call service function directly
      const data = await getNotifications(filters);
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const acknowledge = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await acknowledgeAlert(id);
      // Refresh alerts - call service function directly
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to acknowledge alert");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setFilters = useCallback((newFilters: NotificationFilters) => {
    setFiltersState(newFilters);
    // Call service function directly to avoid circular dependency
    void (async () => {
      try {
        const data = await getNotifications(newFilters);
        setNotifications(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notifications");
      }
    })();
  }, []);

  const clearSelectedNotification = useCallback(() => {
    setSelectedNotification(null);
  }, []);

  const filteredNotifications = notifications;
  const unreadCount = notifications.filter(n => n.status === "unread").length;

  // No context-level fetch: pages that need notifications/alerts call fetchNotifications, fetchAlerts, fetchStats.

  const value: NotificationContextType = {
    notifications,
    selectedNotification,
    alerts,
    filters,
    stats,
    isLoading,
    error,
    pushNotificationsEnabled,
    pushNotificationsSupported,
    notificationPermission,
    serviceWorkerRegistered,
    fetchNotifications,
    fetchNotificationById,
    markAsRead,
    archive,
    delete: deleteAction,
    fetchAlerts,
    acknowledge,
    fetchStats,
    setFilters,
    clearSelectedNotification,
    refreshPushNotificationStatus,
    filteredNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
