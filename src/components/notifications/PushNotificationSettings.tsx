/**
 * Push Notification Settings Component
 * 
 * Allows users to enable/disable web push notifications
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconX,
  IconAlertCircle,
} from '@tabler/icons-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnable = async () => {
    setIsProcessing(true);
    try {
      // Request permission first
      const newPermission = await requestPermission();
      
      if (newPermission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please allow notifications in your browser settings to enable push notifications.',
          variant: 'destructive',
        });
        return;
      }

      // Subscribe to push notifications
      await subscribe();
      
      toast({
        title: 'Push Notifications Enabled',
        description: 'You will now receive push notifications for important updates.',
      });
    } catch (err) {
      toast({
        title: 'Failed to Enable Push Notifications',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisable = async () => {
    setIsProcessing(true);
    try {
      await unsubscribe();
      
      toast({
        title: 'Push Notifications Disabled',
        description: 'You will no longer receive push notifications.',
      });
    } catch (err) {
      toast({
        title: 'Failed to Disable Push Notifications',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-white border-stone-200">
        <CardHeader>
          <CardTitle className="text-stone-900">Push Notifications</CardTitle>
          <CardDescription>Browser push notifications are not supported in this browser.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-stone-500">
            <IconAlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Please use a modern browser like Chrome, Firefox, Edge, or Safari 16+ to enable push notifications.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Blocked</Badge>;
      case 'default':
        return <Badge className="bg-stone-100 text-stone-800 border-stone-200">Not Set</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white border-stone-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-stone-900">Push Notifications</CardTitle>
            <CardDescription>
              Receive real-time notifications in your browser
            </CardDescription>
          </div>
          {getPermissionBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <IconAlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {permission === 'denied' && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <IconAlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Notifications Blocked</p>
              <p className="text-xs text-amber-700 mt-1">
                Push notifications have been blocked. Please enable them in your browser settings:
              </p>
              <ul className="text-xs text-amber-700 mt-2 list-disc list-inside space-y-1">
                <li>Chrome/Edge: Settings → Privacy → Site Settings → Notifications</li>
                <li>Firefox: Preferences → Privacy & Security → Permissions → Notifications</li>
                <li>Safari: Preferences → Websites → Notifications</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <IconBell className="h-6 w-6 text-green-600" />
            ) : (
              <IconBellOff className="h-6 w-6 text-stone-400" />
            )}
            <div>
              <p className="text-sm font-medium text-stone-900">
                {isSubscribed ? 'Push Notifications Active' : 'Push Notifications Inactive'}
              </p>
              <p className="text-xs text-stone-500">
                {isSubscribed
                  ? 'You will receive push notifications for important updates'
                  : 'Enable to receive real-time notifications in your browser'}
              </p>
            </div>
          </div>

          {isSubscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisable}
              disabled={isLoading || isProcessing}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <IconX className="h-4 w-4 mr-2" />
              Disable
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={isLoading || isProcessing || permission === 'denied'}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Enable
            </Button>
          )}
        </div>

        {isSubscribed && (
          <div className="text-xs text-stone-500 space-y-1">
            <p>✓ Notifications will appear even when the app is closed</p>
            <p>✓ You can disable this anytime from your browser settings</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
