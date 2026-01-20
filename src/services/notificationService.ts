/**
 * Notification Service
 * 
 * Handles all notification-related API calls:
 * - Notifications
 * - Alerts
 * 
 * Backend API endpoints to implement:
 * - GET /api/notifications - List notifications
 * - GET /api/notifications/:id - Get notification
 * - PUT /api/notifications/:id/read - Mark as read
 * - PUT /api/notifications/:id/archive - Archive notification
 * - DELETE /api/notifications/:id - Delete notification
 * - GET /api/notifications/stats - Get notification statistics
 * - GET /api/alerts - List alerts
 * - PUT /api/alerts/:id/acknowledge - Acknowledge alert
 */

import type {
  Notification,
  Alert,
  NotificationFilters,
  NotificationStats,
} from "@/types/notification";
import type { ApiResponse } from "@/types/inputCustomer";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const MOCK_DELAY = 500;

const MOCK_NOTIFICATIONS: Notification[] = [];
const MOCK_ALERTS: Alert[] = [];

export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_NOTIFICATIONS;
}

export async function getNotificationById(id: string): Promise<Notification | null> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_NOTIFICATIONS.find(notification => notification.id === id) || null;
}

export async function markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
  if (!notification) {
    return { data: notification!, error: "Notification not found" };
  }
  return { data: { ...notification, status: "read", readAt: new Date().toISOString() }, message: "Notification marked as read" };
}

export async function archiveNotification(id: string): Promise<ApiResponse<Notification>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
  if (!notification) {
    return { data: notification!, error: "Notification not found" };
  }
  return { data: { ...notification, status: "archived" }, message: "Notification archived" };
}

export async function deleteNotification(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
}

export async function getAlerts(): Promise<Alert[]> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return MOCK_ALERTS;
}

export async function acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const alert = MOCK_ALERTS.find(a => a.id === id);
  if (!alert) {
    return { data: alert!, error: "Alert not found" };
  }
  return { data: { ...alert, acknowledgedAt: new Date().toISOString() }, message: "Alert acknowledged" };
}

export async function getNotificationStats(): Promise<NotificationStats> {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  return {
    total: 0,
    unread: 0,
    read: 0,
    byType: {
      order: 0,
      payment: 0,
      transport: 0,
      quality_check: 0,
      system: 0,
      alert: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
  };
}
