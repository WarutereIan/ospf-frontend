/**
 * Notification Service
 * 
 * Handles all notification-related API calls:
 * - Notifications
 * - Alerts
 * 
 * Backend API endpoints:
 * - GET /api/v1/notifications - List notifications
 * - GET /api/v1/notifications/:id - Get notification
 * - PUT /api/v1/notifications/:id/read - Mark as read
 * - PUT /api/v1/notifications/read-all - Mark all as read
 * - DELETE /api/v1/notifications/:id - Delete notification
 * - DELETE /api/v1/notifications/read/all - Delete all read notifications
 * - GET /api/v1/notifications/stats - Get notification statistics
 */

import type {
  Notification,
  Alert,
  NotificationFilters,
  NotificationStats,
  NotificationType,
  NotificationPriority,
} from "@/types/notification";
import type { ApiResponse } from "@/types/inputCustomer";
import { apiGet, apiPut, apiDelete } from "@/lib/api-client";

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

/**
 * Map backend notification type to frontend type
 * Backend uses UPPER_CASE types, frontend expects lowercase
 */
function mapNotificationType(backendType: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    // Direct mappings
    ORDER: 'order',
    PAYMENT: 'payment',
    TRANSPORT: 'transport',
    QUALITY_CHECK: 'quality_check',
    
    // Order-related workflows map to 'order'
    RFQ: 'order',
    RFQ_RESPONSE: 'order',
    SOURCING_REQUEST: 'order',
    SUPPLIER_OFFER: 'order',
    NEGOTIATION: 'order',
    
    // Transport-related map to 'transport'
    PICKUP_SCHEDULE: 'transport',
    PICKUP_BOOKING: 'transport',
    
    // System and alerts
    SYSTEM: 'system',
    ALERT: 'alert',
  };
  
  return typeMap[backendType] || 'system'; // Default to 'system' for unknown types
}

/**
 * Map backend priority to frontend priority
 * Backend uses UPPER_CASE, frontend expects lowercase
 */
function mapNotificationPriority(backendPriority: string): NotificationPriority {
  const priorityMap: Record<string, NotificationPriority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  };
  
  return priorityMap[backendPriority] || 'medium'; // Default to 'medium'
}

/**
 * Transform backend notification to frontend format
 * Converts isRead boolean to status string, maps notification type and priority
 */
function transformNotification(notification: any): Notification {
  return {
    ...notification,
    status: notification.isRead ? "read" : "unread",
    type: mapNotificationType(notification.type),
    priority: mapNotificationPriority(notification.priority),
  };
}

/**
 * Get notifications with filters
 * Backend: GET /api/v1/notifications
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  try {
    const params: Record<string, any> = {};
    if (filters?.type) params.type = filters.type;
    // Transform status filter to isRead boolean for backend
    if (filters?.status && filters.status !== "all") {
      params.isRead = filters.status === "read";
    }
    if (filters?.entityType) params.entityType = filters.entityType;
    if (filters?.entityId) params.entityId = filters.entityId;
    if (filters?.limit) params.limit = filters.limit;
    if (filters?.offset) params.offset = filters.offset;

    const response = await apiGet<any>('/notifications', params);
    const notifications = response.notifications || response.data || [];
    // Transform each notification to include status field
    return notifications.map(transformNotification);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get notification by ID
 * Backend: GET /api/v1/notifications/:id
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  try {
    const notification = await apiGet<any>(`/notifications/${id}`);
    return transformNotification(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return null;
  }
}

/**
 * Mark notification as read
 * Backend: PUT /api/v1/notifications/:id/read
 */
export async function markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
  try {
    const notification = await apiPut<any>(`/notifications/${id}/read`);
    return { data: transformNotification(notification), message: "Notification marked as read" };
  } catch (error: any) {
    return { data: null as any, error: error.message || "Failed to mark notification as read" };
  }
}

/**
 * Mark all notifications as read
 * Backend: PUT /api/v1/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  try {
    return await apiPut<{ count: number }>('/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { count: 0 };
  }
}

/**
 * Archive notification
 * Note: Archived status not supported - just mark as read instead
 */
export async function archiveNotification(id: string): Promise<ApiResponse<Notification>> {
  // Archived status not supported - mark as read instead
  return markNotificationAsRead(id);
}

/**
 * Delete notification
 * Backend: DELETE /api/v1/notifications/:id
 */
export async function deleteNotification(id: string): Promise<void> {
  try {
    await apiDelete(`/notifications/${id}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all read notifications
 * Backend: DELETE /api/v1/notifications/read/all
 */
export async function deleteAllReadNotifications(): Promise<void> {
  try {
    await apiDelete('/notifications/read/all');
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    throw error;
  }
}

/**
 * Get alerts (not implemented in backend yet)
 * TODO: Backend needs to implement alerts endpoint
 */
export async function getAlerts(): Promise<Alert[]> {
  // Backend doesn't have alerts endpoint yet
  return [];
}

/**
 * Acknowledge alert (not implemented in backend yet)
 * TODO: Backend needs to implement alert acknowledgment
 */
export async function acknowledgeAlert(id: string): Promise<ApiResponse<Alert>> {
  // Backend doesn't have alerts endpoint yet
  return { data: null as any, error: "Alerts not implemented yet" };
}

/**
 * Get notification statistics
 * Backend: GET /api/v1/notifications/stats
 */
export async function getNotificationStats(): Promise<NotificationStats> {
  try {
    const stats = await apiGet<NotificationStats>('/notifications/stats');
    return stats;
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    // Return default stats structure
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
}
