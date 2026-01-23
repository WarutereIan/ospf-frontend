/**
 * Notification Context
 * 
 * Provides global state management for notification functionality:
 * - Notifications
 * - Alerts
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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

interface NotificationContextType {
  notifications: Notification[];
  selectedNotification: Notification | null;
  alerts: Alert[];
  filters: NotificationFilters;
  stats: NotificationStats | null;
  isLoading: boolean;
  error: string | null;
  
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
