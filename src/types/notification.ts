/**
 * Notification Types
 * 
 * Types for notification functionality:
 * - Notifications
 * - Alerts
 * - System messages
 */

/**
 * Notification type
 */
export type NotificationType = 
  | "order" 
  | "payment" 
  | "transport" 
  | "quality_check" 
  | "system" 
  | "alert";

/**
 * Notification priority
 */
export type NotificationPriority = "low" | "medium" | "high" | "urgent";

/**
 * Notification status
 * Derived from isRead boolean: isRead ? "read" : "unread"
 */
export type NotificationStatus = "unread" | "read";

/**
 * Notification
 * Backend returns isRead: boolean, frontend transforms to status: "read" | "unread"
 */
export interface Notification {
  id: string; // UUID
  userId: string; // Recipient user ID
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus; // Computed from isRead: isRead ? "read" : "unread"
  isRead?: boolean; // Backend field - used to compute status
  title: string;
  message: string;
  actionUrl?: string; // URL to navigate to when clicked
  actionLabel?: string; // Button label
  metadata?: Record<string, unknown>; // Additional data
  entityType?: string; // Entity type (e.g., "ORDER", "TRANSPORT")
  entityId?: string; // Entity ID
  createdAt: string; // ISO 8601
  readAt?: string; // ISO 8601
  expiresAt?: string; // ISO 8601 - optional expiration
}

/**
 * Alert
 * System alerts and warnings
 */
export interface Alert {
  id: string; // UUID
  type: "warning" | "error" | "info" | "success";
  title: string;
  message: string;
  entityType?: string; // e.g., "order", "center", "stock"
  entityId?: string;
  actionUrl?: string;
  createdAt: string; // ISO 8601
  acknowledgedAt?: string; // ISO 8601
  resolvedAt?: string; // ISO 8601
}

/**
 * Notification filters
 */
export interface NotificationFilters {
  type?: NotificationType | "all";
  status?: NotificationStatus | "all";
  priority?: NotificationPriority | "all";
  entityType?: string; // Filter by entity type (e.g., "ORDER", "TRANSPORT")
  entityId?: string; // Filter by entity ID
  limit?: number; // Limit number of results
  offset?: number; // Offset for pagination
  dateRange?: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}
