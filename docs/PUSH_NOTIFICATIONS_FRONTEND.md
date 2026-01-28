# Frontend Push Notifications Integration

This document describes the frontend implementation of web push notifications for the OFSP platform.

## Overview

The frontend push notification system provides:
- **Service Worker** - Handles push events and displays notifications
- **Push Notification Service** - API client for subscription management
- **React Hook** - `usePushNotifications` for easy integration
- **UI Components** - Settings component and prompt component
- **Utilities** - Helper functions for key conversion and permission handling

## File Structure

```
frontend/src/
├── public/
│   └── service-worker.js          # Service worker for push notifications
├── lib/
│   └── push-notification-utils.ts # Utility functions (key conversion, permissions)
├── services/
│   └── pushNotificationService.ts # API client for push subscriptions
├── hooks/
│   └── usePushNotifications.ts    # React hook for push notifications
├── components/
│   └── notifications/
│       ├── PushNotificationSettings.tsx  # Settings component
│       └── PushNotificationPrompt.tsx    # Prompt component
└── contexts/
    └── NotificationContext.tsx    # Updated with push notification state
```

## Components

### 1. Service Worker (`public/service-worker.js`)

Handles:
- **Push Events** - Receives and displays push notifications
- **Notification Click** - Opens app/URL when notification is clicked
- **Action Buttons** - Handles notification action buttons
- **Cache Management** - Caches static assets

**Key Features:**
- Automatically shows notifications when push events are received
- Handles notification clicks to navigate to relevant pages
- Supports action buttons (e.g., "View" button)
- Groups notifications by tag

### 2. Push Notification Utilities (`lib/push-notification-utils.ts`)

**Functions:**
- `urlBase64ToUint8Array()` - Converts VAPID public key for browser API
- `arrayBufferToBase64()` - Converts subscription keys to base64
- `isPushNotificationSupported()` - Checks browser support
- `getNotificationPermission()` - Gets current permission status
- `requestNotificationPermission()` - Requests permission from user
- `registerServiceWorker()` - Registers service worker
- `getPushSubscription()` - Gets existing subscription
- `subscribeToPush()` - Subscribes to push service
- `unsubscribeFromPush()` - Unsubscribes from push service
- `subscriptionToJSON()` - Converts subscription to API format

### 3. Push Notification Service (`services/pushNotificationService.ts`)

**API Methods:**
- `getVapidPublicKey()` - GET `/notifications/push/public-key`
- `subscribeToPushNotifications()` - POST `/notifications/push/subscribe`
- `unsubscribeFromPushNotifications()` - POST `/notifications/push/unsubscribe`
- `getUserPushSubscriptions()` - GET `/notifications/push/subscriptions`

### 4. usePushNotifications Hook (`hooks/usePushNotifications.ts`)

**Returns:**
```typescript
{
  isSupported: boolean;
  permission: NotificationPermission | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscription: PushSubscription | null;
  userSubscriptions: PushSubscriptionType[];
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  refreshSubscriptions: () => Promise<void>;
}
```

**Usage:**
```typescript
const {
  isSupported,
  permission,
  isSubscribed,
  subscribe,
  unsubscribe,
} = usePushNotifications();
```

### 5. PushNotificationSettings Component

Full-featured settings component for managing push notifications:
- Shows browser support status
- Displays permission status with badges
- Enable/disable buttons
- Error handling and user feedback
- Instructions for enabling blocked notifications

**Usage:**
```tsx
import { PushNotificationSettings } from '@/components/notifications/PushNotificationSettings';

<PushNotificationSettings />
```

### 6. PushNotificationPrompt Component

Subtle prompt that appears once to encourage users to enable push notifications:
- Auto-dismisses after enabling
- Can be manually dismissed
- Won't show again after dismissal
- Only shows if supported and not already subscribed

**Location:** Automatically included in `App.tsx`

## Integration Points

### 1. App Initialization

The `PushNotificationPrompt` component is automatically included in `App.tsx` and will show a subtle prompt to users who haven't enabled push notifications.

### 2. Settings Page

The `PushNotificationSettings` component is added to the Staff Settings page (`/dashboard/staff/settings`) for managing push notification preferences.

### 3. Notification Context

The `NotificationContext` has been updated to track push notification status:
```typescript
interface NotificationContextType {
  // ... existing fields
  pushNotificationsEnabled: boolean;
}
```

## Usage Examples

### Enable Push Notifications Programmatically

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

function MyComponent() {
  const { subscribe, requestPermission, permission, isSubscribed } = usePushNotifications();

  const handleEnable = async () => {
    try {
      // Request permission first
      const newPermission = await requestPermission();
      if (newPermission === 'granted') {
        // Subscribe to push notifications
        await subscribe();
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    }
  };

  return (
    <button onClick={handleEnable} disabled={isSubscribed || permission !== 'default'}>
      Enable Push Notifications
    </button>
  );
}
```

### Check Subscription Status

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

function MyComponent() {
  const { isSubscribed, permission, isSupported } = usePushNotifications();

  if (!isSupported) {
    return <p>Push notifications not supported</p>;
  }

  if (permission === 'denied') {
    return <p>Notifications blocked. Please enable in browser settings.</p>;
  }

  return (
    <div>
      {isSubscribed ? (
        <p>Push notifications are enabled</p>
      ) : (
        <p>Push notifications are disabled</p>
      )}
    </div>
  );
}
```

## Browser Support

Push notifications are supported in:
- ✅ Chrome 42+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16+ (macOS/iOS)
- ❌ Internet Explorer (not supported)

**Requirements:**
- HTTPS (required for production)
- Localhost (works for development)
- Service Worker support
- Push API support

## Testing

### Local Development

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Open browser console** to see service worker registration logs

3. **Test subscription:**
   - Click "Enable" in the push notification prompt or settings
   - Grant permission when prompted
   - Check browser DevTools → Application → Service Workers to verify registration

4. **Test notifications:**
   - Use browser DevTools → Application → Service Workers → Push to send a test notification
   - Or trigger a notification from the backend

### Production Testing

1. **Ensure HTTPS is enabled** (required for push notifications)

2. **Verify VAPID keys are configured** in backend `.env`

3. **Test subscription flow:**
   - User visits site
   - Prompt appears (if not dismissed)
   - User enables notifications
   - Subscription saved to database

4. **Test notification delivery:**
   - Backend sends notification via web-push
   - Notification appears in browser
   - Click notification to verify navigation

## Troubleshooting

### Service Worker Not Registering

**Check:**
1. Service worker file exists at `/public/service-worker.js`
2. Browser console for registration errors
3. HTTPS is enabled (or using localhost)

### Permission Denied

**Solutions:**
1. Check browser notification settings
2. Clear site data and try again
3. Use browser settings to allow notifications for the site

### Notifications Not Appearing

**Check:**
1. Service worker is active (DevTools → Application → Service Workers)
2. Subscription exists in database
3. VAPID keys are correctly configured
4. Browser notification settings allow notifications
5. Browser is not in "Do Not Disturb" mode

### Subscription Not Saving

**Check:**
1. User is authenticated (JWT token valid)
2. Backend API is accessible
3. Network tab for API errors
4. Backend logs for errors

## Security Considerations

1. **VAPID Keys:**
   - Public key is safe to expose to clients
   - Private key must remain secret on backend
   - Never commit private key to version control

2. **HTTPS Required:**
   - Push notifications only work over HTTPS (or localhost)
   - Ensure production uses SSL/TLS

3. **User Consent:**
   - Always request permission before subscribing
   - Allow users to unsubscribe easily
   - Respect user's browser notification settings

4. **Subscription Management:**
   - Subscriptions are tied to user accounts
   - Expired subscriptions are automatically cleaned up
   - Users can manage subscriptions in settings

## Future Enhancements

- [ ] Notification preferences (per notification type)
- [ ] Rich media notifications (images, videos)
- [ ] Notification scheduling
- [ ] Notification analytics
- [ ] Multi-device subscription management
- [ ] Notification history
